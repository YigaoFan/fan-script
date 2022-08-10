import { IParser, Position, } from "../IParser";
import { ISyntaxNode } from "../ISyntaxNode";
import {
    from,
    optional,
    appendString,
    withHandleNull,
    id,
    nullize,
    selectLeft,
    selectNonblank,
    selectRight,
    or,
    Option,
    eitherOf,
} from "../combinator";
import { lazy, makeWordParser, oneOf } from "../parser";
import { asArray, combine, selectNotNull, selectNotNullIn2DifferentType, stringify } from "../util";
import { identifier, Identifier } from "./Identifier";
import { func, Func, leftBrace, rightBrace, VarStmt, varStmt } from "./Func";
import { whitespace } from "./Whitespace";

// property 默认是 private，method 默认是 public，目前更改不了权限
export class Class implements ISyntaxNode {
    private mName?: Identifier;
    private mProperties: VarStmt[] = []; // Func 那边把 VarStmt 暴露出来了，这种暴露行为要整理一下嘛？TODO
    private mMethods: Func[] = [];

    public static New() {
        return new Class();
    }

    public static SetName(cls: Class, name: Identifier) {
        cls.mName = name;
        return cls;
    }

    public static SetMember(cls: Class, member: Func | VarStmt) {
        if (member instanceof Func) {
            cls.mMethods.push(member);
        } else {
            cls.mProperties.push(member);
        }
        return cls;
    }

    public static SetMembers(cls: Class, members: (Func | VarStmt | null)[]) {
        for (const i of members) {
            if (i === null) {
                continue;
            }
            Class.SetMember(cls, i);
        }
        return cls;
    }

    public toString() {
        return stringify({
            name: this.mName?.toString(), // 为什么有的情况下，这一项不在？是因为 undefined stringify 就直接没了吗？是的
            varStmts: this.mProperties.map(x => x.toString()),
            methods: this.mMethods.map(x => x.toString()),
        });
    }

    Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }
    get Valid(): boolean {
        throw new Error("Method not implemented.");
    }

}

// 感觉之前想的：做一个将其他 parser 传进来的 parser 挺好的，像这里 block 里可以允许不同的 parser
// 不过感觉也简化不了太多，下面用 or 来做代码也很少呀
export const classs = from(makeWordParser('class', Class.New))
                        .prefixComment('parse class keyword')
                        .rightWith(whitespace, selectLeft)
                        .rightWith(identifier, Class.SetName)
                        .rightWith(optional(whitespace), selectLeft)
                        .rightWith(leftBrace, selectLeft)
                        // add whitespace below todo
                        .rightWith(from(or(func, or(varStmt, whitespace, selectNotNullIn2DifferentType), selectNotNullIn2DifferentType)).zeroOrMore(asArray).raw, Class.SetMembers)
                        .rightWith(rightBrace, selectLeft)
                        .prefixComment('parse class')
                        .raw
                        ;