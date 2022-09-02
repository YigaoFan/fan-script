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
        var reduceItems: ReduceItem[] = [];
        reduceItems.push(...this.ShiftOnNonTerminated(c, input.Copy()));
        reduceItems.push(...this.ShiftOnTerminated());
        
        // 以这里的思路为主，reduce 那里思路为辅：
        // reduce 给最后一列新增项，closure 除 reduce 后的第一次外，主要关注新增的项有没有增加 expect symbol
        // 所以 expect symbol 要记录下
        // reduce 则还要关注 closure *新增*的项有没有可进一步的
        {
            const newAddedItems = ChartParser.Reduce(reduceItems, this.mNonTerminatedStateChart);

            const len = this.mNonTerminatedStateChart.length;
            const lastColumn = this.mNonTerminatedStateChart[len - 1];
            reduceItems = ChartParser.Closure([], lastColumn, lastColumn, this.mTerminatedStateChart, len - 1, input.Copy());
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
        const chart = nonTerminatedStateChart;
        // log('char len', chart.length);
        const newReduceItems: ReduceItem[] = [];
        const newAddedItems: NonTerminatedParserState[] = [];
        for (const item of reduceItems) {
            const toMoveStates = chart[item.From].filter(x => x.Rule[1][x.NowPoint] === item.LeftSymbol).map(x => x.Copy());
            const moveResults = toMoveStates.map(x => x.MoveANonTerminated(item.LeftSymbol, item.Result));
            const insertPos = chart.length - 1;
            // 这里添加的时候也要去重吗 TODO
            chart[insertPos].push(...toMoveStates);
            newAddedItems.push(...toMoveStates);
    
            toMoveStates
                .filter((_, i) => moveResults[i] === ParserWorkState.Succeed)
                .forEach(x => newReduceItems.push({ From: x.From, LeftSymbol: x.Rule[0], Result: x.Result, }));
        }
        ChartParser.Reduce(newReduceItems, chart);
        return newAddedItems;
    }
    
    private static Closure(searchedSymbols: string[], totalNonTers: NonTerminatedParserState[], lastNewAddNonTers: NonTerminatedParserState[], terminateds: TerminatedStates, from: number, input: ParserInput): [NonTerminatedParserState[], TerminatedStates,]  {
        if (lastNewAddNonTers.length == 0) {
            return [[], []];
        }
        var newSyms = ChartParser.GetExpectSymbols(lastNewAddNonTers);
        newSyms = ChartParser.Diff(newSyms, searchedSymbols);
        const newNons: NonTerminatedParserState[] = [];
        const newTers: TerminatedStates = [];
        for (const s of newSyms) {
            var [nonTers, ters] = ChartParser.ClosureOn(input, s, from);
            nonTers = nonTers.filter(x => !totalNonTers.some(y => x.EqualTo(y)));
            nonTers.forEach(x => totalNonTers.push(x));
            newNons.push(...nonTers);
            ters = ters.filter(x => !terminateds.some(y => x.EqualTo(y)));
            ters.forEach(x => terminateds.push(x));
            newTers.push(...ters);
        }

        completeds.push(...ChartParser.Closure([...searchedSymbols, ...newSyms], totalNonTers, newNons, terminateds, from, input));
        return completeds;
    }

    private static ClosureOn(input: ParserInput, symbol: string, from: number): [NonTerminatedParserState[], TerminatedStates,] {
        const nonTerminateds: NonTerminatedParserState[] = [];
        const completeds: ReduceItem[] = [];
        for (const rule of ExpGrammar.nonTerminated) {
            if (rule[0] === symbol) {
                const s = NonTerminatedParserState.New(from, rule, input.Copy());
                nonTerminateds.push(s);
                // if (s.State == ParserWorkState.Succeed) {
                //     completeds.push({ From: from, LeftSymbol: symbol, Result: s.Result, });
                // }
            }
        }
        const terminateds: TerminatedStates = [];
        for (const rule of ExpGrammar.terminated) {
            if (rule[0] === symbol) {
                const p = rule[1];
                const s = TerminatedParserState.New(from, rule, p, input.Copy());
                // if (s.State == ParserWorkState.Succeed) {
                //     completeds.push({ From: from, LeftSymbol: symbol, Result: s.Result, });
                // } else {
                    terminateds.push(s);
                // }
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

    private static AddIfNotExist<T extends IEqual>(ts: T[], newItem: T) {
        for (const i of ts) {
            if (i.EqualTo(newItem)) {
                return;
            }
        }
        ts.push(newItem);
    }
    
    public async asyncParse(input: AsyncParserInput): Promise<AsyncParserResult<Expression>> {
        throw new Error('Not support');
    }
}