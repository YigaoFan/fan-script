import { from, } from "../combinator";
import { Text, Position, } from "../IParser";
import { oneOf, } from "../parser";
import { ISyntaxNode } from "../ISyntaxNode";
import { Identifier, } from "./Identifier";
import { Literal, } from "./Literal";
import { stringify } from "../util";
import { assert } from "console";

export abstract class Expression implements ISyntaxNode {
    abstract Contains(p: Position): boolean;
    abstract get Valid(): boolean;
    abstract toString(): string;
    public static New(typeInfo: string, args: (ISyntaxNode | Text)[]): ISyntaxNode {
        switch (typeInfo) {
            case 'LiteralExpression':
                assert(args.length === 1);
                return LiteralExpression.New(args[0] as Literal);
            case 'IdentifierExpression':
                assert(args.length === 1);
                return IdentifierExpression.New(args[0] as Identifier);
            case 'ParenExpression':
                assert(args.length === 3);
                return ParenExpression.New(args[0] as Text, args[1] as Expression, args[2] as Text);
            case 'PrefixOperatorExpression':
                assert(args.length === 2);
                return PrefixOperatorExpression.New(args[0] as Text, args[1] as Expression);
            case 'InfixOperatorExpression':
                assert(args.length === 3);
                return InfixOperatorExpression.New(args[0] as Expression, args[1] as Text, args[2] as Expression);
            case 'TernaryExpression':
                assert(args.length === 5);
                return TernaryExpression.New(args[0] as Expression, args[1] as Text, args[2] as Expression, args[3] as Text, args[4] as Expression);
            case 'InvocationExpression':
                assert(args.length === 2);
                return InvocationExpression.New(args[0] as Expression, args[1] as Invocation);
            case 'RefinementExpression':
                assert(args.length === 2);
                return RefinementExpression.New(args[0] as Expression, args[1] as Refinement);
            case 'NewExpression':
                assert(args.length === 3);
                return NewExpression.New(args[0] as Text, args[1] as Expression, args[2] as Invocation);
            case 'DeleteExpression':
                assert(args.length === 3);
                return DeleteExpression.New(args[0] as Text, args[1] as Expression, args[2] as Refinement);
        }
        throw new Error(`not support type info: ${typeInfo}`);
    }
}

class LiteralExpression implements Expression {
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

class IdentifierExpression implements Expression {
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

class ParenExpression implements Expression {
    private mLeftParen: Text;
    private mExp: Expression;
    private mRightParen: Text;

    public static New(leftParen: Text, exp: Expression, rightParen: Text): ParenExpression {
        return new ParenExpression(leftParen, exp, rightParen);
    }

    private constructor(leftParen: Text, exp: Expression, rightParen: Text) {
        this.mLeftParen = leftParen;
        this.mExp = exp;
        this.mRightParen = rightParen;
    }

    public Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }
    public get Valid(): boolean {
        throw new Error("Method not implemented.");
    }
    public toString(): string {
        return stringify({
            innerExp: this.mExp?.toString(),
        });
    }
}

class PrefixOperatorExpression implements Expression {
    public Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }
    public get Valid(): boolean {
        throw new Error("Method not implemented.");
    }

    private mOperator?: Text;
    private mExpression?: Expression;

    public static New(operator: Text, subExpression: Expression): PrefixOperatorExpression {
        return new PrefixOperatorExpression(operator, subExpression);
    }

    public static SetSubExpression(expression: PrefixOperatorExpression, subExpression: Expression) {
        expression.mExpression = subExpression;
        return expression;
    }

    public constructor(operator: Text, subExpression: Expression) {
        this.mOperator = operator;
        this.mExpression = subExpression;
    }

    public toString(): string {
        return stringify({
            operator: this.mOperator?.toString(),
            exp: this.mExpression?.toString(),
        });
    }
}

class InfixOperatorExpression implements Expression {
    private mOperator: Text;
    private mLeftExpression?: Expression;
    private mRightExpression?: Expression;

    public static New(left: Expression, operator: Text, right: Expression): InfixOperatorExpression {
        return new InfixOperatorExpression(left, operator, right);
    }

    public static SetLeftExpression(expression: InfixOperatorExpression, subExpression: Expression): InfixOperatorExpression {
        expression.mLeftExpression = subExpression;
        return expression;
    }

    public static SetRightExpression(expression: InfixOperatorExpression, subExpression: Expression): InfixOperatorExpression {
        expression.mRightExpression = subExpression;
        return expression;
    }

    public constructor(left: Expression, operator: Text, right: Expression) {
        this.mOperator = operator;
        this.mLeftExpression = left;
        this.mRightExpression = right;
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

class TernaryExpression implements Expression {
    Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }
    get Valid(): boolean {
        throw new Error("Method not implemented.");
    }
    private mCondition?: Expression;
    private mTrueResult?: Expression;
    private mFalseResult?: Expression;

    public static New(cond: Expression, questionMark: Text, trueResult: Expression, colonMark: Text, falseResult: Expression): TernaryExpression {
        return new TernaryExpression(cond, trueResult, falseResult);
    }

    private constructor(cond: Expression, trueResult: Expression, falseResult: Expression) {
        this.mCondition = cond;
        this.mTrueResult = trueResult;
        this.mFalseResult = falseResult;
    }

    public static SetCondition(expression: TernaryExpression, condtion: Expression) {
        expression.mCondition = condtion;
        return expression;
    }

    public static SetTrueResult(expression: TernaryExpression, trueResult: Expression) {
        expression.mTrueResult = trueResult;
        return expression;
    }

    public static SetFalseResult(expression: TernaryExpression, falseResult: Expression) {
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

class InvocationExpression implements Expression {
    Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }
    get Valid(): boolean {
        throw new Error("Method not implemented.");
    }
    private mFunc?: Expression;
    private mInvocation?: Invocation;

    public static New(func: Expression, invocation: Invocation): InvocationExpression {
        return new InvocationExpression(func, invocation);
    }

    private constructor(func: Expression, invocation: Invocation) {
        this.mFunc = func;
        this.mInvocation = invocation;
    }

    public static SetFunc(expression: InvocationExpression, func: Expression) {
        expression.mFunc = func;
        return expression;
    }

    public static SetInvocation(expression: InvocationExpression, invocation: Invocation) {
        expression.mInvocation = invocation;
        return expression;
    }

    public get Invocation(): Invocation | undefined {
        return this.mInvocation;
    }

    public toString(): string {
        return stringify({
            func: this.mFunc?.toString(),
            invocation: this.mInvocation?.toString(),
        });
    }
}

class RefinementExpression implements Expression {
    Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }
    get Valid(): boolean {
        throw new Error("Method not implemented.");
    }
    private mObject?: Expression;
    private mRefinement?: Refinement;

    public static New(obj: Expression, refinement: Refinement): RefinementExpression {
        return new RefinementExpression(obj, refinement);
    }

    private constructor(obj: Expression, refinement: Refinement) {
        this.mObject = obj;
        this.mRefinement = refinement;
    }

    public static SetObject(expression: RefinementExpression, obj: Expression) {
        expression.mObject = obj;
        return expression;
    }

    public static SetKey(expression: RefinementExpression, refinement: Refinement) {
        expression.mRefinement = refinement;
        return expression;
    }

    public get Refinement(): Refinement | undefined {
        return this.mRefinement;
    }

    public toString(): string {
        return stringify({
            object: this.mObject?.toString(),
            refinement: this.mRefinement?.toString(),
        });
    }
}

class NewExpression implements Expression {
    Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }
    get Valid(): boolean {
        throw new Error("Method not implemented.");
    }
    private mType?: Expression;
    private mInvocation?: Invocation;

    public static New(newKeyword: Text, type: Expression, invocation: Invocation): NewExpression {
        return new NewExpression(type, invocation);
    }

    private constructor(type: Expression, invocation: Invocation) {
        this.mType = type;
        this.mInvocation = invocation;
    }

    public static SetType(expression: NewExpression, type: Expression) {
        expression.mType = type;
        return expression;
    }

    public static SetArgs(expression: NewExpression, invocation: Invocation) {
        expression.mInvocation = invocation;
        return expression;
    }

    public toString(): string {
        return stringify({
            type: this.mType?.toString(),
            invocation: this.mInvocation?.toString(),
        });
    }
}

export class DeleteExpression implements Expression {
    Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }
    get Valid(): boolean {
        throw new Error("Method not implemented.");
    }
    private mObject?: Expression;
    private mRefinement?: Refinement;

    public static New(newKeyword: Text, object: Expression, refinement: Refinement): DeleteExpression {
        return new DeleteExpression(object, refinement);
    }

    public constructor(object: Expression, refinement: Refinement) {
        this.mObject = object;
        this.mRefinement = refinement;
    }

    public static SetObject(expression: DeleteExpression, obj: Expression) {
        expression.mObject = obj;
        return expression;
    }

    public static SetKey(expression: DeleteExpression, refinement: Refinement) {
        expression.mRefinement = refinement;
        return expression;
    }

    public toString(): string {
        return stringify({
            object: this.mObject?.toString(),
            refinement: this.mRefinement?.toString(),
        });
    }
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

export class Keyword implements ISyntaxNode {
    private mText: Text;
    public static New(text: Text) {
        return new Keyword(text);
    }

    private constructor(text: Text) {
        this.mText = text;
    }

    public Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }
    public get Valid(): boolean {
        throw new Error("Method not implemented.");
    }
    public toString(): string {
        return stringify({
            text: this.mText.toString(),
        });
    }
}

export const prefixOperator = from(oneOf(['typeof ', '+', '-', '!'], PrefixOperator.New)).prefixComment('parse prefix operato').raw;
export const infixOperator = from(oneOf(['*', '/', '%', '+', '-', '>=', '<=', '>', '<', '==', '!=', '||', '&&'], InfixOperator.New)).raw;
// 之后做补全会碰到一个问题：什么时候算进入到某个语法节点的范围，在这个范围内进行补全，在这个范围内，某些东西可能是不完整的
// 建立 ast 相关 node 的类型的事要提上日程了
// 这里面有些地方是可以放任意多的空格，这个要想一下在哪加上
/** exp 管 exp 内部的空格，两边的空格不要管 */
// export const consExp = function (func: IParser<Func>, kind: ExpKind, postfix: IParser<null> | null = null): IParser<Expression> {
//     const noPostfixArgsBindedConsExp = consExp.bind(null, func, ExpKind.All, null);// sub expression has full function
//     const postfixArgsBindedConsExp = consExp.bind(null, func, ExpKind.All, postfix); // for the exp that end with exp
//     const lit = from(consLiteral(func)).transform(LiteralExpression.New).prefixComment('parse literal expression').raw;
//     const name = from(identifier).transform(IdentifierExpression.New).prefixComment('parse identifier expression').raw;
//     const parenExp = from(lazy(noPostfixArgsBindedConsExp)).leftWith(leftParen, selectRight).rightWith(rightParen, selectLeft).prefixComment('parse paren expression').raw;
//     const prefixOp = ['typeof ', '+', '-', '!'];
//     const preExp = from(oneOf(prefixOp, PrefixOperatorExpression.New)).rightWith(optional(whitespace), selectLeft).rightWith(lazy(postfixArgsBindedConsExp), PrefixOperatorExpression.SetSubExpression).prefixComment('parse prefix expression').raw;
//     const infixOp = ['*', '/', '%', '+', '-', '>=', '<=', '>', '<', '==', '!=', '||', '&&'];
//     const inExp = from(lazy(noPostfixArgsBindedConsExp)).leftWith(optional(whitespace), selectRight).rightWith(optional(whitespace), selectLeft).rightWith(oneOf(infixOp, InfixOperatorExpression.New), exchangeParas(InfixOperatorExpression.SetLeftExpression)).rightWith(optional(whitespace), selectLeft).rightWith(lazy(postfixArgsBindedConsExp), InfixOperatorExpression.SetRightExpression).rightWith(optional(whitespace), selectLeft).prefixComment('parse infix expression').raw;
//     const ternaryExp = from(lazy(noPostfixArgsBindedConsExp)).rightWith(optional(whitespace), selectLeft).rightWith(makeWordParser('?', TernaryExpression.New), exchangeParas(TernaryExpression.SetCondition)).rightWith(optional(whitespace), selectLeft).rightWith(lazy(noPostfixArgsBindedConsExp), TernaryExpression.SetTrueResult).rightWith(optional(whitespace), selectLeft).rightWith(makeWordParser(':', nullize), selectLeft).rightWith(optional(whitespace), selectLeft).rightWith(lazy(postfixArgsBindedConsExp), TernaryExpression.SetFalseResult).prefixComment('parse ternary expression').raw;
//     const invocation = genInvocation(func, InvocationExpression.New, InvocationExpression.SetArgs);
//     const invokeExp = from(lazy(noPostfixArgsBindedConsExp)).rightWith(optional(whitespace), selectLeft).rightWith(invocation, exchangeParas(InvocationExpression.SetFunc)).prefixComment('parse invocation expression').raw;
//     const refinement = genRefinement(func, RefinementExpression.New, RefinementExpression.SetKey);
//     const refineExp = from(lazy(noPostfixArgsBindedConsExp)).rightWith(optional(whitespace), selectLeft).rightWith(refinement, exchangeParas(RefinementExpression.SetObject)).prefixComment('parse refinement expression').raw;
//     // ! 还能像下面这样用
//     const newExp = from(makeWordParser('new', NewExpression.New)).rightWith(whitespace, selectLeft).rightWith(lazy(noPostfixArgsBindedConsExp), NewExpression.SetType).rightWith(whitespace, selectLeft).rightWith(from(invocation).transform(x => x.Args!).raw, NewExpression.SetArgs).prefixComment('parse new expression').raw;
//     const deleteExp = from(makeWordParser('delete', DeleteExpression.New))
//                             .rightWith(whitespace, selectLeft)
//                             .rightWith(lazy(noPostfixArgsBindedConsExp), DeleteExpression.SetObject)
//                             .rightWith(whitespace, selectLeft)
//                             .rightWith(from(refinement).transform(x => x.Key!).raw, DeleteExpression.SetKey)
//                             .prefixComment('parse delete expression')
//                             .raw;
//     if (kind === ExpKind.DeleteExp) {
//         return deleteExp;
//     }
//     var notExpEndExps = [lit, name, parenExp, invokeExp, newExp, deleteExp, refineExp];
//     var expEndExps = [preExp, inExp, ternaryExp];
//     // var exps = [lit, name, newExp, deleteExp, parenExp, preExp, inExp, ternaryExp, invokeExp, refineExp];
//     if (postfix) {
//         notExpEndExps = notExpEndExps.map(x => from(x).rightWith(postfix, selectLeft).raw);
//     }
//     const exp = from(eitherOf(selectNotNull, ...notExpEndExps, ...expEndExps)).prefixComment('parse expression').raw;
//     // 我现在感觉，做补全的时候会将这些语法规则重新写一遍，以另一种方式
//     return exp;
// };
// log('evaluate expression');
// export const expression: IParser<Expression> = consExp();
// typescript 里 IParser<Expression> 可以赋给 IParser<SyntaxNode> 吗 可以
// export const consDeleteExp = function (func: IParser<Func>) { return consExp(func, ExpKind.DeleteExp); };

export class Invocation implements ISyntaxNode {
    private mArgs: Args;

    public static New(args: (ISyntaxNode | Text)[]) {
        assert(args.length === 3);
        return new Invocation(args[1] as Args);
    }
    public constructor(args: Args) {
        this.mArgs = args;
    }
    
    public Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }
    public get Valid(): boolean {
        throw new Error("Method not implemented.");
    }
    public toString(): string {
        return stringify({
            args: this.mArgs.toString(),
        });
    }
}

export class Refinement implements ISyntaxNode {
    private mKey: Expression | Identifier;

    public static New(args: (ISyntaxNode | Text)[]) {
        assert(args.length === 2 || args.length === 3);
        return new Refinement(args[1] as Expression | Identifier);
    }
    
    private constructor(key: Expression | Identifier) {
        this.mKey = key;
    }
    
    public Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }
    public get Valid(): boolean {
        throw new Error("Method not implemented.");
    }
    public toString(): string {
        return stringify({
            key: this.mKey.toString(),
        });
    }
}

export class Args implements ISyntaxNode {
    private mArgs: Expression[] = [];

    public static New(args: (ISyntaxNode | Text)[]) {
        assert(args.length === 3 || args.length === 0);
        const as = new Args();
        if (args.length === 0) {
            return as;
        }
        as.mArgs.push(args[0] as Expression);
        as.mArgs.push(...(args[2] as Args).mArgs);
        return as;
    }

    public Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }
    public get Valid(): boolean {
        throw new Error("Method not implemented.");
    }
    public toString(): string {
        return stringify(this.mArgs.map(x => x.toString()));
    }
}