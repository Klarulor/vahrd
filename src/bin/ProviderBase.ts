// ProviderBase.ts
import { DataVault, DataVaultBase } from "./DataVault";
import {Device} from "./Device";
import {ISerializable} from "./interfaces/ISerializable";
import {IVirtualConnector} from "./providers/ArduinoProvider";

export abstract class ProviderBase implements IProviderBase, ISerializable {
    public readonly type: ProviderType;
    public abstract readonly data?: DataVaultBase;
    protected readonly device: Device;

    protected constructor(args: IProviderConstructorArgs, dev: Device) {
        this.type = args.type;
        this.device = dev;
    }
    serialize: () => any  = () => null as any;
    abstract runProvider(): void;

}


export interface IProviderBase{
    args?: any;
    type: ProviderType;
    connector?: IVirtualConnector;
}
export interface IProviderConstructorArgs {
    type: ProviderType;
    args: any;
}

export type ProviderType = "VIRTUAL" | "ARDUINO";