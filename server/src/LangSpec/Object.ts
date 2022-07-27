import { id, or, from, nullize, selectRight, optional, eitherOf, selectLeft, } from "../combinator";
import { Range, Text } from "../IParser";
import { ISyntaxNode } from "../ISyntaxNode";
import { makeWordParser, oneOf, lazy, } from "../parser";
import { asArray, selectNotNullIn2DifferentType, } from "../util";
import { expression, Expression } from "./Expression";
import { Identifier, identifier, } from "./Identifier";
import { string, } from "./String";
import { whitespace } from "./Whitespace";

class KeyValuePair implements ISyntaxNode {
    // 这里面的数据都是可能为空的，这是之后编写 SyntaxNode 的习惯规定
    private mKey: Identifier | null;
    private mValue: Expression | null;

    public static New(key: Identifier, value: Expression) : KeyValuePair {
        return new KeyValuePair(key, value);
    }
    // 然后构造函数可以的话，都是可以不用参数构造的
    public constructor(key: Identifier | null = null, value: Expression | null = null) {
        this.mKey = key;
        this.mValue = value;
    }

    // range 主要是用来分配当前光标所在位置的
    // 这个接口方法的相关事宜还要想清楚，比如子 node 可能是 null
    // 解析的事差不多弄完后再想这个，现在决定还无法窥全貌
    public get Range(): Range | null {
        // if (this.mKey) {
        //     if (this.mValue) {
        //         return Range.Combine(this.mKey.Range, this.mValue.Range);
        //     } else {
        //         return this.mKey.Range;
        //     }
        // } else if (this.mValue) {
        //     return this.mValue.Range;
        // }
        // return null;
        throw new Error("Method not implemented.");
    }
    public set Range(range: Range | null) {
        throw new Error("Method not implemented.");
    }
    public get Valid(): boolean {
        return this.mKey != null || this.mValue != null;
    }

}

const pair = from(or(identifier, string, selectNotNullIn2DifferentType
)).leftWith(optional(whitespace), selectRight)
   .rightWith(from(makeWordParser(':', nullize))
                .leftWith(optional(whitespace), nullize)
                .rightWith(optional(whitespace), nullize).raw, selectLeft)
   .rightWith(expression, (k, v) => (KeyValuePair.New(Identifier.New(k), v)))
   .rightWith(optional(whitespace), selectLeft)
   .rightWith(makeWordParser(',', nullize), selectLeft);

export class Obj implements ISyntaxNode {
    private mPairs: KeyValuePair[] | null;

    public static New(pairs: KeyValuePair[]): Obj {
        return new Obj(pairs);
    }

    public constructor(pairs: KeyValuePair[] | null = null) {
        this.mPairs = pairs;
    }

    get Range(): Range | null {
        throw new Error("Method not implemented.");
    }
    set Range(range: Range | null) {
        throw new Error("Method not implemented.");
    }
    get Valid(): boolean {
        throw new Error("Method not implemented.");
    }
}
/**
 * 强制每个 pair 后面都要打逗号
 */ 
export const object = from(makeWordParser('{', nullize))
                        .rightWith(pair.zeroOrMore(asArray).raw, selectRight)
                        .rightWith(makeWordParser('}', nullize), selectLeft)
                        .transform(Obj.New)
                        .raw;
