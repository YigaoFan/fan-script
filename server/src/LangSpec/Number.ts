import { id, or, from, nullize, selectRight, optional, Option, } from "../combinator";
import { IParser, Text, Position, } from "../IParser";
import { IRange, ISyntaxNode } from "../ISyntaxNode";
import { makeWordParser, oneOf, lazy, } from "../parser";
import { combine, selectNotNull, stringify, } from "../util";

const zero = '0';
const oneToNine = '123456789';
const zeroToNine = zero + oneToNine;

// 负号和正号开头 TODO
const integer = from(optional(or(makeWordParser('+', id), makeWordParser('-', id), selectNotNull)))
                    .rightWith(or(makeWordParser(zero, id), 
                        from(oneOf(oneToNine, id))
                            .rightWith(from(oneOf(zeroToNine, id)).zeroOrMore(combine).raw, combine).raw,
                        selectNotNull), (l, r) => ([l, r] as const)).raw;

const fraction = from(makeWordParser('.', nullize))
                    .rightWith(from(oneOf(zeroToNine, id)).zeroOrMore(combine).raw, 
                               selectRight)
                    .raw;
const exponent = from(oneOf('eE', id))
                    .rightWith(optional(oneOf('+-', id)), selectRight)
                    .rightWith(from(oneOf(zeroToNine, id)).oneOrMore(combine).raw, (l, r) => ([l, r] as const))
                    .raw;

export class Number implements ISyntaxNode {
    private mSign: Option<Text>;
    private mInteger: Text;
    private mFraction: Option<Text>;
    private mExponent: Option<readonly [Option<Text>, Text]>;

    public static New(data: readonly [Option<Text>, Text, Option<Text>, Option<readonly [Option<Text>, Text]>]): Number {
        return new Number(...data);
    }

    public constructor(sign: Option<Text>, integer: Text, fraction: Option<Text>, exponent: Option<readonly [Option<Text>, Text]>) {
        this.mSign = sign;
        this.mInteger = integer;
        this.mFraction = fraction;
        this.mExponent = exponent;
    }

    public get Value(): number {
        let v = 0;
        const intStr = this.mInteger.Value;
        v += parseInt(intStr);
        
        if (this.mFraction.hasValue()) {
            const fracStr = this.mFraction.value.Value;
            const frac = parseInt(fracStr);
            v += (frac / (fracStr.length * 10));
        }
        const InverseIfMinus = (signText: Option<Text>, value: number) => {
            if (signText.hasValue()) {
                if (signText.value.Value == '-') {
                    return -value;
                }
            }
            return value;
        };
        if (this.mExponent.hasValue()) {
            let expStr = this.mExponent.value[1].Value;
            let exp = parseInt(expStr);
            exp = InverseIfMinus(this.mExponent.value[0], exp);
            v *= Math.pow(10, exp);
        }
        v = InverseIfMinus(this.mSign, v);
        return v;
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
const ExpandLeftIntoArray = <T0 extends readonly any[], T1>(l: T0, r: T1) => ([...l, r] as const);
export const number: IParser<Number> = from(integer)
                        .rightWith(optional(fraction), ExpandLeftIntoArray)
                        .rightWith(optional(exponent), ExpandLeftIntoArray)
                        .transform(Number.New)
                        .prefixComment('parse number')
                        .raw;
