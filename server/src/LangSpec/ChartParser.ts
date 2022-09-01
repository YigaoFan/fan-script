import { AsyncParserInput, IAsyncInputStream, IInputStream, IParser, ParserInput, ParserResult, Text, AsyncParserResult, debug } from "../IParser";
import { ISyntaxNode } from "../ISyntaxNode";
import { Expression } from "./Expression";
import { log } from "console";
import { InitialStart as Start, NonTerminatedParserState, ParserWorkState, TerminatedParserState } from "./ParserState";
import { ExpGrammar, Factory, FactoryWithTypeInfo, Node, NodeFactory } from "./GrammarMap";
import { ChartView } from "./ChartView";

interface IEqual {
    EqualTo(that: this): boolean;
}

export type TerminatedStates = TerminatedParserState<null | ISyntaxNode>[];
type ReduceItem = { From: number, LeftSymbol: string, Result: ParserResult<ISyntaxNode | null> };
/** 这个解析对象只能用一次，因为内部有状态 */
export class ChartParser implements IParser<Expression> {
    private mTerminatedStateChart: TerminatedStates;
    private mNonTerminatedStateChart: NonTerminatedParserState[][];
    private mRoot: Node;

    public constructor(root: Node, endChar: string) {
        this.mTerminatedStateChart = [];
        this.mNonTerminatedStateChart = [];
        this.mRoot = root;
    }

    @debug()
    public parse(input: IInputStream): ParserResult<Expression> {
        var [thisNonTers, thisTers, thisComs] = ChartParser.ClosureOn(input, this.mRoot, Start);
        this.mNonTerminatedStateChart.push(thisNonTers);
        this.mTerminatedStateChart = thisTers;

        const len = this.mNonTerminatedStateChart.length;
        const lastColumn = this.mNonTerminatedStateChart[len - 1];
        const coms = ChartParser.Closure([], lastColumn, lastColumn , this.mTerminatedStateChart, len - 1, input.Copy());
        ChartParser.Reduce(thisComs.concat(coms), this.mNonTerminatedStateChart);

        const view = new ChartView(input.Copy());
        view.Snapshot(this.mTerminatedStateChart, this.mNonTerminatedStateChart);
        for (let i = 0; ; i++) {
            log('iter', i);
            const r = this.iter(input);            
            log('iter', i, 'end');
            view.Snapshot(this.mTerminatedStateChart, this.mNonTerminatedStateChart);

            if (r) {
                view.Close();
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
        if (c.Empty) {// 因为现在的 terminated parser在他最后一个位置就应该成功然后结束，而不是下一个空字符
            return true;
        }
        const completedItems: ReduceItem[] = [];
        completedItems.push(...this.ShiftOnNonTerminated(c, input.Copy()));
        completedItems.push(...this.ShiftOnTerminated());
        const len = this.mNonTerminatedStateChart.length;
        const lastColumn = this.mNonTerminatedStateChart[len - 1];
        // const coms = ExpressionChartParser.Closure([], lastColumn, lastColumn, this.mTerminatedStateChart, len - 1, input.Copy());
        // completedItems.push(...coms);
        // 这里 coms 有用吗？

        // reduce 和 closure 的顺序先后顺序该是什么样？TODO
        ChartParser.Reduce(completedItems, this.mNonTerminatedStateChart);
        const newComs = ChartParser.Closure([], lastColumn, lastColumn, this.mTerminatedStateChart, len - 1, input.Copy());
        ChartParser.Reduce(newComs, this.mNonTerminatedStateChart);
        
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
        // for (let i = shiftResults.length - 1; i >= 0; i--) {
        //     const r = shiftResults[i];
        //     if (r !== ParserWorkState.Fail) {
        //         // len here is old len, because do a push operation above.
        //         this.mNonTerminatedStateChart[len - 1].splice(i, 1);
        //     }
        // }
        return completedItems;
    }

    private ShiftOnTerminated(): ReduceItem[] {
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
        // log('char len', chart.length);
        for (const item of items) {
            const toMoveStates = chart[item.From].filter(x => x.Rule[1][x.NowPoint] === item.LeftSymbol).map(x => x.Copy());
            const moveResults = toMoveStates.map(x => x.MoveANonTerminated(item.LeftSymbol, item.Result));
            const insertPos = chart.length - 1;
            chart[insertPos].push(...toMoveStates);
    
            const newItems = toMoveStates
                .filter((_, i) => moveResults[i] === ParserWorkState.Succeed)
                .map(x => ({ From: x.From, LeftSymbol: x.Rule[0], Result: x.Result }));
            // log('char len before deep in', chart.length);
            ChartParser.Reduce(newItems, chart);
        }
    }
    
    private static Closure(searchedSymbols: string[], totalNonTers: NonTerminatedParserState[], lastNewAddNonTers: NonTerminatedParserState[], terminateds: TerminatedStates, from: number, input: ParserInput): ReduceItem[] {
        const completeds: ReduceItem[] = [];
        if (lastNewAddNonTers.length == 0) {
            return completeds;
        }
        var newSyms = ChartParser.getExpectSymbols(lastNewAddNonTers);
        newSyms = ChartParser.Diff(newSyms, searchedSymbols);
        const newNons: NonTerminatedParserState [] = [];
        for (const s of newSyms) {
            var [thisNonTers, thisTers, thisComs] = ChartParser.ClosureOn(input, s, from);
            completeds.push(...thisComs);
            thisNonTers = thisNonTers.filter(x => !totalNonTers.some(y => x.EqualTo(y)));
            thisNonTers.forEach(x => totalNonTers.push(x));
            newNons.push(...thisNonTers);
            thisTers.forEach(x => ChartParser.AddIfNotExist(terminateds, x));
        }

        completeds.push(...ChartParser.Closure([...searchedSymbols, ...newSyms], totalNonTers, newNons, terminateds, from, input));
        return completeds;
    }

    private static Diff(from: string[], to: string[]) {
        const diff: string[] = [];
        for (const i of from) {
            if (!to.includes(i)) {
                diff.push(i);
            }
        }
        return diff;
    }
    private static getExpectSymbols(column: NonTerminatedParserState[]) {
        var expectSymbols = column
            .filter(x => x.NowPoint < x.Rule[1].length && !NonTerminatedParserState.IsChar(x.Rule[1][x.NowPoint]))
            .map(x => x.Rule[1][x.NowPoint]);
        expectSymbols = [...new Set(expectSymbols)];// remove duplicates
        return expectSymbols;
    }

    private static AddIfNotExist<T extends IEqual>(ts: T[], newItem: T) {
        for (const i of ts) {
            if (i.EqualTo(newItem)) {
                return;
            }
        }
        ts.push(newItem);
    }

    private static ClosureOn(input: ParserInput, symbol: string, from: number): readonly [NonTerminatedParserState[], TerminatedStates, ReduceItem[]] {
        const nonTerminateds: NonTerminatedParserState[] = [];
        const completeds: ReduceItem[] = [];
        for (const rule of ExpGrammar.nonTerminated) {
            if (rule[0] === symbol) {
                nonTerminateds.push(NonTerminatedParserState.New(from, rule, input.Copy()));
                if (rule[1].length == 0) {
                    if (rule[2]) {
                        var n = (NodeFactory[rule[0]] as FactoryWithTypeInfo)(rule[2], []);
                    } else {
                        var n = (NodeFactory[rule[0]] as Factory)([]);;
                    }
                    completeds.push({ From: from, LeftSymbol: symbol, Result: { Remain: input.Copy(), Result: n }, });
                }
            }
        }
        const terminateds: TerminatedStates = [];
        for (const rule of ExpGrammar.terminated) {
            if (rule[0] === symbol) {
                const p = rule[1];
                const t = TerminatedParserState.New(from, rule, p, input.Copy());
                if (t.State == ParserWorkState.Succeed) {
                    completeds.push( { From: from, LeftSymbol: symbol, Result: t.Result });
                } else {
                    terminateds.push(t);
                }
            }
        }

        return [nonTerminateds, terminateds, completeds];
    }

    public async asyncParse(input: AsyncParserInput): Promise<AsyncParserResult<Expression>> {
        throw new Error('Not support');
    }
}