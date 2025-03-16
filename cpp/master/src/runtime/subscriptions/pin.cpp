#include "pin.h"
#include "mills.h"
#include <tools/shorter.h>

void setupPin();
void send_new_state(byte signature, uint16_t v);
void on_update();
void read(PinSubscription* obj);

#define SUBSCRIPTION_COUNT 32
PinSubscription subscriptions[SUBSCRIPTION_COUNT] = {};
bool active = false;

void add_subscription(byte signature, uint8_t pin, bool isAnalog, uint16_t measureInterval, uint16_t dif){
    PinSubscription obj = {signature, isAnalog, pin, measureInterval, dif, true};
    for(int i = 0; i < SUBSCRIPTION_COUNT; i++){
        if(!subscriptions[i].isActive){
            pinMode(pin, INPUT);
            subscriptions[i] = obj;
            if(!active){
                setupPin();
                active = true;
            }
            return;
        }
    }
}

void setupPin(){
    //add_listener(on_update, 100);
}

void on_update(){
    for(int i = 0; i < SUBSCRIPTION_COUNT; i++){
        PinSubscription* obj = &subscriptions[i];
        if(!obj->isActive || (millis() & obj->measureInterval) != 0){
            continue;
        }
        read(obj);
    }
}

void read(PinSubscription* obj){
    uint16_t curValue = obj->isAnalog ? analogRead(obj->pin) : digitalRead(obj->pin);
    uint16_t dif = curValue-(obj->lastValue);
    if(abs(dif) >= obj->dif){
        obj->lastValue = curValue;
        send_new_state(obj->signature, curValue);
    }
}

void send_new_state(byte signature, uint16_t v){
    send_5data(3,1,signature,v/10,v%10);
}