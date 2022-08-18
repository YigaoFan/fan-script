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

type Node = 'exp' | 'literal' | 'object' | 'pairs' | 'pair' | 'key' | 'value'
    | 'array' | 'items' | 'invocation' | 'args' | 'refinement';
type NonTerminatedRule = readonly [Node, (string | Node)[], string?];
type TerminatedRule = readonly [string, IParser<ISyntaxNode>];
// TODO add space
const expGrammarMap: { nonTerminated: NonTerminatedRule[], terminated: TerminatedRule[] } = {
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

type Factory = (nodes: (ISyntaxNode | Text)[]) => ISyntaxNode;
type FactoryWithTypeInfo = (nodeTypeInfo:string, nodes: (ISyntaxNode | Text)[]) => ISyntaxNode;
const NodeFactory: { [key: string]: Factory | FactoryWithTypeInfo; } = {
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
const InitialStart = 0;
// TODO 写完看一下，我这里写得好像很长，课上的代码好像很短？对比一下
class NonTerminatedParserState {
    public From: number;
    public readonly Rule: NonTerminatedRule;
    private readonly mNodes: (AsyncParserResult<Text> | AsyncParserResult<ISyntaxNode> | null)[]; // 传到 factory 里时过滤掉 null
    /** now on @property Rule[NowPoint] left */
    public NowPoint: number;
    private mInputOnlyFor0RightRule: AsyncParserInput;

    public static New(from: number, rule: NonTerminatedRule, nowPoint: number, input: AsyncParserInput) {
        assert(rule[1].length != 0, 'NonTerminatedParserState rule cannot be empty');
        return new NonTerminatedParserState(from, rule, nowPoint, input);
    }

    private constructor(from: number, rule: NonTerminatedRule, nowPoint: number, input: AsyncParserInput, nodes: (AsyncParserResult<Text> | AsyncParserResult<ISyntaxNode> | null)[] = []) {
        this.From = from;
        this.Rule = rule;
        this.NowPoint = nowPoint;
        this.mNodes = nodes;
        this.mInputOnlyFor0RightRule = input;
    }

    public Copy(): NonTerminatedParserState {
        return new NonTerminatedParserState(this.From, this.Rule, this.NowPoint, this.mInputOnlyFor0RightRule.Copy(), [...this.mNodes]);
    }
    
    /** 
     * Note: Copy firstly then call this method
     * @return Fail should means move failed, should stay on the old chart position.
     * Succeed means arrive end. Pending means pass this char but not arrive the end.
     */
    public MoveAChar(char: AsyncParserResult<Text>): ParserWorkState {
        const len = this.Rule[1].length;
        if (this.NowPoint > InitialStart) {
            if (!NonTerminatedParserState.IsChar(this.Rule[1][this.NowPoint])) {
                return ParserWorkState.Fail;
            }
        }

        const destSymbol = this.Rule[1][this.NowPoint + 1];
        if (NonTerminatedParserState.IsChar(destSymbol)) {
            if (destSymbol === char!.Result.Value) { // destSymbol 必须是一个字符串
                this.AddSub(char);
                this.NowPoint++;
                if (this.NowPoint === len) {
                    return ParserWorkState.Succeed;
                }
                return ParserWorkState.Pending;
            }
            return ParserWorkState.Fail;
        }

        return ParserWorkState.Fail;
    }

    public get Completed(): boolean {
        return this.NowPoint === this.Rule[1].length;
    }

    /** Note: Copy firstly then call this method */
    public MoveANonTerminated(symbol: string, node: AsyncParserResult<ISyntaxNode>): ParserWorkState {
        if (symbol !== this.Rule[1][this.NowPoint]) {
            throw new Error(`MoveANonTerminated on wrong input symbol(${symbol}) at ${this.Rule[1][this.NowPoint]}`);
        }

        this.AddSub(node);
        this.NowPoint++;
        if (this.NowPoint === this.Rule[1].length) {
            return ParserWorkState.Succeed;
        }
        return ParserWorkState.Pending;
    }

    public get Result(): AsyncParserResult<ISyntaxNode> {
        function notNull(value: AsyncParserResult<Text> | AsyncParserResult<ISyntaxNode> | null): value is (AsyncParserResult<Text> | AsyncParserResult<ISyntaxNode>) {
            if (value === null) {
                return false;
            }
            return true;
        }
        const nodes = this.mNodes.filter(notNull);
        const nodeResults = nodes.map(x => x!.Result);
        const remain = nodes[nodes.length - 1]!.Remain;

        if (this.Rule[2]) {
            return {
                Result: (NodeFactory[this.Rule[0]] as FactoryWithTypeInfo)(this.Rule[2], nodeResults),
                Remain: remain,
            };
        } else {
            return {
                Result: (NodeFactory[this.Rule[0]] as Factory)(nodeResults),
                Remain: remain,
            };
        }
    }

    private AddSub(s: AsyncParserResult<Text> | AsyncParserResult<ISyntaxNode>) {
        this.mNodes.push(s);
    }

    /** Judge if @arg symbol is char, not the left of a rule */
    public static IsChar(symbol: string): boolean {
        return (!expGrammarMap.terminated.map(x => x[0]).includes(symbol))
            && (!expGrammarMap.nonTerminated.map(x => x[0] as string).includes(symbol));
    }
}

enum ParserWorkState {
    Pending,
    Succeed,
    Fail,
}

/** T cannot be undefined */
class TerminatedParserState<T> {
    private mPromise: Promise<AsyncParserResult<T>>;
    private mFrom: number;
    private mRule: TerminatedRule;
    private mSignal: Signal;
    private mParserResult?: AsyncParserResult<T>;

    public static New<T1>(from: number, rule: TerminatedRule, promise: Promise<AsyncParserResult<T1>>, signal: Signal) {
        return new TerminatedParserState(from, rule, promise, signal);
    }

    private constructor(from: number, rule: TerminatedRule, promise: Promise<AsyncParserResult<T>>, signal: Signal) {
        this.mFrom = from;
        this.mRule = rule;
        this.mPromise = promise;
        this.mSignal = signal;
    }
    
    public get From(): number {
        return this.mFrom;
    }

    public get Rule(): TerminatedRule {
        return this.mRule;
    }

    // NonTerminatedRule 里也有 Terminated 的东西，比如 {，所以 move，控制 nonterminated 里的 terminated 如 { 只有一个字符，方便移动更新状态
    public async Move(): Promise<ParserWorkState> {
        this.mSignal.Signal();
        // await wait1s();
        const querablePromise = makeQuerablePromise(this.mPromise);
        // @ts-expect-error
        if (querablePromise.isPending()) {
            log('terminated parser pending');
            return Promise.resolve(ParserWorkState.Pending);
        // @ts-expect-error
        } else if (querablePromise.isRejected()) {
            log('terminated parser failed');
            return Promise.resolve(ParserWorkState.Fail);
        // @ts-expect-error
        } else if (querablePromise.isFulfilled()) {
            log('terminated parser success');
            const r = await this.mPromise;
            if (r === null) {
                return Promise.resolve(ParserWorkState.Fail);
            } else {
                this.mParserResult = r;
                return Promise.resolve(ParserWorkState.Succeed);
            }
        } else {
            throw new Error('not handle situation in Move');
        }
    }

    public get Result(): AsyncParserResult<T> {
        if (this.mParserResult) {
            return this.mParserResult;
        }
        throw new Error('not result in TerminatedParserState');
    }
}

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
        // for (const r of expGrammarMap.terminated) {
        //     const parser = r[1];
        //     const s = SignalStringStream.New(input.Copy());
        //     const promise = parser.asyncParse(s);
        //     this.mTerminatedStateChart.push(TerminatedParserState.New(InitialStart, r, promise, s.GetSignal()));
        // }

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
            const shiftResultPromises = this.mTerminatedStateChart.map(async x => await x.Move());
            const shiftResults = await Promise.all(shiftResultPromises);
            log('terminate end move'); // 果然到这里 move 都完毕了，上面这步应该有玄机，所以只要在下面获取 move 状态就好了。


            for (let i = 0; i < shiftResults.length; i++) {
                const r = shiftResults[i];
                if (r === ParserWorkState.Succeed) {
                    const s = this.mTerminatedStateChart[i];
                    completedItems.push({ From: s.From, LeftSymbol: s.Rule[0], Result: s.Result });
                }
            }
            this.mTerminatedStateChart = this.mTerminatedStateChart.filter((_, i) => shiftResults[i] === ParserWorkState.Pending);
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