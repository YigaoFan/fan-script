import { IParser } from "../IParser";
import { Expression, expression, } from "./Expression";
import { ISyntaxNode } from "../ISyntaxNode";
import { from, nullize, optional, selectLeft, selectRight } from "../combinator";
import { makeWordParser } from "../parser";
import { whitespace, } from "./Whitespace";
import { asArray } from "../util";

export class Array implements ISyntaxNode {
    private mExps: Expression[];

    public static New(exps: Expression[]): Array {
        return new Array(exps);
    }
    public constructor(exps: Expression[]) {
        this.mExps = exps;
    }
}

const item = from(expression)
        .leftWith(optional(whitespace), selectRight)
        .rightWith(optional(whitespace), selectLeft)
        .rightWith(makeWordParser(',', nullize), selectLeft);

// refactor with constrcut node firstly TODO
export const array: IParser<Array> = from(makeWordParser('[', nullize))
                                        .rightWith(item.zeroOrMore(asArray).raw, selectRight)
                                        .rightWith(makeWordParser(']', nullize), selectLeft)
                                        .transform(Array.New)
                                        .raw;