import { Position } from "./IParser";

export interface IRange { Left: Position, Right: Position, /*Contains: (pos: Position) => boolean;*/ }
export interface ISyntaxNode {
    get Range(): IRange;
    Contains(p: Position): boolean;
    get Valid(): boolean;
    toString(): string;
}