import {IControllerConstructorArgs} from "../ControllerBase";
import {IMqttComponent} from "../MqttComponent";
import {Device, IDeviceContructorArgs} from "../Device";
import {IHeap, readStorage} from "../../Storage";

export const getStorageHeap = (): IHeap =>{
    const obj: IHeap = {
        devices: []
    };
    const data = readStorage();
    if(!data.devices)
        data.devices = [];
    if(data.devices.length > 0){
        for(const devT of data.devices){
            const providerArgs: any = {
                type: devT.provider?.type,
                args: devT.provider?.args,
            }
            const controllerArgs: IControllerConstructorArgs = {
                type: devT.controller.type,
                args: devT.controller.args
            }
            const mqttArgs: IMqttComponent = {
                isEnabled: devT.mqtt?.isEnabled || false,
            }
            const args: IDeviceContructorArgs = {
                id: devT.id,
                isDevice: devT.isDevice,
                provider: providerArgs,
                controller: controllerArgs,
                mqtt: mqttArgs
            };
            //console.log(Device)
            const dev = Device.create(args);
            console.log(`created`, `${dev.id}`);
            obj.devices.push(dev);
        }
    }
    return obj;
}