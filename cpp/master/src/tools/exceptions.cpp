#include "Arduino.h"

void throw_error(byte errorCode, bool breakRuntime = true){
    byte* bytes = new byte[3]{2, 9, errorCode};
    Serial.write(bytes, 3);
    delete[] bytes;
    if(breakRuntime){
        while(1){}
    }
}