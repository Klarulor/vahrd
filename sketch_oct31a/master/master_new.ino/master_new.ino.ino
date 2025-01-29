#include <DHT11.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <Wire.h>
#include <Adafruit_AHTX0.h>
#include "ScioSense_ENS160.h"

ScioSense_ENS160 ens160(ENS160_I2CADDR_1);
Adafruit_AHTX0 aht;

void setup() {
  Serial.begin(115200); // main
  Serial1.begin(9600);
  Serial.write(1);
  ens160.begin();
  ens160.available();
  ens160.setMode(ENS160_OPMODE_STD);
  aht.begin();
}

void readPacket(byte* packet, byte len){
  if(packet[0] == 1){
    if(packet[1] == 1){ // allow slave connection
      byte id = packet[2];
      byte* bytes = new byte[4]{3,1,id,1};
      Serial1.write(bytes, 4);
      delete[] bytes;
    }else if(packet[1] == 2){ // deny slave connection
      byte id = packet[2];
      byte* bytes = new byte[4]{3,1,id,0};
      Serial1.write(bytes, 4);
      delete[] bytes;
    }else if(packet[1] == 3){ //emit remote
      byte id = packet[2];
      byte dataSize = len-3;
      byte pckSize = dataSize+4;
      byte* pck = new byte[pckSize];
      pck[0]=pckSize-1;
      pck[1]=2;
      pck[2]=id;
      pck[3]=1;
      for(int i =0;i<=dataSize;i++){
        pck[i+4] = packet[i+3];
      }
      Serial1.write(pck, pckSize);
      //Serial.write(pck, pckSize);
      delete[] pck;
    }
  }else if(packet[0] == 2){
    if(packet[1] == 0){ // pinMode
      byte pin = packet[2];
      if(packet[3] == 0)
        pinMode(pin, INPUT);
      else pinMode(pin, OUTPUT);
    }else if(packet[1] == 1){ // write data
      byte pin = packet[2];
      int v = packet[4]*10+packet[5];
      if(packet[3] == 0)
        analogWrite(pin, v);
      else digitalWrite(pin, v);
    }else if(packet[1] == 2){ // request pin read+response
      byte s = packet[2];
      byte pin = packet[3];
      int v;
      if(packet[4] == 0)
        v = analogRead(pin);
      else v = digitalRead(pin);
      int vR1,vR;
      vR1 = v/10;
      vR = v%10;
      byte* bytes = new byte[6]{5, 2,2,s,vR1,vR};
      Serial.write(bytes, 6);
      delete[] bytes;
    }else if(packet[1] == 4){
      byte s = packet[2];
      byte pin = packet[3];
      OneWire oneWire(pin);
      DallasTemperature sensors(&oneWire);
      sensors.begin();
      sensors.requestTemperatures();
      float num = sensors.getTempCByIndex(0);
      if(num < 0) num = 0;
      byte* bytes =new byte[5]{4,2,4,s,(int)(num * 10)};
      Serial.write(bytes, 5);
      delete[] bytes;
    }else if(packet[1] == 5){
      byte s = packet[2];
      //byte pin = packet[3];
      sensors_event_t humidity1, temp;
      aht.getEvent(&humidity1, &temp);
      int tempC = (temp.temperature);
      int humidity = (humidity1.relative_humidity);
      ens160.set_envdata(tempC, humidity);
      delay(200);
      ens160.measure(true);
      delay(200);
      ens160.measureRaw(true);
      delay(200);
      int aqi = ens160.getAQI();
      int tvoc = ens160.getTVOC();
      int eco2 = ens160.geteCO2();
      byte* bytes = new byte[11]{
        10,
        2, 5, s,
        tempC, humidity, aqi,
        eco2/10, eco2%10,
        tvoc/10, tvoc%10
      };
      Serial.write(bytes, 11);
      delete[] bytes;
    }
  }
}
void readSlavePacket(byte* packet, byte len){
  byte id = packet[1];
  if(packet[0] == 1){
      if(packet[2] == 1){ // trying to register
        byte* bytes = new byte[4]{3,1,1,id};
        Serial.write(bytes, 4);
        delete[] bytes;
      }
    }
}

void loop() {
  readSerial0();
  readSerial1();
}

void readSerial0(){
  static byte size=0;
  static byte inx=0;
  static char packet[128];
  if(Serial.available()){
    byte b = Serial.read();
    if(size==0){
      size = b;
      return;
    }
    packet[inx++] = b;
    if(inx == size){
      readPacket(packet, size);
      inx=0;
      size=0;
    }
  }
}
void readSerial1(){
  static byte size=0;
  static byte inx=0;
  static byte packet[128];
  if(Serial1.available()){
    byte b = (byte)Serial1.read();
    if(size==0){
      size = b;
      return;
    }
    packet[inx++] = b;
    if(inx == size){
      readSlavePacket(packet, size);
      inx=0;
      size=0;
    }
  }
}
