import { from, nullize, optional } from "../combinator";
import { IParser, Text } from "../IParser";
import { ISyntaxNode } from "../ISyntaxNode";
import { makeWordParser } from "../parser";
import { Items, Array, } from "./Array";
import { Args, Expression, infixOperator, Invocation, Keyword, prefixOperator, Refinement } from "./Expression";
import { Func, Paras } from "./Func";
import { identifier } from "./Identifier";
import { Literal } from "./Literal";
import { number } from "./Number";
import { Obj, Pairs, Pair, Key, Value } from "./Object";
import { ReturnStmt, Statement } from "./Statement";
import { string } from "./String";
import { whitespace } from "./Whitespace";

export type Node = 'exp' | 'literal' | 'object' | 'pairs' | 'pair' | 'key' | 'value'
    | 'array' | 'items' | 'invocation' | 'args' | 'refinement' | 'retStmt' | 'fun' | 'stmt' | 'paras';
export type NonTerminatedRule = readonly [Node, (string | Node)[], string?];
export type TerminatedRule = readonly [string, IParser<ISyntaxNode> | IParser<null>];
// TODO add space
export const ExpGrammar: { nonTerminated: NonTerminatedRule[], terminated: TerminatedRule[] } = {
    nonTerminated: [
        // ow还是有问题
        // ['cls', ['class', 'w', 'id', '{', 'w', 'funs', 'w', '}']],
        ['fun', ['func', 'w', 'id', 'ow', '(', 'ow', 'paras', 'ow', ')', 'ow', '{', 'stmt', '}']], // TODO 加可选空白
        ['paras', ['id', 'ow', ',', 'ow', 'paras']], // bug 所在：reduce 之后没有再 closure，两者要可以互相触发，于是要有个机制看有没有引入新的 rule
        ['paras', []],

        ['stmt', ['return', 'w', 'exp', 'ow', ';'], 'ReturnStmt'],
        
        ['exp', ['literal'], 'LiteralExpression'], // like 'LiteralExpression' is type info for node factory
        ['exp', ['id'], 'IdentifierExpression'],
        ['exp', ['(', 'exp', ')'], 'ParenExpression'],
        ['exp', ['prefix-operator', 'exp'], 'PrefixOperatorExpression'],
        ['exp', ['exp', 'infix-operator', 'exp'], 'InfixOperatorExpression'],
        ['exp', ['exp', '?', 'exp', ':', 'exp'], 'TernaryExpression'],
        ['exp', ['exp', 'invocation'], 'InvocationExpression'],
        ['exp', ['exp', 'refinement'], 'RefinementExpression'],
        ['exp', ['new', 'exp', 'invocation'], 'NewExpression'],
        ['exp', ['delete', 'exp', 'refinement'], 'DeleteExpression'],

        ['literal', ['string'], 'StringLiteral'],
        ['literal', ['number'], 'NumberLiteral'],
        ['literal', ['object'], 'ObjectLiteral'],
        ['literal', ['array'], 'ArrayLiteral'],
        // ['literal', ['func'], 'FuncLiteral'],

        ['object', ['{', 'pairs', '}']],
        ['pairs', []],
        ['pairs', ['pair', ',', 'pairs']],
        ['pair', ['key', ':', 'value']],
        ['key', ['string']],
        ['key', ['id']],
        ['value', ['exp']],

        ['array', ['[', 'items', ']'], 'Array'],
        ['items', []],
        ['items', ['exp', ',', 'items']],

        ['invocation', ['(', 'args', ')']],
        ['args', ['exp', ',', 'args']],
        ['args', []],

        ['refinement', ['.', 'id']],
        ['refinement', ['[', 'exp', ']']],
    ],
    terminated: [
        ['id', identifier],
        ['prefix-operator', prefixOperator],
        ['infix-operator', infixOperator],
        ['string', string],
        ['number', number],
        // ['func', func],
        ['new', makeWordParser('new', Keyword.New)],
        ['delete', makeWordParser('delete', Keyword.New)],
        ['return', makeWordParser('return', Keyword.New)],
        ['func', makeWordParser('func', Keyword.New)],
        ['w', from(whitespace).transform(nullize).raw],
        ['ow', from(optional(whitespace)).transform(nullize).raw],
    ],
};

export type Factory = (nodes: (ISyntaxNode | Text)[]) => ISyntaxNode;
export type FactoryWithTypeInfo = (nodeTypeInfo: string, nodes: (ISyntaxNode | Text)[]) => ISyntaxNode;
export const NodeFactory: { [key: string]: Factory | FactoryWithTypeInfo; } = {
    exp: Expression.New,
    literal: Literal.New,
    object: Obj.New,
    pairs: Pairs.New,
    pair: Pair.New,
    key: Key.New,
    value: Value.New,
    array: Array.New,
    items: Items.New,
    invocation: Invocation.New,
    args: Args.New,
    refinement: Refinement.New,
    stmt: Statement.New,
    paras: Paras.New,
    fun: Func.New,
};