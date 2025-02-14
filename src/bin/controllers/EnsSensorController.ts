import {ControllerBase, IControllerConstructorArgs} from "../ControllerBase";
import {ISwitchable} from "./implements/base";
import {Device} from "../Device";
import {ArduinoProvider} from "../providers/ArduinoProvider";
import {saveDevice} from "../../Storage";
import {Arduino, IEnsData} from "../../modules/arduino";
import {AverageEqualiser} from "../../utils/AverageEqualiser";

export class EnsSensorController extends ControllerBase{
    private _data?: IEnsData;
    private readonly _ArduinoProvider: ArduinoProvider;

    private readonly _averageEqualizer: AverageEqualiser<IEnsData>;

    constructor(args: IensSensorControllerArgs, dev: Device) {
        super(args, dev);
        if(dev.mqtt){
            dev.mqtt.routes["base/status"] = {
                get: () => this._data as IEnsData,
            };
        }
        this._ArduinoProvider = this.device.provider as ArduinoProvider;

        this._averageEqualizer = new AverageEqualiser(data => this.data = data, 12, 'NUMERICAL_OBJ');
    }
    serialize = () => ({
        value: this._data
    });
    private dataArr: IEnsData[] = [];
    onProviderReady = () => {
        const ownArgs = (this.args.args as IensSensorControllerArgs);
        this._data = (ownArgs as any).value;
        console.log("On provider ready invoked;-ens");

        setInterval(async () => {
            console.log(`-----------------------------reading data`);
            const tData = await this.readData();
            console.log(`-----------------------------success reading data`);
            console.log(tData);
            this._averageEqualizer.set(tData);
        },5000);
        this.device.mqtt?.sendUpdate(this.device);
    }

    public readData(): Promise<IEnsData>{
        return new Promise(async r => {
            const data = await this._ArduinoProvider.read() as IEnsData;
            r(data);
        })
    }
    public get data(): IEnsData{
        return this._data as IEnsData;
    }
    private set data(data: IEnsData){
        this._data = data;
        this.device.mqtt?.sendUpdate(this.device);
        saveDevice(this.device);
    }


}

export interface IensSensorControllerArgs extends IControllerConstructorArgs{
    data?: IEnsData;
}