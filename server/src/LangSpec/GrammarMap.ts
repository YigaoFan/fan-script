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
    | 'array' | 'items' | 'invocation' | 'args' | 'refinement' | 'retStmt' | 'fun' 
    | 'stmt' | 'paras' | 'cls' | 'ifStmt' | 'returnStmt' | 'expStmt' | 'varStmt'
    | 'invocationCircle' | 'afterIdInExpStmt';
export type NonTerminatedRule = readonly [Node, (string | Node)[], string?];
export type TerminatedRule = readonly [string, IParser<ISyntaxNode> | IParser<null>];
// TODO add space，只处理内部的空白，不处理两边的空白
export const ExpGrammar: { nonTerminated: NonTerminatedRule[], terminated: TerminatedRule[] } = {
    nonTerminated: [
        ['cls', ['class', 'w', 'id', '{', 'w', 'funs', 'w', '}']],
        ['fun', ['func', 'w', 'id', 'ow', '(', 'ow', 'paras', 'ow', ')', 'ow', '{', 'stmt', '}']],
        ['paras', ['id', 'ow', ',', 'ow', 'paras']], // bug 所在：reduce 之后没有再 closure，两者要可以互相触发，于是要有个机制看有没有引入新的 rule
        ['paras', []],

        ['stmt', ['returnStmt']],//这里变了，stmt.new 那里要改一下
        ['stmt', ['exp', 'ow', ';']],// 这种这样加分号会不会有问题？
        ['stmt', ['varStmt', 'ow', ';'], 'VarStmt'],
        ['stmt', ['ifStmt'], 'IfStmt'],
        ['stmt', ['expStmt', 'ow', ';'], 'ExpStmt'],
        ['varStmt', ['var', 'w', 'id', 'ow', '=', 'ow', 'exp']], // TODO
        ['returnStmt', ['return', 'w', 'exp', 'ow', ';'], 'ReturnStmt'],
        ['ifStmt', ['if', 'ow', '(', 'ow', 'exp', 'ow', ')', 'ow', 'block', 'ow', 'else', 'ow', 'block']],
        ['ifStmt', ['if', 'ow', '(', 'ow', 'exp', 'ow', ')', 'ow', 'block']],
        ['expStmt', ['id', 'ow', 'afterIdInExpStmt']],

        ['afterIdInExpStmt', ['=', 'ow', 'exp']],
        ['afterIdInExpStmt', ['=', 'ow', 'expStmt']],
        ['afterIdInExpStmt', ['+=', 'ow', 'exp']],// handle +=
        ['afterIdInExpStmt', ['-=', 'ow', 'exp']],// handle -=
        ['afterIdInExpStmt', ['invocationCircle']],
        ['afterIdInExpStmt', ['invocationCircle', 'ow', 'refinement', 'ow', 'afterIdInExpStmt']],
        ['afterIdInExpStmt', ['refinement', 'ow', 'afterIdInExpStmt']],
        
        ['invocationCircle', ['invocation']],
        ['invocationCircle', ['invocation', 'invocationCircle']],
        
        ['exp', ['literal'], 'LiteralExpression'], // like 'LiteralExpression' is type info for node factory
        ['exp', ['id'], 'IdentifierExpression'],
        ['exp', ['(', 'ow', 'exp', 'ow', ')'], 'ParenExpression'],
        ['exp', ['prefix-operator', 'ow', 'exp'], 'PrefixOperatorExpression'],
        ['exp', ['exp', 'ow', 'infix-operator', 'ow', 'exp'], 'InfixOperatorExpression'],
        ['exp', ['exp', 'ow', '?', 'ow', 'exp', 'ow', ':', 'ow', 'exp'], 'TernaryExpression'],
        ['exp', ['exp', 'ow', 'invocation'], 'InvocationExpression'],
        ['exp', ['exp', 'ow', 'refinement'], 'RefinementExpression'],
        ['exp', ['new', 'w', 'exp', 'ow', 'invocation'], 'NewExpression'],
        ['exp', ['delete', 'w', 'exp', 'ow', 'refinement'], 'DeleteExpression'],

        ['literal', ['string'], 'StringLiteral'],
        ['literal', ['number'], 'NumberLiteral'],
        ['literal', ['object'], 'ObjectLiteral'],
        ['literal', ['array'], 'ArrayLiteral'],
        // ['literal', ['func'], 'FuncLiteral'],

        ['object', ['{', 'ow', 'pairs', 'ow', '}']],
        ['pairs', []],
        ['pairs', ['pair', 'ow', ',', 'ow', 'pairs']],
        ['pair', ['key', 'ow', ':', 'ow', 'value']],
        ['key', ['string']],
        ['key', ['id']],
        ['value', ['exp']],

        ['array', ['[', 'ow', 'items', 'ow', ']']],
        ['items', []],
        ['items', ['exp', 'ow', ',', 'ow', 'items']],

        ['invocation', ['(', 'ow', 'args', 'ow', ')']],
        ['args', ['exp', 'ow', ',', 'ow', 'args']],
        ['args', []],

        ['refinement', ['.', 'ow', 'id']],
        ['refinement', ['[', 'ow', 'exp', 'ow', ']']],
    ],
    terminated: [
        ['id', identifier],
        ['prefix-operator', prefixOperator],
        ['infix-operator', infixOperator],
        ['string', string],
        ['number', number],
        // ['func', func],
        ['new', makeWordParser('new', Keyword.New)],
        ['if', makeWordParser('if', Keyword.New)],
        ['else', makeWordParser('else', Keyword.New)],
        ['var', makeWordParser('var', Keyword.New)],
        ['delete', makeWordParser('delete', Keyword.New)],
        ['return', makeWordParser('return', Keyword.New)],
        ['func', makeWordParser('func', Keyword.New)],
        ['class', makeWordParser('class', Keyword.New)],
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
    // cls: Class.New,
};