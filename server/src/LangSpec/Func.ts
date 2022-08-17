import { IParser, Position, } from "../IParser";
import { ISyntaxNode } from "../ISyntaxNode";
import {
    from,
    optional,
    id,
    nullize,
    selectLeft,
    selectRight,
    or,
    Option,
    eitherOf,
} from "../combinator";
import { lazy, makeWordParser, oneOf } from "../parser";
import { asArray, combine, log, selectNotNull, selectNotNullIn2DifferentType, stringify } from "../util";
import { Whitespace, whitespace } from "./Whitespace";
import { Identifier, identifier } from "./Identifier";
import { Statement } from "./Statement";
import { DeleteExpression, Expression, } from "./Expression";

export class Func implements ISyntaxNode {
    private mName?: Identifier;
    private mParas?: Identifier[];
    private mBlock?: Statement[];

    public static New() {
        return new Func();
    }

    public static SetName(func: Func, name: Identifier) {
        func.mName = name;
        return func;
    }

    public static SetParameters(func: Func, parameters: Option<Identifier[]>) {
        if (parameters.hasValue()) {
            func.mParas = parameters.value;
        }
        return func;
    }

    public static SetBlock(func: Func, block: Statement[]) {
        func.mBlock = block;
        return func;
    }

    Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }
    get Valid(): boolean {
        throw new Error("Method not implemented.");
    }

    public toString(): string {
        return stringify({
            name: this.mName?.toString(),
            parars: this.mParas?.map(x => x.toString()),
            block: this.mBlock?.map(x => x.toString()),
        });
    }
}

const blanks = whitespace;
const varName = identifier;
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

export const leftParen = from(makeWordParser('(', id)).leftWith(optional(blanks), selectRight).rightWith(optional(blanks), selectLeft).raw;
export const rightParen = from(makeWordParser(')', id)).leftWith(optional(blanks), selectRight).rightWith(optional(blanks), selectLeft).raw;
const varWithBlanks = from(varName).leftWith(optional(blanks), selectRight).rightWith(optional(blanks), selectLeft).raw;
const remainParas = from(makeWordParser(',', nullize)).rightWith(varWithBlanks, selectRight).zeroOrMore(asArray).raw;
const paras = from(varWithBlanks).rightWith(optional(remainParas), rightCombineOption).raw;
const parasWithParen = from(leftParen).rightWith(optional(paras), selectRight).rightWith(rightParen, selectLeft).raw;

// 

// const consBlock = function(stmt: IParser<Statement>): IParser<Statement[]> {
//     function notWhiteSpace(value: Statement | Whitespace): value is Statement {
//         if (value instanceof Whitespace) { 
//             return false;
//         }
//         return true;
//     }
//     return from(or(stmt, whitespace, selectNotNullIn2DifferentType))
//                 .zeroOrMore(asArray)
//                 .transform(xs => xs.filter(notWhiteSpace))
//                 .raw;
// };

enum StmtKind {
    All,
    VarStmt,
}

// 加一个终止符的概念，到了终止符，返回
// 终止符应该是一个特别的设定，而不是一个普通的 parser
// 解析要有开始和终止的概念，也要有开始和终止之间这一段是某个 parser 全权负责解析的概念，所以之前 return 语句里的多级 refinement 应该有办法解决
// 要不要语法解析过程也搞成一个语法结点内，可以有哪些子结点，而不止是解析结果有结构


// // parse xxx, start
// //      parse sub part
// // parse xxx, result
// // parse yyy, result
// // log('evaluate consFunc and func');
// export const consFunc = function() : IParser<Func> { 
//     return from(makeWordParser('func', Func.New))
//                     .prefixComment('parse func keyword')
//                     .rightWith(blanks, selectLeft)
//                     .rightWith(varName, Func.SetName)
//                     .rightWith(optional(blanks), selectLeft)
//                     .rightWith(parasWithParen, Func.SetParameters)
//                     .rightWith(leftBrace, selectLeft)
//                     .rightWith(consBlock(consStmt(lazy(consFunc), StmtKind.All)), Func.SetBlock)
//                     .rightWith(rightBrace, selectLeft)
//                     .prefixComment('parse func')
//                     .raw;
// };
// export const func = consFunc();
// export const varStmt = consStmt(func, StmtKind.VarStmt) as IParser<Statement>;
