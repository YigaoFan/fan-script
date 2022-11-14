import { assert } from "console";
import { Text } from "../IParser";
import { ISyntaxNode } from "../ISyntaxNode";
import { Node, NonTerminatedRule } from "./GrammarMap";

type UniversalNode = {
    Type: Node[],
    SubNodes: (UniversalNode | Text)[],
};

// tuple to object type
export const UniversalNodeFactory = function (nodes: (UniversalNode | Text)[], rule: NonTerminatedRule): UniversalNode {
    if (rule[1].length == 1) {
        // assert n is UniversalNode type
        const n = nodes[0] as UniversalNode;
        n.Type.unshift(rule[0]);
        // maybe need to overload or add raw method
        return n;
    }
    let r: Record<string, UniversalNode | Text> ={};
    r.helo;
    const n = {
        Type: [rule[0]],
        SubNodes: nodes,
        // read property name rule to generate property in this object
    };
    return n;
};