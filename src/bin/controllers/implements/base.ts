export interface ISwitchable{
    turnOn: () => void
    turnOff: () => void
    switch: () => void
    setIsTurnedOn: (v: boolean) => void
}