import { IParser, Position, Text, } from "../IParser";
import { Expression, } from "./Expression";
import { ISyntaxNode } from "../ISyntaxNode";
import { from, nullize, optional, selectLeft, selectRight } from "../combinator";
import { lazy, makeWordParser } from "../parser";
import { whitespace, } from "./Whitespace";
import { asArray, stringify } from "../util";
// import { Func } from "./Func";
import { assert } from "console";

export class Array implements ISyntaxNode {
    private mItems?: Items;

    public static New(args: (ISyntaxNode | Text)[]): Array {
        assert(args.length === 3);
        return new Array(args[1] as Items);
    }
    public static SetItems(array: Array, items: Items) {
        array.mItems = items;
        return array;
    }

    public constructor(items: Items) {
        this.mItems = items;
    }
    Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }
    get Valid(): boolean {
        throw new Error("Method not implemented.");
    }

    public toString(): string {
        return stringify({
            items: this.mItems?.toString(),
        });
    }
}

export class Items implements ISyntaxNode {
    private mItems: Item[];

    public static New(args: (ISyntaxNode | Text)[]) {
        assert(args.length === 3 || args.length === 0);
        const is = new Items();
        if (args.length === 0) {
            return is;
        }
        is.mItems.push(args[0] as Item);
        is.mItems.push(...(args[2] as Items).mItems);
        return is;
    }

    private constructor() {
        this.mItems = [];
    }

    public Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }
    public get Valid(): boolean {
        throw new Error("Method not implemented.");
    }
    public toString(): string {
        return stringify(this.mItems.map(x => x.toString()));
    }    
}

export class Item implements ISyntaxNode {
    private mExp: Expression;

    public static New(args: (ISyntaxNode | Text)[]) {
        assert(args.length === 1);
        return new Item(args[0] as Expression);
    }

    private constructor(exp: Expression) {
        this.mExp = exp;
    }

    public Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }
    public get Valid(): boolean {
        throw new Error("Method not implemented.");
    }
    public toString(): string {
        return this.mExp.toString();
    }    
}