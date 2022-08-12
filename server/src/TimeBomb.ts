// 定时抛异常让程序终止
// js vscode 调试指南 https://code.visualstudio.com/docs/editor/debugging 调用栈看不下了

export class TimeBomb {
    private mStart: Date;
    private mDelay: number;

    /** @arg delay is seconds */
    public constructor(delay: number) {
        this.mStart = new Date();
        this.mDelay = delay;
    }

    public Update() {
        var now = new Date();
        var diff = (now.getTime() - this.mStart.getTime());

        if (diff >= this.mDelay) {
            throw new Error('Time is up, bomb');
        }
    }
}