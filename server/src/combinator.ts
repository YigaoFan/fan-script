import { Parser, ParserInput, ParserResult } from './parser';

export function combine<T1, T2, T3>(parser1: Parser<T1>, parser2: Parser<T2>, resultCombinator: (r1: T1 | null, r2: T2 | null) => T3): Parser<T3> {
    return input => {
        const r1 = parser1(input);
        if (r1 != null) {
            const r2 = parser2(input);
            if (r2 != null) {
                const r3 = resultCombinator(r1.Result, r2.Result);
                return {
                    Result: r3,
                    Remain: r2.Remain,
                };
            }
        }
        return null;
    };
}

export function optional<T>(parser: Parser<T>): Parser<T> {
    return input => {
        const oldInput = input.Copy();
        const r = parser(input);
        if (r == null) {
            // 决定把 null 加入到类型中，因为针对每种 node 类型都构建一个对使用者来说默认值太麻烦了，
            // 因为使用者完全可以拿到一个 parser，不知道里面解析的结果，这时如果想 optional 下怎么办呢
            return {
                Result: null,
                Remain: oldInput,
            };
        }
        return r;
    };
}

// oneOrmore(Optional()) 这种情况能处理吗，这是使用者的责任
export function oneOrMore<T, T1>(parser: Parser<T>, resultConverter: (ts: T[]) => T1): Parser<T1> {
    const option = optional(parser);
    return input => {
        let results: T[] = [];
        for (; ;) {
            // 因 optional 的原因，这里 r 必不可能是 null
            const r = option(input);
            if (r!.Result != null) {
                results.push(r!.Result);
            } else {
                if (results.length == 0) {
                    return null;
                }
                return {
                    Result: resultConverter(results),
                    Remain: input,
                };
            }
        }
    };
}

function zeroOrMore<T, T1>(parser: Parser<T>, resultConverter: (ts: T[]) => T1): Parser<T1> {
    const option = optional(parser);
    return input => {
        let results: T[] = [];
        for (;;) {
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
    };
}

export function eitherOf<T1, T2>(parser1: Parser<T1>, parser2: Parser<T2>) {
    const option1 = optional(parser1);
    const option2 = optional(parser2);
    return (input: ParserInput): ParserResult<T1> | ParserResult<T2> => {
        const r1 = option1(input);
        if (r1 != null) {
            return r1;
        }
        const r2 = option2(input);
        if (r2 != null) {
            return r2;
        }
        return null;
    };
}

export const transform = <T, T1>(p: Parser<T>, transformFunc: (t: T | null) => T1): Parser<T1> => {
    return (input: ParserInput) => {
        const r = p(input);
        if (r == null) {
            return null;
        }
        return {
            Result: transformFunc(r.Result),
            Remain: r.Remain,
        };
    };
};


// 之后想一下，大部分代码都是错的情况下，如何生成补全内容, 也就是说如何尽量匹配到正确语法的内容
// 最终的结果都会合并到 T 中
export type from<T> = {
    oneOrMore: <T1>(resultConverter: (ts: T[]) => T1) => from<T1>,
    zeroOrMore: <T1>(resultConverter: (ts: T[]) => T1) => from<T1>,
    rightWith: <T1, T2>(p1: Parser<T1>, resultCombinator: (r1: T | null, r2: T1 | null) => T2) => from<T2>,
    leftWith: <T1, T2>(p1: Parser<T1>, resultCombinator: (r1: T1 | null, r2: T | null) => T2) => from<T2>,
    transform: <T1>(transformFunc: (t: T | null) => T1) => from<T1>,
    raw: Parser<T>,
};

export const from: <T>(p: Parser<T>) => from<T> = <T>(p: Parser<T>) => ({
    oneOrMore: <T1>(resultConverter: (ts: T[]) => T1) => from(oneOrMore(p, resultConverter)),
    zeroOrMore: <T1>(resultConverter: (ts: T[]) => T1) => from(zeroOrMore(p, resultConverter)),
    // 下面这两个主要用于加一些重点关注的内容，比如空白
    rightWith: <T1, T2>(p1: Parser<T1>, resultCombinator: (r1: T | null, r2: T1 | null) => T2) => from(combine(p, p1, resultCombinator)),
    leftWith: <T1, T2>(p1: Parser<T1>, resultCombinator: (r1: T1 | null, r2: T | null) => T2) => from(combine(p1, p, resultCombinator)),
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
