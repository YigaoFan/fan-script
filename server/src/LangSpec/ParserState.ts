import { assert } from "console";
import { AsyncParserInput, AsyncParserResult, Text } from "../IParser";
import { ISyntaxNode } from "../ISyntaxNode";
import { Signal } from "../Signal";
import { log, makeQuerablePromise } from "../util";
import { expGrammarMap, Factory, FactoryWithTypeInfo, NodeFactory, NonTerminatedRule, TerminatedRule } from "./MapParser";

export const InitialStart = 0;
// TODO 写完看一下，我这里写得好像很长，课上的代码好像很短？对比一下
export class NonTerminatedParserState {
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

export enum ParserWorkState {
    Pending,
    Succeed,
    Fail,
}

/** T cannot be undefined */
export class TerminatedParserState<T> {
    private mPromise: Promise<AsyncParserResult<T>>;
    private mFrom: number;
    private mRule: TerminatedRule;
    private mSignal: Signal;
    private mParserResult?: AsyncParserResult<T>;
    private mState?: ParserWorkState;

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
    public Move(): void {
        this.mSignal.Signal();
    }

    public get Result(): AsyncParserResult<T> {
        if (this.mParserResult) {
            return this.mParserResult;
        }
        throw new Error('not result in TerminatedParserState');
    }

    public async State(): Promise<ParserWorkState> {
        const querablePromise = makeQuerablePromise(this.mPromise);
        // @ts-expect-error
        if (querablePromise.isPending()) {
            log('terminated parser pending');
            this.mState = ParserWorkState.Pending;
            return ParserWorkState.Pending;
            // @ts-expect-error
        } else if (querablePromise.isRejected()) {
            log('terminated parser failed');
            this.mState = ParserWorkState.Fail;
            return ParserWorkState.Fail;
            // @ts-expect-error
        } else if (querablePromise.isFulfilled()) {
            log('terminated parser success');
            const r = await this.mPromise;
            if (r === null) {
                this.mState = ParserWorkState.Fail;
                return ParserWorkState.Fail;
            } else {
                this.mState = ParserWorkState.Succeed;
                this.mParserResult = r;
                return ParserWorkState.Succeed;
            }
        } else {
            throw new Error('not handle situation in Move');
        }
    }
}