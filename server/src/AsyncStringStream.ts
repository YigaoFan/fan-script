import { Char, IAsyncInputStream, Position, Text } from "./IParser";

export class AsyncStringStream implements IAsyncInputStream {
    private mChars: Char[];
    private mFilename: string;
    private mCurrentIndex: number;

    public static New(str: string, filename: string): AsyncStringStream {
        var nowPos = Position.From(0, 0);
        const chars = [];
        for (const c of str) {
            if (c == '\n') {
                nowPos = Position.From(nowPos.Line + 1, 0);
            } else if (c == '\r') {
                continue;
            } else {
                chars.push(Char.New(c, nowPos));
                nowPos = Position.From(nowPos.Line, nowPos.Column + 1);
            }
        }

        return new AsyncStringStream(filename, chars);
    }
    
    public constructor(filename: string, chars: Char[]) {
        this.mChars = chars;
        this.mFilename = filename;
        this.mCurrentIndex = 0;
    }

    public get NextChar(): Promise<Text> {
        if (this.mCurrentIndex >= this.mChars.length) {
            return Promise.resolve(Text.New(this.mFilename));
        }
        var c = this.mChars[this.mCurrentIndex++];
        // log(`get char of ${this.mCurrentIndex - 1}: ${c.Value}`);
        var t = Text.New(this.mFilename, [c]);
        return Promise.resolve(t);
    }

    public Copy(): AsyncStringStream {
        const c = new AsyncStringStream(this.mFilename, this.mChars);
        c.mCurrentIndex = this.mCurrentIndex;
        return c;
    }

    public toString(): string {
        return `pos ${this.mCurrentIndex} content ` + this.mChars.map(x => x.Value).join('');
    }
}