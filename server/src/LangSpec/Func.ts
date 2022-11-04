import { assert } from "console";
import {
    from, id,
    nullize, Option, optional, selectLeft,
    selectRight
} from "../combinator";
import { Position, Text } from "../IParser";
import { ISyntaxNode } from "../ISyntaxNode";
import { makeWordParser } from "../parser";
import { asArray, stringify } from "../util";
import { Identifier, identifier } from "./Identifier";
import { Literal } from "./Literal";
import { Statement } from "./Statement";
import { whitespace } from "./Whitespace";

export class Func implements Literal {
    private mName?: Identifier;
    private mParas: Paras;
    private mBlock: Block;

    public static New(args: (ISyntaxNode | Text)[]) {
        assert(args.length == 6);
        return new Func(args[1] as Identifier, args[3] as Paras, args[6] as Block);
    }

    private constructor(name: Identifier, paras: Paras, block: Block) {
        this.mName = name;
        this.mParas = paras;
        this.mBlock = block;
    }

    public static SetName(func: Func, name: Identifier) {
        func.mName = name;
        return func;
    }

    public Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }

    public get Valid(): boolean {
        throw new Error("Method not implemented.");
    }

    public toString(): string {
        return stringify({
            
        });
    }
}

export class Paras implements ISyntaxNode {
    private mParas: Identifier[];

    public static New(args: (ISyntaxNode | Text)[]) {
        assert(args.length === 3 || args.length === 0);
        const ps = new Paras();
        if (args.length === 0) {
            return ps;
        }
        ps.mParas.push(args[0] as Identifier);
        ps.mParas.push(...(args[2] as Paras).mParas);
        return ps;
    }
    
    private constructor() {
        this.mParas = [];
    }

    public Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }
    
    public get Valid(): boolean {
        throw new Error("Method not implemented.");
    }
    
    public toString(): string {
        return stringify({
            paras: this.mParas.map(x => x.toString()),
        });
    }
}

export class Stmts implements ISyntaxNode {
    private mStmt?: Statement;
    private mRemainStmts?: Stmts;

    public static New(args: (ISyntaxNode | Text)[]) {
        assert(args.length == 2 || args.length == 0);
        const s = new Stmts();
        if (args.length == 2) {
            s.mStmt = args[0] as Statement;
            s.mRemainStmts = args[1] as Stmts;
        }
        return s;
    }

    private constructor() {
    }

    public Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }

    public get Valid(): boolean {
        throw new Error("Method not implemented.");
    }

    public toString(): string {
        return stringify({
            
        });
    }
}

export class Block implements ISyntaxNode {
    private mStmts: Stmts;

    public static New(args: (ISyntaxNode | Text)[]) {
        assert(args.length == 3);
        const s = new Block(args[1] as Stmts);
        return s;
    }

    private constructor(stmts: Stmts) {
        this.mStmts = stmts;
    }

    public Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }

    public get Valid(): boolean {
        throw new Error("Method not implemented.");
    }

    public toString(): string {
        return stringify({

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
