import { assert } from "console";
import { from, Option, optional, id, selectRight, selectLeft, } from "../combinator";
import { Position, Text } from "../IParser";
import { IRange, ISyntaxNode } from "../ISyntaxNode";
import { makeWordParser } from "../parser";
import { stringify } from "../util";
import { whitespace } from "./Whitespace";

enum AssignOperatorKind {
    Assign,
    AddAssign,
    MinusAssign,
}

export class AssignOperator implements ISyntaxNode {
    private mOperator: AssignOperatorKind;
    private mOperatorText: Text;

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
        return new AssignOperator(op, operator);
    }

    private constructor(operator: AssignOperatorKind, operatorText: Text) {
        this.mOperator = operator;
        this.mOperatorText = operatorText;
    }
    
    public get Range(): IRange {
        return this.mOperatorText.Range;
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