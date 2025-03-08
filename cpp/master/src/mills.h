typedef void (*ListenerFunc)();

struct TickAwaiter{
    ListenerFunc pFunc;
    unsigned int mills;
    bool active;
};

void mills_update(unsigned int millis);

void add_100ms_listener(ListenerFunc pFunc);
void add_200ms_listener(ListenerFunc pFunc);
void add_1s_listener(ListenerFunc pFunc);

void add_listener(ListenerFunc pFunc, int mills);

void run_in(ListenerFunc pFunc, int mills);