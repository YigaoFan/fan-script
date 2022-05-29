
// parse sample
// func hello() {
// }
import { log, } from './util';
import { makeWordParser, oneOf, lazy, } from "./parser";
import { KeywordNode, BlankNode, FunctionNode, } from "./ISyntaxNode";
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
    or,
    Option,
} from "./combinator";
import { IParser, } from "./IParser";

const combine = (strs: string[]): string => (strs.join(''));
const consArray = <T>(t1: T, t2: T) => ([t1, t2]);

const rightCombineOption = <T>(t: T, ts: Option<T[]>): T[] => {
    if (!ts.hasValue()) {
        return [t];
    }
    return rightCombine(t, ts.value);
};

const rightCombine = <T>(t: T, ts: T[]): T[] => {
    ts.unshift(t);
    return ts;
};

// 结果里应该不会有 NoOption，这个要想下
// const leftCom = (ts: NoOption | (string | NoOption)[], t: string | NoOption): (NoOption | (string | NoOption)[])[] => {
const leftCombine = <T>(ts: T[], t: T): T[] => { // 我这里的类型和上面他期望的类型并不完全一样，改成具体类型 string 后就编译不行了，看来是泛型起了作用，类型体操还不会啊
    // if (NoOption.equal(ts)) {
    //     return [t];
    // }
    var s = ts as T[];
    s.push(t);
    return s;
};

const notEmpty = <TValue>(value: TValue | null | undefined): value is TValue => {
    if (value === null || value === undefined /*|| NoOption.equal(value)*/) {
        return false;
    }
    const testDummy: TValue = value;
    return true;
};
const nullToEmptyArray = <T>(ts: T[] | null): T[] => (ts == null ? [] : ts);

const funcKeyword = makeWordParser('func', KeywordNode.New);
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
                        // .transform((xs): string[] => (NoOption.equal(xs) ? [] : xs.filter(notEmpty)))
                        .raw;

                        const parasWithParens = from(varWithBlanks)
                .rightWith(optional(remainParas), rightCombineOption) // 这里 optional 产生的解析结果类型对吗？
                .leftWith(leftParen, selectRight)
                .rightWith(rightParen, selectLeft)
                // .transform((xs): string[] => (NoOption.equal(xs) ? [] : xs.filter(notEmpty))) // 在 .Result 类型上加入 null 支持 optional，这里的 xs 就永远可能为 null，所以这个函数里的两个操作不能被分成两个 transform 语句
                .raw;

const leftBrace = from(makeWordParser('{', id)).leftWith(optional(blanks), selectRight).rightWith(optional(blanks), selectLeft).raw;
const rightBrace = from(makeWordParser('}', id)).leftWith(optional(blanks), selectRight).rightWith(optional(blanks), selectLeft).raw;

// 变量不能 Block-scoped variable 'testRecur' used before its declaration.
// const testRecur = from(makeWordParser('recur', id))
//                     .rightWith(optional(testRecur), selectLeft)
//                     .raw;
const consBody = function(): IParser<string[]> {
    // lazy 之后可能要重命名，这个名字不清晰 TODO
    // 既然 body、if、for 各个体中互相引用了，那就不能先定义了，只能先声明，然后引用
    // body 里还有普通的语句，作为递归的终点
    // let ifStmt, body, forStmt: IParser<string>; // T 暂时为 string
    // 下面这个里面其实还可以互相嵌套的 TODO，其实任何 function body 里可以有的东西都可以在里面，这就递归了
    const block = from(optional(blanks))
                .rightWith(makeWordParser('{', id), selectLeft)
                .rightWith(optional(blanks), selectLeft)
                .rightWith(lazy(consBody), selectRight) // 这里的结果肯定是错的，后面处理 // 肯定要提供一种惰性求值，类似指针的操作，保留一种无限的能力，不然这里的函数会无限递归下去
                .rightWith(optional(blanks), selectLeft)
                .rightWith(makeWordParser('}', id), selectLeft)
                .rightWith(optional(blanks), selectLeft)
                .raw;
    const rightCombine = (x: string, y: string[]) => {
        y.unshift(x);
        return y;
    };
    const ifStmt = from(makeWordParser('if', id))
        .rightWith(optional(blanks), selectLeft)
        .rightWith(makeWordParser('(', id), selectLeft)
        // TODO bool exp
        .rightWith(makeWordParser(')', id), selectLeft)
        .rightWith(block, rightCombine)
        .rightWith(optional(from(makeWordParser('else', id))
                            .rightWith(block, selectRight).raw), (x, y): string[] => {
                                if (y.hasValue()) {
                                    return x.concat(y.value);
                                }
                                return x;
                            })
        .raw;
    const forStmt = from(makeWordParser('for', id))
                    .rightWith(optional(blanks), selectLeft)
                    .rightWith(makeWordParser('(', id), selectLeft)
                    // TODO for condition exp
                    .rightWith(makeWordParser(')', id), selectLeft)
                    .rightWith(optional(blanks), selectLeft)
                    .rightWith(block, rightCombine)
                    .raw;
    // EitherOf 的接口要想一下，加个 resultProcessor
    const body = from(or(ifStmt, forStmt, (a, b) => {
        if (a) {
            return a;
        } else if (b) {
            return b;
        } else {
            throw new Error('body content not handle in all possible path');
        }
    })).zeroOrMore(id)
    .transform(xs => xs.flat()).raw;
    // 接下来完善 exp 和 stmt parser 就可以大体完工了
    // 可能得重温下当时学构建浏览器的课程里的编写顺序了
    // 主要是分为哪些语法元素
    return body;
};

// 还是要想一下，transform 的类型的事，向上看，为什么可以这样 as
// 我也不知道我写出来这东西这么屌...，我自己一下都想不明白
const funcDefNode = FunctionNode.New();
// parse xxx, start
//      parse sub part
// parse xxx, result
// parse yyy, result
export const funcDef = from(funcKeyword)
                    .rightWith(blanks, selectLeft)
                    .rightWith(varName, selectRight)
                    .rightWith(optional(blanks), selectLeft)
                    .rightWith(parasWithParens, rightCombine)
                    .rightWith(leftBrace, selectLeft)
                    // .rightWith(ifStmt, leftCombine) // 为什么这里能编过...
                    .rightWith(rightBrace, selectLeft)
                    // .transform((xs): string[] => (NoOption.equal(xs) ? [] : xs.filter(notEmpty)))
                    .raw;

// unit test for each up parser
export const test = function() {

};