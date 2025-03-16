#include "ens.h"
#include <ScioSense_ENS160.h>
#include "mills.h"
#include <tools/exceptions.h>
#include <tools/log.h>

struct EnsReadStruct{
    int tempC, humidity;
    byte state;
};

ScioSense_ENS160 ens160(ENS160_I2CADDR_1);

void start_ens(){
    if(!ens160.begin()) throw_error(81, true);
    if(!ens160.available()) throw_error(82, true);
    if(!ens160.setMode(ENS160_OPMODE_STD)) throw_error(83, true);
}

#define SIGNATURE_LENGTH 8
EnsReadStruct readStruct;
byte signatures[SIGNATURE_LENGTH] = {0};
//bool active;

void produce();

void produce_ens(byte s, int tempC, int humidity){
    //if(s == 0) throw_error(84, false);
    
    bool slotFound = false;
    for(int i=0;i<SIGNATURE_LENGTH;i++){
        if(signatures[i] == 0){
            signatures[i] = s;
            slotFound = true;
            break;
        }
    }
    if(!slotFound) throw_error(85, false);
    
    readStruct.tempC = tempC;
    readStruct.humidity = humidity;
    produce();
}

void produceZeroStage(){
    if(readStruct.tempC < -400 || readStruct.tempC > 850) throw_error(86, false);
    if(readStruct.humidity < 0 || readStruct.humidity > 1000) throw_error(87, false);
    
    send_log("Data: "+String(readStruct.tempC) + " " + String(readStruct.humidity));
    bool r = true;
    ens160.set_envdata(readStruct.tempC, readStruct.humidity);
    if(!r)
        throw_error(88, false);
}

void productFirstStage(){
    if(!ens160.measure(true)) throw_error(89, false);
}

void produceSecondStage(){
    if(!ens160.measureRaw(true)) throw_error(90, false);
}

void produceThirdState(){
    int aqi = ens160.getAQI();
    int tvoc = ens160.getTVOC();
    int eco2 = ens160.geteCO2();
    
    if(aqi < 1 || aqi > 5) throw_error(91, false);
    if(tvoc < 0 || tvoc > 65000) throw_error(92, false);
    if(eco2 < 0 || eco2 > 65000) throw_error(93, false);

    for(int i = 0; i < SIGNATURE_LENGTH; i++){
        byte s = signatures[i];
        if(s == 0) continue;
        
        if(s == 0) throw_error(96, false); // Дублирующая проверка
        
        byte* bytes = new byte[11]{
            10,
            2, 5, s,
            (byte)readStruct.tempC, (byte)readStruct.humidity, (byte)aqi,
            (byte)(eco2/10), (byte)(eco2%10),
            (byte)(tvoc/10), (byte)(tvoc%10)
        };
        if(!bytes) throw_error(94, false);
        
        if(Serial.write(bytes, 11) != 11) throw_error(95, false);
        delete[] bytes;
        signatures[i] = 0;
    }  
}

void produce(){
    if(!run_in(produceZeroStage, 300)) throw_error(97, false);
    if(!run_in(productFirstStage, 600)) throw_error(98, false);
    if(!run_in(produceSecondStage, 900)) throw_error(99, false);
    if(!run_in(produceThirdState, 1200)) throw_error(100, false);
}