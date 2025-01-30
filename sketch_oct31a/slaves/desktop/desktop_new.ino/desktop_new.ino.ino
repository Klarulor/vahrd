#include <Wire.h>
#include <LiquidCrystal_I2C.h>

#define ID 1

byte* slice(byte* source, byte startIndex, byte endIndex){
  byte size = (endIndex-startIndex)+1;
  byte* ar = new byte[size];
  for(byte i=0;i<size;i++){
    ar[i]=source[startIndex+i];
  }
  return ar;
}

LiquidCrystal_I2C lcd(0x27,16,2);


void setup() {
  Serial.begin(9600);
  lcd.init();
  lcd.backlight();
  delay(1000);
  //tryInit();
}

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
    identified = true;
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
  }
  delete[] cmd;
}

void readLCCmd(byte* cmd, byte len){
  switch(cmd[0]){
    case 0:
      lcd.noBacklight();
    break;
    case 1:
      lcd.backlight();
    break;
    case 2:
      lcd.clear();
    break;
    case 3:
      lcd.blink();
    break;
    case 4:
      lcd.noBlink();
    break;
    case 5:
      lcd.cursor();
    break;
    case 6:
      lcd.noCursor();
    break;
    case 7:
      byte x,y;
      x = cmd[1];
      y = cmd[2];
      lcd.setCursor(x,y);
    break;
    case 8:
      for (byte i = 1; i < len; i++) {
        lcd.print((char)cmd[i]);
      }
      
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


