import { Char, IAsyncInputStream, IInputStream, Position, Text, } from './IParser';
import { Channel, } from './Channel';
import { log } from './util';

export class AsyncStream implements IAsyncInputStream {
    private mChannel: Channel<Text>;

    public static New(): AsyncStream {
        return new AsyncStream();
    }

    public constructor() {
        this.mChannel = new Channel();
    }

    public PutValue(v: Text) {
        this.mChannel.PutValue(v);
    }

    public Copy(): IAsyncInputStream {
        // AsyncStream 和 StringStream 绑定就可以实现了
        throw new Error('Still not support copy');
    }

    public get NextChar(): Promise<Text> {
        var c = this.mChannel.GetValue();
        return c;
    }

    public toString(): string {
        return '#this is AsyncStream#';
    }

    public get Channel() {
        return this.mChannel;
    }
}
