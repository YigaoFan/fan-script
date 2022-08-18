import { SignalStringStream } from "../SignalStringStream";
import { Channel } from "../Channel";
import { AsyncParserInput, AsyncParserResult, IAsyncInputStream, IInputStream, IParser, ParserInput, ParserResult, Text } from "../IParser";
import { ISyntaxNode } from "../ISyntaxNode";
import { Args, Expression, infixOperator, Invocation, Keyword, prefixOperator, Refinement } from "./Expression";
// import { func } from "./Func";
import { identifier } from "./Identifier";
import { Literal } from "./Literal";
import { number } from "./Number";
import { Array, Items } from "./Array";
import { Key, Pair, Obj, Value, Pairs } from "./Object";
import { string } from "./String";
import { makeWordParser } from "../parser";
import { whitespace } from "./Whitespace";
import { optional } from "../combinator";
import { Signal } from "../Signal";
import { assert, log } from "console";
import { makeQuerablePromise, wait1 as wait1s } from "../util";
import { InitialStart, NonTerminatedParserState, ParserWorkState, TerminatedParserState } from "./ParserState";

type Node = 'exp' | 'literal' | 'object' | 'pairs' | 'pair' | 'key' | 'value'
    | 'array' | 'items' | 'invocation' | 'args' | 'refinement';
export type NonTerminatedRule = readonly [Node, (string | Node)[], string?];
export type TerminatedRule = readonly [string, IParser<ISyntaxNode>];
// TODO add space
export const expGrammarMap: { nonTerminated: NonTerminatedRule[], terminated: TerminatedRule[] } = {
    nonTerminated: [
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
        ['w', whitespace],
        // ['ow', optional(whitespace)],
    ],
};

export type Factory = (nodes: (ISyntaxNode | Text)[]) => ISyntaxNode;
export type FactoryWithTypeInfo = (nodeTypeInfo:string, nodes: (ISyntaxNode | Text)[]) => ISyntaxNode;
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


type ReduceItem = { From: number, LeftSymbol: string, Result: AsyncParserResult<ISyntaxNode> };
/** 这个解析对象只能用一次，因为内部有状态 */
export class ExpressionChartParser implements IParser<Expression> {
    private mTerminatedStateChart: TerminatedParserState<ISyntaxNode>[];
    private mNonTerminatedStateChart: NonTerminatedParserState[][];
    private mEndChar: string;

    public constructor(endChar: string) {
        this.mEndChar = endChar;
        this.mTerminatedStateChart = [];
        this.mNonTerminatedStateChart = [];
    }
    
    public parse(input: IInputStream): ParserResult<Expression> {
        throw new Error('not support');
    }

    public async asyncParse(input: AsyncParserInput): Promise<AsyncParserResult<Expression>> {
        // init
        const nonTerminatedOnZero: NonTerminatedParserState[] = [];
        for (const r of expGrammarMap.nonTerminated) {
            if (r[0] == 'exp') {
                nonTerminatedOnZero.push(NonTerminatedParserState.New(InitialStart, r, InitialStart, input.Copy()));
            }
        }
        this.mNonTerminatedStateChart.push(nonTerminatedOnZero);
        const len = this.mNonTerminatedStateChart.length;
        const lastColumn = this.mNonTerminatedStateChart[len - 1];
        const [nons, ters, coms] = ExpressionChartParser.Closure(lastColumn, len - 1, input.Copy());
        lastColumn.push(...nons);
        this.mTerminatedStateChart.push(...ters);

        for (let i = 0;;i++) {
            log('iter start', i);
            const r = await this.iter(input);
            log('iter end', i);

            if (r) {
                const chart = this.mNonTerminatedStateChart;
                const lastColumn = chart[chart.length - 1];
                const completeds = lastColumn.filter(x => x.Completed && x.From === 0);
                if (completeds.length == 0) {
                    return Promise.resolve(null);
                }
                return Promise.resolve(completeds[0].Result);
            }
        }
    }

    /**
     * @returns end or not
     */
    public async iter(input: AsyncParserInput): Promise<boolean> {
        const c = await input.NextChar;

        const completedItems: ReduceItem[] = [];
        // shift
        { // non-terminated shift
            const len = this.mNonTerminatedStateChart.length;
            const stateCopies = this.mNonTerminatedStateChart[len - 1].map(x => x.Copy());
            const shiftResults = stateCopies.map(x => x.MoveAChar({ Result: c, Remain: input.Copy() }));
            for (let i = 0; i < shiftResults.length; i++) {
                const r = shiftResults[i];
                if (r === ParserWorkState.Succeed) {
                    const s = stateCopies[i];
                    completedItems.push({ From: s.From, LeftSymbol: s.Rule[0], Result: s.Result });
                }
            }
            this.mNonTerminatedStateChart.push(stateCopies.filter((_, i) => shiftResults[i] !== ParserWorkState.Fail));
            for (let i = shiftResults.length - 1; i >= 0; i--) {
                const r = shiftResults[i];
                if (r !== ParserWorkState.Fail) {
                    // len here is old len, because do a push operation above.
                    this.mNonTerminatedStateChart[len - 1].splice(i, 1);
                }
            }
        }
        { // terminated shift
            log('terminate start move');
            this.mTerminatedStateChart.map(x => x.Move());
            const shiftResults = await Promise.all(this.mTerminatedStateChart.map(async x => await x.State()));
            log('terminate end move'); // 果然到这里 move 都完毕了，上面这步应该有玄机，所以只要在下面获取 move 状态就好了。
            // const sndShiftResults = await Promise.all(this.mTerminatedStateChart.map(x => x.State()));

            // for (let i = 0; i < sndShiftResults.length; i++) {
            //     const r = sndShiftResults[i];
            //     if (r === ParserWorkState.Succeed) {
            //         const s = this.mTerminatedStateChart[i];
            //         completedItems.push({ From: s.From, LeftSymbol: s.Rule[0], Result: s.Result });
            //     }
            // }
            // this.mTerminatedStateChart = this.mTerminatedStateChart.filter((_, i) => sndShiftResults[i] === ParserWorkState.Pending);
        }
        const len = this.mNonTerminatedStateChart.length;
        const lastColumn = this.mNonTerminatedStateChart[len - 1];
        const [nons, ters, coms] = ExpressionChartParser.Closure(lastColumn, len - 1, input.Copy());
        lastColumn.push(...nons);
        this.mTerminatedStateChart.push(...ters);
        completedItems.push(...coms);

        ExpressionChartParser.Reduce(completedItems, this.mNonTerminatedStateChart);

        if (c.Empty || c.Value === this.mEndChar) {
            return true;
        }
        return false;
    }

    private static Shift() {
        // TODO
    }

    private static Reduce(items: ReduceItem[], nonTerminatedStateChart: NonTerminatedParserState[][]) {
        const chart = nonTerminatedStateChart;
        for (const item of items) {
            const toMoveStates = chart[item.From].filter(x => x.Rule[1][x.NowPoint] === item.LeftSymbol).map(x => x.Copy());
            const moveResults = toMoveStates.map(x => x.MoveANonTerminated(item.LeftSymbol, item.Result));
            const insertPos = chart.length - 1;
            chart[insertPos].push(...toMoveStates);
    
            const newItems = toMoveStates
                .filter((_, i) => moveResults[i] === ParserWorkState.Succeed)
                .map(x => ({ From: x.From, LeftSymbol: x.Rule[0], Result: x.Result }));
            ExpressionChartParser.Reduce(newItems, chart);
        }
    }
    
    private static Closure(column: NonTerminatedParserState[], from: number, input: IAsyncInputStream) {
        const newItems: [NonTerminatedParserState[], TerminatedParserState<ISyntaxNode>[], ReduceItem[]] = [[], [], []];
        const expectSymbols = column
            .filter(x => x.NowPoint < x.Rule[1].length && !NonTerminatedParserState.IsChar(x.Rule[1][x.NowPoint]))
            .map(x => x.Rule[1][x.NowPoint]);
        for (const s of expectSymbols) {
            const r = ExpressionChartParser.ClosureOn(input, s, from);
            newItems[0].push(...r[0]);
            newItems[1].push(...r[1]);
            newItems[2].push(...r[2]);
        }
        return newItems;
    }

    private static ClosureOn(input: AsyncParserInput, symbol: string, from: number): readonly [NonTerminatedParserState[], TerminatedParserState<ISyntaxNode>[], ReduceItem[]] {
        const nonTerminateds: NonTerminatedParserState[] = [];
        const completeds: ReduceItem[] = [];
        for (const rule of expGrammarMap.nonTerminated) {
            if (rule[0] === symbol) {
                if (rule[1].length == 0) {
                    if (rule[2]) {
                        var r = (NodeFactory[rule[0]] as FactoryWithTypeInfo)(rule[2], []);
                    } else {
                        var r = (NodeFactory[rule[0]] as Factory)([]);;
                    }
                    completeds.push({ From: from, LeftSymbol: symbol, Result: { Remain: input.Copy(), Result: r }, });
                } else {
                    nonTerminateds.push(NonTerminatedParserState.New(from, rule, 0, input.Copy()));
                }
            }
        }
        const terminateds: TerminatedParserState<ISyntaxNode>[] = [];
        for (const rule of expGrammarMap.terminated) {
            if (rule[0] === symbol) {
                const s = SignalStringStream.New(input.Copy());
                const promise = rule[1].asyncParse(s);
                terminateds.push(TerminatedParserState.New(InitialStart, rule, promise, s.GetSignal()));
            }
        }

        return [nonTerminateds, terminateds, completeds];
    }
}