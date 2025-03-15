#include "log.h"
#include "Arduino.h"
#include "exceptions.h"

void send_log(String str) {
    int len = str.length();
    char* bytes = new char[len + 2]{};
    
    // Конвертация символов в ANSI (предполагаем, что входная строка в UTF-8)
    for (int i = 0; i < len; i++) {
        bytes[i + 2] = str.charAt(i) & 0xFF; // Убираем старший байт (оставляем Latin-1)
    }
    
    bytes[0] = len + 1; // Длина сообщения
    bytes[1] = 10;       // Код конца строки (LF)
    
    if (Serial.write(bytes, len + 2) != len + 2) {
        throw_error(111, false);
    }
    
    delete[] bytes;
}
