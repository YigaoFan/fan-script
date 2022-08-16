// TODO test
export class Channel<T> {
    private mWaitter?: (value: T | PromiseLike<T>) => void;

    public constructor() {
    }

    public async GetValue() {
        return new Promise<T>((resolve, reject) => {
            this.mWaitter = resolve;
        });
    }

    public PutValue(v: T) {
        if (this.mWaitter) {
            this.mWaitter(v);
        }
    }
}