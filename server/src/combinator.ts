import { ParserInput, ParserResult, IParser, debug, IInputStream, logWith, Indent, } from './IParser';
import { ISyntaxNode } from './ISyntaxNode';
import { log, stringify } from './util';

// 一定贯彻一个 input 只能用一次的原则，后面的解析用前面的解析的返回值中的 remain，注意循环会用多次

class Combine<T1, T2, T3> implements IParser<T3> {
    private mParser1: IParser<T1>;
    private mParser2: IParser<T2>;
    private mResultCombinator: (r1: T1, r2: T2) => T3;

    constructor(parser1: IParser<T1>, parser2: IParser<T2>, resultCombinator: (r1: T1, r2: T2) => T3) {
        this.mParser1 = parser1;
        this.mParser2 = parser2;
        this.mResultCombinator = resultCombinator;
    }

    @debug()
    public parse(input: ParserInput): ParserResult<T3> {
        var parser1 = this.mParser1;
        var parser2 = this.mParser2;
        const r1 = parser1.parse(input);
        if (r1 != null) {
            // 这里面用 iter 的方式来迭代应该就不容易有 input 多次使用的问题了
            const r2 = parser2.parse(r1.Remain);
            if (r2 != null) {
                const r3 = this.mResultCombinator(r1.Result, r2.Result);
                return {
                    Result: r3,
                    Remain: r2.Remain,
                };
            }
        }
        return null;
    }
    
}
function combine<T1, T2, T3>(parser1: IParser<T1>, parser2: IParser<T2>, resultCombinator: (r1: T1, r2: T2) => T3): IParser<T3> {
    return new Combine(parser1, parser2, resultCombinator);
}

/**
 * not use undefined as @template arg T.
 * Option use undefined to judge if exist value internal.
 */
export class Option<T extends { toString(): string; }> {
    private mT: T | undefined;

    public constructor(t: T | undefined = undefined) {
        this.mT = t;
    }
    
    public hasValue(): boolean {
        return this.mT !== undefined;  // null == undefined is true
    }

    public get value(): T {
        if (this.hasValue()) {
            return this.mT!;
        }
        throw new Error('get value while no value stored in Option');
    }

    public ToUndefined(): T | undefined {
        return this.mT;
    }

    public toString(): string {
        return stringify({
            value: this.mT?.toString(),
        });
    }
}

class Optional<T> implements IParser<Option<T>> {
    private mParser: IParser<T>;

    constructor(parser: IParser<T>) {
        if (parser === undefined) {
            console.trace('issue trace');
            log('parser arg is undefined');
        }
        this.mParser = parser;
    }

    @debug()
    public parse(input: ParserInput): ParserResult<Option<T>> {
        var parser = this.mParser;
        const oldInput = input.Copy();
        const r = parser.parse(input);
        if (r == null) {
            // 决定把 null 加入到类型中，因为针对每种 node 类型都构建一个对使用者来说默认值太麻烦了，
            // 因为使用者完全可以拿到一个 parser，不知道里面解析的结果，这时如果想 optional 下怎么办呢
            return {
                Result: new Option(),// 这里蛮神奇的，typescript 如何知道 Option<undefined> 和 Option<T> 是兼容的类型？我这里也没有显式指定类型参数
                Remain: oldInput,
            };
        }
        return {
            Result: new Option(r.Result),
            Remain: r.Remain,
        };
    }

}
export function optional<T>(parser: IParser<T>): IParser<Option<T>> {
    return new Optional(parser);
}

class OneOrMore<T, T1> implements IParser<T1> {
    private mOption: IParser<Option<T>>;
    private mResultConverter: (...ts: T[]) => T1;

    constructor(parser: IParser<T>, resultConverter: (...ts: T[]) => T1) {
        this.mOption = optional(parser);
        this.mResultConverter = resultConverter;
    }

    @debug()
    public parse(input: ParserInput): ParserResult<T1> {
        var option = this.mOption;

        let results: T[] = [];
        for (; ;) {
            // 因 optional 的原因，这里 r 必不可能是 null
            const r = option.parse(input);
            if (r!.Result.hasValue()) {
                results.push(r!.Result.value);
                input = r!.Remain;
            } else {
                if (results.length == 0) {
                    return null;
                }
                return {
                    Result: this.mResultConverter(...results),
                    Remain: r!.Remain,
                };
            }
        }
    }

}
// oneOrmore(Optional()) 这种情况能处理吗，这是使用者的责任
function oneOrMore<T, T1>(parser: IParser<T>, resultConverter: (...ts: T[]) => T1): IParser<T1> {
    return new OneOrMore(parser, resultConverter);
}

class ZeroOrMore<T, T1> implements IParser<T1> {
    private mOption: IParser<Option<T>>;
    private mResultConverter: (...ts: T[]) => T1;

    constructor(parser: IParser<T>, resultConverter: (...ts: T[]) => T1) {
        this.mOption = optional(parser);
        this.mResultConverter = resultConverter;
    }

    @debug()
    public parse(input: ParserInput): ParserResult<T1> {
        // 因 optional 的原因，这里 r 必不可能是 null
        var r = this.iter(input, []);
        return {
            Result: this.mResultConverter(...r.Result),
            Remain: r.Remain,
        };
    }

    // 感觉下面这个修改下设计可以用在好几个地方，安全又卫生
    private iter(input: ParserInput, ts: T[]): { Result: T[], Remain: ParserInput } {
        const r = this.mOption.parse(input);
        if (r!.Result.hasValue()) {
            ts.push(r!.Result.value);
            return this.iter(r!.Remain, ts);
        } else {
            return {
                Result: ts,
                Remain: r!.Remain,
            };
        }
    }
    
}
function zeroOrMore<T, T1>(parser: IParser<T>, resultConverter: (...ts: T[]) => T1): IParser<T1> {
    return new ZeroOrMore(parser, resultConverter);
}

// type RemoveNoOption<Type> = Exclude<Type, NoOption>;

class Or<T1, T2, T3> implements IParser<T3> {
    private mOption1: IParser<Option<T1>>;
    private mOption2: IParser<Option<T2>>;
    private mResultProcessor: (t1: T1 | null, t2: T2 | null) => T3;

    constructor(parser1: IParser<T1>, parser2: IParser<T2>, resultProcessor: (t1: T1 | null, t2: T2 | null) => T3) {
        this.mOption1 = optional(parser1);
        this.mOption2 = optional(parser2);
        this.mResultProcessor = resultProcessor;
    }

    @debug()
    public parse(input: ParserInput): ParserResult<T3> {
        var option1 = this.mOption1.parse.bind(this.mOption1);
        var option2 = this.mOption2.parse.bind(this.mOption2);

        // 因 optional 的原因，这里 r 必不可能是 null
        const r1 = option1(input); // input may be changed internal, so not use below
        if (r1!.Result.hasValue()) {
            return {
                Result: this.mResultProcessor(r1!.Result.value, null),
                Remain: r1!.Remain,
            };
        }
        const r2 = option2(r1!.Remain);
        if (r2!.Result.hasValue()) {
            return {
                Result: this.mResultProcessor(null, r2!.Result.value),
                Remain: r2!.Remain,
            };
        }
        return null;
    }
}
/**
 * results of @argument parser1 and @argument parser2 are not same
 */
export function or<T1, T2, T3>(parser1: IParser<T1>, parser2: IParser<T2>, resultProcessor: (t1: T1 | null, t2: T2 | null)=> T3) {
    return new Or(parser1, parser2, resultProcessor);
}

class Transform<T, T1> implements IParser<T1> {
    private mParser: IParser<T>;
    private mTransformFunc: (t: T) => T1;

    /**
     * @param transformFunc NoOption in T | NoOption is the result in option result, not fail result
     */
    constructor(parser: IParser<T>, transformFunc: (t: T) => T1) {
        if (parser === undefined) {
            console.trace('transform issue trace: undefined');
        }
        this.mParser = parser;
        this.mTransformFunc = transformFunc;
    }

    @debug()
    public parse(input: ParserInput): ParserResult<T1> {
        // var p = this.mParser.parse; // 这样赋值会影响函数绑定到 this 啊，类似 C++ 直接保存成员函数地址！本来下面是调用 p 的，然后报了个 this undefine 的错
        // var transformFunc = this.mTransformFunc;
        log('this.mParser', this.mParser === undefined);
        const r = this.mParser.parse(input);
        if (r == null) {
            return null;
        }
        return {
            Result: this.mTransformFunc(r.Result),
            Remain: r.Remain,
        };
    }
    
}
const transform = <T, T1>(p: IParser<T>, transformFunc: (t: T) => T1): IParser<T1> => {
    return new Transform(p, transformFunc);
};

class EitherOf<T1, T2> implements IParser<T2> {
    private mOptionParsers: IParser<Option<T1>>[];
    private mResultProcessor: (...t1s: (T1 | null)[]) => T2;

    public constructor(resultPrcessor: (...t1s: (T1 | null)[]) => T2, ...parsers: IParser<T1>[]) {
        this.mOptionParsers = parsers.map((x, i) => {
            // log('EitherOf parser', i, x === undefined);
            return optional(x);
        });
        this.mResultProcessor = resultPrcessor;
    }

    @debug()
    parse(input: ParserInput): ParserResult<T2> {
        const optionNum = this.mOptionParsers.length;
        for (var i = 0; i < optionNum; i++) {
            const p = this.mOptionParsers[i];
            const oldInput = input.Copy();
            const r = p.parse(input);
            if (r!.Result.hasValue()) {
                const result: (T1 | null)[] = Array(optionNum).fill(null);
                result[i] = r!.Result.value;
                return {
                    Result: this.mResultProcessor(...result),
                    Remain: r!.Remain,
                };
            } else {
                input = oldInput;
            }
        }
        return null;
    }
}
/**
 * results of @argument parsers are same.
 */
export const eitherOf = <T1, T2>(resultPrcessor: (...t1s: (T1 | null)[]) => T2, ...parsers: IParser<T1>[]): IParser<T2> => {
    return new EitherOf(resultPrcessor, ...parsers);
};

class PrefixComment<T> implements IParser<T> {
    private mComment: string;
    private mParser: IParser<T>;

    public constructor(parser: IParser<T>, comment: string) {
        this.mComment = comment;
        this.mParser = parser;
    }

    public parse(input: ParserInput): ParserResult<T> {
        logWith(Indent.KeepSame, this.mComment);
        const r = this.mParser.parse(input);
        return r;
    }    
}

const prefixComment = <T>(parser: IParser<T>, comment: string): PrefixComment<T> => {
    return new PrefixComment(parser, comment);
};

// 之后想一下，大部分代码都是错的情况下，如何生成补全内容, 也就是说如何尽量匹配到正确语法的内容
// 最终的结果都会合并到 T 中
export type from<T> = {
    oneOrMore: <T1>(resultConverter: (...ts: T[]) => T1) => from<T1>,
    zeroOrMore: <T1>(resultConverter: (...ts: T[]) => T1) => from<T1>,
    rightWith: <T1, T2>(p1: IParser<T1>, resultCombinator: (r1: T, r2: T1) => T2) => from<T2>,
    leftWith: <T1, T2>(p1: IParser<T1>, resultCombinator: (r1: T1, r2: T) => T2) => from<T2>,
    transform: <T1>(transformFunc: (t: T) => T1) => from<T1>,
    prefixComment: (comment: string) => from<T>,
    raw: IParser<T>,
};

export const from: <T>(p: IParser<T>) => from<T> = <T>(p: IParser<T>) => ({
    oneOrMore: <T1>(resultConverter: (...ts: T[]) => T1) => from(oneOrMore(p, resultConverter)),
    zeroOrMore: <T1>(resultConverter: (...ts: T[]) => T1) => from(zeroOrMore(p, resultConverter)),
    rightWith: <T1, T2>(p1: IParser<T1>, resultCombinator: (r1: T, r2: T1) => T2) => from(combine(p, p1, resultCombinator)),
    leftWith: <T1, T2>(p1: IParser<T1>, resultCombinator: (r1: T1, r2: T) => T2) => from(combine(p1, p, resultCombinator)),
    transform: <T1>(transformFunc: (t: T) => T1) => from(transform(p, transformFunc)),
    prefixComment: (comment: string) => from(prefixComment(p, comment)),
    raw: p,
});

// https://www.baidu.com
export function appendString(s1: string, s2: string): string {
    return s1 + s2;
}

export const combineAsArray = <T>(t: T) => {

};

// 因为下面这个，我终于知道 Haskell 里的同样的函数的作用了
export const id = <T>(t: T) => (t);
export const nullize = <T>(...ts: T[]) => (null);
export const selectLeft = <T1, T2>(t1: T1, t2: T2) => (t1);
export const selectRight = <T1, T2>(t1: T1, t2: T2) => (t2);
// caller 需要保证两个中必有一空白
// TODO due to unused, delete this method
export const selectNonblank = (s1: string, s2: string): string => {
    s1 = s1.trim();
    s2 = s2.trim();
    if (s1 == '') {
        return s2;
    }
    if (s2 == '') {
        return s1;
    }
    throw new Error('all are non-blank in selectNonblank');
};

export const withHandleNull = function<T>(orginalHandler: (t1: T, t2: T)=> T) {
    return (t1: T | null, t2: T | null): T | null => {
        if (t1 == null) {
            return t2;
        }
        if (t2 == null) {
            return null;
        }
    
        return orginalHandler(t1, t2);
    };
};
