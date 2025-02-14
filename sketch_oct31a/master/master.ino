#include <DHT11.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <Wire.h>
#include <Adafruit_AHTX0.h>
#include "ScioSense_ENS160.h"

ScioSense_ENS160 ens160(ENS160_I2CADDR_1);
Adafruit_AHTX0 aht;

void setup() {
  Serial.begin(9600); // main
  Serial1.begin(9600);
  Serial.println('1');


  ens160.begin();
  Serial.println(ens160.available() ? "done." : "failed!");
  Serial.println(ens160.setMode(ENS160_OPMODE_STD) ? "done2." : "failed2!");
  if (!aht.begin()) {
    Serial.println("Could not find AHT? Check wiring");
    //while (1) delay(10);
  }
}

char cmd[32];

char* slice(const char* ar, byte startIndex, byte endIndex){
  char* obj = (char*)malloc(sizeof(char) * ((endIndex - startIndex) + 3));

  for(int i = startIndex; i <= endIndex; i++){
    obj[i - startIndex] = ar[i];
  }
  obj[(endIndex - startIndex) + 1] = '\0';
  return obj;
}

char* sliceCMD(byte startIndex, byte endIndex){
  return slice(cmd, startIndex, endIndex);
}

int parseCMDInt(byte startIndex, byte endIndex){
  char* slicedString = slice(cmd, startIndex, endIndex);
  int num = atoi(slicedString);
  free(slicedString);
  return num;
}
int parseInt(const char* ar, byte startIndex, byte endIndex){
  char* slicedString = slice(ar, startIndex, endIndex);
  int num = atoi(slicedString);
  free(slicedString);
  return num;
}

String numToStr(int num, int needLength){
  String str = String(num);
  while (str.length() < needLength) {
    str = "0" + str;
  }
  return str;
}


char slaveCmd[256];
void readSlaveCommand(byte len){
  if(slaveCmd[0] == '0'){
    int id = parseInt(slaveCmd, 1,3);
    if(len == 4){ // identification request
      //Serial.println("031"+numToStr(id,3));
    }else if(slaveCmd[4] == '3'){
      if(slaveCmd[5] == '1'){
        return; // not using
      }else if(slaveCmd[5] == '2'){ // incomming rpc
        int reqLen = parseInt(slaveCmd, 6,8);
        //Serial.println("032"+numToStr(id,3)+numToStr(reqLen,3)+slice(slaveCmd, 9, reqLen+8));
      }
    }
  }
}

void readCommand(int len){
  if(cmd[0] == '0'){
    if(cmd[1] == '0'){ // base
      switch(cmd[2]){
        case '1':{
          Serial.println("Executing 1cmd");
          int pin = parseCMDInt(4, 6);
          Serial.println("Variables set");
          Serial.println(pin);
          if(cmd[3] == '0'){
            pinMode(pin, INPUT);
            Serial.println("IN");
          } else {
            pinMode(pin, OUTPUT);
            Serial.println("OUT");
          }
        } break;
        case '2':{
          int pin = parseCMDInt(3, 5);
          int mode = atoi(&cmd[6]);
          int v = parseCMDInt(7, 9);
          if(mode == 0){
            analogWrite(pin, v);
            Serial.println(pin);
            Serial.println(v);
            Serial.println("AW");
          } else {
            digitalWrite(pin, v);
            Serial.println("DW");
          }
        } break;
        case '3':{ // request to read the port
          char* signature = sliceCMD(3, 5);
          int pin = parseCMDInt(7, 9);
          bool isAnalog = (cmd[6] == '0');
          int value = isAnalog ? analogRead(pin) : digitalRead(pin);

          Serial.println("pin: " + String(pin) + " isAnalog: " + String(isAnalog));
          if (isAnalog) {
            Serial.println("ANALOG");
          }
          Serial.println("011" + String(signature) + numToStr(value, 3));
          free(signature);
        } break;
      }
    } else if(cmd[1] == '4'){ // additional 1
      if(cmd[2] == '1'){
        Serial.println("called");
        char* signature = sliceCMD(3, 5);
        if (signature == nullptr) return;

        Serial.println("called 1");
        int pin = parseCMDInt(6, 8);
        Serial.println("called 2");
        OneWire oneWire(pin);
        Serial.println("called 3");
        DallasTemperature sensors(&oneWire);
        Serial.println("called 4");
        sensors.begin();
        Serial.println("called 5");
        sensors.requestTemperatures();
        Serial.println("called 6");
        float num = sensors.getTempCByIndex(0);
        if(num < 0) num = 0;
        Serial.println("called 7");
        Serial.println("051" + String(signature) + numToStr((int)(num * 10), 3));
        Serial.println("called 8");
        free(signature);
      } else if(cmd[2] == '2'){
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

        char* signature = sliceCMD(3, 5);
        Serial.println("z7");
        if (signature == nullptr) return;
        String strHum = String(numToStr(humidity, 3));
        Serial.println("052" + String(signature) +String(numToStr(tempC, 2))+strHum+String(numToStr(aqi,1))+String(numToStr(eco2, 5))+String(numToStr(tvoc,5)));
        free(signature);
      } else if(cmd[2] == '3'){
        // char* signature = sliceCMD(3, 5);
        // if (signature == nullptr) return;
        // int pin = parseCMDInt(6, 8);

      }
    } else if(cmd[1] == '2'){
      if(cmd[2] == '1'){ // slave reg ack
        int id = parseCMDInt(3,5);
        bool allow = cmd[6] == '1';
        if(allow){
          Serial1.println("0"+numToStr(id,3)+"11");
        }else{
          Serial1.println("0"+numToStr(id,3)+"10");
        }
      }else if(cmd[2] == '2'){ // rem emt
        int id = parseCMDInt(3,5);
        int reqLen = parseCMDInt(6,8);
        String str = "";
        for(int i = 9; i < reqLen+9; i++){
          str += cmd[i];
        }
        String txt = "0"+numToStr(id, 3)+"23"+numToStr(reqLen,3)+str;
        Serial.println("Text: |"+txt+"|");
        Serial1.println(txt);
      }
    }
  }
}


void loop() {
  char endMarker = '\n';
  char avrEndMarker = '\r';
  static byte ndx = 0;
  static byte sNdx = 0;
  if (Serial.available()){
    char rc = Serial.read();
    if(rc != endMarker){
      cmd[ndx] = rc;
      ndx++;
    }else{
      Serial.println("Command received "+String(cmd));
      readCommand(ndx);
      ndx = 0;
    }
  }
  if(Serial1.available()){
    char rc = Serial1.read();
    //Serial.println(rc);
    if(rc != endMarker && rc != avrEndMarker && rc != '\0'){
      slaveCmd[sNdx] = rc;
      sNdx++;
    }else{
      if(sNdx == 0) return;
      slaveCmd[sNdx] = '\0';
      Serial.println("Slave command received "+String(slaveCmd)+" with length: "+sNdx);
      readSlaveCommand(sNdx);
      sNdx = 0;
    }
  }
  
}

