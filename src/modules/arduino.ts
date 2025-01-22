import {SerialPort} from "serialport";
import {getConfig} from "../Storage";
import {expandString, randomStr} from "../bin/shared/primitivesFunctions";
import {ReadlineParser} from "@serialport/parser-readline";
import {sign} from "node:crypto";

export class Arduino {
    public static readonly instance: Arduino = new Arduino();
    private readonly _port: SerialPort;
    private readonly _parser: ReadlineParser;

    private initialized: boolean = false;
    constructor() {
        this._port = new SerialPort({
            path: process.platform == "win32" ? "COM3" : "/dev/ttyS3",//getConfig()?.SERIAL_PORT || "COM4",
            baudRate: 9600
        });
        this._parser = this._port.pipe(new ReadlineParser({ delimiter: '\r\n' }));
        this._parser.on(`data`, this.onData);
        this._port.on("connect", (port: SerialPort) => {
            console.log(`Serial port ${port.path} was successfully connected`);
            this.initialized = true;
        })
    }

    private static _callback?: () => any;
    private static _readPinCallbacks: {[signature: string]: (num: number) => void} = {};
    private static _readDallasCallbacks: {[signature: string]: (num: number) => void} = {};
    private static _readEnsCallbacks: {[signature: string]: (obj: IEnsData) => void} = {};
    private static _pinValueChangingCallbacks: {signature: string; pin: number, state: PinSignalType, callback: (value: number) => any}[] = [];
    private onData(data: Buffer): void{
        const cmd = data.toString();
        if(cmd[1] == "1"){
            //console.log(`Serial R: ${cmd}`);

        }//else console.log(cmd)
        //console.log(`Serial R: ${cmd}`);
        if(cmd == "1"){
            if(Arduino._callback)
            {

                Arduino._callback();
            }
            console.log("Arduino confirmation was received");
        }else if(cmd.startsWith("011")){ // response for pin read request
            const signature = cmd.slice(3,6);
            const v = Number(cmd.slice(6,9));
            //console.log(`TEST ${v}||${signature}|${Object.keys(Arduino._readPinCallbacks).join(':')}|`)
            if(Arduino._readPinCallbacks[signature])
            {
                Arduino._readPinCallbacks[signature](v);
                delete Arduino._readPinCallbacks[signature];
            }else console.log("No callback")
        }else if(cmd.startsWith("012")){ // call subscription on pin value changing
            const signature = cmd.slice(3,6);
            const v = Number(cmd.slice(6,9));
            const target = Arduino._pinValueChangingCallbacks.find(x => x.signature == signature);
            if(target)
                target.callback(v);
        }else if(cmd.startsWith("051")){ // dallas
            const signature = cmd.slice(3,6);
            const v = Number(cmd.slice(6,9));
            const callback = Arduino._readDallasCallbacks[signature];
            if(!callback)
                return;
            callback(v/10);
            delete Arduino._readDallasCallbacks[signature];
        }else if(cmd.startsWith('052')){ // ens 052XXX2103910040044
            console.log(cmd)
            const signature = cmd.slice(3,6);
            const temperature = Number(cmd.slice(6,8)) -3;
            const humidity = Math.round(Number(cmd.slice(8,11)));
            const aqi = Number(cmd[11]);
            const eco2 = Number(cmd.slice(12, 17));
            const tvoc = Number(cmd.slice(17, 22));
            const obj: IEnsData = {temperature, humidity, tvoc, aqi, eco2};
            const callback = Arduino._readEnsCallbacks[signature];
            if(!callback)
                return;
            callback(obj);
        }
    }

    private static send = (data: string) => Arduino.instance.send(data);
    private send(data: string): void{
        //console.log(`Serial W: ${data}`);
        this._port.write(`${data}\n`);
    }

    public static run(callback: () => any): void {
        this._callback = callback;
        console.log("Waiting for arduino confirmation");
    }

    public static pinMode(pin: number, state: PinMode): void{
        const command = `001${state == "READ" ? 0 : 1}${expandString(pin, '0', 3, false)}`;
        this.send(command);
    }

    public static analogWrite = (pin: number, value: number) => Arduino.writePort(pin, "ANALOG", value);
    public static digitalWrite = (pin: number, value: number) => Arduino.writePort(pin, "DIGITAL", value);
    public static writePort(pin: number, state: PinSignalType, value: number): void{
        //console.log(`ppp|${value}|${expandString(value, '0', 3, false)}`,)
        const command = `002${expandString(pin, '0', 3, false)}${state == "ANALOG" ? 0 : 1}${expandString(value, '0', 3, false)}`;
        this.send(command);
    }
    public static readPin(pin: number, state: PinSignalType): Promise<number>{
        return new Promise(r => {
            const signature = randomStr(3, false, false).toLowerCase();
            this._readPinCallbacks[signature] = r;
            //console.log(`putting new signature: ${signature}`)
            const command = `003${signature}${state == "ANALOG" ? 0 : 1}${expandString(pin, '0', 3, false)}`;
            this.send(command);
        })
    }
    // @trigger  - +-
    public static subscribeOnValueChanging(pin: number, state: PinSignalType, trigger: number, callback: (v: number) => any): void {
        const signature = randomStr(3, false, false).toLowerCase();
        this._pinValueChangingCallbacks.push({pin, signature, state, callback});
        const command = `004${signature}${state == "ANALOG" ? 0 : 1}${expandString(pin ,'0', 3, false)}${expandString(trigger ,'0', 4, false)}`;
        this.send(command);
    }
    public static readDallas(pin: number): Promise<number>{
        return new Promise(r => {
            const signature = randomStr(3, false, false).toLowerCase();
            this._readDallasCallbacks[signature] = r;
            //console.log(`putting new signature: ${signature}`)
            const command = `041${signature}${expandString(pin, '0', 3, false)}`;
            this.send(command);
        })
    }
    public static readENS(): Promise<IEnsData>{
        return new Promise(r => {
            const signature = randomStr(3, false, false).toLowerCase();
            this._readEnsCallbacks[signature] = r;
            const command = `042${signature}`;
            this.send(command);
        })
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