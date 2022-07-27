import { IParser, Range } from "../IParser";
import { ISyntaxNode } from "../ISyntaxNode";
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
} from "../combinator";
import { lazy, makeWordParser, oneOf } from "../parser";
import { asArray, combine, selectNotNull } from "../util";
import { whitespace } from "./Whitespace";
import { Identifier, identifier } from "./Identifier";
import { IStatement } from "./Statement";
import { Expression, expression } from "./Expression";

export class Func implements ISyntaxNode {
    private mName?: Identifier;
    private mParas?: Identifier[];
    private mBlock?: IStatement[];

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

    public static SetBlock(func: Func, block: IStatement[]) {
        func.mBlock = block;
        return func;
    }

    get Range(): Range | null {
        throw new Error("Method not implemented.");
    }
    set Range(range: Range | null) {
        throw new Error("Method not implemented.");
    }
    get Valid(): boolean {
        throw new Error("Method not implemented.");
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

const leftParen = from(makeWordParser('(', id)).leftWith(optional(blanks), selectRight).rightWith(optional(blanks), selectLeft).raw;
const rightParen = from(makeWordParser(')', id)).leftWith(optional(blanks), selectRight).rightWith(optional(blanks), selectLeft).raw;
const varWithBlanks = from(varName).leftWith(optional(blanks), selectRight).rightWith(optional(blanks), selectLeft).raw;
const remainParas = from(makeWordParser(',', nullize)).rightWith(varWithBlanks, selectRight).zeroOrMore(asArray).raw;
const paras = from(varWithBlanks).rightWith(optional(remainParas), rightCombineOption).raw;
const parasWithParen = from(leftParen).rightWith(optional(paras), selectRight).rightWith(rightParen, selectLeft).raw;
const leftBrace = from(makeWordParser('{', id)).leftWith(optional(blanks), selectRight).rightWith(optional(blanks), selectLeft).raw;
const rightBrace = from(makeWordParser('}', id)).leftWith(optional(blanks), selectRight).rightWith(optional(blanks), selectLeft).raw;

class IfStmt implements IStatement {
    private mCondExp?: Expression;
    private mBlock?: IStatement[];
    private mElseBlock?: IStatement[];
    // 每个节点都该有个准入条件，方便补全时判断是否已经进入节点，或者有个判断当前节点是否进入的方法
    // 目前是创造了节点都已经进入了
    public static New() {
        return new IfStmt();
    }
    // TODO use decorator to generate this kind method
    public static SetCond(statement: IfStmt, expression: Expression) {
        statement.mCondExp = expression;
        return statement;
    }

    public static SetBlock(statement: IfStmt, block: IStatement[]) {
        statement.mElseBlock = block;
        return statement;
    }

    public static SetElseBlock(statement: IfStmt, elseBlock: Option<IStatement[]>) {
        if (elseBlock.hasValue()) {
            statement.mElseBlock = elseBlock.value;
        }
        return statement;
    }

    public constructor() {
    } 
    get Range(): Range | null {
        throw new Error("Method not implemented.");
    }
    set Range(range: Range | null) {
        throw new Error("Method not implemented.");
    }
    get Valid(): boolean {
        throw new Error("Method not implemented.");
    }
}

class ForStmt implements IStatement {
    private mInitExp?: Expression;
    private mCondExp?: Expression;
    private mUpdateExp?: Expression;
    private mBlock?: IStatement[];

    public static New(): ForStmt {
        return new ForStmt();
    }

    public static SetInit(statement: ForStmt, expression: Expression) {
        statement.mInitExp = expression;
        return statement;
    }

    public static SetCond(statement: ForStmt, expression: Expression) {
        statement.mCondExp = expression;
        return statement;
    }

    public static SetUpdate(statement: ForStmt, expression: Expression) {
        statement.mUpdateExp = expression;
        return statement;
    }

    public static SetBlock(statement: ForStmt, block: IStatement[]) {
        statement.mBlock = block;
        return statement;
    }

    public constructor() {

    }    
    get Range(): Range | null {
        throw new Error("Method not implemented.");
    }
    set Range(range: Range | null) {
        throw new Error("Method not implemented.");
    }
    get Valid(): boolean {
        throw new Error("Method not implemented.");
    }
}

const consBlock = function(): IParser<IStatement[]> {
    // 既然 body、if、for 各个体中互相引用了，那就不能先定义了，只能先声明，然后引用
    // body 里还有普通的语句，作为递归的终点
    // 下面这个里面其实还可以互相嵌套的，其实任何 function body 里可以有的东西都可以在里面，这就递归了
    // 这里的结果肯定是错的，后面处理 // 肯定要提供一种惰性求值，类似指针的操作，保留一种无限的能力，不然这里的函数会无限递归下去
    const block = from(leftBrace).rightWith(lazy(consBlock), selectRight).rightWith(optional(blanks), selectLeft).rightWith(rightBrace, selectLeft).raw;
    const elseBlock = from(makeWordParser('else', id)).rightWith(block, selectRight).raw
    const ifStmt = from(makeWordParser('if', IfStmt.New))
        .rightWith(leftParen, selectLeft)
        .rightWith(expression, IfStmt.SetCond)
        .rightWith(rightParen, selectLeft)
        .rightWith(block, IfStmt.SetBlock)
        .rightWith(optional(elseBlock), IfStmt.SetElseBlock)
        .raw;
    const expWithBlank = from(expression).leftWith(optional(blanks), selectRight).rightWith(optional(blanks), selectLeft).raw;
    const expWithSemicolon = from(expWithBlank).rightWith(makeWordParser(';', id), selectLeft).rightWith(optional(blanks), selectLeft).raw;
    const forStmt = from(makeWordParser('for', ForStmt.New))
                    .rightWith(leftParen, selectLeft)
                    .rightWith(expWithSemicolon, ForStmt.SetInit)
                    .rightWith(expWithSemicolon, ForStmt.SetCond)
                    .rightWith(expWithBlank, ForStmt.SetUpdate)
                    .rightWith(rightParen, selectLeft)
                    .rightWith(block, ForStmt.SetBlock)
                    .raw;
    const body = from(or(ifStmt, forStmt, (a, b) => (selectNotNull<IStatement>(a, b)))).zeroOrMore(asArray).raw;
    return body;
};

// 还是要想一下，transform 的类型的事，向上看，为什么可以这样 as
// 我也不知道我写出来这东西这么屌...，我自己一下都想不明白
// parse xxx, start
//      parse sub part
// parse xxx, result
// parse yyy, result
export const func = from(makeWordParser('func', Func.New))
                    .rightWith(blanks, selectLeft)
                    .rightWith(varName, Func.SetName)
                    .rightWith(optional(blanks), selectLeft)
                    .rightWith(parasWithParen, Func.SetParameters)
                    .rightWith(leftBrace, selectLeft)
                    .rightWith(lazy(consBlock), Func.SetBlock)
                    .rightWith(rightBrace, selectLeft)
                    .raw;
