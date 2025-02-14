import { SymbolType } from "../bin/types/SymbolType";

export class SymbolManager {
  public static getSymbol(type: SymbolType): number[] {
    const symbol = this.symbolMap[type];
    if (!symbol) {
      throw new Error(`Symbol type "${type}" does not exist.`);
    }
    return symbol;
  }
  
  private static symbolMap: Record<SymbolType, number[]> = {
    // Arrows
    "ARROW_UP": [
      0b00100,
      0b01110,
      0b10101,
      0b00100,
      0b00100,
      0b00100,
      0b00100,
      0b00000,
    ],
    "ARROW_DOWN": [
      0b00100,
      0b00100,
      0b00100,
      0b00100,
      0b10101,
      0b01110,
      0b00100,
      0b00000,
    ],
    "ARROW_LEFT": [
      0b00010,
      0b00110,
      0b01010,
      0b10010,
      0b01010,
      0b00110,
      0b00010,
      0b00000,
    ],
    "ARROW_RIGHT": [
      0b01000,
      0b01100,
      0b01010,
      0b01001,
      0b01010,
      0b01100,
      0b01000,
      0b00000,
    ],
    "ARROW_UP_LEFT": [
      0b00010,
      0b00110,
      0b01010,
      0b10010,
      0b01010,
      0b00110,
      0b00010,
      0b00000,
    ],
    "ARROW_UP_RIGHT": [
      0b01000,
      0b01100,
      0b01010,
      0b01001,
      0b01010,
      0b01100,
      0b01000,
      0b00000,
    ],
    "ARROW_DOWN_LEFT": [
      0b00010,
      0b00110,
      0b01010,
      0b10010,
      0b01010,
      0b00110,
      0b00010,
      0b00000,
    ],
    "ARROW_DOWN_RIGHT": [
      0b01000,
      0b01100,
      0b01010,
      0b01001,
      0b01010,
      0b01100,
      0b01000,
      0b00000,
    ],

    // Currency Symbols
    "CURRENCY_DOLLAR": [
      0b00100,
      0b01110,
      0b10100,
      0b01110,
      0b00101,
      0b01110,
      0b00100,
      0b00000,
    ],
    "CURRENCY_EURO": [
      0b01110,
      0b10001,
      0b10000,
      0b11110,
      0b10000,
      0b10001,
      0b01110,
      0b00000,
    ],
    "CURRENCY_POUND": [
      0b01110,
      0b10001,
      0b10000,
      0b11100,
      0b10000,
      0b10001,
      0b01110,
      0b00000,
    ],
    "CURRENCY_YEN": [
      0b10001,
      0b10001,
      0b01110,
      0b00100,
      0b01110,
      0b10001,
      0b10001,
      0b00000,
    ],

    // Weather Symbols
    "WEATHER_SUNNY": [
      0b00100,
      0b10101,
      0b00100,
      0b11111,
      0b00100,
      0b10101,
      0b00100,
      0b00000,
    ],
    "WEATHER_CLOUDY": [
      0b01110,
      0b10001,
      0b10000,
      0b10000,
      0b10001,
      0b01110,
      0b00000,
      0b00000,
    ],
    "WEATHER_RAIN": [
      0b00100,
      0b10101,
      0b00100,
      0b11111,
      0b00100,
      0b10101,
      0b00100,
      0b00000,
    ],
    "WEATHER_SNOW": [
      0b00100,
      0b10101,
      0b00100,
      0b11111,
      0b00100,
      0b10101,
      0b00100,
      0b00000,
    ],

    // Fill Levels
    "FILL_BOTTOM_0": [
      0b00000,
      0b00000,
      0b00000,
      0b00000,
      0b00000,
      0b00000,
      0b00000,
      0b00000,
    ],
    "FILL_BOTTOM_1": [
      0b00000,
      0b00000,
      0b00000,
      0b00000,
      0b00000,
      0b00000,
      0b11111,
      0b11111,
    ],
    "FILL_BOTTOM_2": [
      0b00000,
      0b00000,
      0b00000,
      0b00000,
      0b11111,
      0b11111,
      0b11111,
      0b11111,
    ],
    "FILL_BOTTOM_3": [
      0b00000,
      0b00000,
      0b00000,
      0b11111,
      0b11111,
      0b11111,
      0b11111,
      0b11111,
    ],
    "FILL_BOTTOM_4": [
      0b00000,
      0b00000,
      0b11111,
      0b11111,
      0b11111,
      0b11111,
      0b11111,
      0b11111,
    ],
    "FILL_BOTTOM_5": [
      0b00000,
      0b11111,
      0b11111,
      0b11111,
      0b11111,
      0b11111,
      0b11111,
      0b11111,
    ],
    "FILL_BOTTOM_6": [
      0b11111,
      0b11111,
      0b11111,
      0b11111,
      0b11111,
      0b11111,
      0b11111,
      0b11111,
    ],
    "FILL_BOTTOM_7": [
      0b11111,
      0b11111,
      0b11111,
      0b11111,
      0b11111,
      0b11111,
      0b11111,
      0b11111,
    ],

    // Smileys
    "SMILEY_SMILE": [
      0b00000,
      0b01010,
      0b00000,
      0b00000,
      0b10001,
      0b01110,
      0b00000,
      0b00000,
    ],
    "SMILEY_SAD": [
      0b00000,
      0b01010,
      0b00000,
      0b00000,
      0b01110,
      0b10001,
      0b00000,
      0b00000,
    ],

    // Alert Icons
    "ALERT_WARNING": [
      0b00100,
      0b01110,
      0b10101,
      0b00100,
      0b00100,
      0b00100,
      0b00100,
      0b00000,
    ],
    "ALERT_OK": [
      0b00000,
      0b00000,
      0b00100,
      0b01010,
      0b10001,
      0b00000,
      0b00000,
      0b00000,
    ],
    "ALERT_CHECK": [
      0b00000,
      0b00100,
      0b01010,
      0b10001,
      0b01010,
      0b00100,
      0b00000,
      0b00000,
    ],
    "ALERT_CROSS": [
      0b00000,
      0b10001,
      0b01010,
      0b00100,
      0b01010,
      0b10001,
      0b00000,
      0b00000,
    ],

    // Numbers in Boxes
    "NUMBER_BOX_0": [
      0b01110,
      0b10001,
      0b10011,
      0b10101,
      0b11001,
      0b10001,
      0b01110,
      0b00000,
    ],
    "NUMBER_BOX_1": [
      0b00100,
      0b01100,
      0b00100,
      0b00100,
      0b00100,
      0b00100,
      0b01110,
      0b00000,
    ],
    "NUMBER_BOX_2": [
      0b01110,
      0b10001,
      0b00001,
      0b00010,
      0b00100,
      0b01000,
      0b11111,
      0b00000,
    ],
    "NUMBER_BOX_3": [
      0b11111,
      0b00010,
      0b00100,
      0b00010,
      0b00001,
      0b10001,
      0b01110,
      0b00000,
    ],
    "NUMBER_BOX_4": [
      0b00010,
      0b00110,
      0b01010,
      0b10010,
      0b11111,
      0b00010,
      0b00010,
      0b00000,
    ],
    "NUMBER_BOX_5": [
      0b11111,
      0b10000,
      0b11110,
      0b00001,
      0b00001,
      0b10001,
      0b01110,
      0b00000,
    ],
    "NUMBER_BOX_6": [
      0b00110,
      0b01000,
      0b10000,
      0b11110,
      0b10001,
      0b10001,
      0b01110,
      0b00000,
    ],
    "NUMBER_BOX_7": [
      0b11111,
      0b00001,
      0b00010,
      0b00100,
      0b01000,
      0b01000,
      0b01000,
      0b00000,
    ],
    "NUMBER_BOX_8": [
      0b01110,
      0b10001,
      0b10001,
      0b01110,
      0b10001,
      0b10001,
      0b01110,
      0b00000,
    ],
    "NUMBER_BOX_9": [
      0b01110,
      0b10001,
      0b10001,
      0b01111,
      0b00001,
      0b00010,
      0b01100,
      0b00000,
    ],
  };

}
