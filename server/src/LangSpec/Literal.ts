import { Position, Text, } from "../IParser";
import { ISyntaxNode } from "../ISyntaxNode";
import { Number, } from "./Number";
import { String, } from "./String";
import { Obj, } from "./Object";
import { Array, } from "./Array";
// import { consFunc, Func, } from "./Func";
import { stringify } from "../util";
import { assert } from "console";
import { Func } from "./Func";

export abstract class Literal implements ISyntaxNode {
    abstract Contains(p: Position): boolean;
    abstract get Valid(): boolean;
    abstract toString(): string;
    // ['constructor']: new (...args: ConstructorParameters<typeof ILiteral>) => this;

    public static New(typeInfo: string, args: (ISyntaxNode | Text)[]): ISyntaxNode {
        assert(args.length === 1);
        switch (typeInfo) {
            case 'StringLiteral':
                return StringLiteral.New(args[0] as String);
            case 'NumberLiteral':
                return NumberLiteral.New(args[0] as Number);
            case 'ObjectLiteral':
                return ObjectLiteral.New(args[0] as Obj);
            case 'ArrayLiteral':
                return ArrayLiteral.New(args[0] as Array);
            case 'FuncLiteral':
                return FuncLiteral.New(args[0] as Func);
        }
        throw new Error(`not support type info: ${typeInfo}`);
    }
}

class NumberLiteral implements Literal {
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

class StringLiteral implements Literal {
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

class ObjectLiteral implements Literal {
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

class ArrayLiteral implements Literal {
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

class FuncLiteral implements Literal {
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

//     // IParser<StringLiteral> 为什么可以赋值给 IParser<ILiteral>

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
