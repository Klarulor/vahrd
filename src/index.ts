

// create new device virtual bulm
import {Device, IDeviceContructorArgs} from "./bin/Device";
import {runStorage, saveDevice} from "./Storage";
import {initMqtt, runMqtt} from "./modules/mqtt";
import {Arduino} from "./modules/arduino";
import { RemoteControllerBase } from "./bin/RemoteControllerBase";

(() => {
    Arduino.run(() => {
        initMqtt();
        runStorage();
        runMqtt();
    }, RemoteControllerBase.allowRegister);

})()
