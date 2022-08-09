import { Position } from "./IParser";

export interface ISyntaxNode {
    Contains(p: Position): boolean;
    get Valid(): boolean;
    // use reflect to do this TODO 成员变量里有 ISyntaxNode 也有数组
    toString(): string;
}

export interface ICompoundSyntaxNode extends ISyntaxNode {
    // extend range internal
    AddSub(node: ISyntaxNode): void;
}