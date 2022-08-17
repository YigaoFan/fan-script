import { Char, IAsyncInputStream, IInputStream, Position, Text, } from './IParser';
import { log } from './util';
import { Signal } from './Signal';

export class SignalStringStream implements IAsyncInputStream {
    private mAccessControl: { Signal: Signal, AccessiblePos: number, }; // signal 是控制对一个位置的访问权限，没有访问权限得等外面使用 signal 开放
    private mAsyncStream: IAsyncInputStream;
    private mCurrentPos: number;

    public static New(stream: IAsyncInputStream): SignalStringStream {
        return new SignalStringStream(stream);
    }

    public constructor(stream: IAsyncInputStream) {
        this.mAsyncStream = stream;
        this.mAccessControl = { Signal: new Signal(), AccessiblePos: 0 }; // 这里 AccessiblePos 的初始位置可能不对 TODO
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
                await this.mAccessControl.Signal.WaitSignal();// 不知道这里写得对不对，晚上回去拿到 node 里单独测一下 TODO
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
