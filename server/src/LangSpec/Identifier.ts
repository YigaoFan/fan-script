import { makeWordParser, oneOf, lazy, } from "../parser";
import {
    from,
    optional,
    id,
    nullize,
    selectLeft,
    selectRight,
    or,
} from "../combinator";
import { IParser, Text, Position, } from "../IParser";
import { ISyntaxNode } from "../ISyntaxNode";
import { combine, stringify, } from "../util";

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
    private mText?: Text;
    public static New(text: Text): Identifier {
        return new Identifier(text);
    }
    
    public constructor(text: Text) {
        this.mText = text;
    }

    public toString(): string {
        return stringify({
            text: this.mText?.toString(), 
        });
    }

    // For test, may delete future
    public get Value(): string {
        if (this.mText) {
            return this.mText.toString();
        }
        throw new Error('text not exist in Identifier');
    }

    Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }
    get Valid(): boolean {
        throw new Error("Method not implemented.");
    }
}

export const identifier: IParser<Identifier> = from(oneOf(possibleFirstChars, id))
                    .rightWith(from(oneOf(possibleLaterChars, id))
                                .zeroOrMore(combine).raw, combine)
                    .transform(Identifier.New)
                    .prefixComment('parse identifier')
                    .raw;

