import { id, or, from, nullize, selectRight, optional, eitherOf, selectLeft, } from "../combinator";
import { IParser, Range } from "../IParser";
import { makeWordParser, oneOf, lazy, } from "../parser";
import { ISyntaxNode } from "../ISyntaxNode";
import { Identifier, identifier } from "./Identifier";
import { literal } from "./Literal";

const combineIntoArray = <T>(...ts: T[]) => {
    return ts;
};
// 之后做补全会碰到一个问题：什么时候算进入到某个语法节点的范围，在这个范围内进行补全，在这个范围内，某些东西可能是不完整的

// 建立 ast 相关 node 的类型的事要提上日程了
// 这里面有些地方是可以放任意多的空格，这个要想一下在哪加上
const consExp = function(): IParser<IExpression> {
    const lit = from(literal).transform(LiteralExpression.New).raw;
    const name = from(identifier).transform(IdentifierExpression.New).raw;
    const parenExp = from(lazy(consExp))
                        .leftWith(makeWordParser('(', nullize), selectRight)
                        .rightWith(makeWordParser(')', nullize), selectLeft)
                        .raw;
    const preExp = from(oneOf(['typeof', '+', '-', '!'], id))
                        .rightWith(lazy(consExp), combineIntoArray)
                        .transform(args => PrefixOperatorExpression.New(args[]))
                        .raw;
    const infixOp = ['*', '/', '%', '+', '-', '>=', '<=', '>', '<', '==', '!=', '||', '&&'];
    const inExp = from(lazy(consExp)).rightWith(oneOf(infixOp, id), combineIntoArray).rightWith(lazy(consExp), combineIntoArray).raw;
    const exp = eitherOf((...args) => (false), identifier, parenExp, preExp, inExp);
    return exp;
};
export const expression: IParser<Expression> = consExp();
// typescript 里 IParser<IExpression> 可以赋给 IParser<SyntaxNode> 吗
export interface IExpression extends ISyntaxNode {

}

class Operator {

}

class LiteralExpression implements IExpression {
    private mLiteral: Literal;

    public static New(literal: Literal): LiteralExpression {
        return new LiteralExpression(literal);
    }

    public constructor(literal: Literal) {
        this.mLiteral = literal;
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

class IdentifierExpression implements IExpression {
    private mIdentifier: Identifier;

    public static New(identifier: Identifier): IdentifierExpression {
        return new IdentifierExpression(identifier);
    }

    public constructor(identifier: Identifier) {
        this.mIdentifier = identifier;
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

class ParenthesesExpression implements IExpression {
    private mExpression: IExpression;

    public static New(expression: IExpression): ParenthesesExpression {
        return new ParenthesesExpression(expression);
    }

    public constructor(expression: IExpression) {
        this.mExpression = expression;
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

class PrefixOperatorExpression implements IExpression {
    private mOperator: Operator;
    private mExpression: IExpression;

    public static New(operator: Operator, expression: IExpression): PrefixOperatorExpression {
        return new PrefixOperatorExpression(operator, expression);
    }

    public constructor(operator: Operator, expression: IExpression) {
        this.mOperator = operator;
        this.mExpression = expression;
    }

}

class InfixOperatorExpression implements IExpression {
    private mOperator: Operator;
    private mExpression: IExpression;

    public static New(operator: Operator, expression: IExpression): InfixOperatorExpression {
        return new InfixOperatorExpression(operator, expression);
    }

    public constructor(operator: Operator, expression: IExpression) {
        this.mOperator = operator;
        this.mExpression = expression;
    }
}

class TernaryOperatorExpression implements IExpression {
    private mCondition: IExpression;
    private mTrueResult: IExpression;
    private mFalseResult: IExpression;

    public New(condition: IExpression, trueResult: IExpression, falseResult: IExpression): TernaryOperatorExpression {
        return new TernaryOperatorExpression(condition, trueResult, falseResult);
    }

    public constructor(condition: IExpression, trueResult: IExpression, falseResult: IExpression) {
        this.mCondition = condition;
        this.mTrueResult = trueResult;
        this.mFalseResult = falseResult;
    }
}

class InvocationExpression implements IExpression {
    private mFunc: IExpression;
    private mArgs: IExpression[];

    public static New(func: IExpression, args: IExpression[]): InvocationExpression {
        return new InvocationExpression(func, args);
    }

    public constructor(func: IExpression, args: IExpression[]) {
        this.mFunc = func;
        this.mArgs = args;
    }
}

class RefinementExpression implements IExpression {
    private mObject: IExpression;
    private mKey: IExpression | Identifier;

    public static New(object: IExpression, key: IExpression | Identifier): RefinementExpression {
        return new RefinementExpression(object, key);
    }

    public constructor(object: IExpression, key: IExpression | Identifier) {
        this.mObject = object;
        this.mKey = key;
    }
}

class NewOperatorExpression implements IExpression {
    private mType: IExpression;
    private mArgs: IExpression[];

    public static New(type: IExpression, args: IExpression[]): NewOperatorExpression {
        return new NewOperatorExpression(type, args);
    }

    public constructor(type: IExpression, args: IExpression[]) {
        this.mType = type;
        this.mArgs = args;
    }
}

class DeleteOperatorExpression implements IExpression {
    private mObject: IExpression;
    private mKey: IExpression | Identifier;

    public static New(object: IExpression, key: IExpression | Identifier): RefinementExpression {
        return new RefinementExpression(object, key);
    }

    public constructor(object: IExpression, key: IExpression | Identifier) {
        this.mObject = object;
        this.mKey = key;
    }
}

export class Expression implements IExpression {
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