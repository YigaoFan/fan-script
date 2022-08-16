import { IParser, Position, } from "../IParser";
import { consExp, ExpKind, Expression, } from "./Expression";
import { ISyntaxNode } from "../ISyntaxNode";
import { from, nullize, optional, selectLeft, selectRight } from "../combinator";
import { lazy, makeWordParser } from "../parser";
import { whitespace, } from "./Whitespace";
import { asArray, stringify } from "../util";
import { Func } from "./Func";

export class Array implements ISyntaxNode {
    private mExps?: Expression[];

    public static New(): Array {
        return new Array();
    }
    public static SetItems(array: Array, expressions: Expression[]) {
        array.mExps = expressions;
        return array;
    }

    public constructor() {
    }
    Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }
    get Valid(): boolean {
        throw new Error("Method not implemented.");
    }

    public toString(): string {
        return stringify({
            exps: this.mExps?.toString(),
        });
    }
}

export class Items implements ISyntaxNode {
    public static New() {
        return new Items();
    }

    public Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }
    public get Valid(): boolean {
        throw new Error("Method not implemented.");
    }
    public toString(): string {
        throw new Error("Method not implemented.");
    }    
}

export class Item implements ISyntaxNode {
    public static New() {
        return new Item();
    }
    public Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }
    public get Valid(): boolean {
        throw new Error("Method not implemented.");
    }
    public toString(): string {
        throw new Error("Method not implemented.");
    }    
}