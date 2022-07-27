//想一个机制，让 stmt 可以向上调用别的 stmt，也就是无限嵌套
//想想还是拉出来单独写，因为涉及到一些新的节点类，不宜还放在一块写

import { ISyntaxNode } from "../ISyntaxNode";

class StatementManager {
    public get Statments() : IStatement[] {
    }
    
}

export interface IStatement extends ISyntaxNode {
}

export class Statement implements ISyntaxNode {

}