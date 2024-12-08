

// create new device virtual bulm
import {Device, IDeviceContructorArgs} from "./bin/Device";
import {runStorage, saveDevice} from "./Storage";
import {initMqtt, runMqtt} from "./modules/mqtt";
import {IArduinoProviderConstructorArgs} from "./bin/providers/ArduinoProvider";
import {Arduino} from "./modules/arduino";

(() => {
    Arduino.run(() => {
        initMqtt();
        runStorage();
        runMqtt();
        // const provider: IArduinoProviderConstructorArgs = {
        //     type: "ARDUINO",
        //     args: {
        //         connector: {
        //             type: "PIN",
        //             module: {
        //                 pin: 13,
        //                 type: "ANALOG",
        //                 mode: "WRITE"
        //             }
        //         }
        //     },
        //
        // };
        // const args: IDeviceContructorArgs = {
        //     id: "testvirtualbulb",
        //     isDevice: true,
        //     controller: {
        //         type: "BULB",
        //         args: {
        //             isTurnedOn: true,
        //             isPWMEnabled: true,
        //         }
        //     },
        //     provider: provider,
        //     mqtt: {
        //         isEnabled: true
        //     }
        //
        // }
        //const dev = Device.create(args);
        //console.log(dev)
        //saveDevice(dev);


    });

})()
