import { assert } from "console";
import { CounterStream } from "../CounterStream";
import { AsyncParserInput, IParser, ParserInput, ParserResult, Text } from "../IParser";
import { ISyntaxNode } from "../ISyntaxNode";
import { log, } from "../util";
import { Factory, FactoryWithTypeInfo, NodeFactory, NonTerminatedRule, TerminatedRule } from "./GrammarMap";
import { ExpGrammar } from "./GrammarMap";

export const InitialStart = 0;
export enum ParserWorkState {
    Pending,
    Succeed,
    Fail,
}

export class NonTerminatedParserState {
    public From: number;
    public readonly Rule: NonTerminatedRule;
    private readonly mNodes: (ParserResult<Text> | ParserResult<ISyntaxNode> | null)[]; // 传到 factory 里时过滤掉 null
    /** now on @property Rule[NowPoint] left */
    public NowPoint: number;

    public static New(from: number, rule: NonTerminatedRule) {
        assert(rule[1].length != 0, 'NonTerminatedParserState rule cannot be empty');
        return new NonTerminatedParserState(from, rule, InitialStart);
    }

    public EqualTo(that: NonTerminatedParserState): boolean {
        return this.From == that.From && this.Rule == that.Rule;
    }

    private constructor(from: number, rule: NonTerminatedRule, nowPoint: number, nodes: (ParserResult<Text> | ParserResult<ISyntaxNode> | null)[] = []) {
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
    public MoveAChar(char: ParserResult<Text>): ParserWorkState {
        const len = this.Rule[1].length;
        // if (this.NowPoint > InitialStart) {
        //     if (!NonTerminatedParserState.IsChar(this.Rule[1][this.NowPoint])) {
        //         return ParserWorkState.Fail;
        //     }
        // }

        const destSymbol = this.Rule[1][this.NowPoint];
        if (NonTerminatedParserState.IsChar(destSymbol)) {
            if (destSymbol === char!.Result.Value) { // destSymbol 必须是一个字符的字符串
                this.AddSub(char);
                this.NowPoint++;
                if (this.NowPoint === len) {
                    return ParserWorkState.Succeed;
                }
                return ParserWorkState.Pending;
            }
        }
        log(`move char expect ${destSymbol} actual ${char?.Result}`)
        return ParserWorkState.Fail;
    }

    public get Completed(): boolean {
        return this.NowPoint === this.Rule[1].length;
    }

    /** Note: Copy firstly then call this method */
    public MoveANonTerminated(symbol: string, node: ParserResult<ISyntaxNode>): ParserWorkState {
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

    public get Result(): ParserResult<ISyntaxNode> {
        function notNull(value: ParserResult<Text> | ParserResult<ISyntaxNode> | null): value is (ParserResult<Text> | ParserResult<ISyntaxNode>) {
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

    private AddSub(s: ParserResult<Text> | ParserResult<ISyntaxNode>) {
        this.mNodes.push(s);
    }

    /** Judge if @arg symbol is char, not the left of a rule */
    public static IsChar(symbol: string): boolean {
        return (!ExpGrammar.terminated.map(x => x[0]).includes(symbol))
            && (!ExpGrammar.nonTerminated.map(x => x[0] as string).includes(symbol));
    }

    public toString(): string {
        return `${this.Rule[0]} -> ${this.Rule[1].join()} from ${this.From}`;
    }
}

/** T cannot be undefined */
export class TerminatedParserState<T> {
    private mFrom: number;
    public readonly Rule: TerminatedRule;
    private mParserResult: ParserResult<T>;
    private mNeedShiftCharCount: number;

    public static New<T1>(from: number, rule: TerminatedRule, parser: IParser<T1>, input: ParserInput) {
        const cs = CounterStream.New(input);
        const r = parser.parse(cs);
        const shiftCharCount = r != null ? (r.Remain as CounterStream).Count : 0;
        return new TerminatedParserState(from, rule, r, shiftCharCount);
    }

    private constructor(from: number, rule: TerminatedRule, result: ParserResult<T>, shiftCharCount: number) {
        this.mFrom = from;
        this.Rule = rule;
        this.mParserResult = result;
        this.mNeedShiftCharCount = shiftCharCount;
    }

    public EqualTo(that: TerminatedParserState<T>): boolean {
        return this.From == that.From && this.Rule == that.Rule;
    }

    public get From(): number {
        return this.mFrom;
    }

    public get Result(): ParserResult<T> {
        if (this.mParserResult) {
            return this.mParserResult;
        }
        throw new Error('not result in TerminatedParserState');
    }

    public Move(): ParserWorkState {
        if (!this.mParserResult) {
            return ParserWorkState.Fail;
        }

        --this.mNeedShiftCharCount;
        if (this.mNeedShiftCharCount == 0) {
            return ParserWorkState.Succeed;
        }
        return ParserWorkState.Pending;
    }

    public toString(): string {
        return `${this.Rule[0]} from ${this.From}`;
    }
}