export class Signal {
    private mWaitter?: (value: void | PromiseLike<void>) => void;

    public constructor() {
    }

    public async WaitSignal() {
        return new Promise<void>((resolve, reject) => {
            this.mWaitter = resolve;
        });
    }

    public Signal() {
        if (this.mWaitter) {
            this.mWaitter();
        }
    }
}