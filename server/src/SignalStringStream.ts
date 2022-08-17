import { Char, IAsyncInputStream, IInputStream, Position, Text, } from './IParser';
import { log } from './util';
import { Signal } from './Signal';

export class SignalStringStream implements IAsyncInputStream {
    private mAccessControl: { Signal: Signal, AccessiblePos: number }; // signal 是控制对一个位置的访问权限，没有访问权限得等外面使用 signal 开放
    private mAsyncStream: IAsyncInputStream;

    public static New(str: string, filename: string): SignalStringStream {
        var nowPos = Position.From(0, 0);
        const chars = [];
        for (const c of str) {
            if (c == '\n') {
                nowPos = Position.From(nowPos.Line + 1, 0);
            } else if (c == '\r') {
                continue;
            } else {
                chars.push(Char.New(c, nowPos));
                nowPos = Position.From(nowPos.Line, nowPos.Row + 1);
            }
        }
        return new SignalStringStream(filename, chars);
    }

    public constructor(filename: string, chars: Char[]) {
        this.mCurrentIndex = 0;
        this.mAccessControl = { Signal: new Signal(), AccessiblePos: this.mCurrentIndex }; // 这里 AccessiblePos 的初始位置可能不对 TODO
        this.mChars = chars;
        this.mFilename = filename;
    }

    public Signal() {
        this.mAccessControl.Signal.Signal();
    }

    public Copy(): IAsyncInputStream {
        const c = new SignalStringStream(this.mFilename, this.mChars);
        c.mCurrentIndex = this.mCurrentIndex;
        c.mAccessControl = this.mAccessControl;
        return c;
    }

    public get NextChar(): Promise<Text> {
        return new Promise(async (resolve, reject) => {
            if (this.mCurrentIndex >= this.mChars.length) {
                resolve(Text.New(this.mFilename));
            }

            if (this.mCurrentIndex > this.mAccessControl.AccessiblePos) {
                if (this.mCurrentIndex - this.mAccessControl.AccessiblePos > 1) {
                    log("mCurrentIndex isn't one bigger than AccessiblePos, please rethink program logic here");
                }
                await this.mAccessControl.Signal.WaitSignal();// 不知道这里写得对不对，晚上回去拿到 node 里单独测一下 TODO
                ++this.mAccessControl.AccessiblePos;
            }
            var c = this.mChars[this.mCurrentIndex++];
            // log(`get char of ${this.mCurrentIndex - 1}: ${c.Value}`);
            var t = Text.New(this.mFilename, [c]);
            resolve(t);            
        });
    }

    public toString(): string {
        return '#this is AsyncStream#';
    }

    // 下面这个方法不应该加到接口中去 TODO
    public GetSignal() {
        return this.mAccessControl.Signal;
    }
}
