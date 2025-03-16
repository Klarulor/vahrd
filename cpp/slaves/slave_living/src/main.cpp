#include "Arduino.h"
//#include "PinDefinitionsAndMore.h"
#include <IRremote.hpp> // include the library

#define ID 2

void(* resetFunc) (void) = 0;

byte* slice(byte* source, byte startIndex, byte endIndex){
  byte size = (endIndex-startIndex)+1;
  byte* ar = new byte[size];
  for(byte i=0;i<size;i++){
    ar[i]=source[startIndex+i];
  }
  return ar;
}

void setup() {
  Serial.begin(9600);
  delay(1000);
  pinMode(LED_BUILTIN, OUTPUT);
  IrSender.begin(3); // Start with IR_SEND_PIN -which is defined in PinDefinitionsAndMore.h- as send pin and enable feedback LED at default feedback LED pin
  disableLEDFeedback(); // Disable feedback LED at default feedback LED pin
  //tryInit();
}

void readCmd(byte* cmd, byte len);
void readLCCmd(byte* cmd, byte len);

void tryInit(){
  byte* buf = new byte[4]{3,1,ID,1};
  Serial.write(buf, 4);
  delete[] buf;
}

byte packet[256];
bool identified = false;
bool isSerialConnected = false;
void readPacket(byte len){
  if(packet[1] != ID) return;
  if(len == 3 && packet[2] == 1){
    {
      if(identified)
        resetFunc();
      identified = true;
    }
  }else if(len == 3 && packet[2] == 2){
    resetFunc();
  }
  if(!identified) return;
  if(packet[0] == 2){
    if(packet[2] == 1){
      byte size = len-3;
      readCmd(slice(packet, 3, len-1), size);
    }
  }
}

void readCmd(byte* cmd, byte len){
  if(cmd[0] < 9){
    readLCCmd(cmd, len);
  }else{
    if(cmd[0] == 255){
      resetFunc();
    }
  }
  delete[] cmd;
}

uint32_t bytesToUint32(byte b0, byte b1, byte b2, byte b3) {
  return ((uint32_t)b0 << 24) |
         ((uint32_t)b1 << 16) |
         ((uint32_t)b2 << 8)  |
         (uint32_t)b3;
}


void readLCCmd(byte* cmd, byte len){
  delay(10);
  switch(cmd[0]){
    case 0:
      uint32_t data = bytesToUint32(cmd[1],cmd[2],cmd[3],cmd[4]);
      IrSender.sendNECRaw(data, 0);

    break;
  }
  
 
}
long tick=0;
void readSerial(){
  static byte inx=0;
  static byte length=0; 
  if(!isSerialConnected && tick++ % 4000 == 0){
    tryInit();
  }
  if(Serial.available()){
    isSerialConnected = true;
    byte b = (byte)Serial.read();
    if(length == 0){
      length = b;
      return;
    }
    packet[inx++] = b;
    if(length == inx){
      readPacket(inx);
      inx=0;
      length=0;
      return;
    }
    
  }
}

void loop() {
  readSerial();
}

