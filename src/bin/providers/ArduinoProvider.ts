import { DataVault } from "../DataVault";
import {IProviderConstructorArgs, ProviderBase} from "../ProviderBase";
import {IVirtualProviderData} from "./VirtualProvider";
import {Device} from "../Device";
import {Arduino, IEnsData, PinMode, PinSignalType} from "../../modules/arduino";
import {IControllerBase, IControllerConstructorArgs} from "../ControllerBase";

export class ArduinoProvider extends ProviderBase {
    public override readonly data: DataVault<IVirtualProviderData>;
    private readonly connector: IVirtualConnector;
    public write: (...data: any) => void;
    public read: () => Promise<unknown>;

    private readonly args: IArduinoProviderConstructorArgs;
    public constructor(args: IProviderConstructorArgs, dev: Device){
        super(args, dev);
        this.args = args.args;
        this.connector = args.args.connector;
        this.write = (x: any) => null;
        this.read = <T>() => null as T;
        this.data = new DataVault("RW", {isTurnedOn: false} as IVirtualProviderData);
    }
    serialize = () => this.args;
    override runProvider(){
        console.log('- provider run()');
        this.initConnector(this.args as any as IInternalArduinoProviderArgs, this.device);
        this.setDataChannels(this.args as any as IInternalArduinoProviderArgs, this.device);
        
        this.device.controller.onProviderReady();
    };

    private setDataChannels(args: IInternalArduinoProviderArgs, dev: Device): void{
        //nsole.log(args)
        if(args.connector.type == "PIN"){
            const module = args.connector.module as IVirtualPinModule;
            if(module.mode == "WRITE"){
                console.log('writing mode');
                this.write = (v: number) => {
                    console.log("Writing to port: "+v);
                    Arduino.writePort(module.pin, module.type, Number(v));
                }
            }else if(module.mode == "READ"){ /// TODO
                console.log('reading mode');
                this.read = () => new Promise<number>(async r => {
                    const data = await Arduino.readPin(module.pin, module.type);
                    r(data as number);
                });
            }
        }else if(args.connector.type == "DALLAS"){
            const module = args.connector.module as IVirtualDallasModule;
             this.read = () => new Promise<number>(async r => {
                 const data = await Arduino.readDallas(module.pin);
                 r(data);
             })
        }else if(args.connector.type == "ENS"){
            const module = args.connector.module as IVirtualEnsModule;
            this.read = () => new Promise<IEnsData>(async r => {
                const data = await Arduino.readENS();
                r(data);
            })
        }else if(args.connector.type == "DETACHED_TEMPERATURE_SENSOR"){
            console.log('reading mode');
            const module = args.connector.module as IVirtualPinModule;
            this.read = () => new Promise<number>(async r => {
                const data = await Arduino.readPin(module.pin, module.type);
                r(data as number);
            });
        }
    }
    private initConnector(args: IInternalArduinoProviderArgs, dev: Device): void{
        console.log((args.connector.module as any)?.pin, (args.connector.module as any)?.mode);
        if(args.connector.type == "PIN"){
            const module = args.connector.module as IVirtualPinModule;
            Arduino.pinMode(module.pin, module.mode);
        }else if(args.connector.type == "DETACHED_TEMPERATURE_SENSOR"){
            const module = args.connector.module as IVirtualPinModule;
            Arduino.pinMode(module.pin, module.mode);
        }
    }
    public get pinSignalType(){
        return ((this.args as any).connector.module as IVirtualPinModule).type;
    }

}

export interface IArduinoProviderConstructorArgs extends IProviderConstructorArgs{
    args: {
        connector: IVirtualConnector
    }
}
interface IInternalArduinoProviderArgs{
    connector: IVirtualConnector
}
export interface IVirtualConnector {
    type: VirtualConnectorType
    module: IVirtualModule
}
export interface IVirtualModule{}
export interface IVirtualPinModule extends IVirtualModule{
    pin: number;
    type: PinSignalType,
    mode: PinMode
}
export interface IVirtualDallasModule extends IVirtualModule{
    pin: number;
}
export interface IVirtualEnsModule extends IVirtualModule{

}

export type VirtualConnectorType = "PIN" | "DALLAS" | "ENS" | "DETACHED_TEMPERATURE_SENSOR";
