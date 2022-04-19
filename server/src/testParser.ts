
// parse sample
// func hello() {
// }

import { makeWordParser, oneOf, } from "./parser";
import { KeywordNode, BlankNode, FunctionNode, } from "./grammarNode";
import {
    from,
    optional,
    appendString,
    withHandleNull, 
    id, 
    nullize, 
    selectLeft, 
    selectNonblank,
    selectRight, 
} from "./combinator";
import { NoOption } from "./IParser";

const capAlphabets = Array.from(Array(26)).map((_, i) => i + 65).map(x => String.fromCharCode(x));
const alphabets = Array.from(Array(26)).map((_, i) => i + 65 + 32).map(x => String.fromCharCode(x));
const combine = (strs: string[]): string => (strs.join(''));

const leftCombine = <T>(t: T, ts: T[] | NoOption): T[] => {
    if (NoOption.equal(ts)) {
        return [t];
    }
    var s = ts as T[];
    s.unshift(t);
    return s;
};
const notEmpty = <TValue>(value: TValue | null | undefined | NoOption): value is TValue => {
    if (value === null || value === undefined || NoOption.equal(value)) {
        return false;
    }
    // @ts-expect-error for NoOption error
    const testDummy: TValue = value;
    return true;
};
const nullToEmptyArray = <T>(ts: T[] | null): T[] => (ts == null ? [] : ts);

const func = makeWordParser('func', KeywordNode.New);
const blanks = from(makeWordParser(' ', nullize)).oneOrMore(nullize).transform(nullize).raw;
// abcd_ 太少了
const varName = from(oneOf('abcd_', id)).oneOrMore(combine).raw;

const leftParen = from(makeWordParser('(', id)).leftWith(optional(blanks), selectRight).rightWith(optional(blanks), selectLeft).raw;
const rightParen = from(makeWordParser(')', id)).leftWith(optional(blanks), selectRight).rightWith(optional(blanks), selectLeft).raw;
const varWithBlanks = from(varName)
                .leftWith(optional(blanks), selectRight)
                .rightWith(optional(blanks), selectLeft)
                .raw;
const remainParas = from(makeWordParser(',', nullize))
                        .rightWith(varWithBlanks, selectRight)
                        .zeroOrMore(id)
                        // use transform to remove the null from T in Parser<T> which come from rightWith
                        // @ts-expect-error for NoOption
                        .transform((xs): string[] => (NoOption.equal(xs) ? [] : xs.filter(notEmpty)))
                        .raw;
// replace varName with varWithBlanks
const parasWithParens = from(varWithBlanks)
                .rightWith(optional(remainParas), leftCombine) // 这里 optional 产生的解析结果类型对吗？
                .leftWith(leftParen, selectRight)
                .rightWith(rightParen, selectLeft)
                // @ts-expect-error
                .transform((xs): string[] => (NoOption.equal(xs) ? [] : xs.filter(notEmpty))) // 在 .Result 类型上加入 null 支持 optional，这里的 xs 就永远可能为 null，所以这个函数里的两个操作不能被分成两个 transform 语句
                .raw;

const leftBrace = from(makeWordParser('{', id)).leftWith(optional(blanks), selectRight).rightWith(optional(blanks), selectLeft).raw;
const rightBrace = from(makeWordParser('}', id)).leftWith(optional(blanks), selectRight).rightWith(optional(blanks), selectLeft).raw;

// 还是要想一下，transform 的类型的事，向上看，为什么可以这样 as
// 我也不知道我写出来这东西这么屌...，我自己一下都想不明白
const funcDefNode = FunctionNode.New();
// parse xxx, start
//      parse sub part
// parse xxx, result
// parse yyy, result
export const funcDef = from(func)
                    .rightWith(blanks, selectLeft)
                    .rightWith(varName, selectRight)
                    .rightWith(optional(blanks), selectLeft)
                    .rightWith(parasWithParens, leftCombine)
                    .rightWith(leftBrace, selectLeft)
                    .rightWith(rightBrace, selectLeft)
                    // @ts-expect-error
                    .transform((xs): string[] => (NoOption.equal(xs) ? [] : xs.filter(notEmpty)))
                    .raw;

// unit test for each up parser
export const test = function() {

};