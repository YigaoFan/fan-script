interface IGrammarNode {

}

// func, if, for, class
export class KeywordNode implements IGrammarNode {
    private mName: string;

    public static New(name: string): KeywordNode {
        return new KeywordNode(name);
    }

    public constructor(name: string) {
        this.mName = name;
    }
    public get Name(): string {
        return this.mName;
    }

}

export class OperatorNode implements IGrammarNode {

}

export class IdentifierNode implements IGrammarNode {

}

export class FunctionNode implements IGrammarNode {
    public static New(): FunctionNode {
        return new FunctionNode();
    }
}

// 要不要抽象出类似 IControlFlowNode 的概念，让下面两个继承

export class IfStmtNode implements IGrammarNode {

}

export class ForStmtNode implements IGrammarNode {

}

export class ClassDefNode implements IGrammarNode {

}

export class BlankNode implements IGrammarNode {
    public static New(name: string): BlankNode {
        return new BlankNode();
    }

    public static Combine(blank1: BlankNode, blank2: BlankNode): BlankNode {
        return blank1; // TODO do some process
    }
}