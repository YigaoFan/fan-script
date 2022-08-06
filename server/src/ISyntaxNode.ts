import { Position } from "./IParser";

export interface ISyntaxNode {
    Contains(p: Position): boolean;
    get Valid(): boolean;
}

export interface ICompoundSyntaxNode extends ISyntaxNode {
    // extend range internal
    AddSub(node: ISyntaxNode): void;
}