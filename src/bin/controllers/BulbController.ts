import {ControllerBase, IControllerConstructorArgs} from "../ControllerBase";
import {ISwitchable} from "./implements/base";
import {Device} from "../Device";
import {ArduinoProvider} from "../providers/ArduinoProvider";
import {saveDevice} from "../../Storage";

export class BulbController extends ControllerBase implements ISwitchable{
    private _isTurnedOn: boolean = false;
    private _isPWMEnabled: boolean = false;
    private pwmValue: number = 0;
    constructor(args: IControllerConstructorArgs, dev: Device) {
        super(args, dev);
        if(dev.mqtt){
            dev.mqtt.routes["base/switch"] = {
                set: x => this.isTurnedOn = x == "ON"
            };
            dev.mqtt.routes["base/status"] = {
                get: () => ({
                    "brightness": this.pwmValue || 255,
                    "state": `${this.isTurnedOn ? "ON" : "OFF"}`,
                })
            };
            dev.mqtt.routes["brightness/status"] = {
                get: () => ({
                    "brightness": this.pwmValue || 255,
                    "state": `${this.isTurnedOn ? "ON" : "OFF"}`,
                })
            };
            dev.mqtt.routes["brightness/set"] = {
                set: x => {
                    console.log("ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ 1");
                    console.log("brightness/set", x);
                    this.pwmValue = Number(x);
                }
            };

        }


    }
    serialize = () => ({
        isTurnedOn: this.isTurnedOn,
        isPWMEnabled: this._isPWMEnabled,
        pwmValue: this.pwmValue,
    });
    onProviderReady = () => {
        const ownArgs = (this.args.args as IBulbControllerArgs);
        this.pwmValue = ownArgs.pwmValue || 0;
        this._isPWMEnabled = ownArgs.isPWMEnabled || false;
        console.log("On provider ready invoked");

        this.isTurnedOn = ownArgs.isTurnedOn;
    }
    public setIsTurnedOn(v: boolean): void {
        this.isTurnedOn = v;
    }

    public switch(): void {
        this.isTurnedOn = !this.isTurnedOn;
    }

    public turnOff(): void {
        this.isTurnedOn = false;
    }

    public turnOn(): void {
        this.isTurnedOn = true;
    }

    public get isTurnedOn(){
        return this._isTurnedOn;
    }
    public set isTurnedOn(v: boolean){
        this._isTurnedOn = v;
        if(this.device.provider.type == "ARDUINO"){
            const Arduino = (this.device.provider as ArduinoProvider);
            let num = 0;
            if(this._isPWMEnabled){
                if(v)
                    num = this.pwmValue;
                else num = 0;
            }else if(Arduino.pinSignalType == "DIGITAL")
                num = v ? 1 : 0;
            else if(Arduino.pinSignalType == "ANALOG")
                num = v ? 255 : 0;
            Arduino.write(num);
            saveDevice(this.device);
            this.changeGlobalState();
        }
    }

}

export interface IBulbControllerArgs extends IControllerConstructorArgs{
    isTurnedOn: boolean;
    isPWMEnabled?: boolean;
    pwmValue?: number;
}