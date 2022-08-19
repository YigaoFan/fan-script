import { IParser, Text } from "../IParser";
import { ISyntaxNode } from "../ISyntaxNode";
import { makeWordParser } from "../parser";
import { Items, Array, } from "./Array";
import { Args, Expression, infixOperator, Invocation, Keyword, prefixOperator, Refinement } from "./Expression";
import { identifier } from "./Identifier";
import { Literal } from "./Literal";
import { number } from "./Number";
import { Obj, Pairs, Pair, Key, Value } from "./Object";
import { string } from "./String";
import { whitespace } from "./Whitespace";

type Node = 'exp' | 'literal' | 'object' | 'pairs' | 'pair' | 'key' | 'value'
    | 'array' | 'items' | 'invocation' | 'args' | 'refinement' | 'ret-stmt' | 'fun' | 'stmts';
export type NonTerminatedRule = readonly [Node, (string | Node)[], string?];
export type TerminatedRule = readonly [string, IParser<ISyntaxNode>];
// TODO add space
export const ExpGrammar: { nonTerminated: NonTerminatedRule[], terminated: TerminatedRule[] } = {
    nonTerminated: [
        ['cls', ['class', 'w', 'id', '{', 'w', 'funs', 'w', '}']],
        
        ['funs', ['func', 'w', 'funs']],// TODO add space
        ['funs', []],// TODO add space
        ['fun', ['func', 'w', 'id', '(', 'paras', ')', '{', 'stmts', '}']],// TODO add space

        ['stmts', ['ret-stmt']],
        ['ret-stmt', ['return', 'w', 'exp', ';']],
        
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
        ['w', whitespace],
        // ['ow', optional(whitespace)],//nullize
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
};