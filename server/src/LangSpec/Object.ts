import { assert } from "console";
import { id, or, from, nullize, selectRight, optional, eitherOf, selectLeft, } from "../combinator";
import { IParser, Position, Text, } from "../IParser";
import { ISyntaxNode } from "../ISyntaxNode";
import { makeWordParser, oneOf, lazy, } from "../parser";
import { asArray, selectNotNullIn2DifferentType, stringify, } from "../util";
import { consExp, ExpKind, Expression } from "./Expression";
import { Func } from "./Func";
import { Identifier, identifier, } from "./Identifier";
import { String, string, } from "./String";
import { whitespace } from "./Whitespace";

export class Pairs implements ISyntaxNode {
    private mPairs: Pair[];

    public static New(args: (ISyntaxNode | Text)[]): Pairs {
        assert(args.length === 3 || args.length === 0);
        const ps = new Pairs();
        if (args.length === 0) {
            return ps;
        }

        ps.mPairs.push(args[0] as Pair);
        ps.mPairs.push(...(args[2] as Pairs).mPairs);
        return ps;
    }

    private constructor() {
        this.mPairs = [];
    }
    
    public Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }
    
    public get Valid(): boolean {
        throw new Error("Method not implemented.");
    }
    
    public toString(): string {
        return stringify({
            pairs: this.mPairs.map(x => x.toString()),
        });
    }
}

export class Pair implements ISyntaxNode {
    // 这里面的数据都是可能为空的，这是之后编写 SyntaxNode 的习惯规定
    private mKey?: Key;
    private mValue?: Value;

    public static New(args: (ISyntaxNode | Text)[]) : Pair {
        assert(args.length === 3);
        return new Pair(args[0] as Key, args[2] as Value);
    }

    private constructor(key: Key, value: Value) {
        this.mKey = key;
        this.mValue = value;
    }

    public static SetValue(pair: Pair, value: Value) {
        pair.mValue = value;
        return pair;
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

    public toString(): string {
        return stringify({
            key: this.mKey?.toString(),
            value: this.mValue?.toString(),
        });
    }
}

export class Key implements ISyntaxNode {
    private mKey?: Identifier | String;

    public static New(args: (ISyntaxNode | Text)[]) {
        assert(args.length === 1);
        const key = args[0] as Identifier | String;
        return new Key(key);
    }

    private constructor(key: Identifier | String) {
        this.mKey = key;
    }

    public Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }
    public get Valid(): boolean {
        throw new Error("Method not implemented.");
    }
    public toString(): string {
        return stringify(this.mKey?.toString());
    }    
}

export class Value implements ISyntaxNode {
    private mValue: Expression;

    public static New(args: (ISyntaxNode | Text)[]) {
        assert(args.length === 1);
        return new Value(args[0] as Expression);
    }

    private constructor(value: Expression) {
        this.mValue = value;
    }

    public Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }
    public get Valid(): boolean {
        throw new Error("Method not implemented.");
    }
    public toString(): string {
        return stringify(this.mValue?.toString());
    }    
}

export class Obj implements ISyntaxNode {
    private mPairs?: Pair[];

    public static New(): Obj {
        return new Obj();
    }

    public static SetPairs(obj: Obj, pairs: Pair[]) {
        obj.mPairs = pairs;
        return obj;
    }

    private constructor() {
        this.mPairs = [];
    }

    Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }
    get Valid(): boolean {
        throw new Error("Method not implemented.");
    }

    public toString(): string {
        return stringify(this.mPairs?.map(x => x.toString()));
    }
}

const consPair = (func: IParser<Func>) => (from(or(identifier, string, selectNotNullIn2DifferentType))
                .transform(Pair.New)
                .leftWith(optional(whitespace), selectRight)
                .rightWith(from(makeWordParser(':', nullize))
                    .leftWith(optional(whitespace), nullize)
                    .rightWith(optional(whitespace), nullize).raw, selectLeft)
                .rightWith(lazy(consExp.bind(null, func, ExpKind.All)), Pair.SetValue)// 这里讲道理要把这个 lazy 的 consExp 参数化
                .rightWith(optional(whitespace), selectLeft)
                .rightWith(makeWordParser(',', nullize), selectLeft));
/**
 * 强制每个 pair 后面都要打逗号
 */ 
export const consObject = (func: IParser<Func>) => (from(makeWordParser('{', Obj.New))
                                                    .rightWith(consPair(func).zeroOrMore(asArray).raw, Obj.SetPairs)
                                                    .rightWith(makeWordParser('}', nullize), selectLeft)
                                                    .prefixComment('parse object')
                                                    .raw);

