import { log, } from './util';

// stateful internal
export interface IInputStream {
    get NextChar(): Text;
    get Filename(): string;
    Copy(): IInputStream;
}

export class Position {
    private readonly mLine: number;
    private readonly mRow: number;

    static From(line: number, row: number): Position {
        return new Position(line, row);
    }

    public constructor(line: number, row: number) {
        this.mLine = line;
        this.mRow = row;
    }

    public Equal(line: number, row: number) {
        return this.mLine == line && this.mRow == row;
    }

    get Line(): number {
        return this.mLine;
    }

    get Row(): number {
        return this.mRow;
    }
}

// 这里代表的就是连续的范围，不允许跨行，因为不知道一行有多少个字符
export class Range {
    private mFilename: string;
    // 最好这里的项和 string 中的 char 是一一对应的
    private mStart: Position;
    /**
     * not included
     */
    private mEnd: Position;

    public static New(file: string, start: Position, end: Position) {
        var r = new Range(file, start, end);
        return r;
    }

    public static Combine(r1: Range, r2: Range): Range {
        if (r1.mFilename == r2.mFilename) {
            if (r1.mStart.Line == r2.mStart.Line) {
                if (r1.mEnd.Row == r2.mStart.Row) {
                    return Range.New(r1.mFilename, r1.mStart, r2.mEnd);
                }
            }
        }
        throw new Error(`invalid combination of ${r1} and ${r2}`);
    }

    private constructor(file: string, start: Position, end: Position) {
        this.mFilename = file;
        this.mStart = start;
        this.mEnd = end;
    }

    public Contains(line: number, row: number): boolean {
        if (this.mStart.Line == this.mEnd.Line) {
            return line == this.mStart.Line
                    && row >= this.mStart.Row
                    && row <= this.mEnd.Row;
        }
        if (line == this.mStart.Line) {
            return row >= this.mStart.Row;
        } else if (line == this.mEnd.Line) {
            return row < this.mEnd.Row;
        } else {
            return line > this.mStart.Line && line < this.mEnd.Line; 
        }
    }

    public Append(that: Position | Range): void {
        if (that instanceof Position) {
            if (that.Line == this.mEnd.Line && that.Row == this.mEnd.Row) {
                this.mEnd = Position.From(that.Line + 1, that.Row + 1);
            }
        } else {
            if (that.mStart.Line == this.mEnd.Line && that.mStart.Row == this.mEnd.Row) {
                this.mEnd = that.mEnd;
            }
        }
    }

    public get Filename(): string {
        return this.mFilename;
    }

    public SubRange(start: number, end?: number): Range {
        var s = Position.From(this.mStart.Line, this.mStart.Row + start);
        let e: Position;
        if (end) {
            e = Position.From(this.mStart.Line, this.mStart.Row + end);
        } else {
            e = this.mEnd;
        }
        return Range.New(this.mFilename, s, e);
    }

    public At(i: number): Range {
        var l = this.mStart.Line;
        var r = this.mStart.Row;
        return Range.New(this.mFilename, Position.From(l, r + i), Position.From(l, r + i + 1));
    }
}

export class Text {
    private mValue: string;
    private mRange: Range;

    // 说实话这个工厂为什么要有我也不太清楚
    // 默认 value 都是同一行的，这个可能之后要去掉这个限制
    public static New(filename: string, value: string, start: Position) {
        var end = Position.From(start.Line, start.Row + value.length);
        return new Text(value, Range.New(filename, start, end));
    }

    public static Combine(t1: Text, t2: Text) {
        return new Text(t1.Value + t2.Value, Range.Combine(t1.Range, t2.Range));
    }

    private constructor(value: string, range: Range) {
        this.mValue = value;
        this.mRange = range;
    }

    public get Value(): string {
        return this.mValue;
    }

    public get Range(): Range {
        return this.mRange;
    }

    public set Range(range: Range) {
        this.mRange = range;
    }

    public SubText(start: number, end?: number): Text {
        return new Text(this.mValue.substring(start, end), this.mRange.SubRange(start, end));
    }

    public At(i: number): Text {
        return new Text(this.mValue[i], this.mRange.At(i));
    }
}
// interface IOutputStream {
//     get NextToken(): string;
//     set NextToken(value: string);
// }
// export class NoOption {
//     public static new() {
//         return new NoOption();
//     }

//     // 为什么 NoOption.equal 那里要 any 呢
//     public static equal(t: any): t is NoOption {
//         return t instanceof NoOption;
//     }
// }

type ParseSuccessResult<T1> = { Result: T1, Remain: ParserInput, };
type ParseFailResult = null; // 应该推广出去？ TODO
export type ParserInput = IInputStream;
// NoOption for optional result,让 Optional 的结果类型侵入到所有结果类型，这是个错误的决定，所有地方无论有没有 optional，都得处理这个结果，
// 所以为了只处理有 optional 操作的地方，要让 Option 的结果在 IParser<T> 的 T 中体现出来
// 相当于缩小影响范围
export type ParserResult<T> = ParseSuccessResult<T> | ParseFailResult;

enum Indent {
    NextLineAdd,
    CurrentLineReduce,
}

/**
 * @param indentSetting is set for the next log statement
 * @var indent is global variable to store indent count
 */
var indent = 0;
// 缩进的第二行好像还是有问题 TODO
const logWith = function (indentSetting: Indent, ...args: any[]) {
    const genSpaces = (count: number) => Array(count).join(' ');
    switch (indentSetting) {
        case Indent.CurrentLineReduce: --indent;
    }

    log(genSpaces(indent), ...args);

    switch (indentSetting) {
        case Indent.NextLineAdd: ++indent;
    }
};
export var enableDebug = true;

// 下面这个是一个方法，更好的方法，是可以通过反射，反射到某个包下所有的 parser 类型，然后动态地给 parser.parse 做代理
export const debug = function (enable: boolean = enableDebug) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        var d = descriptor;
        if (!enable) {
            return d;
        }
        var k = propertyKey;
        var v = d.value;
        d.value = function (this: any, ...args: any[]) {
            var title = `${this.constructor.name} ${k}`;
            logWith(Indent.NextLineAdd, `start ${title} with`, JSON.stringify(args));
            var r = v.apply(this, args);
            logWith(Indent.CurrentLineReduce, `end ${title}, result ${JSON.stringify(r)}`);
            return r;
        };

        return d;
    };
};

// 发现可以用接口，不用修饰器来获取信息，那就不是非得用抽象类，但其实包含一些通用逻辑的，抽象类还是有用武之地
/**
 * decorator @function debug should be called on @method parse method of derived class
 */
export interface IParser<T> {
    parse(input: ParserInput): ParserResult<T>;
}