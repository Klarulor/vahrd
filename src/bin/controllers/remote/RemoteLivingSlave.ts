import { encode } from "iconv-lite";
import { Arduino } from "../../../modules/arduino";
import { IControllerConstructorArgs } from "../../ControllerBase";
import { Device } from "../../Device";
import { ArduinoProvider } from "../../providers/ArduinoProvider";
import { IRemoteControllerBaseArgs, RemoteControllerBase } from "../../RemoteControllerBase";
export class RemoteLivingSlave extends RemoteControllerBase{ // 13x2
    private readonly _ArduinoProvider: ArduinoProvider;
    constructor(args: IControllerConstructorArgs, dev: Device) {
        super(args, dev);
        this._ArduinoProvider = this.device.provider as ArduinoProvider;
        
        if(dev.mqtt){
            dev.mqtt.routes["base/switch"] = {
                set: x => {
                    const nV = x == "ON";
                    if(nV != this._curState.isTurnedOn)
                        this.switch(2);
                    this._curState.isTurnedOn = nV;
                }
            };
            dev.mqtt.routes["base/status"] = {
                get: () => ({
                    "state": `${this._curState.isTurnedOn ? "ON" : "OFF"}`,
                    "color": getRGBColor(this._curState.color)
                })
            };
            dev.mqtt.routes["base/color/set"] = {
                set: x => {
                    this._curState.color = rgbToColor(x);
                    this.setColor(2, this._curState.color);
                }
            }
        }
    }
    private _curState: IRemoteLivingSlaveState = {
        isTurnedOn: false,
        color: "NONE"
    };

    onProviderReady = () => {
        this.register((this.args.args as IRemoteLivingSlaveControllerArgs).ids, this);
        console.log(`RLS ready`);
        const ownArgs = (this.args.args as IRemoteLivingSlaveControllerArgs);
        const v = (ownArgs as any).value;
        this._curState = {isTurnedOn: v?.isTurnedOn || false, color: v?.color || "WHITE"};
    }
    private _ids: number[] = [2];
    serialize = () => ({
        value: this._curState,
        ids: this._ids,
    });

    protected onSlaveReady(id: number): any {
        this.setup(id);
    }

    private setup(id: number){
        this.setColor(id, this._curState.color);
    }

    private sendRemoteData(id: number, v: number){
        Arduino.sendRemote(id, [0, ...uint32ToBytes(v)]);
    }
    private switch(id: number): void{
        this.sendRemoteData(id, convertStateToCommand("SWITCH"));
    }
    private setColor(id: number, color: RemoteLivingSlaveColor): void{
        this.sendRemoteData(id, convertStateToCommand(color));
    }
}

function uint32ToBytes(value: number): number[] {
    return [(value >> 24) & 0xFF,
        (value >> 16) & 0xFF,
        (value >> 8) & 0xFF,
        value & 0xFF]
}

export interface IRemoteLivingSlaveControllerArgs extends IRemoteControllerBaseArgs{
    ids: number[];
}

export interface IRemoteLivingSlaveState{
    isTurnedOn: boolean;
    color: RemoteLivingSlaveColor;
}

export type RemoteLivingSlaveColor = "NONE" | "WHITE" | "RED" | "GREEN" | "BLUE";
export type RemoteLivingSlaveCommand = RemoteLivingSlaveColor | "TURN_ON" | "TURN_OFF" | "SWITCH";
function convertStateToCommand(command: RemoteLivingSlaveCommand): number{
    if(command == "SWITCH" || command == "TURN_ON" || command == "TURN_OFF")
        return 0xBF40FF00;
    switch(command){
        case "WHITE":
            return 0xBB44FF00;
        case "BLUE":
            return 0xBA45FF00;
        case "RED":
            return 0xA758FF00;
        case "GREEN":
            return 0xA659FF00;
        default:
            return 0;
    }
}
function getRGBColor(color: RemoteLivingSlaveColor): string{
    if(color == "WHITE")
        return "255,255,255";
    else if(color == "NONE")
        return "0,0,0";
    else if(color == "RED")
        return "255,0,0";
    else if(color == "BLUE")
        return "0,255,0";
    else if(color == "GREEN")
        return "0,0,255";
    return "0,0,0";
}
function rgbToColor(rgb: string): RemoteLivingSlaveColor{
    const split = rgb.split(',').map(x => Number(x));
    if(!split.filter(x => x <= 200)) return "WHITE";
    if(split[0] > 200) return "RED";
    if(split[1] > 200) return "GREEN";
    if(split[2] > 200) return "BLUE";
    return 'NONE';
}