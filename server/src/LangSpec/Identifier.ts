import { oneOf, } from "../parser";
import { from, id, } from "../combinator";
import { IParser, Text, Position, } from "../IParser";
import { IRange, ISyntaxNode } from "../ISyntaxNode";
import { combine, stringify, } from "../util";

const capAlphabets = Array.from(Array(26)).map((_, i) => i + 65).map(x => String.fromCharCode(x));
const alphabets = Array.from(Array(26)).map((_, i) => i + 65 + 32).map(x => String.fromCharCode(x));
const nums = Array.from(Array(10)).map((_, i) => i.toString());
const possibleFirstChars = alphabets.concat(capAlphabets).concat(['_']);
const possibleLaterChars = possibleFirstChars.concat(nums);

export class Identifier implements ISyntaxNode {
    private mText: Text;
    public static New(text: Text): Identifier {
        return new Identifier(text);
    }
    
    public constructor(text: Text) {
        this.mText = text;
    }

    public get Range(): IRange {
        return this.mText.Range;
    }

    public get Text(): string {
        return this.mText.toString();
    }

    public toString(): string {
        return stringify({
            text: this.mText.toString(), 
        });
    }

    public Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }
    
    public get Valid(): boolean {
        throw new Error("Method not implemented.");
    }
}

export const identifier: IParser<Identifier> = from(oneOf(possibleFirstChars, id))
                    .rightWith(from(oneOf(possibleLaterChars, id))
                                .zeroOrMore(combine).raw, combine)
                    .transform(Identifier.New)
                    .prefixComment('parse identifier')
                    .raw;

