import { encode } from "iconv-lite";
import { Arduino } from "../../../modules/arduino";
import { IControllerConstructorArgs } from "../../ControllerBase";
import { Device } from "../../Device";
import { ArduinoProvider } from "../../providers/ArduinoProvider";
import { IRemoteControllerBaseArgs, RemoteControllerBase } from "../../RemoteControllerBase";
import { TextEncoder } from 'node:util'
import { getTextTime } from "../../shared/primitivesFunctions";

export class RemoteDesktopSlave extends RemoteControllerBase{ // 13x2
    private readonly _ArduinoProvider: ArduinoProvider;
    constructor(args: IControllerConstructorArgs, dev: Device) {
        super(args, dev);
        this._ArduinoProvider = this.device.provider as ArduinoProvider;
    }
    private _deviceId = 1;
    onProviderReady = () => {
        this.register((this.args.args as IRemoteDesktopSlaveControllerArgs).ids, this);
        console.log(`RMS ready`);

    }

    protected onSlaveReady(id: number): any {
        this.drawTestScreen();
        console.log(`DROOOOOOOOOOOOOOOOOOOOOOOOOVE`);
    }

    private drawTestScreen(): void{
        this.clearDisplay();
        this.turnOnBacklight();
        this.print("Yo 12345");
        this.blinkOn();
        setTimeout(() => this.drawScreen(), 1200);
    }
    private _curIter: number = 0;
    private _curSmallIter: number = 0;
    private getIterSymbol(): string{
        if(this._curSmallIter == 2)
            this._curSmallIter = 0;
        switch (this._curSmallIter++){
            case 0:
                return "+";
            case 1:
                return "-";
            default: return "Z";
        }
    }
    private drawScreen(): void{
        console.log(`Writing`);
        const time = getTextTime(true);
        this.clearDisplay();
        this.setCursor(8, 3);
        this.print(time);
        this.setCursor(0,0);
        const txt = (this._curIter++).toString();
        this.print(txt);
        this.setCursor(txt.length+1, 0);
        this.print(this.getIterSymbol());
        console.log(`Wrote`);
        setTimeout(() => this.drawScreen(), 1000);
    }

    serialize = () => {
        return this.args.args as IRemoteDesktopSlaveControllerArgs;
    }

    // commands
    private turnOffBacklight(): void {
        Arduino.sendRemote(this._deviceId, [0]);
    }
    private turnOnBacklight(): void {
        Arduino.sendRemote(this._deviceId, [1]);
    }
    private clearDisplay(): void {
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

export interface IRemoteDesktopSlaveControllerArgs extends IRemoteControllerBaseArgs{
    ids: number[];
}