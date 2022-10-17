import { ISyntaxNode } from "../ISyntaxNode";
import { Func } from "./Func";
import { assert } from "console";
import { Identifier } from "./Identifier";
import { Position, Text } from "../IParser";
import { stringify } from "../util";

// property 默认是 private，method 默认是 public，目前更改不了权限
export class Class implements ISyntaxNode {
    private mName: Identifier;
    private mMethods: Funcs;

    public static New(args: (ISyntaxNode | Text)[]) {
        assert(args.length == 5);
        return new Class(args[1] as Identifier, args[3] as Funcs);
    }

    private constructor(name: Identifier, funcs: Funcs) {
        this.mName = name;
        this.mMethods = funcs;
    }

    public toString() {
        return stringify({
            name: this.mName?.toString(), // 为什么有的情况下，这一项不在？是因为 undefined stringify 就直接没了吗？是的
            methods: this.mMethods.toString(),
        });
    }

    public Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }
    
    public get Valid(): boolean {
        throw new Error("Method not implemented.");
    }
}

export class Funcs implements ISyntaxNode {
    private mFunc?: Func;
    private mRemainFuncs?: Funcs;

    public static New(args: (ISyntaxNode | Text)[]): Funcs {
        assert(args.length == 2 || args.length == 0);
        const fs = new Funcs();
        if (args.length == 2) {
            fs.mFunc = args[0] as Func;
            fs.mRemainFuncs = args[1] as Funcs;
        }
        return fs;
    }

    private constructor() {
    }

    public Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }

    public get Valid(): boolean {
        throw new Error("Method not implemented.");
    }

    public toString(): string {
        return stringify({

        });
    }
}

// // 感觉之前想的：做一个将其他 parser 传进来的 parser 挺好的，像这里 block 里可以允许不同的 parser
// // 不过感觉也简化不了太多，下面用 or 来做代码也很少呀
// export const classs = from(makeWordParser('class', Class.New))
//                         .prefixComment('parse class keyword')
//                         .rightWith(whitespace, selectLeft)
//                         .rightWith(identifier, Class.SetName)
//                         .rightWith(optional(whitespace), selectLeft)
//                         .rightWith(leftBrace, selectLeft)
//                         // add whitespace below todo
//                         .rightWith(from(or(func, or(varStmt, whitespace, selectNotNullIn2DifferentType), selectNotNullIn2DifferentType)).zeroOrMore(asArray).raw, Class.SetMembers)
//                         .rightWith(rightBrace, selectLeft)
//                         .prefixComment('parse class')
//                         .raw
//                         ;