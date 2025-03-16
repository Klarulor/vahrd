#include "mills.h"
#include "Arduino.h"
#include "tools/exceptions.h"

#define AWAITERS_COUNT 32
TickAwaiter awaiters[AWAITERS_COUNT] = {};

void add_100ms_listener(ListenerFunc pFunc){
    add_listener(pFunc, 100);
}
void add_200ms_listener(ListenerFunc pFunc){
    add_listener(pFunc, 200);
}
void add_1s_listener(ListenerFunc pFunc){
    add_listener(pFunc, 1000);
}

void add_listener(ListenerFunc pFunc, unsigned int mills){
        TickAwaiter awaiter = {pFunc, mills, true};
        for(int i = 0; i < AWAITERS_COUNT; i++){
            if(!awaiters[i].active){
                awaiters[i] = awaiter;
                return;
            }
        }
}


TickAwaiter runners[AWAITERS_COUNT] = {};
bool run_in(ListenerFunc pFunc, int mills){
    TickAwaiter runner = {pFunc, millis()+mills, true};
    for(int i = 0; i < AWAITERS_COUNT; i++){
        if(!runners[i].active){
            runners[i] = runner;
            return true;
        }
    }
    return false;
}

void mills_update(unsigned int millis){
    if((millis % 100) != 0){
        return;
    }
    for(int i = 0; i < AWAITERS_COUNT; i++){
        TickAwaiter& awaiter = awaiters[i];
        if(awaiter.active && (millis % awaiter.mills) == 0){
            awaiter.pFunc();
            //awaiter.active = false;
        }
    }
    for(int i = 0; i < AWAITERS_COUNT; i++){
        TickAwaiter& runner = runners[i];
        if(runner.active && millis >= runner.mills){
            runner.pFunc();
            runner.active = false;
        }
    }
}