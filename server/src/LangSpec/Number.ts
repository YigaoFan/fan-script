import { id, or, from, nullize, selectRight, optional, Option, } from "../combinator";
import { IParser, Text, Position, } from "../IParser";
import { IRange, ISyntaxNode } from "../ISyntaxNode";
import { makeWordParser, oneOf, lazy, } from "../parser";
import { combine, selectNotNull, stringify, } from "../util";

const zero = '0';
const oneToNine = '123456789';
const zeroToNine = zero + oneToNine;

const integer = or(
                makeWordParser(zero, id), 
                from(oneOf(oneToNine, id))
                    .rightWith(
                        from(oneOf(zeroToNine, id)).zeroOrMore(combine).raw, combine).raw,
                selectNotNull);

const fraction = from(makeWordParser('.', nullize))
                    .rightWith(from(oneOf(zeroToNine, id)).zeroOrMore(combine).raw, 
                               selectRight)
                    .raw;
const exponent = from(oneOf('eE', id))
                    .rightWith(optional(oneOf('+-', id)), selectRight)
                    .rightWith(from(oneOf(zeroToNine, id)).oneOrMore(combine).raw, (l, r) => ([l, r] as const))
                    .raw;

export class Number implements ISyntaxNode {
    private mInteger: Text;
    private mFraction: Option<Text>;
    private mExponent: Option<readonly [Option<Text>, Text]>;

    public static New(data: readonly [Text, Option<Text>, Option<readonly [Option<Text>, Text]>]): Number {
        return new Number(...data);
    }

    public constructor(integer: Text, fraction: Option<Text>, exponent: Option<readonly [Option<Text>, Text]>) {
        this.mInteger = integer;
        this.mFraction = fraction;
        this.mExponent = exponent;
    }

    public get Range(): IRange {
        const l = this.mInteger.Range.Left;
        let r: Position;
        if (this.mExponent.hasValue()) {
            r = this.mExponent.value[1].Range.Right;
        } else if (this.mFraction.hasValue()) {
            r = this.mFraction.value.Range.Right;
        } else {
            r = this.mInteger.Range.Right;
        }
        return { Left: l , Right: r, };
    }

    public toString(): string {
        return stringify({
            integer: this.mInteger.toString(),
            fraction: this.mFraction.toString(),
            exponent: this.mExponent.toString(),
        });
    }

    public Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }

    public get Valid(): boolean {
        throw new Error("Method not implemented.");
    }
}

export const number: IParser<Number> = from(integer)
                        .rightWith(optional(fraction), (l, r) => ([l, r] as const))
                        .rightWith(optional(exponent), (l, r) => ([...l, r] as const))
                        .transform(Number.New)
                        .prefixComment('parse number')
                        .raw;
