import { log, } from './util';
import { HtmlLogger, } from './HtmlLogger';

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

    private constructor(line: number, row: number) {
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

export class Char {
    private mChar: string;
    private mPosition: Position;

    public static New(c: string, pos: Position) {
        return new Char(c, pos);
    }

    public constructor(c: string, pos: Position) {
        this.mChar = c;
        this.mPosition = pos;
    }

    public get Value(): string {
        return this.mChar;
    }
}

export class Text {
    private mChars: Char[];
    private mFilename: string;

    public static New(filename: string, chars: Char[] = []) {
        return new Text(filename, []);
    }

    public static Combine(t1: Text, t2: Text) {
        if (t1.mFilename != t2.mFilename) {
            throw new Error('cannot combine texts in different file');
        }
        return new Text(t1.mFilename, t1.mChars.concat(t2.mChars));
    }

    private constructor(filename: string, chars: Char[]) {
        this.mChars = chars;
        this.mFilename = filename;
    }

    public SubText(start: number, end?: number): Text {
        return new Text(this.mFilename, this.mChars.slice(start, end));
    }

    public At(i: number): Text {
        return new Text(this.mFilename, [this.mChars[i]]);
    }

    public Equal(s: string): boolean {
        const v = this.mChars.map(x => x.Value).join('');
        return v == s;
    }

    public get Value() {
        const v = this.mChars.map(x => x.Value).join('');
        return v;
    }
    /**
     * attention: will change text internal state
     */
    public Append(t: Text) {
        if (this.mFilename != t.mFilename) {
            throw new Error('cannot combine texts in different file');
        }
        this.mChars.push(...t.mChars);
    }

    get Filename(): string {
        return this.mFilename;
    }

    public toString(): string {
        return this.Value;
    }
}
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

export const htmlLogger = new HtmlLogger('parse.html');
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

    htmlLogger.Log(indent, ...args);
    // log(genSpaces(indent), ...args);

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
            // summary
            logWith(Indent.NextLineAdd, `start ${title} with ${args}`);// ${} will call class.toString to get better string
            var r = v.apply(this, args);
            logWith(Indent.CurrentLineReduce, `end ${title}, result ${r}`);
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