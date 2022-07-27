import { makeWordParser, oneOf, lazy, } from "../parser";
import {
    from,
    optional,
    appendString,
    withHandleNull,
    id,
    nullize,
    selectLeft,
    selectNonblank,
    selectRight,
    or,
} from "../combinator";
import { IParser, Range, Text } from "../IParser";
import { ISyntaxNode } from "../ISyntaxNode";
import { combine, } from "../util";

// TODO 把下面这个函数整理到 util 里去
// export const combine2String = (s1: string, s2: string): string => {
//     return s1 + s2;
// };
const capAlphabets = Array.from(Array(26)).map((_, i) => i + 65).map(x => String.fromCharCode(x));
const alphabets = Array.from(Array(26)).map((_, i) => i + 65 + 32).map(x => String.fromCharCode(x));
const nums = Array.from(Array(10)).map((_, i) => i.toString());
const possibleFirstChars = alphabets.concat(capAlphabets).concat(['_']);
const possibleLaterChars = possibleFirstChars.concat(nums);

export class Identifier implements ISyntaxNode {
    public static New(value: Text): Identifier {
        throw new Error("Method not implemented.");
    }
    get Range(): Range | null {
        throw new Error("Method not implemented.");
    }
    set Range(range: Range | null) {
        throw new Error("Method not implemented.");
    }
    get Valid(): boolean {
        throw new Error("Method not implemented.");
    }
}

export const identifier: IParser<Identifier> = from(oneOf(possibleFirstChars, id))
                    .rightWith(from(oneOf(possibleLaterChars, id))
                                .oneOrMore(combine).raw, combine)
                    .transform(Identifier.New)
                    // .oneOrMore(combine)
                    .raw;

