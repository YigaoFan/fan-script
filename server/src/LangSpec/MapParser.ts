import { AsyncStream } from "../AsyncStream";
import { Channel } from "../Channel";
import { IInputStream, IParser, ParserInput, ParserResult, Text } from "../IParser";
import { ISyntaxNode } from "../ISyntaxNode";
import { Expression, infixOperator, prefixOperator } from "./Expression";
import { identifier } from "./Identifier";
import { number } from "./Number";
import { string } from "./String";

type Node = 'exp' | 'literal' | 'object' | 'pairs' | 'pair' | 'key' | 'value'
    | 'array' | 'items' | 'item' | 'invocation' | 'args' | 'refinement';
type NonTerminatedRule = readonly [Node, (string | Node)[]];
type TerminatedRule = readonly [string, IParser<ISyntaxNode>];
// TODO add space
const expGrammarMap: { nonTerminated: NonTerminatedRule[], terminated: TerminatedRule[] } = {
    nonTerminated: [
        // 下面的每一个都要有一个 New、和各个元素静态的 setter
        ['exp', ['literal']],
        ['exp', ['id']],
        ['exp', ['(', 'exp', ')']],
        ['exp', ['prefix-operator', 'exp']],
        ['exp', ['exp', 'infix-operator', 'exp']],
        ['exp', ['exp', '?', 'exp', ':', 'exp']],
        ['exp', ['exp', 'invocation']],
        ['exp', ['exp', 'refinement']],
        ['exp', ['new', 'exp', 'invocation']],
        ['exp', ['delete', 'exp', 'refinement']],

        ['literal', ['string']],
        ['literal', ['number']],
        ['literal', ['object']],
        ['literal', ['array']],
        ['literal', ['func']],

        ['object', ['{', 'pairs', '}']],
        ['pairs', []],
        ['pairs', ['pair', ',', 'pairs']],
        ['pair', ['key', ':', 'value']],
        ['key', ['string']],
        ['key', ['id']],
        ['value', ['exp']],

        ['array', ['[', 'items', ']']],
        ['items', []],
        ['items', ['item', ',', 'items']],
        ['item', ['exp']],

        ['invocation', ['(', 'args', ')']],
        ['args', ['arg', ',', 'args']],
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
    ],
};

const InitialStart = -1;
// TODO 写完看一下，我这里写得好像很长，课上的代码好像很短？对比一下
class NonTerminatedParserState {
    public From: number;
    public readonly Rule: NonTerminatedRule;
    /** now on @property Rule[NowPoint] left */
    public NowPoint: number;

    public static New(from: number, rule: NonTerminatedRule, nowPoint: number) {
        return new NonTerminatedParserState(from, rule, nowPoint);
    }

    private constructor(from: number, rule: NonTerminatedRule, nowPoint: number) {
        this.From = from;
        this.Rule = rule;
        this.NowPoint = nowPoint;
    }

    public Copy(): NonTerminatedParserState {
        return new NonTerminatedParserState(this.From, this.Rule, this.NowPoint);
    }
    
    /** 
     * Note: Copy firstly then call this method
     * @return Fail should means move failed, should stay on the old chart position.
     * Succeed means arrive end. Pending means pass this char but not arrive the end.
     */
    public MoveAChar(t: Text): ParserWorkState {
        // Text 里的位置信息丢掉了，好像有问题 TODO
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

        // 可能这次 move 已经超长度了
        const destSymbol = this.Rule[1][this.NowPoint + 1];
        if (NonTerminatedParserState.IsChar(destSymbol)) {
            if (destSymbol === t.Value) {
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
    public MoveANonTerminated(symbol: string): ParserWorkState {
        if (symbol !== this.Rule[1][this.NowPoint]) {
            throw new Error(`MoveANonTerminated on wrong input symbol(${symbol}) at ${this.Rule[1][this.NowPoint]}`);
        }

        this.NowPoint++;
        if (this.NowPoint === this.Rule[1].length) {
            return ParserWorkState.Succeed;
        }
        return ParserWorkState.Pending;
    }

    /** Judge if @arg symbol is char, not the left of a rule */
    private static IsChar(symbol: string): boolean {
        return (!expGrammarMap.terminated.map(x => x[0]).includes(symbol))
            && (!expGrammarMap.nonTerminated.map(x => x[0] as string).includes(symbol));
    }
}

enum ParserWorkState {
    Pending,
    Succeed,
    Fail,
}

class TerminatedParserState<T> {
    private mPromise: Promise<ParserResult<T>>;
    private mFrom: number;
    private mRule: TerminatedRule;
    private mChannel: Channel<Text>;

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
                return Promise.resolve(ParserWorkState.Succeed);
            }
        } else {
            throw new Error('not handle situation in Move');
        }
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
                // cons parser result
                const chart = this.mNonTerminatedStateChart;
                const lastColumn = chart[chart.length - 1];
                const completeds = lastColumn.filter(x => x.Completed && x.From === 0);
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
        const completedItems: { From: number, LeftSymbol: string, }[] = [];
        // shift
        { // non-terminated shift
            const len = this.mNonTerminatedStateChart.length;
            const stateCopies = this.mNonTerminatedStateChart[len - 1].map(x => x.Copy());
            const shiftResults = stateCopies.map(x => x.MoveAChar(c));
            for (let i = 0; i < shiftResults.length; i++) {
                const r = shiftResults[i];
                if (r === ParserWorkState.Succeed) {
                    const s = stateCopies[i];
                    completedItems.push({ From: s.From, LeftSymbol: s.Rule[0] });
                }
            }
            this.mNonTerminatedStateChart.push(stateCopies.filter((_, i) => shiftResults[i] !== ParserWorkState.Fail));
            // 这里 move 成功或pending了，之前的 rule 就没人来找来 reduction 了，所以可以删掉
            // 不对吧，比如 1 + 1 + 1 刚开始匹配 exp + exp 很顺利，但后来 exp + exp 会替代第二个 exp
            // 但是这里替代的是 non-terminated，这里是把 terminated 的字符匹配过了的给删掉
            for (let i = shiftResults.length - 1; i >= 0; i--) {
                const r = shiftResults[i];
                if (r !== ParserWorkState.Fail) {
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
                    completedItems.push({ From: s.From, LeftSymbol: s.Rule[0] });
                }
            }
            this.mTerminatedStateChart = this.mTerminatedStateChart.filter((_, i) => shiftResults[i] !== ParserWorkState.Fail);
        }
        // reduction
        for (const p of completedItems) {
            ExpressionChartParser.Reduce(p, this.mNonTerminatedStateChart);
        }
        // closure
        {
            const from = this.mNonTerminatedStateChart.length - 1;
            const nextChar = input.NextChar; // how to restore TODO
            const lastColumn = this.mNonTerminatedStateChart[this.mNonTerminatedStateChart.length - 1];
            // Closure 好像只用在 non-terminal
            // ExpressionChartParser.ClosureOnChar(nextChar, from, lastColumn, this.mTerminatedStateChart);
            const expectSymbols = lastColumn.filter(x => x.NowPoint < x.Rule[1].length).map(x => x.Rule[1][x.NowPoint]);
            for (const s of expectSymbols) {
                ExpressionChartParser.ClosureOnNonterminated(s, from, lastColumn, this.mTerminatedStateChart);
            }
        }

        return false;
    }

    private static Reduce(pair: { From: number, LeftSymbol: string, }, nonTerminatedStateChart: NonTerminatedParserState[][]) {
        const chart = nonTerminatedStateChart;
        const toMoveStates = chart[pair.From].filter(x => x.Rule[1][x.NowPoint] === pair.LeftSymbol).map(x => x.Copy());
        const moveResults = toMoveStates.map(x => x.MoveANonTerminated(pair.LeftSymbol));
        const insertPos = chart.length - 1;
        chart[insertPos].push(...toMoveStates);

        const completedItems = toMoveStates.filter((_, i) => moveResults[i] === ParserWorkState.Succeed);
        for (const i of completedItems) {
            ExpressionChartParser.Reduce({ From: i.From, LeftSymbol: i.Rule[0] }, chart);
        }
    }

    private static ClosureOnChar(char: Text, from: number, nonTerminatedColumn: NonTerminatedParserState[], terminatedChart: TerminatedParserState<ISyntaxNode>[]) {
        for (const rule of expGrammarMap.nonTerminated) {
            // 下面这两个 if 都要考虑吗？比如 symbol: exp 遇到 exp -> exp + exp，这个 rule 会被加两次
            // closure 到底是看 rule 的左边还是右边
            // 看右边。想了下 closure 是用来连接不同的 non-terminated rule
            if (rule[1].length > 0) {
                if (rule[1][0] === char.Value) {
                    nonTerminatedColumn.push(NonTerminatedParserState.New(from, rule, 0));
                }
            }
        }

        for (const rule of expGrammarMap.terminated) {
            const s = new AsyncStream();
            // @ts-expect-error TODO fix
            const promise = parser.asyncParse(s);
            terminatedChart.push(TerminatedParserState.New(InitialStart, rule, promise, s.Channel));
        }
    }

    // 把 0 长度的也加进来，逻辑可以不用放在这里 TODO
    private static ClosureOnNonterminated(symbol: string, from: number, nonTerminatedColumn: NonTerminatedParserState[], terminatedChart: TerminatedParserState<ISyntaxNode>[]) {
        for (const rule of expGrammarMap.nonTerminated) {
            // 下面这两个 if 都要考虑吗？比如 symbol: exp 遇到 exp -> exp + exp，这个 rule 会被加两次
            // closure 到底是看 rule 的左边还是右边
            // 看右边。想了下 closure 是用来连接不同的 non-terminated rule
            if (rule[1].length > 0) {
                if (rule[1][0] === symbol) {
                    nonTerminatedColumn.push(NonTerminatedParserState.New(from, rule, 0));
                }
            }
        }
    }

    private ConsAstFrom(state: NonTerminatedParserState, chart: NonTerminatedParserState[][]) {
        const from = state.From;
    }
}