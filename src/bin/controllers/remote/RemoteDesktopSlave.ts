import { encode } from "iconv-lite";
import { Arduino } from "../../../modules/arduino";
import { IControllerConstructorArgs } from "../../ControllerBase";
import { Device } from "../../Device";
import { ArduinoProvider } from "../../providers/ArduinoProvider";
import { RemoteConstrollerBase } from "../../RemoteControllerBase";
import { TextEncoder } from 'node:util'

export class RemoteDesktopSlave extends RemoteConstrollerBase{
    private readonly _ArduinoProvider: ArduinoProvider;
    constructor(args: IControllerConstructorArgs, dev: Device) {
        super(args, dev);
        this._ArduinoProvider = this.device.provider as ArduinoProvider;
    }
    private _deviceId = 1;
    onProviderReady = () => {
        console.log(`Slave ready`);
    }

    private drawScreen(): void{
        this.clearDiaplay();
        this.turnOnBacklight();
        this.print("Yo 12345");
    }

    // commands
    private turnOffBacklight(): void {
        Arduino.sendRemote(this._deviceId, [0]);
    }
    private turnOnBacklight(): void {
        Arduino.sendRemote(this._deviceId, [1]);
    }
    private clearDiaplay(): void {
        Arduino.sendRemote(this._deviceId, [2]);
    }
    private blinkOn(): void {
        Arduino.sendRemote(this._deviceId, [3]);
    }
    private blinkOff(): void {
        Arduino.sendRemote(this._deviceId, [4]);
    }
    private cursorOn(): void {
        Arduino.sendRemote(this._deviceId, [5]);
    }
    private cursorOff(): void {
        Arduino.sendRemote(this._deviceId, [6]);
    }
    private setCursor(x:number,y:number): void {
        if(x>255||y>255) throw `Bad cursor value for (${x};${y})`;
        Arduino.sendRemote(this._deviceId, [7,x,y]);
    }
    private print(text: string){
        const buf = [8,...Array.from(this.convertToWindows1252(text))];
        Arduino.sendRemote(this._deviceId ,buf);
    }

    private convertToWindows1252 = (input: string): Buffer => encode(input, "windows-1252");
}