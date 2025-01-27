import { IENV } from "./bin/interfaces/IENV";
import {Device, IDevice, IDeviceContructorArgs} from "./bin/Device";
import {readFileSync} from "fs";
import {writeFileSync} from "node:fs";
import {IProviderConstructorArgs} from "./bin/ProviderBase";
import {IControllerConstructorArgs} from "./bin/ControllerBase";
import {IMqttComponent} from "./bin/MqttComponent";
import {getStorageHeap} from "./bin/shared/reverseFunctions";

const env = require('dotenv').config();
export const getConfig = () => process.env as any as IENV;

const FILE_PATH = './storage.json';


function read() {
    return JSON.parse(readFileSync(FILE_PATH).toString()) as IStorage;
}
function serializeDevice(dev: Device): any {
    const obj: IDevice = {
        id: dev.id,
        isDevice: dev.isDevice,
        mqtt: dev.mqtt ? {
            isEnabled: dev.mqtt?.isEnabled,
        } : undefined,
        controller: {
            type: dev.controller.type,
            args: dev.controller.serialize()
        },
        provider: {
            type: dev.provider.type,
            args: dev.provider.serialize()
        }
    }
    return obj;
}

export const readStorage = () => read();

let heap: IHeap = {devices: []};
function write(storage: IStorage){
    writeFileSync(FILE_PATH, JSON.stringify({
        devices: storage.devices.map(x => serializeDevice(x as Device))
    }, null, 2));
}
export function runStorage(){
    heap = getStorageHeap();
    //console.log(`creating heap\n-------------------------`,heap,`--------------------------------------`)
}

export const getDevices = () => heap.devices;
export const saveDevice = (dev: Device) => {
    setTimeout(() => {
        //console.log(dev, "zzz")
        console.log(`saving device. Total devices: ${getDevices().length}`);
        if(!heap.devices)
            heap.devices = [];
        const index = heap.devices.findIndex(item => item.id === dev.id);
        if(index > -1){
            heap.devices[index] = dev;
        }else heap.devices.push(dev);
        write(heap as any as IStorage);
    }, 1000);

}

export interface IStorage {
    devices: IDevice[];
}
export interface IHeap{
    devices: Device[];
}