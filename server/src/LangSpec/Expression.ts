import { id, or, from, nullize, selectRight, optional, eitherOf, selectLeft, } from "../combinator";
import { IParser, Text, Position, } from "../IParser";
import { makeWordParser, oneOf, lazy, } from "../parser";
import { ISyntaxNode } from "../ISyntaxNode";
import { Identifier, identifier } from "./Identifier";
import { consLiteral, Literal, } from "./Literal";
import { asArray, exchangeParas, log, selectNotNull, stringify } from "../util";
import { whitespace } from "./Whitespace";
import { Func, leftParen, rightParen } from "./Func";

interface IExpression extends ISyntaxNode {

}

class LiteralExpression implements IExpression {
    private mLiteral?: Literal;

    public static New(literal: Literal): LiteralExpression {
        return new LiteralExpression(literal);
    }

    public constructor(literal: Literal) {
        this.mLiteral = literal;
    }

    public toString(): string {
        return stringify(this.mLiteral?.toString());
    }

    Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }
    get Valid(): boolean {
        throw new Error("Method not implemented.");
    }
}

class IdentifierExpression implements IExpression {
    private mIdentifier: Identifier;

    public static New(identifier: Identifier): IdentifierExpression {
        return new IdentifierExpression(identifier);
    }

    public constructor(identifier: Identifier) {
        this.mIdentifier = identifier;
    }

    public toString(): string {
        return this.mIdentifier.toString();
    }

    Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }
    get Valid(): boolean {
        throw new Error("Method not implemented.");
    }
}

class PrefixOperatorExpression implements IExpression {
    Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }
    get Valid(): boolean {
        throw new Error("Method not implemented.");
    }
    private mOperator?: Text;
    private mExpression?: IExpression;

    public static New(operator: Text): PrefixOperatorExpression {
        return new PrefixOperatorExpression(operator);
    }

    public static SetSubExpression(expression: PrefixOperatorExpression, subExpression: IExpression) {
        expression.mExpression = subExpression;
        return expression;
    }

    public constructor(operator: Text) {
        this.mOperator = operator;
    }

    public toString(): string {
        return stringify({
            operator: this.mOperator?.toString(),
            exp: this.mExpression?.toString(),
        });
    }
}

class InfixOperatorExpression implements IExpression {
    private mOperator: Text;
    private mLeftExpression?: IExpression;
    private mRightExpression?: IExpression;

    public static New(operator: Text): InfixOperatorExpression {
        return new InfixOperatorExpression(operator);
    }

    public static SetLeftExpression(expression: InfixOperatorExpression, subExpression: Expression): InfixOperatorExpression {
        expression.mLeftExpression = subExpression;
        return expression;
    }

    public static SetRightExpression(expression: InfixOperatorExpression, subExpression: Expression): InfixOperatorExpression {
        expression.mRightExpression = subExpression;
        return expression;
    }

    public constructor(operator: Text) {
        this.mOperator = operator;
    }

    public toString(): string {
        return stringify({
            operator: this.mOperator.toString(),
            leftExp: this.mLeftExpression?.toString(),
            rightExp: this.mRightExpression?.toString(),
        });
    }
    Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }
    get Valid(): boolean {
        throw new Error("Method not implemented.");
    }
}

class TernaryExpression implements IExpression {
    Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }
    get Valid(): boolean {
        throw new Error("Method not implemented.");
    }
    private mCondition?: IExpression;
    private mTrueResult?: IExpression;
    private mFalseResult?: IExpression;

    public static New(): TernaryExpression {
        return new TernaryExpression();
    }

    public static SetCondition(expression: TernaryExpression, condtion: IExpression) {
        expression.mCondition = condtion;
        return expression;
    }

    public static SetTrueResult(expression: TernaryExpression, trueResult: IExpression) {
        expression.mTrueResult = trueResult;
        return expression;
    }

    public static SetFalseResult(expression: TernaryExpression, falseResult: IExpression) {
        expression.mFalseResult = falseResult;
        return expression;
    }

    public toString(): string {
        return stringify({
            cond: this.mCondition?.toString(),
            trueResult: this.mTrueResult?.toString(),
            falseResult: this.mFalseResult?.toString(),
        });
    }
}

type A = PrefixOperatorExpression | InfixOperatorExpression;
var a: any = 1;
var b = a instanceof PrefixOperatorExpression;
class InvocationExpression implements IExpression {
    Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }
    get Valid(): boolean {
        throw new Error("Method not implemented.");
    }
    private mFunc?: IExpression;
    private mArgs?: IExpression[];

    public static New(): InvocationExpression {
        return new InvocationExpression();
    }

    public static SetFunc(expression: InvocationExpression, func: IExpression) {
        expression.mFunc = func;
        return expression;
    }

    public static SetArgs(expression: InvocationExpression, args: IExpression[]) {
        expression.mArgs = args;
        return expression;
    }

    public get Args(): IExpression[] | undefined {
        return this.mArgs;
    }

    public toString(): string {
        return stringify({
            func: this.mFunc?.toString(),
            args: this.mArgs?.map(x => x.toString()),
        });
    }
}

class RefinementExpression implements IExpression {
    Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }
    get Valid(): boolean {
        throw new Error("Method not implemented.");
    }
    private mObject?: IExpression;
    private mKey?: IExpression;

    public static New(): RefinementExpression {
        return new RefinementExpression();
    }

    public static SetObject(expression: RefinementExpression, obj: IExpression) {
        expression.mObject = obj;
        return expression;
    }

    public static SetKey(expression: RefinementExpression, key: IExpression) {
        expression.mKey = key;
        return expression;
    }

    public get Key(): IExpression | undefined {
        return this.mKey;
    }

    public toString(): string {
        return stringify({
            object: this.mObject?.toString(),
            key: this.mKey?.toString(),
        });
    }
}

class NewExpression implements IExpression {
    Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }
    get Valid(): boolean {
        throw new Error("Method not implemented.");
    }
    private mType?: IExpression;
    private mArgs?: IExpression[];

    public static New(): NewExpression {
        return new NewExpression();
    }

    public static SetType(expression: NewExpression, type: IExpression) {
        expression.mType = type;
        return expression;
    }

    public static SetArgs(expression: NewExpression, args: IExpression[]) {
        expression.mArgs = args;
        return expression;
    }

    public toString(): string {
        return stringify({
            type: this.mType?.toString(),
            args: this.mArgs?.map(x => x.toString()),
        });
    }
}

export class DeleteExpression implements IExpression {
    Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }
    get Valid(): boolean {
        throw new Error("Method not implemented.");
    }
    private mObject?: IExpression;
    private mKey?: IExpression;

    public static New(): DeleteExpression {
        return new DeleteExpression();
    }

    public static SetObject(expression: DeleteExpression, obj: IExpression) {
        expression.mObject = obj;
        return expression;
    }

    public static SetKey(expression: DeleteExpression, key: IExpression) {
        expression.mKey = key;
        return expression;
    }

    public toString(): string {
        return stringify({
            object: this.mObject?.toString(),
            key: this.mKey?.toString(),
        });
    }
}

export const genRefinement = <T>(func: IParser<Func>, nodeCtor: () => T, keySetter: (t: T, k: IExpression) => T) => {
    const refine1 = from(makeWordParser('[', nodeCtor)).rightWith(optional(whitespace), selectLeft).rightWith(lazy(consExp.bind(null, func, ExpKind.All)), keySetter).rightWith(optional(whitespace), selectLeft).rightWith(makeWordParser(']', nullize), selectLeft).raw;
    const refine2 = from(makeWordParser('.', nodeCtor)).rightWith(optional(whitespace), selectLeft).rightWith(identifier, (t, x) => (keySetter(t, IdentifierExpression.New(x)))).raw;
    const refinement = or(refine1, refine2, selectNotNull) as IParser<T>;
    return refinement;
};
export const genInvocation = <T>(func: IParser<Func>, nodeCtor: () => T, argsSetter: (t: T, k: IExpression[]) => T) => {
    const invocation = from(leftParen)
                            .transform(nodeCtor)
                            .rightWith(optional(whitespace), selectLeft)
                            .rightWith(optional(from(lazy(consExp.bind(null, func, ExpKind.All)))
                                            .rightWith(optional(whitespace), selectLeft)
                                            .leftWith(optional(whitespace), selectRight)
                                            .rightWith(makeWordParser(',', nullize), selectLeft)
                                            .rightWith(optional(whitespace), selectLeft)
                                            .zeroOrMore(asArray).raw), (l, r) => argsSetter(l, r.hasValue() ? r.value : []))
                            .rightWith(rightParen, selectLeft).raw;
    return invocation;
};
// 注意变量定义及其引用位置，定义在引用后，会出 undefined 的问题
export enum ExpKind {
    All,
    DeleteExp,
}

enum PrefixOperatorKind {
    Add = '+',
    Minus = '-',
    TypeOf = 'typof -',
    Not = '!',
}

class PrefixOperator implements ISyntaxNode {
    private mOperator: PrefixOperatorKind;

    public static New(operator: Text) {
        let op: PrefixOperatorKind;
        switch (operator.Value) {
            case 'typeof ':
                op = PrefixOperatorKind.TypeOf;
                break;
            case '+':
                op = PrefixOperatorKind.Add;
                break;
            case '-':
                op = PrefixOperatorKind.Minus;
                break;
            case '!':
                op = PrefixOperatorKind.Not;
                break;
            default:
                throw new Error(`not handle prefix operator ${operator.Value}`);
        }
        return new PrefixOperator(op);
    }

    private constructor(operator: PrefixOperatorKind) {
        this.mOperator = operator;
    }

    Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }
    get Valid(): boolean {
        throw new Error("Method not implemented.");
    }
    public toString(): string {
        return this.mOperator;
    }    
}

enum InfixOperatorKind {
    Multiply = '*',
    Divide = '/',
    Remain = '%',
    Add = '+',
    Minus = '-',
    GreaterEqual = '>=',
    LessEqual = '<=',
    Greater = '>',
    Less = '<',
    Equal = '==',
    NotEqual = '!=',
    Or = '||',
    And = '&&',
}

class InfixOperator implements ISyntaxNode {
    private mOperator: InfixOperatorKind;

    public static New(operator: Text) {
        let op: InfixOperatorKind;
        switch (operator.Value) {
            case '*':
                op = InfixOperatorKind.Multiply;
                break;
            case '/':
                op = InfixOperatorKind.Divide;
                break;
            case '%':
                op = InfixOperatorKind.Remain;
                break;
            case '+':
                op = InfixOperatorKind.Add;
                break;
            case '-':
                op = InfixOperatorKind.Minus;
                break;
            case '>=':
                op = InfixOperatorKind.GreaterEqual;
                break;
            case '<=':
                op = InfixOperatorKind.LessEqual;
                break;
            case '>':
                op = InfixOperatorKind.Greater;
                break;
            case '<':
                op = InfixOperatorKind.Less;
                break;
            case '==':
                op = InfixOperatorKind.Equal;
                break;
            case '!=':
                op = InfixOperatorKind.NotEqual;
                break;
            case '||':
                op = InfixOperatorKind.Or;
                break;
            case '&&':
                op = InfixOperatorKind.And;
                break;
            default:
                throw new Error(`not handle prefix operator ${operator.Value}`);
        }
        return new InfixOperator(op);
    }

    private constructor(operator: InfixOperatorKind) {
        this.mOperator = operator;
    }

    Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }
    get Valid(): boolean {
        throw new Error("Method not implemented.");
    }
    public toString(): string {
        return this.mOperator;
    }
}

export const prefixOperator = oneOf(['typeof ', '+', '-', '!'], PrefixOperator.New);
export const infixOperator = oneOf(['*', '/', '%', '+', '-', '>=', '<=', '>', '<', '==', '!=', '||', '&&'], InfixOperator.New);
// 之后做补全会碰到一个问题：什么时候算进入到某个语法节点的范围，在这个范围内进行补全，在这个范围内，某些东西可能是不完整的
// 建立 ast 相关 node 的类型的事要提上日程了
// 这里面有些地方是可以放任意多的空格，这个要想一下在哪加上
/** exp 管 exp 内部的空格，两边的空格不要管 */
export const consExp = function (func: IParser<Func>, kind: ExpKind, postfix: IParser<null> | null = null): IParser<IExpression> {
    const noPostfixArgsBindedConsExp = consExp.bind(null, func, ExpKind.All, null);// sub expression has full function
    const postfixArgsBindedConsExp = consExp.bind(null, func, ExpKind.All, postfix); // for the exp that end with exp
    const lit = from(consLiteral(func)).transform(LiteralExpression.New).prefixComment('parse literal expression').raw;
    const name = from(identifier).transform(IdentifierExpression.New).prefixComment('parse identifier expression').raw;
    const parenExp = from(lazy(noPostfixArgsBindedConsExp)).leftWith(leftParen, selectRight).rightWith(rightParen, selectLeft).prefixComment('parse paren expression').raw;
    const prefixOp = ['typeof ', '+', '-', '!'];
    const preExp = from(oneOf(prefixOp, PrefixOperatorExpression.New)).rightWith(optional(whitespace), selectLeft).rightWith(lazy(postfixArgsBindedConsExp), PrefixOperatorExpression.SetSubExpression).prefixComment('parse prefix expression').raw;
    const infixOp = ['*', '/', '%', '+', '-', '>=', '<=', '>', '<', '==', '!=', '||', '&&'];
    const inExp = from(lazy(noPostfixArgsBindedConsExp)).leftWith(optional(whitespace), selectRight).rightWith(optional(whitespace), selectLeft).rightWith(oneOf(infixOp, InfixOperatorExpression.New), exchangeParas(InfixOperatorExpression.SetLeftExpression)).rightWith(optional(whitespace), selectLeft).rightWith(lazy(postfixArgsBindedConsExp), InfixOperatorExpression.SetRightExpression).rightWith(optional(whitespace), selectLeft).prefixComment('parse infix expression').raw;
    const ternaryExp = from(lazy(noPostfixArgsBindedConsExp)).rightWith(optional(whitespace), selectLeft).rightWith(makeWordParser('?', TernaryExpression.New), exchangeParas(TernaryExpression.SetCondition)).rightWith(optional(whitespace), selectLeft).rightWith(lazy(noPostfixArgsBindedConsExp), TernaryExpression.SetTrueResult).rightWith(optional(whitespace), selectLeft).rightWith(makeWordParser(':', nullize), selectLeft).rightWith(optional(whitespace), selectLeft).rightWith(lazy(postfixArgsBindedConsExp), TernaryExpression.SetFalseResult).prefixComment('parse ternary expression').raw;
    const invocation = genInvocation(func, InvocationExpression.New, InvocationExpression.SetArgs);
    const invokeExp = from(lazy(noPostfixArgsBindedConsExp)).rightWith(optional(whitespace), selectLeft).rightWith(invocation, exchangeParas(InvocationExpression.SetFunc)).prefixComment('parse invocation expression').raw;
    const refinement = genRefinement(func, RefinementExpression.New, RefinementExpression.SetKey);
    const refineExp = from(lazy(noPostfixArgsBindedConsExp)).rightWith(optional(whitespace), selectLeft).rightWith(refinement, exchangeParas(RefinementExpression.SetObject)).prefixComment('parse refinement expression').raw;
    // ! 还能像下面这样用
    const newExp = from(makeWordParser('new', NewExpression.New)).rightWith(whitespace, selectLeft).rightWith(lazy(noPostfixArgsBindedConsExp), NewExpression.SetType).rightWith(whitespace, selectLeft).rightWith(from(invocation).transform(x => x.Args!).raw, NewExpression.SetArgs).prefixComment('parse new expression').raw;
    const deleteExp = from(makeWordParser('delete', DeleteExpression.New))
                            .rightWith(whitespace, selectLeft)
                            .rightWith(lazy(noPostfixArgsBindedConsExp), DeleteExpression.SetObject)
                            .rightWith(whitespace, selectLeft)
                            .rightWith(from(refinement).transform(x => x.Key!).raw, DeleteExpression.SetKey)
                            .prefixComment('parse delete expression')
                            .raw;
    if (kind === ExpKind.DeleteExp) {
        return deleteExp;
    }
    var notExpEndExps = [lit, name, parenExp, invokeExp, newExp, deleteExp, refineExp];
    var expEndExps = [preExp, inExp, ternaryExp];
    // var exps = [lit, name, newExp, deleteExp, parenExp, preExp, inExp, ternaryExp, invokeExp, refineExp];
    if (postfix) {
        notExpEndExps = notExpEndExps.map(x => from(x).rightWith(postfix, selectLeft).raw);
    }
    const exp = from(eitherOf(selectNotNull, ...notExpEndExps, ...expEndExps)).prefixComment('parse expression').raw;
    // 我现在感觉，做补全的时候会将这些语法规则重新写一遍，以另一种方式
    return exp;
};
// log('evaluate expression');
// export const expression: IParser<Expression> = consExp();
// typescript 里 IParser<IExpression> 可以赋给 IParser<SyntaxNode> 吗 可以
export const consDeleteExp = function (func: IParser<Func>) { return consExp(func, ExpKind.DeleteExp); };

export type Expression = IExpression;
