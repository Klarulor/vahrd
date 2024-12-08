import {changeMqttDeviceState, placeName} from "../modules/mqtt";
import {Device} from "./Device";

export class MqttComponent implements IMqttComponent{
    public readonly isEnabled: boolean;
    public readonly routes: IMqttComponentRoutes = {};
    constructor(args: IMqttComponentConstructorArgs){
        this.isEnabled = args.isEnabled;
    }
    serialize = () => ({
        isEnabled: this.isEnabled
    });
    // public get basePath(){
    //     return `${placeName}/${}`
    // }

    public sendUpdate: (device: Device) => void = (device: Device) => {
        changeMqttDeviceState(device.controller);
    };
}

export interface IMqttComponent{
    isEnabled: boolean;
}
export interface IMqttComponentConstructorArgs{
    isEnabled: boolean;
}

export type IMqttComponentRoutes = {[key:string]: {
    get?: () => any;
    getAsync?: () => Promise<any>;
    set?: (v:any) => void;
}};