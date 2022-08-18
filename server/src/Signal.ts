import { log } from "./util";

export class Signal {
    private mSignaled: boolean;
    private mWaitter?: (value: void | PromiseLike<void>) => void;

    public constructor() {
        this.mSignaled = false;
    }

    public async WaitSignal() {
        return new Promise<void>((resolve, reject) => {
            // log('set waitter');
            if (this.mSignaled) {
                this.mSignaled = false;
                resolve();
            } else {
                this.mWaitter = resolve;
            }
        });
    }

    public Signal() {
        // log('signal');
        if (this.mWaitter) {
            // log('do continuation', this.mWaitter);
            this.mWaitter();// this is not continuation, just set a return result. the continuation will be called after all of here
            // log('end continuation');
            this.mWaitter = undefined;
        } else {
            this.mSignaled = true;
        }
    }
}