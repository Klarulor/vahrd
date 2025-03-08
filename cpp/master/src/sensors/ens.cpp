#include "ens.h"
#include <ScioSense_ENS160.h>
#include "mills.h"

struct EnsReadStruct{
    int tempC, humidity;
    byte state;
};

ScioSense_ENS160 ens160(ENS160_I2CADDR_1);

void start_ens(){
    ens160.begin();
    ens160.available();
    ens160.setMode(ENS160_OPMODE_STD);
}

#define SIGNATURE_LENGTH 8
EnsReadStruct readStruct;
byte signatures[SIGNATURE_LENGTH] = {0};
bool active;

void produce();

void produce_ens(byte s, int tempC, int humidity){
    readStruct.tempC = tempC;
    readStruct.humidity = humidity;

    for(int i=0;i<SIGNATURE_LENGTH;i++){
        if(signatures[i] == 0){
            signatures[i] = s;
            produce();
            return;
        }
    }
}

void produceZeroStage(){
    ens160.set_envdata(readStruct.tempC, readStruct.humidity);
}

void productFirstStage(){
    
    ens160.measure(true);
}
void produceSecondStage(){
    ens160.measureRaw(true);
}
void produceThirdState(){
    int aqi = ens160.getAQI();
    int tvoc = ens160.getTVOC();
    int eco2 = ens160.geteCO2();
    for (int i = 0; i < SIGNATURE_LENGTH; i++) {
        byte s = signatures[i];
        if(s == 0)
        {
            continue;
        }
        byte* bytes = new byte[11]{
            10,
            2, 5, s,
            readStruct.tempC, readStruct.humidity, aqi,
            eco2/10, eco2%10,
            tvoc/10, tvoc%10
        };
        Serial.write(bytes, 11);
        delete[] bytes;
        signatures[i] = 0;
    }  
}

void produce(){
    //ens160.set_envdata(readStruct.tempC, readStruct.humidity);
    
    run_in(produceZeroStage, 300);
    run_in(productFirstStage, 600);
    run_in(produceSecondStage, 900);
    run_in(produceThirdState, 1200);
}


// ens160.set_envdata(tempC, humidity);
//       delay(200);
//       ens160.measure(true);
//       delay(200);
//       ens160.measureRaw(true);
//       delay(200);
//       int aqi = ens160.getAQI();
//       int tvoc = ens160.getTVOC();
//       int eco2 = ens160.geteCO2();
//       byte* bytes = new byte[11]{
//         10,
//         2, 5, s,
//         tempC, humidity, aqi,
//         eco2/10, eco2%10,
//         tvoc/10, tvoc%10
//       };
//       Serial.write(bytes, 11);
//       delete[] bytes;