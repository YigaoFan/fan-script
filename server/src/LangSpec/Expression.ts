import { id, or, from, nullize, selectRight, optional, eitherOf, selectLeft, } from "../combinator";
import { IParser, Text, Position, } from "../IParser";
import { makeWordParser, oneOf, lazy, } from "../parser";
import { ISyntaxNode } from "../ISyntaxNode";
import { Identifier, identifier } from "./Identifier";
import { consLiteral, Literal, } from "./Literal";
import { asArray, exchangeParas, log, selectNotNull, stringify } from "../util";
import { whitespace } from "./Whitespace";
import { Func } from "./Func";

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
        expression.mCondition = trueResult;
        return expression;
    }

    public static SetFalseResult(expression: TernaryExpression, falseResult: IExpression) {
        expression.mCondition = falseResult;
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
    const refine1 = from(makeWordParser('[', nodeCtor)).rightWith(lazy(consExp.bind(null, func, ExpKind.All)), keySetter).rightWith(makeWordParser(']', nullize), selectLeft).raw;
    const refine2 = from(makeWordParser('.', nodeCtor)).rightWith(lazy(consExp.bind(null, func, ExpKind.All)), keySetter).raw;
    const refinement = or(refine1, refine2, selectNotNull) as IParser<T>;
    return refinement;
};
export const genInvocation = <T>(func: IParser<Func>, nodeCtor: () => T, argsSetter: (t: T, k: IExpression[]) => T) => {
    // add space TODO
    const invocation = from(makeWordParser('(', nodeCtor)).rightWith(from(lazy(consExp.bind(null, func, ExpKind.All))).rightWith(makeWordParser(',', nullize), selectLeft).zeroOrMore(asArray).raw, argsSetter).rightWith(makeWordParser(')', nullize), selectLeft).raw;
    return invocation;
};
// 注意变量定义及其引用位置，定义在引用后，会出 undefined 的问题
export enum ExpKind {
    All,
    DeleteExp,
}

// 之后做补全会碰到一个问题：什么时候算进入到某个语法节点的范围，在这个范围内进行补全，在这个范围内，某些东西可能是不完整的
// 建立 ast 相关 node 的类型的事要提上日程了
// 这里面有些地方是可以放任意多的空格，这个要想一下在哪加上
export const consExp = function (func: IParser<Func>, kind: ExpKind, postfix: IParser<null> | null = null): IParser<IExpression> {
    // handle blank TODO
    const argsBindedConsExp = consExp.bind(null, func, ExpKind.All);// sub expression has full function
    const lit = from(consLiteral(func)).transform(LiteralExpression.New).prefixComment('parse literal expression').raw;
    const name = from(identifier).transform(IdentifierExpression.New).prefixComment('parse identifier expression').raw;
    const parenExp = from(lazy(argsBindedConsExp))
                        // TODO handle blank
                        .leftWith(makeWordParser('(', nullize), selectRight)
                        .rightWith(makeWordParser(')', nullize), selectLeft)
                        .prefixComment('parse paren expression')
                        .raw;
    const preExp = from(oneOf(['typeof', '+', '-', '!'], PrefixOperatorExpression.New))
                        .rightWith(lazy(argsBindedConsExp), PrefixOperatorExpression.SetSubExpression)
                        .prefixComment('parse prefix expression')
                        .raw;
    const infixOp = ['*', '/', '%', '+', '-', '>=', '<=', '>', '<', '==', '!=', '||', '&&'];
    // 要不要给 combinator 那里加个 surround 方法来处理左右加括号和空白
    // 有些地方忘加空白了
    const inExp = from(lazy(argsBindedConsExp)).leftWith(optional(whitespace), selectRight).rightWith(optional(whitespace), selectLeft).rightWith(oneOf(infixOp, InfixOperatorExpression.New), exchangeParas(InfixOperatorExpression.SetLeftExpression)).rightWith(lazy(argsBindedConsExp), InfixOperatorExpression.SetRightExpression).prefixComment('parse infix expression').raw;
    const ternaryExp = from(lazy(argsBindedConsExp)).rightWith(makeWordParser('?', TernaryExpression.New), exchangeParas(TernaryExpression.SetCondition)).rightWith(lazy(argsBindedConsExp), TernaryExpression.SetTrueResult).rightWith(makeWordParser(':', nullize), selectLeft).rightWith(lazy(argsBindedConsExp), TernaryExpression.SetFalseResult).prefixComment('parse ternary expression').raw;
    const invocation = genInvocation(func, InvocationExpression.New, InvocationExpression.SetArgs);
    const invokeExp = from(lazy(argsBindedConsExp)).rightWith(invocation, exchangeParas(InvocationExpression.SetFunc)).prefixComment('parse invocation expression').raw;
    const refinement = genRefinement(func, RefinementExpression.New, RefinementExpression.SetKey);
    const refineExp = from(lazy(argsBindedConsExp)).rightWith(refinement, exchangeParas(RefinementExpression.SetObject)).prefixComment('parse refinement expression').raw;
    // ! 还能像下面这样用
    const newExp = from(makeWordParser('new', NewExpression.New)).rightWith(whitespace, selectLeft).rightWith(lazy(argsBindedConsExp), NewExpression.SetType).rightWith(from(invocation).transform(x => x.Args!).raw, NewExpression.SetArgs).prefixComment('parse new expression').raw;
    const deleteExp = from(makeWordParser('delete', DeleteExpression.New))
                            .rightWith(whitespace, selectLeft)
                            .rightWith(lazy(argsBindedConsExp), DeleteExpression.SetObject)
                            .rightWith(from(refinement).transform(x => x.Key!).raw, DeleteExpression.SetKey)
                            .prefixComment('parse delete expression')
                            .raw;
    if (kind === ExpKind.DeleteExp) {
        return deleteExp;
    }
    var exps = [lit, name, newExp, deleteExp, parenExp, preExp, inExp, ternaryExp, invokeExp, refineExp];
    if (postfix) {
        exps = exps.map(x => from(x).rightWith(postfix, selectLeft).raw);
    }
    const exp = eitherOf(selectNotNull, ...exps);
    // 我现在感觉，做补全的时候会将这些语法规则重新写一遍，以另一种方式
    return exp;
};
// log('evaluate expression');
// export const expression: IParser<Expression> = consExp();
// typescript 里 IParser<IExpression> 可以赋给 IParser<SyntaxNode> 吗 可以
export const consDeleteExp = function (func: IParser<Func>) { return consExp(func, ExpKind.DeleteExp); };

export type Expression = IExpression;
