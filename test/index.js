const {SerialPort} = require(`SerialPort`);


const port = new SerialPort({
    path: process.platform == "win32" ? "COM3" : "/dev/ttyS3",//getConfig()?.SERIAL_PORT || "COM4",
    baudRate: 9600
});

port.on("connect", (port) => {
    console.log(`Serial port ${port.path} was successfully connected`);
})

function onInit(){
    let cmd = [];
    const txt = 'LEONID_GAY';

    // cmd = [3];
    cmd = [8, ...((new TextEncoder('windows-1252')).encode(txt))];

    const packet = [1, 3, 1, ...cmd];
    const d = [packet.length, ...packet];
    console.log(`wr-${packet.map(x=>`${x}`).join(' ')}`)
    port.write(d);
    port.write([4, 1,3,1, 3]);
}

port.on('data', x => {
    const ar = Array.from(x); // data - это Buffer
    console.log(ar); // Вывод массива байтов, например [10, 20, 30]
    if(ar[1] === 1 && ar[0] === 3){
        console.log(`initing`);
        port.write([3,1,1,1]);
        setTimeout(onInit, 500);
    }
});