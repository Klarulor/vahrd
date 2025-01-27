import {SerialPort} from "serialport";
import {getConfig} from "../Storage";
import {expandString, randomStr} from "../bin/shared/primitivesFunctions";
import {ReadlineParser} from "@serialport/parser-readline";
import {sign} from "node:crypto";

export class Arduino {
    public static readonly instance: Arduino = new Arduino();
    private readonly _port: SerialPort;

    private static _initialized: boolean = false;
    private static _isArduinoReady: boolean = false;
    constructor() {
        this._port = new SerialPort({
            path: process.platform == "win32" ? "COM3" : "/dev/ttyS3",//getConfig()?.SERIAL_PORT || "COM4",
            baudRate: 9600
        });
        this._port.on('data', this.onData);
        this._port.on("connect", (port: SerialPort) => {
            console.log(`Serial port ${port.path} was successfully connected`);
            Arduino._callback?.call(null);
        })
    }

    private _writeQueue: number[][] = [];
    private static _callback?: () => any;
    private static _readQueue: number[] = [];
    private static _isReadAvailable: boolean = false;
    private static buffer: number[] = [];
    private onData(data: Buffer): void{
        const ar = Array.from(data);
        console.log(`Receiving packet`, ar.map(x => `${x}`).join(' '));
        if(!Arduino._initialized && ar.length == 1 && ar[0] == 1){
            console.log(`Arduino was confirmed by serial`);
            Arduino._initialized = true;
            if(Arduino._callback)
                Arduino._callback();
            if(this._writeQueue){
                console.log(`Sending queue messages: ${this._writeQueue}`);
                for(const x of this._writeQueue){
                    this.send(x);
                }
            }
            return;
        }
        Arduino.buffer.push(...ar);

        while (Arduino.buffer.length > 0) {
            const packetSize = Arduino.buffer[0];
            if (Arduino.buffer.length < packetSize + 1) {
                break;
            }
            const packet = Arduino.buffer.slice(0, packetSize + 1);
            Arduino.buffer = Arduino.buffer.slice(packetSize + 1);
            console.log(`Processing packet: ${packet.join(' ')}`);
            Arduino.readPacket(packet);
        }

    }

    private static send = (data: number[]) => Arduino.instance.send(data);
    private send(data: number[]): void{
        const bytes = [data.length, ...data];
        if(Arduino._initialized){
            console.log(`Sending packet ${bytes}`);
            this._port.write(bytes);
            //console.log(`Sent packet`);
        }else{
            console.log(`Added packet to queue`);
            this._writeQueue.push(data);
        }
    }

    private static _slaveRegisterCallback: (id: number) => boolean;
    public static run(callback: () => any, slaveRegisterCallback: (id: number) => boolean): void {
        this._callback = callback;
        Arduino._slaveRegisterCallback = slaveRegisterCallback;
    }

    public static pinMode(pin: number, state: PinMode): void{
        this.send([2,0,pin,state == "READ" ? 0 : 1]);
    }

    public static analogWrite = (pin: number, value: number) => Arduino.writePort(pin, "ANALOG", value);
    public static digitalWrite = (pin: number, value: number) => Arduino.writePort(pin, "DIGITAL", value);
    public static writePort(pin: number, state: PinSignalType, value: number): void{
        this.send([2,1,pin,state == "ANALOG" ? 0 : 1, parseInt(value.toFixed(0))/10,parseInt(value.toFixed(0))%10]);
    }

    private _readPinCallbackNextSignature=0;
    private _readPinCallbacks: {[signature: number]: (v: number) => any} = {};
    public static readPin(pin: number, state: PinSignalType): Promise<number>{
        if(Arduino.instance._readPinCallbackNextSignature > 250)
            Arduino.instance._readPinCallbackNextSignature = 0;
        const signature = Arduino.instance._readPinCallbackNextSignature++;
        const promise = new Promise<number>(r => {
            Arduino.instance._readPinCallbacks[signature] = r;
        });
        Arduino.send([2,2,signature,pin,state == "ANALOG" ? 0 : 1]);
        return promise;
    }
    // @trigger  - +-
    public static subscribeOnValueChanging(pin: number, state: PinSignalType, trigger: number, callback: (v: number) => any): void {

    }

    private _readDallasCallbackNextSignature=0;
    private _readDallasCallbacks: {[signature: number]: (v: number) => any} = {};
    public static readDallas(pin: number): Promise<number>{
        if(Arduino.instance._readDallasCallbackNextSignature > 250)
            Arduino.instance._readDallasCallbackNextSignature = 0;
        const signature = Arduino.instance._readDallasCallbackNextSignature++;
        const promise = new Promise<number>(r => {
            Arduino.instance._readDallasCallbacks[signature] = r;
        });
        Arduino.send([2,4,signature,pin]);
        return promise;
    }

    private _readENSCallbackNextSignature=0;
    private _readENSCallbacks: {[signature: number]: (v: IEnsData) => any} = {};
    public static readENS(): Promise<IEnsData>{
        if(Arduino.instance._readENSCallbackNextSignature > 250)
        Arduino.instance._readENSCallbackNextSignature = 0;
        const signature = Arduino.instance._readENSCallbackNextSignature++;
        const promise = new Promise<IEnsData>(r => {
            Arduino.instance._readENSCallbacks[signature] = r;
        });
        Arduino.send([2,5,signature]);
        return promise;
    }

    private static readPacket(packet: number[]): void{
        console.log(`Handling ${packet.join(' ')}`);
        const size = packet[0];
        packet = packet.slice(1, packet.length);
        if(packet[0] == 1){
            if(packet[1] == 1){
                const id = packet[2];
                if(Arduino._slaveRegisterCallback)
                {
                    const allowRegister = Arduino._slaveRegisterCallback(id);
                    if(allowRegister){
                        console.log(`Registering a ${id} slave`);
                    }else console.log(`Deny register a ${id} slave`);
                    Arduino.send([1,allowRegister?1:2,id]);
                }
            }
        }
        else if(packet[0] == 2){
            if(packet[1] == 2){ // read pin response
                const signature = packet[2];
                const v = packet[3]*10+packet[4];
                const callback = Arduino.instance._readPinCallbacks[signature];
                if(!callback) return console.log(`No callback for signature ${signature}`);
                callback(v);
                delete Arduino.instance._readPinCallbacks[signature];
            } else if(packet[1] == 4){ // read dallas response
                const signature = packet[2];
                const v = packet[3];
                const callback = Arduino.instance._readDallasCallbacks[signature];
                if(!callback) return console.log(`No dallas callback for signature ${signature}`);
                callback(parseFloat((v/10).toFixed(2)));
                delete Arduino.instance._readDallasCallbacks[signature];
            }else if(packet[1] == 5){ // read ens response
                const signature = packet[2];
                const obj: IEnsData = {
                  temperature: packet[3],
                  humidity: packet[4],
                  aqi: packet[5],
                  eco2: packet[6]*10+packet[7],
                  tvoc: packet[8]*10+packet[9]
                };
                const callback = Arduino.instance._readENSCallbacks[signature];
                if(!callback) return console.log(`No ens callback for signature ${signature}`);
                callback(obj);
                delete Arduino.instance._readENSCallbacks[signature];
            }
        }
    }

}
export type PinSignalType = "ANALOG" | "DIGITAL";
export type PinMode = "READ" | "WRITE";

export interface IEnsData{
    temperature: number;
    humidity: number;
    eco2: number;
    tvoc: number;
    aqi: number;
}