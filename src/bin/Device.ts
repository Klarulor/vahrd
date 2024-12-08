import {IMqttComponent, IMqttComponentConstructorArgs, MqttComponent} from "./MqttComponent";
import { IProviderBase, IProviderConstructorArgs, ProviderBase } from "./ProviderBase";
import {ControllerBase, IControllerBase, IControllerConstructorArgs} from "./ControllerBase";
import {createController, createProvider} from "./shared/functions";

export class Device implements IDevice{
    public readonly id: string = "";
    public isDevice: boolean = false;
    public readonly provider: ProviderBase;
    public readonly controller: ControllerBase;
    public readonly mqtt?: MqttComponent;

    private constructor(args: IDeviceContructorArgs){
        this.id = args.id;
        this.isDevice = args.isDevice;
        if(args.mqtt){
            this.mqtt = new MqttComponent(args.mqtt);
        }
        this.provider = createProvider(args.provider, this);
        this.controller = createController(args.controller, this);
        this.provider.runProvider();
    }

    public save(): void{

    }

    public static create(args: IDeviceContructorArgs): Device{
        return new Device(args)
    }
}

export interface IDevice{
    id: string;
    isDevice: boolean;
    provider: IProviderBase;
    controller: IControllerBase;
    mqtt?: IMqttComponent;
}
export interface IDeviceContructorArgs extends IDevice{
    mqtt?: IMqttComponentConstructorArgs;
    provider: IProviderConstructorArgs;
    controller: IControllerConstructorArgs;
}
