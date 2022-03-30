
// parse sample
// func hello() {
// }

import { makeWordParser, oneOf, } from "./parser"
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

const capAlphabets = Array.from(Array(26)).map((_, i) => i + 65).map(x => String.fromCharCode(x));
const alphabets = Array.from(Array(26)).map((_, i) => i + 65 + 32).map(x => String.fromCharCode(x));
const combine = (strs: string[]): string => (strs.join());

const rightCombineIntoArray = <T>(t: T, ts: T[] | null): T[] => {
    if (ts == null) {
        return [t];
    }
    ts.push(t);
    return ts;
};
const notEmpty = <TValue>(value: TValue | null | undefined): value is TValue => {
    if (value === null || value === undefined) return false;
    const testDummy: TValue = value;
    return true;
};
const nullToEmptyArray = <T>(ts: T[] | null): T[] => (ts == null ? [] : ts);

const func = makeWordParser('func', KeywordNode.New);
const blanks = from(makeWordParser(' ', nullize)).oneOrMore(nullize).transform(nullize).raw;
const varName = from(oneOf('abc_', id)).oneOrMore(combine).raw;

const leftParen = from(makeWordParser('(', id)).leftWith(optional(blanks), selectRight).rightWith(optional(blanks), selectLeft).raw;
const rightParen = from(makeWordParser(')', id)).leftWith(optional(blanks), selectRight).rightWith(optional(blanks), selectLeft).raw;
const remainParas = from(makeWordParser(',', nullize))
                        .rightWith(optional(blanks), nullize)
                        .leftWith(optional(blanks), nullize)
                        .rightWith(varName, selectRight)
                        .zeroOrMore(id)
                        // use transform to remove the null from T in Parser<T> which come from rightWith
                        .transform((xs): string[] => (xs == null ? [] : xs.filter(notEmpty)))
                        .raw;
const parasWithParens = from(varName)
                .rightWith(optional(remainParas), rightCombineIntoArray) // 这里 optional 产生的解析结果类型对吗？
                .leftWith(leftParen, selectRight)
                .rightWith(rightParen, selectLeft)
                .transform((xs): string[] => (xs == null ? [] : xs.filter(notEmpty))) // 在 .Result 类型上加入 null 支持 optional，这里的 xs 就永远可能为 null，所以这个函数里的两个操作不能被分成两个 transform 语句
                .raw;

const leftBrace = from(makeWordParser('{', id)).leftWith(optional(blanks), selectRight).rightWith(optional(blanks), selectLeft).raw;
const rightBrace = from(makeWordParser('}', id)).leftWith(optional(blanks), selectRight).rightWith(optional(blanks), selectLeft).raw;

// 我也不知道我写出来这东西这么屌...，我自己一下都想不明白
const funcDefNode = FunctionNode.New();
const funcDef = from(func)
                    .rightWith(blanks, selectLeft)
                    .rightWith(varName, selectRight)
                    .rightWith(blanks, selectLeft)
                    .rightWith(parasWithParens, rightCombineIntoArray)
                    .rightWith(leftBrace, selectLeft)
                    .rightWith(rightBrace, selectLeft)
                    .transform((xs): string[] => (xs == null ? [] : xs.filter(notEmpty)))
                    .raw;