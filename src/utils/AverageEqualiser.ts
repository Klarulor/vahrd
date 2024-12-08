export class AverageEqualiser<T>{
    private readonly _updateCallback: (data: T) => void;
    private readonly _dataWorker: (data: T[]) => T;
    private readonly _frameLimit: number;
    private _curFrame = 0;
    private _framesData: T[] = [];

    constructor(updateCallback: (data: T) => void, frameLimit: number, dataWorker: ((data: T[]) => T) | AverageEqualiserWorkerType) {
        this._updateCallback = updateCallback;
        if(typeof dataWorker === 'string') {
            if(dataWorker == "NUMERICAL_OBJ"){
                this._dataWorker = (ar: any) => {
                    const average: {[key: string]: number} = {};
                    const keys = Object.keys(ar[0] as any);
                    for(const key of keys){
                        let curSum = 0;
                        for(const n of ar.map((x: any) => x[key])){
                            curSum += n;

                        }
                        average[key] = parseFloat((curSum/ar.length).toFixed(0));
                    }

                    return average as T;
                }
            }else this._dataWorker = ar => ar[0];
        }else this._dataWorker = dataWorker;
        this._frameLimit = frameLimit;
    }

    public set(data: T){
        this._curFrame++;
        this._framesData.push(data);
        if(this._curFrame >= this._frameLimit){
            this._curFrame = 0;
            const average = this._dataWorker(this._framesData);
            this._framesData = [];
            this._updateCallback(average);
        }
    }
}

export type AverageEqualiserWorkerType = 'NUMERICAL_OBJ';