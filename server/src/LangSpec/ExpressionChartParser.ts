import { AsyncParserInput, IAsyncInputStream, IInputStream, IParser, ParserInput, ParserResult, Text, AsyncParserResult, debug } from "../IParser";
import { ISyntaxNode } from "../ISyntaxNode";
import { Expression } from "./Expression";
import { log } from "console";
import { InitialStart, NonTerminatedParserState, ParserWorkState, TerminatedParserState } from "./ParserState";
import { ExpGrammar, Factory, FactoryWithTypeInfo, NodeFactory } from "./GrammarMap";

// TODO 写完看一下，我这里写得好像很长，课上的代码好像很短？对比一下

type ReduceItem = { From: number, LeftSymbol: string, Result: ParserResult<ISyntaxNode> };
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

    @debug()
    public parse(input: IInputStream): ParserResult<Expression> {
        const nonTerminatedOnZero: NonTerminatedParserState[] = [];
        for (const r of ExpGrammar.nonTerminated) {
            if (r[0] == 'exp') {
                nonTerminatedOnZero.push(NonTerminatedParserState.New(InitialStart, r, InitialStart));
            }
        }
        this.mNonTerminatedStateChart.push(nonTerminatedOnZero);
        const len = this.mNonTerminatedStateChart.length;
        const lastColumn = this.mNonTerminatedStateChart[len - 1];
        const [nons, ters, coms] = ExpressionChartParser.Closure(lastColumn, len - 1, input.Copy());
        lastColumn.push(...nons);
        this.mTerminatedStateChart.push(...ters);

        for (let i = 0; ; i++) {
            const r = this.iter(input);
            if (r) {
                const chart = this.mNonTerminatedStateChart;
                const lastColumn = chart[chart.length - 1];
                const completeds = lastColumn.filter(x => x.Completed && x.From === 0);
                if (completeds.length == 0) {
                    return null;
                }
                return completeds[0].Result;
            }
        }
    }

    /**
     * @returns end or not
     */
    public iter(input: ParserInput): boolean {
        const c = input.NextChar;

        const completedItems: ReduceItem[] = [];
        // shift
        completedItems.push(...this.ShiftOnNonTerminated(c, input.Copy()));
        completedItems.push(...this.shiftOnTerminated());
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

    private ShiftOnNonTerminated(c: Text, input: IInputStream): ReduceItem[] {
        const completedItems: ReduceItem[] = [];
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
        return completedItems;
    }

    private shiftOnTerminated(): ReduceItem[] {
        const completedItems: ReduceItem[] = [];
        const shiftResults = this.mTerminatedStateChart.map(x => x.Move());

        for (let i = 0; i < shiftResults.length; i++) {
            const r = shiftResults[i];
            if (r === ParserWorkState.Succeed) {
                const s = this.mTerminatedStateChart[i];
                completedItems.push({ From: s.From, LeftSymbol: s.Rule[0], Result: s.Result });
            }
        }
        // update chart
        this.mTerminatedStateChart = this.mTerminatedStateChart.filter((_, i) => shiftResults[i] === ParserWorkState.Pending);
        return completedItems;
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
    
    private static Closure(column: NonTerminatedParserState[], from: number, input: ParserInput) {
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

    private static ClosureOn(input: ParserInput, symbol: string, from: number): readonly [NonTerminatedParserState[], TerminatedParserState<ISyntaxNode>[], ReduceItem[]] {
        const nonTerminateds: NonTerminatedParserState[] = [];
        const completeds: ReduceItem[] = [];
        for (const rule of ExpGrammar.nonTerminated) {
            if (rule[0] === symbol) {
                if (rule[1].length == 0) {
                    if (rule[2]) {
                        var r = (NodeFactory[rule[0]] as FactoryWithTypeInfo)(rule[2], []);
                    } else {
                        var r = (NodeFactory[rule[0]] as Factory)([]);;
                    }
                    completeds.push({ From: from, LeftSymbol: symbol, Result: { Remain: input.Copy(), Result: r }, });
                } else {
                    nonTerminateds.push(NonTerminatedParserState.New(from, rule, 0));
                }
            }
        }
        const terminateds: TerminatedParserState<ISyntaxNode>[] = [];
        for (const rule of ExpGrammar.terminated) {
            if (rule[0] === symbol) {
                const p = rule[1];
                terminateds.push(TerminatedParserState.New(InitialStart, rule, p, input.Copy()));
            }
        }

        return [nonTerminateds, terminateds, completeds];
    }

    public async asyncParse(input: AsyncParserInput): Promise<AsyncParserResult<Expression>> {
        throw new Error('Not support');
    }
}