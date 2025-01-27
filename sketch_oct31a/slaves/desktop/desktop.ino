//YWROBOT
//Compatible with the Arduino IDE 1.0
//Library version:1.1
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
char cmd[32];
char* slice(const char* ar, byte startIndex, byte endIndex){
  char* obj = (char*)malloc(sizeof(char) * ((endIndex - startIndex) + 2));

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





LiquidCrystal_I2C lcd(0x27,16,2);  // set the LCD address to 0x27 for a 16 chars and 2 line display

bool identified = false;





void readCommand(int len){
  int targetId = parseCMDInt(1,3);
  if(targetId != 1) return;
  if(cmd[0] == '0'){
    if(cmd[4] == '1'){ // identification
        bool success = cmd[5] == '1';
        identified = success;
        return;
    }
    if(!identified) return;
    if(cmd[4] == '2'){
      if(cmd[5] == '3'){
        int reqLen = parseCMDInt(6,8);
        char* packet = sliceCMD(9, 8+reqLen);
        handleCommand(packet, reqLen);
        free(packet);
      }
    }
  }
}

void handleCommand(const char* packet, int len){
  if(packet[0] == '1'){
    handleLCCommand(slice(packet, 1, len-1), len-1);
  }
}


void initialize(){
  lcd.init();
  lcd.backlight();
}
void handleLCCommand(const char* packet, int len){
  switch(packet[0]){
    case '1': {
        bool allow = packet[1] == '1';
        if(allow){
          lcd.blink();
        }else{
          lcd.noBlink();
        }
    }break;
    case '2': {
      bool allow = packet[1] == '1';
        if(allow){
          lcd.cursor();
        }else{
          lcd.noCursor();
        }
    }break;
    case '0': {
      bool allow = packet[1] == '1';
        if(allow){
          lcd.backlight();
        }else{
          lcd.noBacklight();
        }
    }break;
    case '3': {
      int x = parseInt(packet, 1,2);
      int y = parseInt(packet, 3,4);
      lcd.setCursor(x,y);
    }break;
    case '4': {
      bool nl = packet[1] == '1';
      String str = String(slice(packet, 2, len-1));
      if(nl){
        lcd.println(str);
      }else{
        lcd.print(str);
      }
    }break;
    case '5':{
      lcd.clear();
    }break;
  }
  free(packet);
}

void setup()
{
  initialize();
  Serial.begin(9600);
  delay(2000);
  Serial.println("0001");
}

void loop()
{
  char endMarker = '\n';
  char avrEndMarker = '\r';
  static byte ndx = 0;
  if (Serial.available()){
    char rc = Serial.read();
     if(rc != endMarker && rc != avrEndMarker && rc != '\0'){
      cmd[ndx] = rc;
      ndx++;
    }else{
      if(ndx == 0) return;
      for(int i =0; i<ndx; i++){
      }
      readCommand(ndx);
      ndx = 0;
    }
  }
}
