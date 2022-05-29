import { IInputStream, Position, Text, } from './IParser';

export class StringStream implements IInputStream {
    private mText: Text;
    private mCurrentPos: number = 0;

    public static New(str: string, filename: string): StringStream {
        return new StringStream(Text.New(filename, str, Position.From(0, 0)));
    }
    
    public constructor(text: Text) {
        this.mText = text;
    }

    public get NextChar(): Text {
        var t = this.mText.At(this.mCurrentPos++);
        return t;
    }

    public Copy(): StringStream {
        const s = new StringStream(this.mText, this.mFilename);
        s.mCurrentPos = this.mCurrentPos;
        return s;
    }

    get Filename(): string {
        return this.mText.Range.Filename;
    }
}