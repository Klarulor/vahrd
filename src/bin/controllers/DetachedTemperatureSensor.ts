import {ControllerBase, IControllerConstructorArgs} from "../ControllerBase";
import {ArduinoProvider} from "../providers/ArduinoProvider";
import {Device} from "../Device";
import {AverageEqualiser} from "../../utils/AverageEqualiser";

const R0 = 10000;
const B = 3950;
const T0 = 298.15;

export class DetachedTemperatureSensor extends ControllerBase{
    private _rawValue: number = 0;
    private _temperature: number = 0;
    private readonly _arduinoProvider: ArduinoProvider;
    private readonly _averageEqualizer = new AverageEqualiser<number>(data => {
        this.temperature = data;
    }, 10, "NUMERICAL_OBJ");

    constructor(args: IControllerConstructorArgs, dev: Device) {
        super(args, dev);
        if(dev.mqtt){
            dev.mqtt.routes["base/temperature"] = {
                getAsync: async () => ({
                    "temperature": `${this.convert(await this.readNumberStateAsync())}`,
                })
            };
        }
        this._arduinoProvider = this.device.provider as ArduinoProvider;


    }
    serialize = () => ({
        value: this._rawValue
    });
    onProviderReady = () => {
        const ownArgs = (this.args.args as IDetachedTemperatureSensor);
        this._rawValue = ownArgs.value;
        const v= this.convert(this._rawValue);
        if(!v) return;
        this.temperature = v;
        console.log("On provider ready invoked;-detachedtemperaturesensor");

        setInterval(async () => {
            const data = await this.readNumberStateAsync();
            this._rawValue = data;
            const v= this.convert(data);
            if(!v) return;
            this._averageEqualizer.set(v);
            //console.log(`data: `, data);
        },2000);
        this.device.mqtt?.sendUpdate(this.device);
    }

    public readNumberStateAsync(): Promise<number>{
        return new Promise(async r => {
            const data = await this._arduinoProvider.read() as number;
            r(data);
        })
    }
    public get temperature(){
        return this._temperature;
    }
    private set temperature(v: number){
        if(Math.abs(this._temperature-v)>0.2){
            this.device.mqtt?.sendUpdate(this.device);
            this._temperature = v;
        }
    }

    private convert(raw: number): number | null{
        if(raw < 10) return null;
        const voltage = raw * (5.0 / 1023.0);
        const resistance = (5.0 / voltage - 1) * R0;
        const tempK = 1 / (1 / T0 + Math.log(resistance / R0) / B);
        const tempC = tempK - 273.15;
        return parseInt(`${tempC}`);
    }


}

export interface IDetachedTemperatureSensor extends IControllerConstructorArgs{
    value: number;
}