import { assert } from "console";
import { Position, Text } from "../IParser";
import { ISyntaxNode } from "../ISyntaxNode";
import { stringify } from "../util";
import { Class } from "./Class";

export class Document implements ISyntaxNode {
    private mCls: Class;

    public static New(args: (ISyntaxNode | Text)[]) {
        assert(args.length == 1);
        return new Document(args[0] as Class);
    }

    private constructor(cls: Class) {
        this.mCls = cls;
    }

    public toString() {
        return stringify({
        });
    }

    public Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }

    public get Valid(): boolean {
        throw new Error("Method not implemented.");
    }
}