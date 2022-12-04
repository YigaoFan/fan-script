import { CounterStream } from "../CounterStream";
import { IParser, ParserInput, ParserResult, Text } from "../IParser";
import { ISyntaxNode } from "../ISyntaxNode";
import { ExpGrammar, Factory, nodeFactory, NonTerminatedRule, TerminatedRule } from "./GrammarMap";

export const InitialStart = 0;
export enum ParserWorkState {
    Pending,
    Succeed,
    Fail,
}

export class NonTerminatedParserState {
    public readonly From: number;
    public readonly Rule: NonTerminatedRule;
    private readonly mNodes: (ParserResult<Text> | ParserResult<ISyntaxNode> | ParserResult<null>)[]; // 传到 factory 里时过滤掉 null
    /** now on @property Rule[NowPoint] left */
    public NowPoint: number;
    private mInitalInput: ParserInput;

    public static New(from: number, rule: NonTerminatedRule, startInput: ParserInput) {
        // assert(rule[1].length != 0, 'NonTerminatedParserState rule cannot be empty');
        return new NonTerminatedParserState(from, rule, InitialStart, startInput);
    }

    public EqualTo(that: NonTerminatedParserState): boolean {
        return this.From == that.From && this.Rule == that.Rule;
    }

    private constructor(from: number, rule: NonTerminatedRule, nowPoint: number, initalInput: ParserInput, nodes: (ParserResult<Text> | ParserResult<ISyntaxNode> | ParserResult<null>)[] = []) {
        this.From = from;
        this.Rule = rule;
        this.NowPoint = nowPoint;
        this.mNodes = nodes;
        this.mInitalInput = initalInput;
    }

    public Copy(): NonTerminatedParserState {
        return new NonTerminatedParserState(this.From, this.Rule, this.NowPoint, this.mInitalInput.Copy(), [...this.mNodes]);
    }

    /** 
     * Note: Copy firstly then call this method
     * @return Fail should means move failed, should stay on the old chart position.
     * Succeed means arrive end. Pending means pass this char but not arrive the end.
     */
    public MoveAChar(char: ParserResult<Text>): ParserWorkState {
        if (this.IsEmptyRule) {
            return ParserWorkState.Fail;
        }

        const len = this.Rule[1].length;

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
        // log(`move char expect ${destSymbol} actual ${char?.Result}`);
        return ParserWorkState.Fail;
    }

    public get Completed(): boolean {
        return this.NowPoint === this.Rule[1].length;
    }

    public get State(): ParserWorkState.Pending | ParserWorkState.Succeed {
        return this.NowPoint === this.Rule[1].length ? ParserWorkState.Succeed : ParserWorkState.Pending;
    }

    public get LeftSymbol(): string {
        return this.Rule[0];
    }

    /** Note: Copy firstly then call this method */
    public MoveANonTerminated(symbol: string, node: ParserResult<ISyntaxNode> | ParserResult<null>): ParserWorkState {
        if (symbol !== this.Rule[1][this.NowPoint]) {
            throw new Error(`MoveANonTerminated on wrong input symbol(${symbol}) at ${this.Rule[1][this.NowPoint]}`);
        }

        if (this.IsEmptyRule) {
            return ParserWorkState.Fail;
        }
        this.AddSub(node);
        this.NowPoint++;
        if (this.NowPoint === this.Rule[1].length) {
            return ParserWorkState.Succeed;
        }
        return ParserWorkState.Pending;
    }

    public get Result(): ParserResult<ISyntaxNode> {
        function notNull(value: ParserResult<Text> | ParserResult<ISyntaxNode> | ParserResult<null>): value is (ParserResult<Text> | ParserResult<ISyntaxNode>) {
            // if (value!.Result === null) {
            //     return false;
            // }
            // null is needed in AST node type
            return true;
        }
        const usedNodes = this.mNodes.filter(notNull);
        const usedNodeResults = usedNodes.map(x => x!.Result);
        const remain = this.IsEmptyRule ? this.mInitalInput : this.mNodes[this.mNodes.length - 1]!.Remain;

        if (this.Rule[2]) {
            // TODO remove one of the branch
            return {
                Result: (nodeFactory.Get(this.Rule) as Factory)(usedNodeResults),
                Remain: remain,
            };
        } else {
            return {
                Result: (nodeFactory.Get(this.Rule) as Factory)(usedNodeResults),
                Remain: remain,
            };
        }
    }

    private AddSub(s: ParserResult<Text> | ParserResult<ISyntaxNode> | ParserResult<null>) {
        this.mNodes.push(s);
    }

    /** Judge if @arg symbol is char, not the left of a rule */
    public static IsChar(symbol: string): boolean {
        return (!ExpGrammar.terminated.map(x => x[0]).includes(symbol))
            && (!ExpGrammar.nonTerminated.map(x => x[0] as string).includes(symbol));
    }

    public toString(): string {
        return `${this.Rule[0]} -> ${this.Rule[1].slice(0, this.NowPoint).join(' ')} · ${this.Rule[1].slice(this.NowPoint).join(' ')} from ${this.From}`;
    }

    private get IsEmptyRule(): boolean {
        return this.Rule[1].length == 0;
    }
}

/** T cannot be undefined */
export class TerminatedParserState<T> {
    public readonly From: number;
    public readonly Rule: TerminatedRule;
    private mParserResult: ParserResult<T>;
    private mNeedShiftCharCounter: number;
    private readonly mNeedShiftCharCount: number;

    public static New<T1>(from: number, rule: TerminatedRule, parser: IParser<T1>, input: ParserInput) {
        const cs = CounterStream.New(input);
        const r = parser.parse(cs);
        const shiftCharCount = r != null ? (r.Remain as CounterStream).Count : 0;
        return new TerminatedParserState(from, rule, r, shiftCharCount);
    }

    private constructor(from: number, rule: TerminatedRule, result: ParserResult<T>, shiftCharCount: number) {
        this.From = from;
        this.Rule = rule;
        this.mParserResult = result;
        this.mNeedShiftCharCounter = shiftCharCount;
        this.mNeedShiftCharCount = shiftCharCount;
    }

    public EqualTo(that: TerminatedParserState<T>): boolean {
        return this.From == that.From && this.Rule == that.Rule;
    }

    public get LeftSymbol(): string {
        return this.Rule[0];
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

        --this.mNeedShiftCharCounter;
        if (this.mNeedShiftCharCounter == 0) {
            return ParserWorkState.Succeed;
        }
        return ParserWorkState.Pending;
    }

    public get Completed(): boolean {
        if (!this.mParserResult) {
            return true;
        }

        if (this.mNeedShiftCharCounter > 0) {
            return false;
        }
        return true;
    }

    public get State(): ParserWorkState {
        if (!this.mParserResult) {
            return ParserWorkState.Fail;
        }

        if (this.mNeedShiftCharCounter > 0) {
            return ParserWorkState.Pending;
        }
        return ParserWorkState.Succeed;
    }

    public toString(): string {
        return `${this.Rule[0]} from ${this.From} need shift ${this.mNeedShiftCharCount} char`;
    }
}