import { assert } from "console";
import { Position, Text } from "../IParser";
import { IRange, ISyntaxNode } from "../ISyntaxNode";
import { stringify } from "../util";
import { Node, NonTerminatedRule } from "./GrammarMap";

export interface UniversalNode extends ISyntaxNode {
    Rule: NonTerminatedRule,
    Type: Node[],
    Children: (ISyntaxNode | Text)[],
};

const f: (...args: never[]) => void = function(n: number) {

};
f();
// type IndexOf<T, Ts extends readonly any[]> = T extends Ts[0] ? 0 : 1 + IndexOf<T, Ts>;// 可以递归吗
const rule = ['if-stmt', 'cond', 'block'] as const;
// const noConstRule: any[] = rule;
type Ks1<T extends readonly any[]> = T[number];
type GetReturnType<Type> = Type extends (...args: never[]) => infer Return
    ? Return
    : never;

// type temp<Id> = 
type t = keyof [1];
//这里的参数为什么用 never？
type Exclude<T, U> = T extends U ? never : T; // 这种对于传进去的 union type 来说，是会遍历其中每个项吗
// 果然 When conditional types act on a generic type, they become distributive when given a union type. For example, take the following:
type ks1 = Exclude<keyof (typeof rule), keyof ['0']>; // T[number] 这是一个固定搭配好像，就是说这里面的number不是个变量，没有意义，只是组合起来表明这是个数组项
type Indices<T extends readonly any[]> = Exclude<Partial<T>["length"], T["length"]>;
type Index<Ids extends number, Types extends readonly any[], Dest> = Types[Ids] extends Dest ? Ids : never;
// 由于分配律的存在，所以这些类型参数天然都是支持传 union 进去的
type ids = Indices<typeof rule>;
type TupleToUnion<T extends readonly any[]> = T[number];
type o = TupleToUnion<typeof rule>;
type d = 'cond';
type r = typeof rule;
type r1 = r[number];// 不行的原因应该是在这，这里实际上当作变量存在了，而不是一个数字字面量，所以返回的类型不是预期
// 所以现在的问题就演变成：如何在类型参数中表示一个 index type
type ListIndex<List> = Exclude<keyof List, keyof []>;
// 发现传数字的union进去就不行，直接传一个数字就可以
type v = Index<1, typeof rule, d>;
type Ks<T extends readonly any[]> = { [Key in T[number]]: number };// 这里这个 number 是什么意思，我想获取这个数字，然后就能取到对应位置的 subnode
type keys = Ks<typeof rule>;

// 相当于手动实现继承体系
export const UniversalNodeFactory = function (rule: NonTerminatedRule, nodes: (ISyntaxNode | Text)[]): UniversalNode {
    // if (rule[1].length == 1) {
    //     // 这里的 rule 没有处理
    //     // assert n is UniversalNode type
    //     const n = nodes[0] as UniversalNode;
    //     n.Type.unshift(rule[0]);
    //     // maybe need to overload or add raw method
    //     return n;
    // }
    const n = {
        Rule: rule,
        Type: [rule[0]],
        Children: nodes,// 这里面可能包含的 null 也不需要在 chartParser 那边剔除了，直接在这里保留
        get Range(): IRange {
            const ns = this.Children;
            if (ns.length > 0) {
                const left = ns[0].Range.Left;
                const right = ns[ns.length - 1].Range.Right;
                return { Left: left, Right: right, };
            }
            throw new Error('query node which not have children'); 
        },
        Contains(p: Position): boolean {
            const ns = this.Children;
            if (ns.length > 0) {
                const left = ns[0].Range.Left;
                const right = ns[ns.length - 1].Range.Right;
                if (p.NotBefore(left) && p.NotAfter(right)) {
                    return true;
                }
                return false;
            }
            throw new Error('query node which not have children');
        },
        get Valid(): boolean {
            throw new Error('not implement');
        },
        toString(): string {
            const ns = this.Children;
            return stringify({
                Type: n.Type,
                Children: rule[1].map((n, i) => `${n}: ${ns[i] ? ns[i].toString() : 'null'}`),
            });
        },
    };
    return n;
};