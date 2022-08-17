import { Char, IInputStream, Position, Text, } from './IParser';
import { Channel, } from './Channel';
import { log } from './util';

export class AsyncStream implements IInputStream {
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

    public get NextChar(): Text {
        throw new Error('AsyncStream not support normal NextChar, please use AsyncNextChar');
    }

    public Copy(): IInputStream {
        // AsyncStream 和 StringStream 绑定就可以实现了
        throw new Error('Still not support copy');
    }

    public async AsyncNextChar(): Promise<Text> {
        var c = await this.mChannel.GetValue();
        return c;
    }

    public toString(): string {
        return '#this is AsyncStream#';
    }

    public get Channel() {
        return this.mChannel;
    }
}
