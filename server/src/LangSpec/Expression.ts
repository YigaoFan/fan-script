import { from, } from "../combinator";
import { Text, Position, } from "../IParser";
import { oneOf, } from "../parser";
import { IRange, ISyntaxNode } from "../ISyntaxNode";
import { stringify } from "../util";
import { assert } from "console";

enum PrefixOperatorKind {
    Add = '+',
    Minus = '-',
    TypeOf = 'typof -',
    Not = '!',
}

class PrefixOperator implements ISyntaxNode {
    private mOperator: PrefixOperatorKind;
    private mOperatorText: Text;

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
        return new PrefixOperator(op, operator);
    }

    private constructor(operator: PrefixOperatorKind, operatorText: Text) {
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
    private mOperatorText: Text;

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
        return new InfixOperator(op, operator);
    }

    private constructor(operator: InfixOperatorKind, operatorText: Text) {
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

    public get Range(): IRange {
        return this.mText.Range;
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