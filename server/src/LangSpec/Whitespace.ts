import { makeWordParser, oneOf, lazy, } from "../parser";
import { from, nullize, } from "../combinator";

const spaces = [' ', '\t', '\n'];

export const whitespace = from(oneOf(spaces, nullize)).oneOrMore(nullize).raw;