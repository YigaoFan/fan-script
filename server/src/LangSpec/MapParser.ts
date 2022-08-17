import { AsyncStream } from "../AsyncStream";
import { Channel } from "../Channel";
import { IInputStream, IParser, ParserInput, ParserResult, Text } from "../IParser";
import { ISyntaxNode } from "../ISyntaxNode";
import { Args, Expression, infixOperator, Invocation, Keyword, prefixOperator, Refinement } from "./Expression";
import { func } from "./Func";
import { identifier } from "./Identifier";
import { Literal } from "./Literal";
import { number } from "./Number";
import { Array, Item, Items } from "./Array";
import { Key, Pair, Obj, Value, Pairs } from "./Object";
import { string } from "./String";
import { makeWordParser } from "../parser";

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
        ['literal', ['func'], 'FuncLiteral'],

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
        // func要用这种方法定义吗，还是保持原来的
        // 感觉可以调用原来的，要有个注册机制，只要把 func 的 parser 注册为原来的就行
    ],
    terminated: [
        ['id', identifier],
        ['prefix-operator', prefixOperator],
        ['infix-operator', infixOperator],
        ['string', string],
        ['number', number],
        ['func', func],
        ['new', makeWordParser('new', Keyword.New)],
        ['delete', makeWordParser('delete', Keyword.New)],
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
    private readonly mNodes: (Text | ISyntaxNode | null)[]; // 传到 factory 里时过滤掉 null
    /** now on @property Rule[NowPoint] left */
    public NowPoint: number;

    public static New(from: number, rule: NonTerminatedRule, nowPoint: number) {
        return new NonTerminatedParserState(from, rule, nowPoint);
    }

    private constructor(from: number, rule: NonTerminatedRule, nowPoint: number, nodes: (Text | ISyntaxNode | null)[] = []) {
        this.From = from;
        this.Rule = rule;
        this.NowPoint = nowPoint;
        this.mNodes = nodes;
    }

    public Copy(): NonTerminatedParserState {
        return new NonTerminatedParserState(this.From, this.Rule, this.NowPoint, [...this.mNodes]);
    }
    
    /** 
     * Note: Copy firstly then call this method
     * @return Fail should means move failed, should stay on the old chart position.
     * Succeed means arrive end. Pending means pass this char but not arrive the end.
     */
    public MoveAChar(t: Text): ParserWorkState {
        const len = this.Rule[1].length;
        if (len === 0) {
            // 长度为 0 的这样处理对吗，按理说 0 应该不用 move
            return ParserWorkState.Succeed;
        }
        if (this.NowPoint > InitialStart) {
            if (!NonTerminatedParserState.IsChar(this.Rule[1][this.NowPoint])) {
                return ParserWorkState.Fail;
            }
        }

        const destSymbol = this.Rule[1][this.NowPoint + 1];
        if (NonTerminatedParserState.IsChar(destSymbol)) {
            if (destSymbol === t.Value) { // destSymbol 必须是一个字符串
                this.AddSub(t);
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
    public MoveANonTerminated(symbol: string, node: ISyntaxNode): ParserWorkState {
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

    public get Result(): ISyntaxNode {
        function notNull(value: Text | ISyntaxNode | null): value is (Text | ISyntaxNode) {
            if (value === null) {
                return false;
            }
            return true;
        }
        const nodes = this.mNodes.filter(notNull);
        if (this.Rule[2]) {
            return (NodeFactory[this.Rule[0]] as FactoryWithTypeInfo)(this.Rule[2], nodes);
        } else {
            return (NodeFactory[this.Rule[0]] as Factory)(nodes);
        }
    }

    private AddSub(s: Text | ISyntaxNode) {
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
    private mPromise: Promise<ParserResult<T>>;
    private mFrom: number;
    private mRule: TerminatedRule;
    private mChannel: Channel<Text>;
    private mT?: T;

    public static New(from: number, rule: TerminatedRule, promise: Promise<ParserResult<T>>, channel: Channel<Text>) {
        return new TerminatedParserState(from, rule, promise, channel);
    }

    private constructor(from: number, rule: TerminatedRule, promise: Promise<ParserResult<T>>, channel: Channel<Text>) {
        this.mFrom = from;
        this.mRule = rule;
        this.mPromise = promise;
        this.mChannel = channel;
    }
    
    public get From(): number {
        return this.mFrom;
    }

    public get Rule(): TerminatedRule {
        return this.mRule;
    }

    // NonTerminatedRule 里也有 Terminated 的东西，比如 {，所以 move，控制 nonterminated 里的 terminated 如 { 只有一个字符，方便移动更新状态
    public async Move(t: Text): Promise<ParserWorkState> {
        this.mChannel.PutValue(t);
        var isFulfilled = false;
        var isPending = true;
        var isRejected = false;
        this.mPromise.then(
            function (v) {
                isFulfilled = true;
                isPending = false;
                return v;
            },
            function (e) {
                isRejected = true;
                isPending = false;
                throw e;
            }
        );
        if (isPending) {
            return Promise.resolve(ParserWorkState.Pending);
        } else if (isRejected) {
            return Promise.resolve(ParserWorkState.Fail);
        } else if (isFulfilled) {
            const r = await this.mPromise;
            if (r === null) {
                return Promise.resolve(ParserWorkState.Fail);
            } else {
                this.mT = r.Result;
                return Promise.resolve(ParserWorkState.Succeed);
            }
        } else {
            throw new Error('not handle situation in Move');
        }
    }

    public get Result(): T {
        if (this.mT) {
            return this.mT;
        }
        throw new Error('not result in TerminatedParserState');
    }
}

// 这个解析对象只能用一次，因为内部有状态
class ExpressionChartParser implements IParser<Expression> {
    private mTerminatedStateChart: TerminatedParserState<ISyntaxNode>[];// 不知道这里的范型参数对不对
    private mNonTerminatedStateChart: NonTerminatedParserState[][];
    private mEndChar: string;

    public constructor(endChar: string) {
        this.mEndChar = endChar;
        this.mTerminatedStateChart = [];
        this.mNonTerminatedStateChart = [];
    }
    // setup related parsers

    // 要保存一些协程，因为有些函数可能解析到一半停下来，比如解析 id
    // 那 stream.NextChar 就要加 async
    public async asyncParse(input: ParserInput): Promise<ParserResult<Expression>> {
        const nonTerminatedOnZero: NonTerminatedParserState[] = [];
        for (const r of expGrammarMap.nonTerminated) {
            nonTerminatedOnZero.push(NonTerminatedParserState.New(InitialStart, r, InitialStart));
        }
        
        for (const r of expGrammarMap.terminated) {
            // 这些 parser 是对象，内部应该没有状态影响多次 parser 吧？
            const parser = r[1];
            const s = new AsyncStream();
            // @ts-expect-error TODO fix
            const promise = parser.asyncParse(s);
            this.mTerminatedStateChart.push(TerminatedParserState.New(InitialStart, r, promise, s.Channel));
        }

        for (;;) {
            const r = await this.iter(input);
            if (r) {
                const chart = this.mNonTerminatedStateChart;
                const lastColumn = chart[chart.length - 1];
                const completeds = lastColumn.filter(x => x.Completed && x.From === 0);
                return Promise.resolve(completeds[0].Result);
            }
        }
        return null;
    }

    /**
     * @returns end or not
     */
    public async iter(input: ParserInput): Promise<boolean> {
        const c = input.NextChar;
        if (c.Empty || c.Value === this.mEndChar) {
            return true;
        }
        const completedItems: { From: number, LeftSymbol: string, Result: ISyntaxNode }[] = [];
        // shift
        { // non-terminated shift
            const len = this.mNonTerminatedStateChart.length;
            const stateCopies = this.mNonTerminatedStateChart[len - 1].map(x => x.Copy());
            const shiftResults = stateCopies.map(x => x.MoveAChar(c));
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
            const shiftResultPromises = this.mTerminatedStateChart.map(async x => await x.Move(c));
            const shiftResults = await Promise.all(shiftResultPromises);
            for (let i = 0; i < shiftResults.length; i++) {
                const r = shiftResults[i];
                if (r === ParserWorkState.Succeed) {
                    const s = this.mTerminatedStateChart[i];
                    completedItems.push({ From: s.From, LeftSymbol: s.Rule[0], Result: s.Result });
                }
            }
            this.mTerminatedStateChart = this.mTerminatedStateChart.filter((_, i) => shiftResults[i] === ParserWorkState.Pending);
        }
        // reduction
        for (const p of completedItems) {
            ExpressionChartParser.Reduce(p, this.mNonTerminatedStateChart);
        }
        // closure
        {
            const from = this.mNonTerminatedStateChart.length - 1;
            const lastColumn = this.mNonTerminatedStateChart[this.mNonTerminatedStateChart.length - 1];
            const expectSymbols = lastColumn
                    .filter(x => x.NowPoint < x.Rule[1].length && !NonTerminatedParserState.IsChar(x.Rule[1][x.NowPoint]))
                    .map(x => x.Rule[1][x.NowPoint]);
            for (const s of expectSymbols) {
                ExpressionChartParser.ClosureOnNonterminated(s, from, lastColumn, this.mTerminatedStateChart);
            }
        }

        return false;
    }

    private static Reduce(pair: { From: number, LeftSymbol: string, Result: ISyntaxNode }, nonTerminatedStateChart: NonTerminatedParserState[][]) {
        const chart = nonTerminatedStateChart;
        const toMoveStates = chart[pair.From].filter(x => x.Rule[1][x.NowPoint] === pair.LeftSymbol).map(x => x.Copy());
        const moveResults = toMoveStates.map(x => x.MoveANonTerminated(pair.LeftSymbol, pair.Result));
        const insertPos = chart.length - 1;
        chart[insertPos].push(...toMoveStates);

        const completedItems = toMoveStates.filter((_, i) => moveResults[i] === ParserWorkState.Succeed);
        for (const i of completedItems) {
            ExpressionChartParser.Reduce({ From: i.From, LeftSymbol: i.Rule[0], Result: i.Result }, chart);
        }
    }

    private static ClosureOnNonterminated(symbol: string, from: number, nonTerminatedColumn: NonTerminatedParserState[], terminatedChart: TerminatedParserState<ISyntaxNode>[]) {
        for (const rule of expGrammarMap.nonTerminated) {
            if (rule[0] === symbol) {
                nonTerminatedColumn.push(NonTerminatedParserState.New(from, rule, 0));
            }
        }
        for (const rule of expGrammarMap.terminated) {
            if (rule[0] === symbol) {
                const s = new AsyncStream();
                // @ts-expect-error TODO fix
                const promise = parser.asyncParse(s);
                terminatedChart.push(TerminatedParserState.New(InitialStart, rule, promise, s.Channel));
            }
        }
    }

    private ConsAstFrom(state: NonTerminatedParserState, chart: NonTerminatedParserState[][]) {
        const from = state.From;
    }
}