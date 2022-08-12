import { IParser, Position, } from "../IParser";
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
    eitherOf,
} from "../combinator";
import { lazy, makeWordParser, oneOf } from "../parser";
import { asArray, combine, log, selectNotNull, selectNotNullIn2DifferentType, stringify } from "../util";
import { Whitespace, whitespace } from "./Whitespace";
import { Identifier, identifier } from "./Identifier";
import { Statement } from "./Statement";
import { consExp, consDeleteExp, DeleteExpression, Expression, genInvocation, genRefinement, ExpKind } from "./Expression";

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
export const leftBrace = from(makeWordParser('{', id)).leftWith(optional(blanks), selectRight).rightWith(optional(blanks), selectLeft).raw;
export const rightBrace = from(makeWordParser('}', id)).leftWith(optional(blanks), selectRight).rightWith(optional(blanks), selectLeft).raw;

class ReturnStmt implements Statement {
    private mExp?: Expression;
    Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }
    get Valid(): boolean {
        throw new Error("Method not implemented.");
    }

    public static New() {
        return new ReturnStmt();
    }

    public static SetExp(statement: ReturnStmt, result: Expression) {
        const s = statement;
        s.mExp = result;
        return s;
    }

    public toString(): string {
        return stringify({
            exp: this.mExp?.toString(),
        });
    }
}
export class VarStmt implements Statement {
    private mVars?: (readonly [Identifier, Expression?])[];

    public static New(): VarStmt {
        return new VarStmt();
    }

    public static AddVar(statement: VarStmt, oneVar: readonly [Identifier, Expression?]) {
        var s = statement;
        if (!s.mVars) {
            s.mVars = [];
        }
        s.mVars!.push(oneVar);
        return s;
    }

    public static AddVars(statement: VarStmt, vars: Option<(readonly [Identifier, Expression?])[]>) {
        var s = statement;
        if (!vars.hasValue()) {
            return s;
        }
        if (!s.mVars) {
            s.mVars = [];
        }
        for (const i of vars.value) {
            s.mVars!.push(i);
        }
        return s;
    }
    public toString(): string {
        return stringify(this.mVars?.map(x => stringify({
            name: x[0].toString(),
            exp: x[1]?.toString(),
        })));
    }

    Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }
    get Valid(): boolean {
        throw new Error("Method not implemented.");
    }
}

class IfStmt implements Statement {
    private mCondExp?: Expression;
    private mBlock?: Statement[];
    private mElseBlock?: Statement[];
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

    public static SetBlock(statement: IfStmt, block: Statement[]) {
        statement.mElseBlock = block;
        return statement;
    }

    public static SetElseBlock(statement: IfStmt, elseBlock: Option<Statement[]>) {
        if (elseBlock.hasValue()) {
            statement.mElseBlock = elseBlock.value;
        }
        return statement;
    }

    public constructor() {
    } 
    Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }
    get Valid(): boolean {
        throw new Error("Method not implemented.");
    }

    public toString(): string {
        return stringify({
            cond: this.mCondExp?.toString(),
            block: this.mBlock?.map(x => x.toString()),
            elseBlock: this.mElseBlock?.map(x => x.toString()),
        });
    }
}

class ForStmt implements Statement {
    private mInitExp?: Expression;
    private mCondExp?: Expression;
    private mUpdateExp?: Expression;
    private mBlock?: Statement[];

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

    public static SetBlock(statement: ForStmt, block: Statement[]) {
        statement.mBlock = block;
        return statement;
    }

    public constructor() {

    }    
    Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }
    get Valid(): boolean {
        throw new Error("Method not implemented.");
    }

    public toString(): string {
        return stringify({
            init: this.mInitExp?.toString(),
            cond: this.mCondExp?.toString(),
            update: this.mUpdateExp?.toString(),
            block: this.mBlock?.map(x => x.toString()),
        });
    }
}

// 每个结点只表示自己有的信息，不携带前后结点的信息
abstract class ExpStmtSubNode implements ISyntaxNode  {
    abstract Contains(p: Position): boolean;
    abstract get Valid(): boolean;
    /** default implementation */
    public toString(): string {
        var subObj = this.CrawlSubClassStruct();
        return stringify({
            ...subObj,
            rightNode: this.mRightNode?.toString(),
        });
    }
    protected mRightNode?: ExpStmtSubNode;
    protected CrawlSubClassStruct(): Object {
        return {};
    }

    /**
     * Set right node, return current work node.
     * @returns current work node. 
     * If right node set successful(right is not undefined), current work node will move forward to this right node.
     */
    public static SetRightReturnCurrent(node: ExpStmtSubNode, right?: ExpStmtSubNode) {
        if (right) {
            node.mRightNode = right;
            return right;
        }
        return node;
    }
}

/**
 * For place start with Option parser(not sure parse result), and we need a head, so this class
 */
class Empty_ExpStmtSubNode extends ExpStmtSubNode {
    Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }
    get Valid(): boolean {
        throw new Error("Method not implemented.");
    }
    public static New() {
        const n = new Empty_ExpStmtSubNode();
        return n;
    }
}

class Name_ExpStmtSubNode extends ExpStmtSubNode {
    private mName?: Identifier;
    
    public static New(name: Identifier): Name_ExpStmtSubNode {
        return new Name_ExpStmtSubNode(name);
    }

    public constructor(name: Identifier) {
        super();
        this.mName = name;
    }
    
    Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }
    get Valid(): boolean {
        throw new Error("Method not implemented.");
    }
    protected CrawlSubClassStruct(): Object {
        return {
            name: this.mName?.toString(),
        };
    }
}

class Expression_ExpStmtSubNode extends ExpStmtSubNode {
    private mExp?: Expression;

    public static New(expression: Expression): Expression_ExpStmtSubNode {
        return new Expression_ExpStmtSubNode(expression);
    }

    Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }
    get Valid(): boolean {
        throw new Error("Method not implemented.");
    }

    public constructor(expression: Expression) {
        super();
        this.mExp = expression;
    }

    protected CrawlSubClassStruct(): Object {
        return {
            exp: this.mExp?.toString(),
        };
    }
}

class Assign_ExpStmtSubNode extends ExpStmtSubNode {
    public static New(): Assign_ExpStmtSubNode {
        return new Assign_ExpStmtSubNode();
    }

    Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }
    get Valid(): boolean {
        throw new Error("Method not implemented.");
    }
}

class AddAssign_ExpStmtSubNode extends ExpStmtSubNode {
    public static New() {
        return new AddAssign_ExpStmtSubNode();
    }

    Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }
    get Valid(): boolean {
        throw new Error("Method not implemented.");
    }
}

class MinusAssign_ExpStmtSubNode extends ExpStmtSubNode {
    public static New() {
        return new MinusAssign_ExpStmtSubNode();
    }
    Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }
    get Valid(): boolean {
        throw new Error("Method not implemented.");
    }    
}

class Invoke_ExpStmtSubNode extends ExpStmtSubNode {
    private mArgs?: Expression[];

    public static New() {
        return new Invoke_ExpStmtSubNode();
    }

    public static SetArgs(node: Invoke_ExpStmtSubNode, args: Expression[]) {
        node.mArgs = args;
        return node;
    }

    Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }
    get Valid(): boolean {
        throw new Error("Method not implemented.");
    }

    protected CrawlSubClassStruct(): Object {
        return {
            args: this.mArgs?.map(x => x.toString()),
        };
    }
}

class Refine_ExpStmtSubNode extends ExpStmtSubNode {
    private mKey?: Expression;

    public static New() {
        return new Refine_ExpStmtSubNode();
    }

    public static SetKey(node: Refine_ExpStmtSubNode, key: Expression) {
        node.mKey = key;
        return node;
    }

    Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }
    get Valid(): boolean {
        throw new Error("Method not implemented.");
    }
    
    protected CrawlSubClassStruct(): Object {
        return {
            key: this.mKey?.toString(),
        };
    }
}

class ExpStmt implements Statement {
    private mRoot?: ExpStmtSubNode | DeleteExpression;

    public static New(root: ExpStmtSubNode | DeleteExpression) {
        return new ExpStmt(root);
    }

    public constructor(root: ExpStmtSubNode | DeleteExpression) {
        this.mRoot = root;
    }

    Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }
    get Valid(): boolean {
        throw new Error("Method not implemented.");
    }

    public toString(): string {
        return stringify({
            root: this.mRoot?.toString(),
        });
    }
}

const consBlock = function(stmt: IParser<Statement>): IParser<Statement[]> {
    function notWhiteSpace(value: Statement | Whitespace): value is Statement {
        if (value instanceof Whitespace) { 
            return false;
        }
        return true;
    }
    return from(or(stmt, whitespace, selectNotNullIn2DifferentType))
                .zeroOrMore(asArray)
                .transform(xs => xs.filter(notWhiteSpace))
                .raw;
};

enum StmtKind {
    All,
    VarStmt,
}

// 要不要语法解析过程也搞成一个语法结点内，可以有哪些子结点，而不止是解析结果有结构
export const consStmt = function(lazyFunc: IParser<Func>, kind: StmtKind): IParser<Statement> {
    const expWithBlank = from(consExp(lazyFunc, ExpKind.All)).leftWith(optional(blanks), selectRight).rightWith(optional(blanks), selectLeft).raw;
    const expWithSemicolon = from(expWithBlank).rightWith(makeWordParser(';', id), selectLeft).raw;

    // 要让 ; 参与到 expression 的解析中，这样就可以排除其他可能性解析
    const retStmt = from(makeWordParser('return', ReturnStmt.New)).rightWith(blanks, selectLeft).rightWith(from(consExp(lazyFunc, ExpKind.All, makeWordParser(';', nullize))).leftWith(optional(blanks), selectRight).rightWith(optional(blanks), selectLeft).raw, ReturnStmt.SetExp).prefixComment('parse return stmt').raw;
    // 有环就定义一个下面consAfterName这样的函数，确实是这样一个惯用法，环其实就是递归；之前说的跳到某一点也是这样做(AfterName 就代表一个点)
    // 也就是说可以有算法可以将语法图固定地转换为解析器代码
    // consXXX 代表函数生成的解析器内部有递归
    // getXXX 只是简单的封装，让代码不那么乱
    // expression statement
    const getExpStmt = function(): IParser<ExpStmt> {
        const cons1stWay = function(): IParser<ExpStmtSubNode> {
            const consAfterName = function(): IParser<ExpStmtSubNode> {
                const firstBranch = from(makeWordParser('=', Assign_ExpStmtSubNode.New)).rightWith(optional(blanks), selectLeft).rightWith(optional(lazy(cons1stWay)), (l, r) => ExpStmtSubNode.SetRightReturnCurrent(l, r.ToUndefined()));
                const secondBranch = from(makeWordParser('+=', AddAssign_ExpStmtSubNode.New));
                const thirdBranch = from(makeWordParser('-=', MinusAssign_ExpStmtSubNode.New));
                const refinement = genRefinement(lazyFunc, Refine_ExpStmtSubNode.New, Refine_ExpStmtSubNode.SetKey);
                const toWithExpressions = [firstBranch, secondBranch, thirdBranch, ];// ts 的类型系统真是厉害呀，这个数组项的类型的模板参数可以归到基类
                const branches = toWithExpressions.map(x => x.rightWith(expWithBlank, (l, r) => ExpStmtSubNode.SetRightReturnCurrent(l, Expression_ExpStmtSubNode.New(r))));
    
                const invocation = genInvocation(lazyFunc, Invoke_ExpStmtSubNode.New, Invoke_ExpStmtSubNode.SetArgs);
                // invoke 完如果想环，必须先 refine 一下
                // 同一种图，可能有多种代码表示，比如下面这个两个分支，可以用 eitherof，也可以用 optional
                const fourthBranch = from(invocation).rightWith(optional(blanks), selectLeft)
                                        .oneOrMore(asArray)
                                        .rightWith(optional(from(refinement).rightWith(optional(blanks), selectLeft).rightWith(lazy(consAfterName), ExpStmtSubNode.SetRightReturnCurrent).raw), 
                                            (nodes, r) => ExpStmtSubNode.SetRightReturnCurrent(nodes.reduce((previous, current) => ExpStmtSubNode.SetRightReturnCurrent(previous, current) as Invoke_ExpStmtSubNode), r.ToUndefined()));
                branches.push(fourthBranch);
                const start = from(optional(refinement))
                                    .rightWith(optional(blanks), selectLeft)
                                    .transform(x => ExpStmtSubNode.SetRightReturnCurrent(Empty_ExpStmtSubNode.New(), x.ToUndefined()))
                                    .rightWith(optional(lazy(consAfterName)), (l, r) => ExpStmtSubNode.SetRightReturnCurrent(l, r.ToUndefined()))
                                    .rightWith(eitherOf(selectNotNull, ...branches.map(x => x.raw)),
                                               ExpStmtSubNode.SetRightReturnCurrent)
                                    .raw;
                return start;
            };
            const oneWay = from(identifier).rightWith(optional(blanks), selectLeft).transform(Name_ExpStmtSubNode.New).rightWith(consAfterName(), ExpStmtSubNode.SetRightReturnCurrent).raw;
            return oneWay;
        };
        const expStmt = from(or(cons1stWay(), consDeleteExp(lazyFunc), (a, b) => ExpStmt.New(selectNotNullIn2DifferentType(a, b)))).rightWith(optional(blanks), selectLeft).rightWith(makeWordParser(';', nullize), selectLeft).prefixComment('parse exp stmt').raw;
        return expStmt;
    };

    // 既然 body、if、for 各个体中互相引用了，那就不能先定义了，只能先声明，然后引用
    // body 里还有普通的语句，作为递归的终点
    // 下面这个里面其实还可以互相嵌套的，其实任何 function body 里可以有的东西都可以在里面，这就递归了
    // 肯定要提供一种惰性求值，类似指针的操作，保留一种无限的能力，不然这里的函数会无限递归下去
    const block = from(leftBrace).rightWith(consBlock(lazy(consStmt.bind(null, lazyFunc, StmtKind.All))), selectRight).rightWith(optional(blanks), selectLeft).rightWith(rightBrace, selectLeft).raw;

    const elseBlock = from(makeWordParser('else', id)).rightWith(block, selectRight).raw;
    const ifStmt = from(makeWordParser('if', IfStmt.New))
        .rightWith(leftParen, selectLeft)
        .rightWith(consExp(lazyFunc, ExpKind.All), IfStmt.SetCond)
        .rightWith(rightParen, selectLeft)
        .rightWith(block, IfStmt.SetBlock)
        .rightWith(optional(elseBlock), IfStmt.SetElseBlock)
        .raw;
    
    // TODO handle break and continue
    const forStmt = from(makeWordParser('for', ForStmt.New))
                    .rightWith(leftParen, selectLeft)
                    .rightWith(expWithSemicolon, ForStmt.SetInit)
                    .rightWith(expWithSemicolon, ForStmt.SetCond)
                    .rightWith(expWithBlank, ForStmt.SetUpdate)
                    .rightWith(rightParen, selectLeft)
                    .rightWith(block, ForStmt.SetBlock)
                    .raw;
    const varItem = from(identifier)
                    .rightWith(optional(blanks), selectLeft)
                    .rightWith(
                        optional(from(makeWordParser('=', nullize))
                            .rightWith(expWithBlank, selectRight)
                            .raw),
                        (n, e) => ([n, e.ToUndefined()] as const))
                    .raw;
    const varStmt = from(makeWordParser('var', VarStmt.New))
                    .rightWith(blanks, selectLeft)
                    .rightWith(varItem, VarStmt.AddVar)
                    .rightWith(optional(from(makeWordParser(',', nullize))
                        .rightWith(varItem, selectRight)
                        .zeroOrMore(asArray)
                        .raw),
                        VarStmt.AddVars)
                    .rightWith(makeWordParser(';', nullize), selectLeft)
                    .prefixComment('parse var stmt')
                    .raw;
    if (kind === StmtKind.VarStmt) {
        return varStmt;
    }
    // 这里 whitespace 怎么能传进来的呢？TODO 外面使用解析结果时会出问题
    const stmt = from(eitherOf<Statement, Statement>(selectNotNull, whitespace, ifStmt, forStmt, retStmt, varStmt, getExpStmt())).raw; // add ; after getExpStmt() 
    return stmt;
};

// parse xxx, start
//      parse sub part
// parse xxx, result
// parse yyy, result
// log('evaluate consFunc and func');
export const consFunc = function() : IParser<Func> { 
    return from(makeWordParser('func', Func.New))
                    .prefixComment('parse func keyword')
                    .rightWith(blanks, selectLeft)
                    .rightWith(varName, Func.SetName)
                    .rightWith(optional(blanks), selectLeft)
                    .rightWith(parasWithParen, Func.SetParameters)
                    .rightWith(leftBrace, selectLeft)
                    .rightWith(consBlock(consStmt(lazy(consFunc), StmtKind.All)), Func.SetBlock)
                    .rightWith(rightBrace, selectLeft)
                    .prefixComment('parse func')
                    .raw;
};
export const func = consFunc();
export const varStmt = consStmt(func, StmtKind.VarStmt) as IParser<Statement>;
