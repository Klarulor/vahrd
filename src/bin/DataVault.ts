export abstract class DataVaultBase{
    public abstract readonly type: DataVaultType;
    protected abstract data: any;

    constructor(type: DataVaultType, initialData: any){
    }

    public read = (): any => this.data;
    public write = (v: any): any => this.data = v;
}

export class DataVault<T> extends DataVaultBase{
    public readonly type: DataVaultType;
    protected override data: T;

    constructor(type: DataVaultType, initialData: T){
        super(type, initialData);

        this.type = type;
        this.data = initialData;

    }

    public read = (): T => this.data;
    public write = (v: T): T => this.data = v;
}


export type DataVaultType = "R" | "W" | "RW";