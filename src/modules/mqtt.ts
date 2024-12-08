import { connect, MqttClient } from "mqtt";
import {getConfig, getDevices} from "../Storage";
import {BulbController} from "../bin/controllers/BulbController";
import {Device} from "../bin/Device";
import {IMqttComponentRoutes, MqttComponent} from "../bin/MqttComponent";
import {ControllerBase} from "../bin/ControllerBase";
import {isPromise} from "node:util/types";

let client: MqttClient;
export const initMqtt = (): void => {
    client = connect(getConfig().MQTT_HOST, {
        port: +getConfig().MQTT_PORT,
        username: getConfig().MQTT_LOGIN,
        password: getConfig().MQTT_PASSWORD,
    });
    client.on('message', onMessage);
}
export const placeName = "home";
let inited: boolean = false;
export function runMqtt(){
    for(const dev of getDevices()){
        console.log('a1')
        if(!dev.isDevice || !dev.mqtt || !dev.mqtt.isEnabled) continue;
        console.log('a2')
        console.log('a3', dev.mqtt.routes)
        for(const k in dev.mqtt.routes){
            if(dev.mqtt.routes[k].set)
            {
                const path = `${placeName}/${dev.id}/${k}`;
                client.subscribe(path);
                console.log('subscribed', path)
            }
            if(dev.mqtt.routes[k].get)
                startPublishing(`${placeName}/${dev.id}/${k}`, dev.mqtt.routes[k].get as () => any)
        }
        inited = true;

    }
}
async function startPublishing(path: string, getDataCallback: (() => Promise<any>) | (() => any)){
    const r = getDataCallback();
    let obj = null;
    if(isPromise(r))
        obj = (await r) as any;
    else obj = r;
    const data = JSON.stringify(obj);
    console.log(`publishing`, path,data)
    client.publish(path, data);
}
export async function changeMqttDeviceState(controller: ControllerBase): Promise<void>{
    const routes = controller.device.mqtt?.routes as IMqttComponentRoutes;
    for(const k in routes){
        const path = `${placeName}/${controller.device.id}/${k}`;
        if(routes[k].get || routes[k].getAsync){
            const callback = routes[k].get ?? routes[k].getAsync;
            if(!inited){
                const handle = setInterval(() => {
                    if(inited)
                    {
                        startPublishing(path, callback as () => any);
                        clearInterval(handle);
                    }
                }, 100);
            }else await startPublishing(path, callback as () => any);
        }

    }
}

function onMessage(topic: string, message: Buffer){
    console.log(`message`, topic, message.toString())
    const id = topic.split('/')[1];
    const target = topic.split('/')[2];
    const action = topic.split('/')[3];
    const dev = getDevices().find(x => x.id == id);
    if(!dev) return console.log(`no dev`, topic);
    const routes = (dev.mqtt as MqttComponent).routes;
    // home/testvirtualbulb/brightness/set
    // brightness/set
    const routeK = Object.keys(routes).find(x => x == `${target}/${action}`);
    if(!routeK) return console.log('bad topic', topic);
    const route = routes[routeK];
    if(route.set)
    {
        route.set(message.toString());
    }
    else console.log(`no set`, topic)

}