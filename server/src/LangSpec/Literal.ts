import { IParser, Position, } from "../IParser";
import { id, or, from, nullize, selectRight, optional, Option, eitherOf, } from "../combinator";
import { ISyntaxNode } from "../ISyntaxNode";
import { number, Number, } from "./Number";
import { string, String, } from "./String";
import { consObject, Obj, } from "./Object";
import { Array, consArray, } from "./Array";
import { consFunc, Func, } from "./Func";
import { log, selectNotNull, stringify } from "../util";
import { lazy } from "../parser";

interface ILiteral extends ISyntaxNode {
    // ['constructor']: new (...args: ConstructorParameters<typeof ILiteral>) => this;
}

class NumberLiteral implements ILiteral {
    private mNum: Number;

    // 先用下面这种麻烦的方法写着，之后再看有没有简便的方法
    public static New(num: Number): NumberLiteral {
        return new NumberLiteral(num);
    }

    public constructor(num: Number) {
        this.mNum = num;
    }
    
    public toString(): string {
        return stringify(this.mNum);
    }

    Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }
    get Valid(): boolean {
        throw new Error("Method not implemented.");
    }

}

class StringLiteral implements ILiteral {
    private mStr: String;

    public static New(str: String): StringLiteral {
        return new StringLiteral(str);
    }

    public constructor(str: String) {
        this.mStr = str;
    }
    Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }
    get Valid(): boolean {
        throw new Error("Method not implemented.");
    }

    public toString(): string {
        return this.mStr.toString();
    }
}

class ObjectLiteral implements ILiteral {
    private mObj: Obj;

    public static New(obj: Obj): ObjectLiteral {
        return new ObjectLiteral(obj);
    }

    public constructor(obj: Obj) {
        this.mObj = obj;
    }
    Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }
    get Valid(): boolean {
        throw new Error("Method not implemented.");
    }

    public toString(): string {
        return this.mObj.toString();
    }
}

class ArrayLiteral implements ILiteral {
    private mArray: Array;

    public static New(array: Array): ArrayLiteral {
        return new ArrayLiteral(array);
    }

    public constructor(array: Array) {
        this.mArray = array;
    }
    Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }
    get Valid(): boolean {
        throw new Error("Method not implemented.");
    }
}

class FuncLiteral implements ILiteral {
    private mFunc: Func;

    public static New(func: Func): FuncLiteral {
        return new FuncLiteral(func);
    }

    public constructor(func: Func) {
        this.mFunc = func;
    }
    Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }
    get Valid(): boolean {
        throw new Error("Method not implemented.");
    }
}

export const consLiteral = function(func: IParser<Func>): IParser<ILiteral> {
    // undefined 和 null 没弄吧？ TODO
    const num = from(number).transform(NumberLiteral.New).raw;
    const str = from(string).transform(StringLiteral.New).raw;
    const obj = from(consObject(func)).transform(ObjectLiteral.New).raw;
    const arr = from(consArray(func)).transform(ArrayLiteral.New).raw;
    const fun = from(func).transform(FuncLiteral.New).raw; // func 这里是 undefined 说到底可能还是引用顺序的问题, 已显式化此依赖为一个参数
    // IParser<StringLiteral> 为什么可以赋值给 IParser<ILiteral>
    const lit = from(eitherOf<ILiteral, ILiteral>(selectNotNull, num, str, obj, arr, fun)).prefixComment('parse literal').raw;
    return lit;
};
log('evaluate literal');
// export const literal: IParser<Literal> = from(consLiteral());
export type Literal = ILiteral;// 不要直接暴露接口出去

// 原来是忘了 npm install
// 有时候一些编译错误，需要重新开始编译才能不提示，增量编译还是会错误地提示有问题
// client 引用 server 的问题：回味了下 StackOverflow 上的其实文件夹层次的问题，
// ，这里算是引用本地项目，因为 server 已然成为了一个项目，所以想到了顶级目录下 tsconfig 里的
// references，试了下果然可以
// 所以 import 不能直接写 typescript 文件的地址吗，而是要用 js 的地址？
// 总结下来，还是要好好看文档啊
// tsconfig 里的 baseUrl 和 paths，原来只是让 tsc 在编译时看的吗，实际到 node 运行时并没有这些信息？
// 👆我理解的是对的
// tsconfig - path（这个后来了解到，除了命令行的用法，还有程序里写代码的用法，不过没后面这个只需要加个 require 那么简单）-> module - alias（这个好用点，不用加什么命令行参数）

// 又是 this 的问题

// 对于类型的选择要审慎，类型是有表明含义的，牵一发而动全身
