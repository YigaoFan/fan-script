enum Status {
    Pending,
    Fulfilled,
    Rejected,
}

export class SyncPromise<T> {
    private mStatus: Status;
    private mValue?: T;
    private mReason?: any;

    public constructor(executor: (resolve: (value: T) => void, reject: (reason: any) => void) => void) {
        this.mStatus = Status.Pending;
        this.mReason = undefined;

        const resolve = (value: T) => {
            if (this.mStatus === Status.Pending) {
                this.mStatus = Status.Fulfilled;
                this.mValue = value;
            }
        };

        const reject = (reason: any) => {
            if (this.mStatus === Status.Pending) {
                this.mStatus = Status.Rejected;
                this.mReason = reason;
            }
        };

        try {
            executor(resolve, reject);
        } catch (error) {
            reject(error);
        }
    }

    public then(onFulfilled: (value: T) => void, onRejected: (reason: any) => void) {
        if (this.mStatus === Status.Fulfilled) {
            onFulfilled(this.mValue!);
        }

        if (this.mStatus === Status.Rejected) {
            onRejected(this.mReason);
        }
    }
}