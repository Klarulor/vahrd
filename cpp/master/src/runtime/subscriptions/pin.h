#include "Arduino.h"

struct PinSubscription{
    byte signature;
    bool isAnalog;
    uint8_t pin;
    uint16_t measureInterval, dif;
    bool isActive;
    uint16_t lastValue;
};

void add_subscription(byte signature, uint8_t pin, bool isAnalog, uint16_t measureInterval, uint16_t dif);