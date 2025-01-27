import {ControllerBase, IControllerConstructorArgs} from "../ControllerBase";
import {ISwitchable} from "./implements/base";
import {Device} from "../Device";
import {ArduinoProvider} from "../providers/ArduinoProvider";
import {saveDevice} from "../../Storage";
import {Arduino} from "../../modules/arduino";

export class ButtonController extends ControllerBase{
    private _value: number = 0;
    private readonly _ArduinoProvider: ArduinoProvider;
    constructor(args: IControllerConstructorArgs, dev: Device) {
        super(args, dev);
        if(dev.mqtt){
            dev.mqtt.routes["base/status"] = {
                getAsync: async () => ({
                    "state": `${await this.readNumberStateAsync()>0 ? "1" : "0"}`,
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
        console.log("On provider ready invoked;-buttonController");

        setInterval(async () => {
            const data = await this.readNumberStateAsync();
            this.value = data;
            //console.log(`data: `, data);
        },330);
        this.device.mqtt?.sendUpdate(this.device);
    }

    public readNumberStateAsync(): Promise<number>{
        return new Promise(async r => {
           const data = await this._ArduinoProvider.read() as number;
           r(data);
        })
    }
    public get value(){
        return this._value;
    }
    private set value(v: number){
        if(this._value != v){
            this.device.mqtt?.sendUpdate(this.device);
        }
        this._value = v;
    }


}

export interface IButtonControllerArgs extends IControllerConstructorArgs{
    value: number;
}