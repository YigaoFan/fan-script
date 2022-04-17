import { ParserInput, ParserResult, IParser, debug, IInputStream } from './IParser';

class Combine<T1, T2, T3> implements IParser<T3> {
    private mParser1: IParser<T1>;
    private mParser2: IParser<T2>;
    private mResultCombinator: (r1: T1 | null, r2: T2 | null) => T3;

    constructor(parser1: IParser<T1>, parser2: IParser<T2>, resultCombinator: (r1: T1 | null, r2: T2 | null) => T3) {
        this.mParser1 = parser1;
        this.mParser2 = parser2;
        this.mResultCombinator = resultCombinator;
    }

    @debug()
    public parse(input: IInputStream): ParserResult<T3> {
        var parser1 = this.mParser1;
        var parser2 = this.mParser2;
        const r1 = parser1.parse(input);
        if (r1 != null) {
            const r2 = parser2.parse(input);
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
function combine<T1, T2, T3>(parser1: IParser<T1>, parser2: IParser<T2>, resultCombinator: (r1: T1 | null, r2: T2 | null) => T3): IParser<T3> {
    return new Combine(parser1, parser2, resultCombinator);
}

class Option<T> implements IParser<T> {
    private mParser: IParser<T>;

    constructor(parser: IParser<T>) {
        this.mParser = parser;
    }

    @debug()
    public parse(input: IInputStream): ParserResult<T> {
        var parser = this.mParser;
        const oldInput = input.Copy();
        const r = parser.parse(input);
        if (r == null) {
            // 决定把 null 加入到类型中，因为针对每种 node 类型都构建一个对使用者来说默认值太麻烦了，
            // 因为使用者完全可以拿到一个 parser，不知道里面解析的结果，这时如果想 optional 下怎么办呢
            return {
                Result: null,
                Remain: oldInput,
            };
        }
        return r;
    }

}
export function optional<T>(parser: IParser<T>): IParser<T> {
    return new Option(parser);
}

class OneOrMore<T, T1> implements IParser<T1> {
    private mOption: IParser<T>;
    private mResultConverter: (ts: T[]) => T1;

    constructor(parser: IParser<T>, resultConverter: (ts: T[]) => T1) {
        this.mOption = optional(parser);
        this.mResultConverter = resultConverter;
    }

    @debug()
    public parse(input: IInputStream): ParserResult<T1> {
        var option = this.mOption;

        let results: T[] = [];
        for (; ;) {
            // 因 optional 的原因，这里 r 必不可能是 null
            const r = option.parse(input);
            if (r!.Result != null) {
                results.push(r!.Result);
            } else {
                if (results.length == 0) {
                    return null;
                }
                return {
                    Result: this.mResultConverter(results),
                    Remain: input,
                };
            }
        }
    }

}
// oneOrmore(Optional()) 这种情况能处理吗，这是使用者的责任
function oneOrMore<T, T1>(parser: IParser<T>, resultConverter: (ts: T[]) => T1): IParser<T1> {
    return new OneOrMore(parser, resultConverter);
}

class ZeroOrMore<T, T1> implements IParser<T1> {
    private mOption: IParser<T>;
    private mResultConverter: (ts: T[]) => T1;

    constructor(parser: IParser<T>, resultConverter: (ts: T[]) => T1) {
        this.mOption = optional(parser);
        this.mResultConverter = resultConverter;
    }

    @debug()
    public parse(input: IInputStream): ParserResult<T1> {
        var option = this.mOption.parse;
        var resultConverter = this.mResultConverter;

        let results: T[] = [];
        for (; ;) {
            // 因 optional 的原因，这里 r 必不可能是 null
            const r = option(input);
            if (r!.Result != null) {
                results.push(r!.Result);
            } else {
                return {
                    Result: resultConverter(results),
                    Remain: input,
                };
            }
        }
    }
    
}
function zeroOrMore<T, T1>(parser: IParser<T>, resultConverter: (ts: T[]) => T1): IParser<T1> {
    return new ZeroOrMore(parser, resultConverter);
}

class EitherOf<T1, T2> {
    private mOption1: IParser<T1>;
    private mOption2: IParser<T2>;

    constructor(parser1: IParser<T1>, parser2: IParser<T2>) {
        this.mOption1 = optional(parser1);
        this.mOption2 = optional(parser2);
    }

    @debug()
    public parse(input: IInputStream): ParserResult<T1> | ParserResult<T2> {
        var option1 = this.mOption1.parse;
        var option2 = this.mOption2.parse;

        const r1 = option1(input);
        if (r1 != null) {
            return r1;
        }
        const r2 = option2(input);
        if (r2 != null) {
            return r2;
        }
        return null;
    }
}
function eitherOf<T1, T2>(parser1: IParser<T1>, parser2: IParser<T2>) {
    return new EitherOf(parser1, parser2);
}

class Transform<T, T1> implements IParser<T1> {
    private mParser: IParser<T>;
    private mTransformFunc: (t: T | null) => T1;

    /**
     * @param transformFunc null in T | null is the result in option result, not fail result
     */
    constructor(parser: IParser<T>, transformFunc: (t: T | null) => T1) {
        this.mParser = parser;
        this.mTransformFunc = transformFunc;
    }

    @debug()
    public parse(input: IInputStream): ParserResult<T1> {
        // var p = this.mParser.parse; // 这样赋值会影响函数绑定到 this 啊，类似 C++ 直接保存成员函数地址！本来下面是调用 p 的，然后报了个 this undefine 的错
        // var transformFunc = this.mTransformFunc;

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
const transform = <T, T1>(p: IParser<T>, transformFunc: (t: T | null) => T1): IParser<T1> => {
    return new Transform(p, transformFunc);
};


// 之后想一下，大部分代码都是错的情况下，如何生成补全内容, 也就是说如何尽量匹配到正确语法的内容
// 最终的结果都会合并到 T 中
export type from<T> = {
    oneOrMore: <T1>(resultConverter: (ts: T[]) => T1) => from<T1>,
    zeroOrMore: <T1>(resultConverter: (ts: T[]) => T1) => from<T1>,
    rightWith: <T1, T2>(p1: IParser<T1>, resultCombinator: (r1: T | null, r2: T1 | null) => T2) => from<T2>,
    leftWith: <T1, T2>(p1: IParser<T1>, resultCombinator: (r1: T1 | null, r2: T | null) => T2) => from<T2>,
    transform: <T1>(transformFunc: (t: T | null) => T1) => from<T1>,
    raw: IParser<T>,
};

export const from: <T>(p: IParser<T>) => from<T> = <T>(p: IParser<T>) => ({
    oneOrMore: <T1>(resultConverter: (ts: T[]) => T1) => from(oneOrMore(p, resultConverter)),
    zeroOrMore: <T1>(resultConverter: (ts: T[]) => T1) => from(zeroOrMore(p, resultConverter)),
    // 下面这两个主要用于加一些重点关注的内容，比如空白
    rightWith: <T1, T2>(p1: IParser<T1>, resultCombinator: (r1: T | null, r2: T1 | null) => T2) => from(combine(p, p1, resultCombinator)),
    leftWith: <T1, T2>(p1: IParser<T1>, resultCombinator: (r1: T1 | null, r2: T | null) => T2) => from(combine(p1, p, resultCombinator)),
    transform: <T1>(transformFunc: (t: T | null) => T1) => from(transform(p, transformFunc)),
    raw: p,
});

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
