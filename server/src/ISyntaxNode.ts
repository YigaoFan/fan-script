import { Range, } from './IParser';

export interface ISyntaxNode {
    get Range(): Range | null;
    set Range(range: Range | null);
    get Valid(): boolean;
}

export interface ICompoundSyntaxNode extends ISyntaxNode {
    // extend range internal
    AddSub(node: ISyntaxNode): void;
}

// 下面这些 class 可能没有必要
// func, if, for, class
// export class KeywordNode implements ISyntaxNode {
//     private mName: string;
//     private mRange: Range;

//     public static New(name: string): KeywordNode {
//         return new KeywordNode(name);
//     }

//     public constructor(name: string) {
//         this.mName = name;
//     }
//     public get Name(): string {
//         return this.mName;
//     }

// }

// export class OperatorNode implements ISyntaxNode {

// }

// export class IdentifierNode implements ISyntaxNode {

// }

// export class FunctionNode implements ISyntaxNode {
//     public static New(): FunctionNode {
//         return new FunctionNode();
//     }
// }

// // 要不要抽象出类似 IControlFlowNode 的概念，让下面两个继承

// export class IfStmtNode implements ISyntaxNode {

// }

// export class ForStmtNode implements ISyntaxNode {

// }

// export class ClassDefNode implements ISyntaxNode {

// }

// export class BlankNode implements ISyntaxNode {
//     public static New(name: string): BlankNode {
//         return new BlankNode();
//     }

//     public static Combine(blank1: BlankNode, blank2: BlankNode): BlankNode {
//         return blank1; // TODO do some process
//     }
// }