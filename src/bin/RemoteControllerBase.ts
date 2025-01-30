import {ControllerBase, IControllerConstructorArgs} from "./ControllerBase";

export class RemoteControllerBase extends ControllerBase{
    private static _allowedIds: {[id: number]: RemoteControllerBase} = {};
    private static _connectedIds: number[] = [];

    protected register(ids: number[], worker: RemoteControllerBase): void{
        for(const x of ids)
            RemoteControllerBase._allowedIds[x] = worker;
    }

    protected onSlaveReady(id: number): any{}

    public static allowRegister(id: number): {allowRegistration: boolean, callback?: (id: number) => any}{
        console.log(`----------------------------------------------------------------------------------------------------${id}`);
        if(!RemoteControllerBase._connectedIds.includes(id) || true){
            const worker = RemoteControllerBase._allowedIds[id];
            if(!worker) throw `No worker found for ${id} id`;
            RemoteControllerBase._connectedIds.push(id);

            console.log(`true`);
            return {allowRegistration: true, callback: () => {
                    worker.onSlaveReady(id);
            }};
        }
        console.log(`false`)
        return {allowRegistration: false};
    }
}

export interface IRemoteControllerBaseArgs extends IControllerConstructorArgs{
    ids: number[];
}