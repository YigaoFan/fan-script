import { formatParserResult, log, } from './util';
import { HtmlLogger, } from './HtmlLogger';
import { TimeBomb } from './TimeBomb';
import { IRange } from './ISyntaxNode';

// stateful internal
export interface IInputStream {
    get NextChar(): Text;
    Copy(): IInputStream;
}

// stateful internal
export interface IAsyncInputStream {
    get NextChar(): Promise<Text>;
    Copy(): IAsyncInputStream;
}

export class Position {
    private readonly mLine: number;
    private readonly mColumn: number;

    static From(line: number, row: number): Position {
        return new Position(line, row);
    }

    private constructor(line: number, row: number) {
        this.mLine = line;
        this.mColumn = row;
    }

    public Equal(line: number, row: number) {
        return this.mLine == line && this.mColumn == row;
    }

    public get Line(): number {
        return this.mLine;
    }

    public get Column(): number {
        return this.mColumn;
    }

    public NotBefore(that: Position): boolean {
        if (this.mLine > that.mLine) {
            return true;
        } else if (this.mLine == that.mLine) {
            return this.mColumn >= that.mColumn;
        }
        return false;
    }

    public NotAfter(that: Position): boolean {
        if (this.mLine < that.mLine) {
            return true;
        } else if (this.mLine == that.mLine) {
            return this.mColumn <= that.mColumn;
        }
        return false;
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

    public get Position(): Position {
        return this.mPosition;
    }
}

export class Text {
    private mChars: Char[];
    private mFilename: string;

    public static Empty(): Text {
        return Text.New('');
    }

    public static New(filename: string, chars: Char[] = []) {
        return new Text(filename, chars);
    }

    public static Combine(t1: Text, t2: Text) {
        if (t2.mFilename !== '' && t1.mFilename !== '' && t1.mFilename != t2.mFilename) {
            throw new Error('cannot combine texts in different file');
        }
        return new Text(t1.mFilename === '' ? t2.mFilename : t1.mFilename, t1.mChars.concat(t2.mChars));
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

    /**
     * When text is empty, return ''
     */
    public get Value() {
        const v = this.mChars.map(x => x.Value).join('');
        return v;
    }
    /**
     * attention: will change text internal state
     */
    public Append(t: Text) {
        if (t.Empty) {
            return;
        }

        if (this.mFilename !== '' && t.mFilename !== '' && this.mFilename != t.mFilename) {
            throw new Error('cannot combine texts in different file');
        }
        this.mFilename = this.mFilename === '' ? t.Filename : this.mFilename;
        this.mChars.push(...t.mChars);
    }

    get Filename(): string {
        return this.mFilename;
    }

    public toString(): string {
        return this.Value;
    }

    public get Empty(): boolean {
        return this.mChars.length == 0;
    }

    public get Range(): IRange {
        if (this.mChars.length == 0) {
            throw new Error('empty chars in Text');
        }
        return {
            Left: this.mChars[0].Position,
            Right: this.mChars[this.mChars.length - 1].Position,
        };
    }
}

type ParseSuccessResult<T1, Input> = { Result: T1, Remain: Input, };
type ParseFailResult = null; // 应该推广出去？ TODO
export type ParserInput = IInputStream;
export type AsyncParserInput = IAsyncInputStream;
// NoOption for optional result,让 Optional 的结果类型侵入到所有结果类型，这是个错误的决定，所有地方无论有没有 optional，都得处理这个结果，
// 所以为了只处理有 optional 操作的地方，要让 Option 的结果在 IParser<T> 的 T 中体现出来
// 相当于缩小影响范围
export type ParserResult<T> = ParseSuccessResult<T, ParserInput> | ParseFailResult;
export type AsyncParserResult<T> = ParseSuccessResult<T, AsyncParserInput> | ParseFailResult;

export enum Indent {
    NextLineAdd,
    CurrentLineReduce,
    SameToNext,
    SameToCurrent,
}

export const htmlLogger = new HtmlLogger('parse.html');
/**
 * @param indentSetting is set for the next log statement
 * @var indent is global variable to store indent count
 */
var indent = 0;
// 缩进的第二行好像还是有问题 TODO
// export const logWith = function (indentSetting: Indent, ...args: any[]) {
//     const genSpaces = (count: number) => Array(count).join(' ');
//     switch (indentSetting) {
//         case Indent.CurrentLineReduce: --indent;
//     }

//     log(genSpaces(indent), ...args);

//     switch (indentSetting) {
//         case Indent.NextLineAdd: ++indent;
//     }
// };


export const logWith = htmlLogger.Log.bind(htmlLogger);
export var enableDebug = true;

const b = new TimeBomb(50);
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
            // b.Update();
            // log('this arg', this === undefined);
            var r = v.apply(this, args);
            logWith(Indent.CurrentLineReduce, `end ${title} \n result ${formatParserResult(r)}`);
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
    // 分两套，parse 里面调用 parse，asyncParse 里调 asyncParse，两边的 input 也可以区分
    parse(input: ParserInput): ParserResult<T>;
}