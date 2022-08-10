import { IParser, Position, } from "../IParser";
import { consExp, ExpKind, Expression, } from "./Expression";
import { ISyntaxNode } from "../ISyntaxNode";
import { from, nullize, optional, selectLeft, selectRight } from "../combinator";
import { lazy, makeWordParser } from "../parser";
import { whitespace, } from "./Whitespace";
import { asArray, stringify } from "../util";
import { Func } from "./Func";

export class Array implements ISyntaxNode {
    private mExps?: Expression[];

    public static New(): Array {
        return new Array();
    }
    public static SetItems(array: Array, expressions: Expression[]) {
        array.mExps = expressions;
        return array;
    }

    public constructor() {
    }
    Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }
    get Valid(): boolean {
        throw new Error("Method not implemented.");
    }

    public toString(): string {
        return stringify({
            exps: this.mExps?.toString(),
        });
    }
}

const consItem = (func: IParser<Func>) => (from(lazy(consExp.bind(null, func, ExpKind.All))) // 这里讲道理要把这个 lazy 的 consExp 参数化
                                            .leftWith(optional(whitespace), selectRight)
                                            .rightWith(optional(whitespace), selectLeft)
                                            .rightWith(makeWordParser(',', nullize), selectLeft));

export const consArray = (func: IParser<Func>): IParser<Array> =>  {
    return from(makeWordParser('[', Array.New))
                .rightWith(consItem(func).zeroOrMore(asArray).raw, Array.SetItems)
                .rightWith(makeWordParser(']', nullize), selectLeft)
                .prefixComment('parse array')
                .raw;
};