import type {ProviderBase} from "./ProviderBase";
import {BulbController} from "./controllers/BulbController";
import {Device} from "./Device";
import {ISerializable} from "./interfaces/ISerializable";
import {changeMqttDeviceState} from "../modules/mqtt";


export class ControllerBase implements IControllerBase, ISerializable {
    readonly #device: Device;
    public readonly type: ControllerBaseType;
    public readonly args: any;
    constructor(args: IControllerConstructorArgs, dev: Device) {
        this.#device = dev;
        this.type = args.type;
        this.args = args;
    }

    public get device(){return this.#device;}

    serialize = () => null as any;
    onProviderReady = () => {
        console.log("ERROR: INVOKER DEFAULT CONTROLLER BASE ::ONPROVIDERREADY")
    };
    protected changeGlobalState(): void{
        changeMqttDeviceState(this);
    }

    protected sendMqtt(): void{
        this.device.mqtt?.sendUpdate(this.device);
    }
    // protected sendMqttOnlyUpdated(): void{
    //
    // }

}

export interface IControllerBase{
    type: ControllerBaseType;
    args: any;
    onProviderReady?: () => void;
}
export interface IControllerConstructorArgs{
    type: ControllerBaseType
    args: any
}

export type ControllerBaseType = "BULB" | "BUTTON" | "TEMPERATURE_SENSOR" | "ENS" | "DETACHED_TEMPERATURE_SENSOR"
                                | "REMOTE_DESKTOP";