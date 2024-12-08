export const expandString = (s: number | string, c: string, len: number, rightWay: boolean = true): string => {
    let str = `${s}`;       //1                             3
    if(len != str.length)
        for(let i = 0; i <= len-str.length; i++){
            str = rightWay ? `${str}${c}` : `${c}${str}`;
        }
    return str;
}

const LETTER_NUMS = [65, 90];

export const stringLenCheck = (str: string, max: number, min: number = 0): boolean => str.length <= max && str.length >= min;


export const randomStr = (len: number, useNumbers: boolean, useSpecificSymbols: boolean): string => {
    let str = "";
    for (let i = 0; i < len; i++) {
        str += String.fromCharCode(randomNumber(LETTER_NUMS[0], LETTER_NUMS[1]));
    }
    return str;
}

export function randomNumber(min: number, max: number): number {
    return (Math.random() * (max - min)) + min;
}
