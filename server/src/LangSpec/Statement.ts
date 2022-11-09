import { assert } from "console";
import { from, Option, optional, id, selectRight, selectLeft, } from "../combinator";
import { Position, Text } from "../IParser";
import { ISyntaxNode } from "../ISyntaxNode";
import { makeWordParser } from "../parser";
import { stringify } from "../util";
import { DeleteExpression, Expression, Invocation, Refinement } from "./Expression";
import { Block } from "./Func";
import { Identifier } from "./Identifier";
import { whitespace } from "./Whitespace";

export abstract class Statement implements ISyntaxNode {
    abstract Contains(p: Position): boolean;
    abstract get Valid(): boolean;
    abstract toString(): string;
    // TODO 这里试下这种新的构造过程，即不用构造，可以的话推广到 Literal 那里，可以免除一些类型定义
    public static New(typeInfo: string, args: (ISyntaxNode | Text)[]): ISyntaxNode {
        switch (typeInfo) {
            case 'ReturnStmt':
                assert(args.length == 1);
                return args[0] as ReturnStmt;
            case 'VarStmt':
                assert(args.length == 1);
                return args[0] as VarStmt;
            case 'IfStmt':
                assert(args.length == 1);
                return args[0] as IfStmt;
            case 'ExpStmt':
                assert(args.length == 1);
                return args[0] as ExpStmt;
            case 'DeleteStmt':
                assert(args.length == 1);
                return args[0] as DeleteStmt;
            case 'ForStmt':
                assert(args.length == 1);
                return args[0] as ForStmt;
        }
        throw new Error(`not support type info: ${typeInfo}`);
    }
}

export class ReturnStmt implements Statement {
    private mExp: Expression;

    public static New(args: (ISyntaxNode | Text)[]): ReturnStmt {
        const exp: Expression = args[1] as Expression;
        return new ReturnStmt(exp);
    }

    private constructor(exp: Expression) {
        this.mExp = exp;
    }

    public Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }
    
    public get Valid(): boolean {
        throw new Error("Method not implemented.");
    }

    public toString(): string {
        return stringify({
            exp: this.mExp?.toString(),
        });
    }
}

export class VarStmt implements Statement {
    private mVarName: Identifier;
    private mExp?: Expression;

    public static New(args: (ISyntaxNode | Text)[]): VarStmt {
        assert(args.length == 3 || args.length == 5);
        return new VarStmt(args[1] as Identifier, args[3] as Expression);
    }

    private constructor(varName: Identifier, expression?: Expression) {
        this.mVarName = varName;
        this.mExp = expression;
    }

    public toString(): string {
        return stringify({});
    }

    public Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }

    public get Valid(): boolean {
        throw new Error("Method not implemented.");
    }
}

export class DeleteStmt implements Statement {
    private mObject: Expression;
    private mRefinement: Refinement;

    public static New(args: (ISyntaxNode | Text)[]): DeleteStmt {
        // const deleteKeyword: Text = args[0];
        const object: Expression = args[1] as Expression;
        const refinement: Refinement = args[2] as Refinement;
        return new DeleteStmt(object, refinement);
    }

    private constructor(object: Expression, refinement: Refinement) {
        this.mObject = object;
        this.mRefinement = refinement;
    }

    public toString(): string {
        return stringify({});
    }

    public Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }

    public get Valid(): boolean {
        throw new Error("Method not implemented.");
    }
}

export class IfStmt implements Statement {
    private mCond: Expression;
    private mBlock: Block;
    private mElseBlock?: Block;
    // 每个节点都该有个准入条件，方便补全时判断是否已经进入节点，或者有个判断当前节点是否进入的方法
    // 目前是创造了节点都已经进入了
    public static New(args: (ISyntaxNode | Text)[]) {
        assert(args.length == 7 || args.length == 5);
        return new IfStmt(args[2] as Expression, args[4] as Block, args[6] as Block);
    }

    public constructor(cond: Expression, block: Block, elseBlock: Block) {
        this.mCond = cond;
        this.mBlock = block;
        this.mElseBlock = elseBlock;
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

export class ForStmt implements Statement {
    private mInit: Statement;
    private mCond: Expression;
    private mUpdate: Statement;
    private mBlock: Block;

    public static New(args: (ISyntaxNode | Text)[]): ForStmt {
        assert(args.length == 8);
        return new ForStmt(args[2] as Statement, args[3] as Expression, args[5] as Statement, args[7] as Block);
    }

    private constructor(init: Statement, cond: Expression, update: Statement, block: Block) {
        this.mInit = init;
        this.mCond = cond;
        this.mUpdate = update;
        this.mBlock = block;
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

// 每个结点只表示自己有的信息，不携带前后结点的信息
export abstract class ExpStmtSubNode implements ISyntaxNode {
    public static New(typeInfo: string, args: (ISyntaxNode | Text)[]): ExpStmtSubNode {
        switch (typeInfo) {
            case 'Assign_ExpStmtSubNode':
                assert(args.length == 2);
                return Assign_ExpStmtSubNode.New(args[1] as Expression);
            case 'ContinuousAssign_ExpStmtSubNode':
                assert(args.length == 2);
                return ContinuousAssign_ExpStmtSubNode.New(args[1] as ExpStmt);
            case 'AddAssign_ExpStmtSubNode':
                assert(args.length == 2);
                return AddAssign_ExpStmtSubNode.New(args[1] as Expression);
            case 'MinusAssign_ExpStmtSubNode':
                assert(args.length == 2);
                return MinusAssign_ExpStmtSubNode.New(args[1] as Expression);
            case 'Invoke_ExpStmtSubNode':
                assert(args.length == 1);
                return Invoke_ExpStmtSubNode.New(args[0] as InvocationCircle);
            case 'InvokeRefineThen_ExpStmtSubNode':
                assert(args.length == 3);
                return InvokeRefineThen_ExpStmtSubNode.New(args[0] as InvocationCircle,
                    args[1] as Refinement, args[2] as ExpStmtSubNode);
            case 'RefineThen_ExpStmtSubNode':
                assert(args.length == 2);
                return RefineThen_ExpStmtSubNode.New(args[0] as Refinement,
                    args[1] as ExpStmtSubNode);
        }
        throw new Error(`not support type info: ${typeInfo}`);
    }

    public abstract Contains(p: Position): boolean;
    public abstract get Valid(): boolean;
    public abstract CrawlSubClassStruct(): Object;
    /** default implementation */
    public toString(): string {
        var obj = this.CrawlSubClassStruct();
        return stringify(obj);
    }
}

class Assign_ExpStmtSubNode implements ExpStmtSubNode {
    private mExp: Expression;

    public static New(expression: Expression): Assign_ExpStmtSubNode {
        return new Assign_ExpStmtSubNode(expression);
    }

    public Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }

    public get Valid(): boolean {
        throw new Error("Method not implemented.");
    }

    private constructor(expression: Expression) {
        this.mExp = expression;
    }

    public CrawlSubClassStruct(): Object {
        return {
            exp: this.mExp?.toString(),
        };
    }
}

class ContinuousAssign_ExpStmtSubNode implements ExpStmtSubNode {
    private mExpStmt: ExpStmt;

    public Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }

    public get Valid(): boolean {
        throw new Error("Method not implemented.");
    }

    public CrawlSubClassStruct(): Object {
        return {
            expStmt: this.mExpStmt.toString(),
        };
    }

    public static New(expStmt: ExpStmt) {
        return new ContinuousAssign_ExpStmtSubNode(expStmt);
    }

    private constructor(expStmt: ExpStmt) {
        this.mExpStmt = expStmt;
    }    
}

class AddAssign_ExpStmtSubNode implements ExpStmtSubNode {
    private mExp: Expression;

    public static New(expression: Expression): AddAssign_ExpStmtSubNode {
        return new AddAssign_ExpStmtSubNode(expression);
    }

    private constructor(expression: Expression) {
        this.mExp = expression;
    }

    public Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }
    
    public get Valid(): boolean {
        throw new Error("Method not implemented.");
    }

    public CrawlSubClassStruct(): Object {
        return {};
    }
}

class MinusAssign_ExpStmtSubNode implements ExpStmtSubNode {
    private mExp: Expression;

    public static New(expression: Expression): MinusAssign_ExpStmtSubNode {
        return new MinusAssign_ExpStmtSubNode(expression);
    }

    private constructor(expression: Expression) {
        this.mExp = expression;
    }

    public Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }

    public get Valid(): boolean {
        throw new Error("Method not implemented.");
    }

    public CrawlSubClassStruct(): Object {
        // TODO change all
        return {};
    }
}

export class InvocationCircle implements ISyntaxNode {
    private mInvocation: Invocation;
    private mRemainInvocationCircle?: InvocationCircle;

    public static New(args: (ISyntaxNode | Text)[]): InvocationCircle {
        assert(args.length === 1 || args.length === 2);
        return new InvocationCircle(args[0] as Invocation, args[1] as InvocationCircle);
    }

    private constructor(invocation: Invocation, remainInvocationCircle?: InvocationCircle) {
        this.mInvocation = invocation;
        this.mRemainInvocationCircle = remainInvocationCircle;
    }
    
    public Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }
    
    public get Valid(): boolean {
        throw new Error("Method not implemented.");
    }
    
    public toString(): string {
        throw new Error("Method not implemented.");
    }
}

class Invoke_ExpStmtSubNode implements ExpStmtSubNode {
    private mSubNode: InvocationCircle;

    public static New(subNode: InvocationCircle): Invoke_ExpStmtSubNode {
        return new Invoke_ExpStmtSubNode(subNode);
    }

    private constructor(subNode: InvocationCircle) {
        this.mSubNode = subNode;
    }

    public Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }

    public get Valid(): boolean {
        throw new Error("Method not implemented.");
    }

    public CrawlSubClassStruct(): Object {
        return {
            
        };
    }
}

class InvokeRefineThen_ExpStmtSubNode implements ExpStmtSubNode {
    private mInvocation: InvocationCircle;
    private mRefinement: Refinement;
    private mRemain: ExpStmtSubNode;

    public static New(invocation: InvocationCircle, refinement: Refinement, remain: ExpStmtSubNode): InvokeRefineThen_ExpStmtSubNode {
        return new InvokeRefineThen_ExpStmtSubNode(invocation, refinement, remain);
    }

    private constructor(subNode: InvocationCircle, refinement: Refinement, remain: ExpStmtSubNode) {
        this.mInvocation = subNode;
        this.mRefinement = refinement;
        this.mRemain = remain;
    }

    public Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }

    public get Valid(): boolean {
        throw new Error("Method not implemented.");
    }

    public CrawlSubClassStruct(): Object {
        return {

        };
    }
}

class RefineThen_ExpStmtSubNode implements ExpStmtSubNode {
    private mRefinement: Refinement;
    private mRemain: ExpStmtSubNode;

    public static New(refinement: Refinement, remain: ExpStmtSubNode): RefineThen_ExpStmtSubNode {
        return new RefineThen_ExpStmtSubNode(refinement, remain);
    }

    private constructor(refinement: Refinement, remain: ExpStmtSubNode) {
        this.mRefinement = refinement;
        this.mRemain = remain;
    }

    public Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }

    public get Valid(): boolean {
        throw new Error("Method not implemented.");
    }

    public CrawlSubClassStruct(): Object {
        return {
            
        };
    }
}

export class ExpStmt implements Statement {
    private mName: Identifier;
    private mRemainExpStmtSubNode: ExpStmtSubNode;

    public static New(args: (ISyntaxNode | Text)[]): ExpStmt {
        assert(args.length == 3);
        return new ExpStmt(args[0] as Identifier, args[1] as ExpStmtSubNode);
    }

    public constructor(name: Identifier, remainExpStmtSubNode: ExpStmtSubNode) {
        this.mName = name;
        this.mRemainExpStmtSubNode = remainExpStmtSubNode;
    }

    Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }
    get Valid(): boolean {
        throw new Error("Method not implemented.");
    }

    public toString(): string {
        return stringify({
            name: this.mName.toString(),// 好像是因为这种 toString 误用了，所以 log 里出来转义符号太多了，之后看能不能去掉
            remainExpStmtSubNode: this.mRemainExpStmtSubNode.toString(),
        });
    }
}

enum AssignOperatorKind {
    Assign,
    AddAssign,
    MinusAssign,
}

export class AssignOperator implements ISyntaxNode {
    private mOperator: AssignOperatorKind;

    public static New(operator: Text) {
        let op: AssignOperatorKind;
        switch (operator.Value) {
            case '=':
                op = AssignOperatorKind.Assign;
                break;
            case '+=':
                op = AssignOperatorKind.AddAssign;
                break;
            case '-=':
                op = AssignOperatorKind.MinusAssign;
                break;
            default:
                throw new Error(`not handle operator ${operator.Value}`);
        }
        return new AssignOperator(op);
    }

    private constructor(operator: AssignOperatorKind) {
        this.mOperator = operator;
    }

    public Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }

    public get Valid(): boolean {
        throw new Error("Method not implemented.");
    }

    public toString(): string {
        switch (this.mOperator) {
            case AssignOperatorKind.Assign:
                return '=';
            case AssignOperatorKind.AddAssign:
                return '+=';
            case AssignOperatorKind.MinusAssign:
                return '-=';
            default:
                throw new Error(`not handle operator ${this.mOperator}`);
        }
    }    
}


export const leftBrace = from(makeWordParser('{', id)).leftWith(optional(whitespace), selectRight).rightWith(optional(whitespace), selectLeft).raw;
export const rightBrace = from(makeWordParser('}', id)).leftWith(optional(whitespace), selectRight).rightWith(optional(whitespace), selectLeft).raw;

// export const consStmt = function(lazyFunc: IParser<Func>, kind: StmtKind): IParser<Statement> {
//     const expWithBlank = from(consExp(lazyFunc, ExpKind.All)).leftWith(optional(whitespace), selectRight).rightWith(optional(whitespace), selectLeft).raw;
//     const expWithSemicolon = from(expWithBlank).rightWith(makeWordParser(';', id), selectLeft).raw;

//     // 要让 ; 参与到 expression 的解析中，这样就可以排除其他可能性解析
//     const retStmt = from(makeWordParser('return', ReturnStmt.New)).rightWith(whitespace, selectLeft).rightWith(from(consExp(lazyFunc, ExpKind.All, makeWordParser(';', nullize))).leftWith(optional(whitespace), selectRight).rightWith(optional(whitespace), selectLeft).raw, ReturnStmt.SetExp).prefixComment('parse return stmt').raw;
//     // 有环就定义一个下面consAfterName这样的函数，确实是这样一个惯用法，环其实就是递归；之前说的跳到某一点也是这样做(AfterName 就代表一个点)
//     // 也就是说可以有算法可以将语法图固定地转换为解析器代码
//     // consXXX 代表函数生成的解析器内部有递归
//     // getXXX 只是简单的封装，让代码不那么乱
//     // expression statement
//     // 下面这个语法用新 exp 应该能够简化 TODO
//     const getExpStmt = function(): IParser<ExpStmt> {
//         const cons1stWay = function(): IParser<ExpStmtSubNode> {
//             const consAfterName = function(): IParser<ExpStmtSubNode> {
//                 const firstBranch = from(makeWordParser('=', Assign_ExpStmtSubNode.New)).rightWith(optional(whitespace), selectLeft).rightWith(optional(lazy(cons1stWay)), (l, r) => ExpStmtSubNode.SetRightReturnCurrent(l, r.ToUndefined()));
//                 const secondBranch = from(makeWordParser('+=', AddAssign_ExpStmtSubNode.New));
//                 const thirdBranch = from(makeWordParser('-=', MinusAssign_ExpStmtSubNode.New));
//                 const refinement = genRefinement(lazyFunc, Refine_ExpStmtSubNode.New, Refine_ExpStmtSubNode.SetKey);
//                 const toWithExpressions = [firstBranch, secondBranch, thirdBranch, ];// ts 的类型系统真是厉害呀，这个数组项的类型的模板参数可以归到基类
//                 const branches = toWithExpressions.map(x => x.rightWith(expWithBlank, (l, r) => ExpStmtSubNode.SetRightReturnCurrent(l, Expression_ExpStmtSubNode.New(r))));
    
//                 const invocation = genInvocation(lazyFunc, Invoke_ExpStmtSubNode.New, Invoke_ExpStmtSubNode.SetArgs);
//                 // invoke 完如果想环，必须先 refine 一下
//                 // 同一种图，可能有多种代码表示，比如下面这个两个分支，可以用 eitherof，也可以用 optional
//                 const fourthBranch = from(invocation).rightWith(optional(whitespace), selectLeft)
//                                         .oneOrMore(asArray)
//                                         .rightWith(optional(from(refinement).rightWith(optional(whitespace), selectLeft).rightWith(lazy(consAfterName), ExpStmtSubNode.SetRightReturnCurrent).raw), 
//                                             (nodes, r) => ExpStmtSubNode.SetRightReturnCurrent(nodes.reduce((previous, current) => ExpStmtSubNode.SetRightReturnCurrent(previous, current) as Invoke_ExpStmtSubNode), r.ToUndefined()));
//                 branches.push(fourthBranch);
//                 const start = from(optional(refinement))
//                                     .rightWith(optional(whitespace), selectLeft)
//                                     .transform(x => ExpStmtSubNode.SetRightReturnCurrent(Empty_ExpStmtSubNode.New(), x.ToUndefined()))
//                                     .rightWith(eitherOf(selectNotNull, ...branches.map(x => x.raw), lazy(consAfterName)),// 递归的 parser 放在最后一个
//                                                ExpStmtSubNode.SetRightReturnCurrent)
//                                     .raw;
//                 return start;
//             };
//             const oneWay = from(identifier).rightWith(optional(whitespace), selectLeft).transform(Name_ExpStmtSubNode.New).rightWith(consAfterName(), ExpStmtSubNode.SetRightReturnCurrent).raw;
//             return oneWay;
//         };
//         const expStmt = from(or(cons1stWay(), consDeleteExp(lazyFunc), (a, b) => ExpStmt.New(selectNotNullIn2DifferentType(a, b)))).rightWith(optional(whitespace), selectLeft).rightWith(makeWordParser(';', nullize), selectLeft).prefixComment('parse exp stmt').raw;
//         return expStmt;
//     };

//     // 既然 body、if、for 各个体中互相引用了，那就不能先定义了，只能先声明，然后引用
//     // body 里还有普通的语句，作为递归的终点
//     // 下面这个里面其实还可以互相嵌套的，其实任何 function body 里可以有的东西都可以在里面，这就递归了
//     // 肯定要提供一种惰性求值，类似指针的操作，保留一种无限的能力，不然这里的函数会无限递归下去
//     const block = from(leftBrace).rightWith(consBlock(lazy(consStmt.bind(null, lazyFunc, StmtKind.All))), selectRight).rightWith(optional(whitespace), selectLeft).rightWith(rightBrace, selectLeft).raw;

//     const elseBlock = from(makeWordParser('else', id)).rightWith(block, selectRight).raw;
//     const ifStmt = from(makeWordParser('if', IfStmt.New))
//         .rightWith(leftParen, selectLeft)
//         .rightWith(consExp(lazyFunc, ExpKind.All), IfStmt.SetCond)
//         .rightWith(rightParen, selectLeft)
//         .rightWith(block, IfStmt.SetBlock)
//         .rightWith(optional(elseBlock), IfStmt.SetElseBlock)
//         .raw;
    
//     // TODO handle break and continue
//     const forStmt = from(makeWordParser('for', ForStmt.New))
//                     .rightWith(leftParen, selectLeft)
//                     .rightWith(expWithSemicolon, ForStmt.SetInit)
//                     .rightWith(expWithSemicolon, ForStmt.SetCond)
//                     .rightWith(expWithBlank, ForStmt.SetUpdate)
//                     .rightWith(rightParen, selectLeft)
//                     .rightWith(block, ForStmt.SetBlock)
//                     .raw;
//     const varItem = from(identifier)
//                     .rightWith(optional(whitespace), selectLeft)
//                     .rightWith(
//                         optional(from(makeWordParser('=', nullize))
//                             .rightWith(expWithBlank, selectRight)
//                             .raw),
//                         (n, e) => ([n, e.ToUndefined()] as const))
//                     .raw;
//     const varStmt = from(makeWordParser('var', VarStmt.New))
//                     .rightWith(whitespace, selectLeft)
//                     .rightWith(varItem, VarStmt.AddVar)
//                     .rightWith(optional(from(makeWordParser(',', nullize))
//                         .rightWith(varItem, selectRight)
//                         .zeroOrMore(asArray)
//                         .raw),
//                         VarStmt.AddVars)
//                     .rightWith(makeWordParser(';', nullize), selectLeft)
//                     .prefixComment('parse var stmt')
//                     .raw;
//     if (kind === StmtKind.VarStmt) {
//         return varStmt;
//     }
//     // 这里 whitespace 怎么能传进来的呢？TODO 外面使用解析结果时会出问题
//     const stmt = from(eitherOf<Statement, Statement>(selectNotNull, whitespace, ifStmt, forStmt, retStmt, varStmt, getExpStmt())).raw; // add ; after getExpStmt() 
//     return stmt;
// };