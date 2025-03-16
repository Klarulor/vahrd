#include "Arduino.h"
#include "shorter.h"

void send(byte* ar, int len);

bool send_1data(byte e1){
    send(new byte[2]{1,e1}, 2);
}
bool send_2data(byte e1, byte e2){
    send(new byte[3]{2,e1,e2}, 3);
}
bool send_3data(byte e1, byte e2, byte e3){
    send(new byte[4]{3,e1,e2,e3}, 4);
}
bool send_4data(byte e1, byte e2, byte e3, byte e4){
    send(new byte[5]{4,e1,e2,e3,e4}, 5);
}
bool send_5data(byte e1, byte e2, byte e3, byte e4, byte e5){
    send(new byte[6]{5,e1,e2,e3,e4,e5}, 6);
}

void send(byte* ar, int len){
    Serial.write(ar, len);
    delete[] ar;
}