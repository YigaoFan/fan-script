import { IInputStream, Position, Text, } from './IParser';
import { log, stringify } from './util';

export class CounterStream implements IInputStream {
    private mStream: IInputStream;
    private mCount: number;

    public static New(stream: IInputStream): CounterStream {
        return new CounterStream(stream);
    }

    public constructor(stream: IInputStream) {
        this.mStream = stream;
        this.mCount = 0;
    }

    public Copy(): IInputStream {
        const c = new CounterStream(this.mStream.Copy());
        c.mCount = this.mCount;
        return c;
    }

    public get NextChar(): Text {
        ++this.mCount;
        return this.mStream.NextChar;
    }

    public toString(): string {
        return stringify({
            count: this.mCount,
            stream: this.mStream.toString(),
        });
    }

    public get Count() {
        return this.mCount;
    }
}
