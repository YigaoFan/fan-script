import { AsyncParserInput, IInputStream, IParser, ParserInput, ParserResult, Text, AsyncParserResult, debug } from "../IParser";
import { ISyntaxNode } from "../ISyntaxNode";
import { InitialStart as Start, NonTerminatedParserState, ParserWorkState, TerminatedParserState } from "./ParserState";
import { Grammar, Node, } from "./GrammarMap";
import { ChartView } from "./ChartView";
import { log, stringify } from "../util";

export type TerminatedStates = TerminatedParserState<null | ISyntaxNode>[];
type ReduceItem = { From: number, LeftSymbol: string, Result: ParserResult<ISyntaxNode | null> };
/** 这个解析对象只能用一次，因为内部有状态 */
export class ChartParser implements IParser<ISyntaxNode> {
    private mTerminatedStateChart: TerminatedStates;
    private mNonTerminatedStateChart: NonTerminatedParserState[][];
    private mRoot: Node;

    public constructor(root: Node) {
        this.mTerminatedStateChart = [];
        this.mNonTerminatedStateChart = [];
        this.mRoot = root;
    }

    @debug()
    public parse(input: IInputStream): ParserResult<ISyntaxNode> {
        var [nonTers, ters] = ChartParser.ClosureOn(input, this.mRoot, Start);
        this.mNonTerminatedStateChart.push(nonTers);
        this.mTerminatedStateChart = ters;
        // 上面这个 ClosureOn 应该不用
        ChartParser.LoopReduceClosureUtilNoNewAdded(this.mNonTerminatedStateChart,
            this.mTerminatedStateChart, [], input);

        const view = new ChartView(input.Copy());
        view.Snapshot(this.mTerminatedStateChart, this.mNonTerminatedStateChart);
        for (let i = 0; ; i++) {
            // log('iter', i);
            // try {
                const r = this.Iter(input);            
            // } catch (e) {
            //     view.Close();
            //     throw e;
            // }
            // log('iter', i, 'end');
            if (!r) {
                view.Snapshot(this.mTerminatedStateChart, this.mNonTerminatedStateChart);
            }
            // if (i == 12) {
            //     view.Close();
            // }

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
    private Iter(input: ParserInput): boolean {
        const c = input.NextChar;
        if (c.Empty) {// 因为现在的 terminated parser在他最后一个位置就应该成功然后结束，而不是下一个空字符
            return true;
        }
        var shiftCompleteItems: ReduceItem[] = [];
        shiftCompleteItems.push(...this.ShiftOnNonTerminated(c, input.Copy()));
        shiftCompleteItems.push(...this.ShiftOnTerminated());
        // 以这里的思路为主，reduce 那里思路为辅：
        // reduce 给最后一列新增项，closure 除 reduce 后的第一次外，主要关注新增的项有没有增加 expect symbol
        // 所以 expect symbol 要记录下
        // reduce 则还要关注 closure *新增*的项有没有可进一步的
        ChartParser.LoopReduceClosureUtilNoNewAdded(this.mNonTerminatedStateChart,
            this.mTerminatedStateChart, shiftCompleteItems, input);
        return false;
    }

    private static LoopReduceClosureUtilNoNewAdded(nonTerChar: NonTerminatedParserState[][], terChart: TerminatedStates, previousReduceItems: ReduceItem[], input: ParserInput) {
        const len = nonTerChar.length;
        const lastColumn = nonTerChar[len - 1];
        for (let closureRange = lastColumn, reduceItems = previousReduceItems, i = 0; ; i++) {
            const newAddedNonsOfReduce = ChartParser.Reduce(reduceItems, nonTerChar);
            reduceItems.length = 0;
            if (i != 0) {
                closureRange = newAddedNonsOfReduce;
            }
            const [newAddedNonsOfClosure, newAddedTersOfClosure] = ChartParser.Closure([],
                lastColumn, closureRange, terChart, len - 1, input.Copy());
            reduceItems.push(...ChartParser.StatesToReduceItems(newAddedNonsOfClosure));
            reduceItems.push(...ChartParser.StatesToReduceItems(newAddedTersOfClosure));
            // update chart
            for (let i = terChart.length-1; i >= 0; i--) {
                if (terChart[i].State == ParserWorkState.Succeed) {
                    terChart.splice(i, 1);
                }
            }
            // log('reduce items len', reduceItems.length);
            // log('reduce items', reduceItems);
            if (reduceItems.length == 0) {
                // log('reduce items empty');
                break;
            }
        }
    }

    private static StatesToReduceItems(states: { get State(): ParserWorkState; get From(): number; get LeftSymbol(): string; get Result(): ParserResult<ISyntaxNode | null>; toString(): string; }[]): ReduceItem[] {
        const reduceItems: ReduceItem[] = [];
        for (const s of states) {
            // log('StatesToReduceItems check', s.toString(), s.State);
            if (s.State == ParserWorkState.Succeed) {
                reduceItems.push({ From: s.From, LeftSymbol: s.LeftSymbol, Result: s.Result, });
            }
        }
        return reduceItems;
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

    private static Reduce(reduceItems: ReduceItem[], nonTerminatedStateChart: NonTerminatedParserState[][]) {
        if (reduceItems.length == 0) {
            // log('reduce nothing');
            return [];
        }
        const chart = nonTerminatedStateChart;
        // log('char len', chart.length);
        const newReduceItems: ReduceItem[] = [];
        const newAddedItems: NonTerminatedParserState[] = [];
        for (const item of reduceItems) {
            // log('move', item);
            // log('search move items in', chart[item.From].map(x => x.toString()));
            const toMoveStates = chart[item.From].filter(x => x.Rule[1][x.NowPoint] === item.LeftSymbol).map(x => x.Copy());
            // log('found to move items', toMoveStates.map(x => x.toString()));
            const moveResults = toMoveStates.map(x => x.MoveANonTerminated(item.LeftSymbol, item.Result));
            const insertPos = chart.length - 1;
            for (const s of toMoveStates) {
                if (!chart[insertPos].some(x => s.EqualTo(x))) {
                    newAddedItems.push(s);
                    chart[insertPos].push(s);
                }
            }
    
            toMoveStates
                .filter((_, i) => moveResults[i] === ParserWorkState.Succeed)
                .forEach(x => newReduceItems.push({ From: x.From, LeftSymbol: x.Rule[0], Result: x.Result, }));
        }
        // log('new reduce items', newReduceItems);

        // log('reduce to new', newAddedItems.map(x => x.toString()), 'due to', reduceItems.map(x => ({ From: x.From, LeftSymbol: x.LeftSymbol, })));
        const remainNewAddedItems = ChartParser.Reduce(newReduceItems, chart);
        newAddedItems.push(...remainNewAddedItems);
        return newAddedItems;
    }
    
    private static Closure(searchedSymbols: string[], totalNonTers: NonTerminatedParserState[], closureRange: NonTerminatedParserState[], terminateds: TerminatedStates, from: number, input: ParserInput): [NonTerminatedParserState[], TerminatedStates,]  {
        if (closureRange.length == 0) {
            // log('closure nothing');
            return [[], []];
        }
        var newSyms = ChartParser.GetExpectSymbols(closureRange);
        // log('symbols', newSyms);
        newSyms = ChartParser.Diff(newSyms, searchedSymbols);
        // log('closure with symbols', stringify(newSyms));
        const newNons: NonTerminatedParserState[] = [];
        const newTers: TerminatedStates = [];
        for (const s of newSyms) {
            const [nonTers, ters] = ChartParser.ClosureOn(input, s, from);
            for (const x of nonTers) {
                if (!totalNonTers.some(y => x.EqualTo(y))) {
                    totalNonTers.push(x);
                    newNons.push(x);
                }
            }
            for (const x of ters) {
                // 思考下这里这样去掉限制会不会引发问题
                if (!terminateds.some(y => x.EqualTo(y))) {
                    terminateds.push(x);
                    newTers.push(x);
                }
            }
        }
        searchedSymbols.push(...newSyms);
        const [remainNonTers, remainTers] = ChartParser.Closure(searchedSymbols, totalNonTers, newNons, terminateds, from, input);
        newNons.push(...remainNonTers);
        newTers.push(...remainTers);
        // log('closure rules', newNons.map(x => x.toString()), newTers.map(x => x.toString()), 'using symbols', searchedSymbols);
        return [newNons, newTers,];
    }

    private static ClosureOn(input: ParserInput, symbol: string, from: number): [NonTerminatedParserState[], TerminatedStates,] {
        const nonTerminateds: NonTerminatedParserState[] = [];
        for (const rule of Grammar.nonTerminated) {
            if (rule[0] === symbol) {
                const s = NonTerminatedParserState.New(from, rule, input.Copy());
                nonTerminateds.push(s);
            }
        }
        const terminateds: TerminatedStates = [];
        for (const rule of Grammar.terminated) {
            if (rule[0] === symbol) {
                const p = rule[1];
                const s = TerminatedParserState.New(from, rule, p, input.Copy());
                terminateds.push(s);
            }
        }

        return [nonTerminateds, terminateds];
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

    private static GetExpectSymbols(column: NonTerminatedParserState[]): string[] {
        var expectSymbols = column
            .filter(x => x.NowPoint < x.Rule[1].length && !NonTerminatedParserState.IsChar(x.Rule[1][x.NowPoint]))
            .map(x => x.Rule[1][x.NowPoint]);
        expectSymbols = [...new Set(expectSymbols)];// remove duplicates
        return expectSymbols;
    }
}