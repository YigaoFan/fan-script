export class StringStream {
    private mStr: string;
    private mCurrentPos: number = 0;

    public constructor(s: string) {
        this.mStr = s;
    }
    public get NextChar(): string {
        return this.mStr[this.mCurrentPos++];
    }
    public Copy(): StringStream {
        const s = new StringStream(this.mStr);
        s.mCurrentPos = this.mCurrentPos;
        return s;
    }
}