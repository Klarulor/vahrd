import { ControllerBase } from "./ControllerBase";

export class RemoteConstrollerBase extends ControllerBase{
    private static allowedIds: number[] = [];
    private static connectedIds: number[] = [];

    protected register(args: IRemoteControllerBaseArgs): void{
        RemoteConstrollerBase.allowedIds.push(...args.ids);
    }

    public static allowRegister(id: number): boolean{
        if(this.allowedIds.includes(id) && !this.connectedIds.includes(id)){
            this.connectedIds.push(id);
            return true;
        }
        return false;
    }
}

export interface IRemoteControllerBaseArgs{
    ids: number[];
}