import {IProviderConstructorArgs, ProviderBase} from "../ProviderBase";
import {VirtualProvider} from "../providers/VirtualProvider";
import {BulbController} from "../controllers/BulbController";
import {ControllerBase, IControllerConstructorArgs} from "../ControllerBase";
import {Device, IDeviceContructorArgs} from "../Device";
import {ArduinoProvider, IArduinoProviderConstructorArgs} from "../providers/ArduinoProvider";
import {ButtonController} from "../controllers/ButtonController";
import {TemperatureSensorController} from "../controllers/TemperatureSensorController";
import {EnsSensorController} from "../controllers/EnsSensorController";
import {DetachedTemperatureSensor} from "../controllers/DetachedTemperatureSensor";
import { RemoteDesktopSlave } from "../controllers/remote/RemoteDesktopSlave";

export function createProvider(args: IProviderConstructorArgs, dev: Device): ProviderBase {
    let obj: ProviderBase | null = null;
    if (args.type === "VIRTUAL") {
        obj = new VirtualProvider(args, dev);
    }else if(args.type == "ARDUINO"){
        obj = new ArduinoProvider(args as IArduinoProviderConstructorArgs, dev);
    }
    return obj as ProviderBase;
}

export function createController(args: IControllerConstructorArgs, dev: Device): ControllerBase {
    if(args.type == "BULB")
        return new BulbController(args,dev);
    else if(args.type == "BUTTON")
        return new ButtonController(args, dev);
    else if(args.type == "TEMPERATURE_SENSOR")
        return new TemperatureSensorController(args,dev);
    else if(args.type == "ENS")
        return new EnsSensorController(args,dev);
    else if(args.type == "DETACHED_TEMPERATURE_SENSOR")
        return new DetachedTemperatureSensor(args, dev);
    else if(args.type == "REMOTE_DESKTOP")
        return new RemoteDesktopSlave(args, dev);
    return new BulbController(args, dev);
}
