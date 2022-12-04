import { makeWordParser, oneOf, lazy, } from "../parser";
import { from, } from "../combinator";
import { IRange, ISyntaxNode } from "../ISyntaxNode";
import { Position } from "../IParser";
import { log } from "../util";

const spaces = [' ', '\t', '\n'];
export class Whitespace implements ISyntaxNode {
    public get Range(): IRange {
        throw new Error("whitespace not implemente range.");
    }

    public Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }

    public get Valid(): boolean {
        throw new Error("Method not implemented.");
    }

    public toString(): string {
        return '#this is whitespace#';
    }
    
    public static New() {
        return new Whitespace();
    }
}
// 这里的解析结果 null，和 selectNotNull 和 selectNotNullIn2DifferentType 一起用时让它们误解了，所以这里还是要有个专门的类型
export const whitespace = from(oneOf(spaces, Whitespace.New)).oneOrMore(Whitespace.New).prefixComment('parse whitespace').raw;