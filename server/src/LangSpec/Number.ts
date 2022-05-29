import { id, or, from, nullize, selectRight, optional, } from "../combinator";
import { makeWordParser, oneOf, lazy, } from "../parser";
import { combine, combine2String } from "./Identifier";

const zero = '0';
const oneToNine = '123456789';
const zeroToNine = zero + oneToNine;

const selectNotNull = <T1, T2>(t1: T1 | null, t2: T2 | null): T1 | T2 => {
    if (t1) {
        return t1;
    } else if (t2) {
        return t2;
    } else {
        throw new Error('both of t1 and t2 are null');
    }
};
const integer = or(
                makeWordParser(zero, id), 
                from(oneOf(oneToNine, id))
                    .rightWith(
                        from(oneOf(zeroToNine, id)).zeroOrMore(combine).raw, combine2String).raw,
                selectNotNull);

const fraction = from(makeWordParser('.', nullize))
                    .rightWith(from(oneOf(zeroToNine, id)).zeroOrMore(combine).raw, 
                               selectRight)
                    .raw;
const exponent = from(oneOf('eE', id))
                    .rightWith(optional(oneOf('+-', id)), selectRight)
                    .rightWith(from(oneOf(zeroToNine, id)).oneOrMore(combine).raw, (l, r) => { // TODO move this function to a separte place
                        if (l.hasValue()) {
                            return [l.value, r];
                        }
                        return [r];
                    })
                    .raw;

export const number = from(integer)
                        .rightWith(optional(fraction), (l, r) => { return null; }) // TODO set combine result
                        .rightWith(optional(exponent), (l, r) => { return null; }) // TODO set combine result
                        .raw;