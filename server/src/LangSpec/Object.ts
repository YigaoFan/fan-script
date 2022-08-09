import { id, or, from, nullize, selectRight, optional, eitherOf, selectLeft, } from "../combinator";
import { Position, Text, } from "../IParser";
import { ISyntaxNode } from "../ISyntaxNode";
import { makeWordParser, oneOf, lazy, } from "../parser";
import { asArray, selectNotNullIn2DifferentType, } from "../util";
import { expression, Expression } from "./Expression";
import { Identifier, identifier, } from "./Identifier";
import { String, string, } from "./String";
import { whitespace } from "./Whitespace";

class KeyValuePair implements ISyntaxNode {
    // 这里面的数据都是可能为空的，这是之后编写 SyntaxNode 的习惯规定
    private mKey?: Identifier | String;
    private mValue?: Expression;

    public static New(key: Identifier | String) : KeyValuePair {
        return new KeyValuePair(key);
    }

    public static SetValue(pair: KeyValuePair, value: Expression) {
        pair.mValue = value;
        return pair;
    }

    // 然后构造函数可以的话，都是可以不用参数构造的
    public constructor(key: Identifier | String) {
        this.mKey = key;
    }
    Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }

    // range 主要是用来分配当前光标所在位置的
    // 这个接口方法的相关事宜还要想清楚，比如子 node 可能是 null
    // 解析的事差不多弄完后再想这个，现在决定还无法窥全貌
    
    public get Valid(): boolean {
        return this.mKey != null || this.mValue != null;
    }
}

const pair = from(or(identifier, string, selectNotNullIn2DifferentType))
                .transform(KeyValuePair.New)
                .leftWith(optional(whitespace), selectRight)
                .rightWith(from(makeWordParser(':', nullize))
                    .leftWith(optional(whitespace), nullize)
                    .rightWith(optional(whitespace), nullize).raw, selectLeft)
                .rightWith(expression, KeyValuePair.SetValue)
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

    Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }
    get Valid(): boolean {
        throw new Error("Method not implemented.");
    }

    public toString(): string {
        
    }
}
/**
 * 强制每个 pair 后面都要打逗号
 */ 
// TODO Obj.New on '{'
export const object = from(makeWordParser('{', nullize))
                        .rightWith(pair.zeroOrMore(asArray).raw, selectRight)
                        .rightWith(makeWordParser('}', nullize), selectLeft)
                        .transform(Obj.New)
                        .prefixComment('parse object')
                        .raw;

