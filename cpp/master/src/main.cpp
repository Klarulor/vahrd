#include <DHT.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <Wire.h>
#include <Adafruit_AHTX0.h>
#include "ScioSense_ENS160.h"
#include "mills.h"
#include "sensors/ens.h"
#include "tools/exceptions.h"
#include "tools/log.h"

Adafruit_AHTX0 aht;

void setup() {
  Serial.begin(115200);
  Serial1.begin(9600);
  if(!Serial || !Serial1) throw_error(100, true);
  
  Serial.write(1);
  start_ens();
}

OneWire oneWire(2);
DallasTemperature sensors(&oneWire);

bool firstMessage;
void on_first_message() {
  if(!aht.begin()) throw_error(1, true);
}

void readPacket(byte* packet, byte len) {
  if(len < 2) throw_error(10, false);

  if(!firstMessage) {
    on_first_message();
    firstMessage = true;
  }

  if(packet[0] == 1) {
    //if(len < 3) throw_error(11, false);

    if(packet[1] == 1 || packet[1] == 2) {
      if(len < 3) throw_error(12, false);
      byte id = packet[2];
      byte* bytes = new byte[4]{3,1,id,(byte)(packet[1] == 1 ? 1 : 0)};
      if(!bytes) throw_error(13, false);
      if(Serial1.write(bytes, 4) != 4) throw_error(14, false);
      delete[] bytes;
    }
    else if(packet[1] == 3) {
      if(len < 4) throw_error(15, false);
      byte id = packet[2];
      byte dataSize = len-3;
      if(dataSize > 124) throw_error(16, false);
      
      byte* pck = new byte[dataSize+4];
      if(!pck) throw_error(17, false);
      
      pck[0] = dataSize+3;
      pck[1] = 2;
      pck[2] = id;
      pck[3] = 1;
      memcpy(pck+4, packet+3, dataSize);
      
      if(Serial1.write(pck, dataSize+4) != dataSize+4) throw_error(18, false);
      delete[] pck;
    }
    else if(packet[1] == 4) {
      if(len < 3) throw_error(19, false);
      byte id = packet[2];
      byte* pck = new byte[5]{4,3,1,id,2};
      if(!pck) throw_error(20, false);
      if(Serial.write(pck, 5) != 5) throw_error(21, false);
      delete[] pck;
    }
    else {
      //throw_error(22, false);
    }
  }
  else if(packet[0] == 2) {
    //if(len < 3) throw_error(23, false);

    if(packet[1] == 0) {
      if(len < 4) throw_error(24, false);
      byte pin = packet[2];
      if(packet[3] == 0) pinMode(pin, INPUT);
      else if(packet[3] == 1) pinMode(pin, OUTPUT);
      else throw_error(25, false);
    }
    else if(packet[1] == 1) {
      if(len < 6) throw_error(26, false);
      byte pin = packet[2];
      int v = packet[4]*10 + packet[5];
      if(packet[3] == 0) analogWrite(pin, v);
      else if(packet[3] == 1) digitalWrite(pin, v);
      else throw_error(27, false);
    }
    else if(packet[1] == 2) {
      if(len < 5) throw_error(28, false);
      byte s = packet[2];
      byte pin = packet[3];
      int v = (packet[4] == 0) ? analogRead(pin) : digitalRead(pin);
      
      byte* bytes = new byte[6]{5,2,2,s,(byte)(v/10),(byte)(v%10)};
      if(!bytes) throw_error(29, false);
      if(Serial.write(bytes, 6) != 6) throw_error(30, false);
      delete[] bytes;
    }
    else if(packet[1] == 4) {
      if(len < 4) throw_error(31, false);
      byte s = packet[2];
      byte pin = packet[3];
      
      sensors.begin();
      sensors.requestTemperatures();
      float num = sensors.getTempCByIndex(0);
      if(num == DEVICE_DISCONNECTED_C) throw_error(33, false);
      
      int integerTemp = static_cast<int>(num*10);
      byte* bytes = new byte[6]{5,2,4,s,(byte)(integerTemp/10),(byte)(integerTemp%10)};
      if(!bytes) throw_error(34, false);
      if(Serial.write(bytes, 6) != 6) throw_error(35, false);
      delete[] bytes;
    }
    else if(packet[1] == 5) {
      if(len < 3) throw_error(36, false);
      byte s = packet[2];
      
      sensors_event_t humidity, temp;
      if(!aht.getEvent(&humidity, &temp)) throw_error(37, false);
      
      int tempC = temp.temperature * 10;
      int hum = humidity.relative_humidity * 10;
      
      byte* bytes = new byte[4]{3,2,(byte)(tempC/10),(byte)(hum/10)};
      if(!bytes) throw_error(38, false);
      if(Serial.write(bytes, 4) != 4) throw_error(39, false);
      delete[] bytes;
      
      produce_ens(s, tempC/10.0, hum/10.0);
    }
    else {
      //throw_error(40, false);
    }
  }
  else {
    //throw_error(41, false);
  }
}

void readSlavePacket(byte* packet, byte len) {
  if(len < 2) throw_error(50, false);
  
  if(packet[0] == 1) {
    if(len < 3) throw_error(51, false);
    
    if(packet[2] == 1) {
      byte* bytes = new byte[4]{3,1,1,packet[1]};
      if(!bytes) throw_error(52, false);
      if(Serial.write(bytes, 4) != 4) throw_error(53, false);
      delete[] bytes;
    }
    else {
      throw_error(54, false);
    }
  }
  else {
    throw_error(55, false);
  }
}

String byteArrayToString(byte arr[], int len) {
  String result = "";
  for (int i = 0; i < len; i++) {
      result += String(arr[i]);  // Преобразуем байт в строку
      if (i < len - 1) {
          result += " ";  // Добавляем пробел между числами
      }
  }
  return result;
}

void readSerial0() {
  static byte size = 0;
  static byte inx = 0;
  static byte packet[128];
  
  while(Serial.available()) {
    byte b = Serial.read();
    if(size == 0) {
      if(b > 128) throw_error(60, false);
      size = b;
      continue;
    }
    
    if(inx >= sizeof(packet)) throw_error(61, false);
    packet[inx++] = b;
    
    if(inx == size) {
      String result = byteArrayToString(packet, size);
      send_log("Reading packet("+String(size)+"): "+result);
      readPacket(packet, size);
      inx = 0;
      size = 0;
    }
  }
}

void readSerial1() {
  static byte size = 0;
  static byte inx = 0;
  static byte packet[128];
  
  while(Serial1.available()) {
    byte b = Serial1.read();
    if(size == 0) {
      if(b > 128) throw_error(70, false);
      size = b;
      continue;
    }
    
    if(inx >= sizeof(packet)) throw_error(71, false);
    packet[inx++] = b;
    
    if(inx == size) {
      readSlavePacket(packet, size);
      inx = 0;
      size = 0;
    }
  }
}

void loop() {
  readSerial0();
  readSerial1();
  mills_update(millis());
}