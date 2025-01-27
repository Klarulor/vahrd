import {ControllerBase, IControllerConstructorArgs} from "../ControllerBase";
import {ISwitchable} from "./implements/base";
import {Device} from "../Device";
import {ArduinoProvider} from "../providers/ArduinoProvider";
import {saveDevice} from "../../Storage";
import {Arduino} from "../../modules/arduino";

export class TemperatureSensorController extends ControllerBase{
    private _value: number = 0;
    private readonly _ArduinoProvider: ArduinoProvider;
    constructor(args: IControllerConstructorArgs, dev: Device) {
        super(args, dev);
        if(dev.mqtt){
            dev.mqtt.routes["base/status"] = {
                get: () => ({
                    "temperature": `${this.value}`,
                })
            };
        }
        this._ArduinoProvider = this.device.provider as ArduinoProvider;


    }
    serialize = () => ({
        value: this._value
    });
    onProviderReady = () => {
        const ownArgs = (this.args.args as IButtonControllerArgs);
        this._value = ownArgs.value;
        console.log("On provider ready invoked;-temperaturesensor");

        setInterval(async () => {
            const data = await this.readTemperature();
            this.value = data;
        },10000);
        this.device.mqtt?.sendUpdate(this.device);
    }

    public readTemperature(): Promise<number>{
        return new Promise(async r => {
            const data = await this._ArduinoProvider.read() as number;
            r(data);
        })
    }
    public get value(){
        return this._value;
    }
    private set value(v: number){
        console.log(`|${v}|${this._value}|${Math.abs(v-this._value).toFixed(1)}`)
        if(parseFloat(Math.abs(v-this._value).toFixed(1)) != 0.1){

            if(this._value != v || true){
                this._value = v;
                this.device.mqtt?.sendUpdate(this.device);
                saveDevice(this.device);
                console.log('publishing')
            }
            this._value = v;
        }
    }


}

export interface IButtonControllerArgs extends IControllerConstructorArgs{
    value: number;
}