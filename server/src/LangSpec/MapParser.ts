import { IInputStream, IParser, ParserInput, ParserResult } from "../IParser";
import { ISyntaxNode } from "../ISyntaxNode";
import { Expression } from "./Expression";

// TODO add space
const grammarMap: (readonly [string, string[]])[] = [
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
    ['pairs', [ 'pair', ',', 'pairs']],
    ['pair', ['key', ':', 'value']],
    ['key', ['string']],
    ['key', ['id']],
    ['value', ['exp']],

    ['array', ['[', 'items', ']']],
    ['items', []],
    ['items', [ 'item', ',', 'items']],
    ['item', ['exp']],

    // func要用这种方法定义吗，还是保持原来的
    // 感觉可以调用原来的，要有个注册机制，只要把 func 的 parser 注册为原来的就行
];

class ParserState {
    public From: number;
    public Rule: readonly [string, string[]];
    /** now on @property Rule[NowPoint] left */
    public NowPoint: number;

    public static New(from: number, rule: readonly [string, string[]], nowPoint: number) {
        return new ParserState(from, rule, nowPoint);
    }

    private constructor(from: number, rule: readonly [string, string[]], nowPoint: number) {
        this.From = from;
        this.Rule = rule;
        this.NowPoint = nowPoint;
    }    
}

class ExpressionChartParser implements IParser<Expression> {
    private mStateChart: ParserState[][];
    private mEndChar: string;

    public constructor(endChar: string) {
        this.mEndChar = endChar;
        this.mStateChart = [];
    }
    // setup related parsers

    // 要保存一些协程，因为有些函数可能解析到一半停下来，比如解析 id
    // 那 stream.NextChar 就要加 async
    public parse(input: ParserInput): ParserResult<Expression> {
        const onZero: ParserState[] = [];
        for (const i of grammarMap) {
            onZero.push(ParserState.New(0, i, 0));
        }
        this.mStateChart.push(onZero);

        for (;;) {
            const r = this.iter(input);
            if (r) {
                break;
            }
        }
        return null;
    }

    /**
     * @returns end or not
     */
    public iter(input: ParserInput): boolean {
        const c = input.NextChar;
        if (c.Value === this.mEndChar) {
            return true;
        }
        // closure
        // shift
        // reduction
        return false;
    }
}