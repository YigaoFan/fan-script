import { IParser, Position, } from "../IParser";
import { Expression, expression, } from "./Expression";
import { ISyntaxNode } from "../ISyntaxNode";
import { from, nullize, optional, selectLeft, selectRight } from "../combinator";
import { makeWordParser } from "../parser";
import { whitespace, } from "./Whitespace";
import { asArray, stringify } from "../util";

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

const item = from(expression)
        .leftWith(optional(whitespace), selectRight)
        .rightWith(optional(whitespace), selectLeft)
        .rightWith(makeWordParser(',', nullize), selectLeft);

export const array: IParser<Array> = from(makeWordParser('[', Array.New))
                                        .rightWith(item.zeroOrMore(asArray).raw, Array.SetItems)
                                        .rightWith(makeWordParser(']', nullize), selectLeft)
                                        .prefixComment('parse array')
                                        .raw;