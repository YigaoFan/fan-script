import { Char, IInputStream, Position, Text, } from './IParser';
import { combine } from './util';

export class StringStream implements IInputStream {
    private mChars: Char[];
    private mFilename: string;
    private mCurrentIndex: number;

    public static New(str: string, filename: string): StringStream {
        var nowPos = Position.From(0, 0);
        const chars = [];
        for (const c of str) {
            if (c == '\n') {
                nowPos = Position.From(nowPos.Line + 1, 0);
            } else {
                chars.push(Char.New(c, nowPos));
                nowPos = Position.From(nowPos.Line, nowPos.Row + 1);
            }
        }
        return new StringStream(filename, chars);
    }
    
    public constructor(filename: string, chars: Char[]) {
        this.mChars = chars;
        this.mFilename = filename;
        this.mCurrentIndex = 0;
    }

    public get NextChar(): Text {
        var c = this.mChars[this.mCurrentIndex++];
        var t = Text.New(this.mFilename, [c]);
        return t;
    }

    public Copy(): StringStream {
        const c = new StringStream(this.mFilename, this.mChars);
        c.mCurrentIndex = this.mCurrentIndex;
        return c;
    }

    get Filename(): string {
        return this.mFilename;
    }
}
