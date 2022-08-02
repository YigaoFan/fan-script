import { IParser, Range } from "../IParser";
import { id, or, from, nullize, selectRight, optional, Option, eitherOf, } from "../combinator";
import { ISyntaxNode } from "../ISyntaxNode";
import { number, Number, } from "./Number";
import { string, String, } from "./String";
import { object, Obj, } from "./Object";
import { array, Array, } from "./Array";
import { Func, func } from "./Func";
import { selectNotNull } from "../util";

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

class StringLiteral implements ILiteral {
    private mStr: String;

    public static New(str: String): StringLiteral {
        return new StringLiteral(str);
    }

    public constructor(str: String) {
        this.mStr = str;
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

class ObjectLiteral implements ILiteral {
    private mObj: Obj;

    public static New(obj: Obj): ObjectLiteral {
        return new ObjectLiteral(obj);
    }

    public constructor(obj: Obj) {
        this.mObj = obj;
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

class ArrayLiteral implements ILiteral {
    private mArray: Array;

    public static New(array: Array): ArrayLiteral {
        return new ArrayLiteral(array);
    }

    public constructor(array: Array) {
        this.mArray = array;
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

class FuncLiteral implements ILiteral {
    private mFunc: Func;

    public static New(func: Func): FuncLiteral {
        return new FuncLiteral(func);
    }

    public constructor(func: Func) {
        this.mFunc = func;
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

const consLiteral = function(): IParser<ILiteral> {
    const num = from(number).transform(NumberLiteral.New).raw;
    const str = from(string).transform(StringLiteral.New).raw;
    const obj = from(object).transform(ObjectLiteral.New).raw;
    const arr = from(array).transform(ArrayLiteral.New).raw;
    const fun = from(func).transform(FuncLiteral.New).raw;
    // IParser<StringLiteral> 为什么可以赋值给 IParser<ILiteral>
    const lit = eitherOf<ILiteral, ILiteral>(selectNotNull, num, str, obj, arr, fun);
    return lit;
};
export const literal: IParser<ILiteral> = consLiteral();
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
