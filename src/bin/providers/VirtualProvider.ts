import { DataVault } from "../DataVault";
import { ProviderBase} from "../ProviderBase";
import {IProviderConstructorArgs} from "../ProviderBase";
import {Device} from "../Device";

export class VirtualProvider extends ProviderBase {
    public override readonly data: DataVault<IVirtualProviderData>;

    public constructor(args: IProviderConstructorArgs, dev: Device){
        super(args, dev);
        this.data = new DataVault("RW", {isTurnedOn: false} as IVirtualProviderData);
    }

    runProvider = () => {
        this.device.controller.onProviderReady();
    }


}

export interface IVirtualProviderData{
    isTurnedOn: boolean;
}