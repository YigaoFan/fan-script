import { Char, IAsyncInputStream, IInputStream, Position, Text, } from './IParser';
import { log } from './util';
import { Signal } from './Signal';

// 这个 stream 从 mapparser 里传出去会影响外面 parser 的进行，因为这里需要信号
// 所以要注意这个只给 mTerminatedStateChart 用，拿出来的时候看能不能还原 TODO
export class SignalStringStream implements IAsyncInputStream {
    private mAccessControl: { Signal: Signal, AccessiblePos: number, }; // signal 是控制对一个位置的访问权限，没有访问权限得等外面使用 signal 开放
    private mAsyncStream: IAsyncInputStream;
    private mCurrentPos: number;

    public static New(stream: IAsyncInputStream): SignalStringStream {
        return new SignalStringStream(stream);
    }

    public constructor(stream: IAsyncInputStream) {
        this.mAsyncStream = stream;
        this.mAccessControl = { Signal: new Signal(), AccessiblePos: 0 };
        this.mCurrentPos = 0;
    }

    public Signal() {
        this.mAccessControl.Signal.Signal();
    }

    public Copy(): IAsyncInputStream {
        const c = new SignalStringStream(this.mAsyncStream.Copy());
        c.mAccessControl = this.mAccessControl;
        c.mCurrentPos = this.mCurrentPos;
        return c;
    }

    public get NextChar(): Promise<Text> {
        return new Promise(async (resolve, reject) => {
            if (this.mCurrentPos >= this.mAccessControl.AccessiblePos) {
                if (this.mCurrentPos - this.mAccessControl.AccessiblePos > 1) {
                    log("mCurrentIndex isn't one bigger than AccessiblePos, please rethink program logic here");
                }
                log('wait signal of', this.mCurrentPos);
                const p = this.mAccessControl.Signal.WaitSignal();
                await p;
                log('got signal of', this.mCurrentPos);
                ++this.mAccessControl.AccessiblePos;
            }
            ++this.mCurrentPos;
            resolve(this.mAsyncStream.NextChar);
        });
    }

    public toString(): string {
        return '#this is AsyncStream#';
    }

    public GetSignal() {
        return this.mAccessControl.Signal;
    }
}
