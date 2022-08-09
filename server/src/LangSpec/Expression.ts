import { id, or, from, nullize, selectRight, optional, eitherOf, selectLeft, } from "../combinator";
import { IParser, Text, Position, } from "../IParser";
import { makeWordParser, oneOf, lazy, } from "../parser";
import { ISyntaxNode } from "../ISyntaxNode";
import { Identifier, identifier } from "./Identifier";
import { Literal, literal } from "./Literal";
import { asArray, exchangeParas, selectNotNull, stringify } from "../util";
import { whitespace } from "./Whitespace";

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
}

export const genRefinement = <T>(nodeCtor: () => T, keySetter: (t: T, k: IExpression) => T) => {
    const refine1 = from(makeWordParser('[', nodeCtor)).rightWith(expression, keySetter).rightWith(makeWordParser(']', nullize), selectLeft).raw;
    const refine2 = from(makeWordParser('.', nodeCtor)).rightWith(expression, keySetter).raw;
    const refinement = or(refine1, refine2, selectNotNull) as IParser<T>;
    return refinement;
};
const refinement = genRefinement(RefinementExpression.New, RefinementExpression.SetKey);
export const genInvocation = <T>(nodeCtor: () => T, argsSetter: (t: T, k: IExpression[]) => T) => {
    // add space TODO
    const invocation = from(makeWordParser('(', nodeCtor)).rightWith(from(expression).rightWith(makeWordParser(',', nullize), selectLeft).zeroOrMore(asArray).raw, argsSetter).rightWith(makeWordParser(')', nullize), selectLeft).raw;
    return invocation;
};
const invocation = genInvocation(InvocationExpression.New, InvocationExpression.SetArgs);

// 之后做补全会碰到一个问题：什么时候算进入到某个语法节点的范围，在这个范围内进行补全，在这个范围内，某些东西可能是不完整的
// 建立 ast 相关 node 的类型的事要提上日程了
// 这里面有些地方是可以放任意多的空格，这个要想一下在哪加上
const consExp = function(): IParser<IExpression> {
    // handle blank TODO
    const lit = from(literal).transform(LiteralExpression.New).raw;
    const name = from(identifier).transform(IdentifierExpression.New).raw;
    const parenExp = from(lazy(consExp))
                        // TODO handle blank
                        .leftWith(makeWordParser('(', nullize), selectRight)
                        .rightWith(makeWordParser(')', nullize), selectLeft)
                        .raw;
    const preExp = from(oneOf(['typeof', '+', '-', '!'], PrefixOperatorExpression.New))
                        .rightWith(lazy(consExp), PrefixOperatorExpression.SetSubExpression)
                        .raw;
    const infixOp = ['*', '/', '%', '+', '-', '>=', '<=', '>', '<', '==', '!=', '||', '&&'];
    // 要不要给 combinator 那里加个 surround 方法来处理左右加括号和空白
    // 有些地方忘加空白了
    const inExp = from(lazy(consExp)).rightWith(oneOf(infixOp, InfixOperatorExpression.New), exchangeParas(InfixOperatorExpression.SetLeftExpression)).rightWith(lazy(consExp), InfixOperatorExpression.SetRightExpression).raw;
    const ternaryExp = from(lazy(consExp)).rightWith(makeWordParser('?', TernaryExpression.New), exchangeParas(TernaryExpression.SetCondition)).rightWith(lazy(consExp), TernaryExpression.SetTrueResult).rightWith(makeWordParser(':', nullize), selectLeft).rightWith(lazy(consExp), TernaryExpression.SetFalseResult).raw;
    const invokeExp = from(lazy(consExp)).rightWith(invocation, exchangeParas(InvocationExpression.SetFunc)).raw;
    const refineExp = from(lazy(consExp)).rightWith(refinement, exchangeParas(RefinementExpression.SetObject)).raw;
    // ! 还能像下面这样用
    const newExp = from(makeWordParser('new', NewExpression.New)).rightWith(whitespace, selectLeft).rightWith(expression, NewExpression.SetType).rightWith(from(invocation).transform(x => x.Args!).raw, NewExpression.SetArgs).raw;
    const exp = eitherOf(selectNotNull, lit, name, parenExp, preExp, inExp, ternaryExp, invokeExp, refineExp, newExp, deleteExp);
    // 我现在感觉，做补全的时候会将这些语法规则重新写一遍，以另一种方式
    return exp;
};

export const expression: IParser<Expression> = consExp();
// typescript 里 IParser<IExpression> 可以赋给 IParser<SyntaxNode> 吗



export const deleteExp = from(makeWordParser('delete', DeleteExpression.New))
                            .rightWith(whitespace, selectLeft)
                            .rightWith(expression, DeleteExpression.SetObject)
                            .rightWith(from(refinement).transform(x => x.Key!).raw, DeleteExpression.SetKey)
                            .prefixComment('parse expression')
                            .raw;

export type Expression = IExpression;
