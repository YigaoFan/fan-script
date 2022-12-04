import { Position, Text, } from "../IParser";
import { IRange, ISyntaxNode } from "../ISyntaxNode";
import { Number, } from "./Number";
import { String, } from "./String";
import { assert } from "console";

// 下面这些类型感觉都没有必要，可以像 stmt 那里那样去掉
// 不过有个东西需要留意，一个东西是字面量数字类型和数字类型是不一样的，这里可能要注意的是：
// 一个是静态类型检查，一个是处于解析的时候的类型判断

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
