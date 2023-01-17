import { InternalNonTerminatedRule } from "../LangSpec/GrammarMap";
import * as ts from 'typescript';
import { genIdName, toString, } from "../LangSpec/Translator";
import { log, stringify } from "../util";
import { appendFileSync, exists, existsSync, unlinkSync } from "fs";
import { assert } from "console";

const filter = function (node: string) {
    assert(node.length != 0, 'node length is 0');
    const nos = ['ow', 'w'];
    if (nos.includes(node) || node.length == 1) {
        return false;
    }
    const legals = "_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    for (const c of node) {
        if (!legals.includes(c)) {
            return false;
        }
    }

    return true;
};
const capitalizeFirstChar = function (s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
};

const serializeRule = function (rule: InternalNonTerminatedRule) {
    if ('main' in rule[1]) {
        throw new Error('not support serialize rule which include main in grammar rule');
    } else {
        return stringify([rule[0], rule[1].map(x => toString(x))]);
    }
};

// 同名 class 处理 rename工作
// 有个 Object class 名违反 JS 规定不能用，要换名
export const GenNodeType = function (filename: string, grammar: InternalNonTerminatedRule[]) {
    if (existsSync(filename)) {
        unlinkSync(filename);
    }
    const classes: Record<string, ((print: (node: ts.Node) => void, clsNamePostfix: string)=> void)[]> = {};
    for (const rule of grammar) {
        // const members: ts.ClassElement[] = [];
        // 这个 generator 还要涉及 translator 那边的语法
        const memberGens: Record<string, ((print: (node: ts.ClassElement) => void, getterNamePostfix: string) => void)[]> = {};
        if ('main' in rule[1]) {
            
        } else {
            for (let i = 0; i < rule[1].length; i++) {
                const u = rule[1][i];
                const name = genIdName(u);
                if (!filter(name)) {
                    continue;
                }
                const m = [ts.factory.createModifier(ts.SyntaxKind.PublicKeyword),];
                const child = ts.factory.createPropertyAccessExpression(ts.factory.createThis(), 'Children');
                const item = ts.factory.createElementAccessExpression(child, i);
                const ret = ts.factory.createReturnStatement(item);
                const b = ts.factory.createBlock([ret], false);
                if (!(name in memberGens)) {
                    memberGens[name] = [];
                }
                memberGens[name].push((print: (node: ts.ClassElement) => void, postfix: string) => print(ts.factory.createGetAccessorDeclaration(undefined, m, name + postfix, [], undefined, b)));
            }
        }
        const members: ts.ClassElement[] = [];
        for (const name in memberGens) {
            const subs = memberGens[name];
            assert(subs.length != 0, 'subclasses has no items');
            const print = (node: ts.ClassElement) => {
                members.push(node);
            };
            if (subs.length == 1) {
                subs[0](print, '');
            } else {
                for (let i = 0; i < subs.length; i++) {
                    const nodeGen = subs[i];
                    nodeGen(print, `_${i}`);
                }
            }
        }
        const m = ts.factory.createModifier(ts.SyntaxKind.ExportKeyword);
        const b = ts.factory.createExpressionWithTypeArguments(ts.factory.createIdentifier('UniversalNode'), undefined);
        const ext = ts.factory.createHeritageClause(ts.SyntaxKind.ExtendsKeyword, [b]);
        let clsName = capitalizeFirstChar(rule[0]);
        if (clsName == 'Object') {
            clsName = 'Object_0';
        }
        if (!(clsName in classes)) {
            classes[clsName] = [];
        }
        classes[clsName].push((print: (node: ts.Node)=> void, clsNamePostfix: string) => {
            const r = ts.factory.createIdentifier('grammarRule');
            const ruleTag = ts.factory.createJSDocClassTag(r, serializeRule(rule));
            const comment = ts.factory.createJSDocComment('', [ruleTag]);
            print(comment);
            const cls = ts.factory.createClassExpression(undefined, [m], clsName + clsNamePostfix, undefined, [ext], members)
            print(cls);
        });
    }
    const resultFile = ts.createSourceFile(filename, "", ts.ScriptTarget.Latest, false, ts.ScriptKind.TS);
    const print = (node: ts.Node) => {
        const result = printer.printNode(ts.EmitHint.Unspecified, node, resultFile);
        // log(result);
        appendFileSync(filename, result);
        appendFileSync(filename, '\n');
    };
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    // const base = ts.factory.createIdentifier('UniversalNodeFactory');
    const nb = ts.factory.createNamedImports([
        ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier('UniversalNode')),
    ]);
    const imC = ts.factory.createImportClause(false, undefined, nb);
    const ms = ts.factory.createStringLiteral('./UniversalNodeFactory');
    const imD = ts.factory.createImportDeclaration(undefined, undefined, imC, ms, undefined);
    print(imD);
    for (const name in classes) {
        const subClasses = classes[name];
        assert(subClasses.length != 0, 'subclasses has no items');
        if (subClasses.length == 1) {
            subClasses[0](print, '');
        } else {
            for (let i = 0; i < subClasses.length; i++) {
                const clsGen = subClasses[i];
                clsGen(print, `_${i}`);
            }
        }
    }
};