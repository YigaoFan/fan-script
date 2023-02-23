import { InternalNonTerminatedRule } from "../LangSpec/GrammarMap";
import * as ts from 'typescript';
import { genIdName, toString, } from "../LangSpec/Translator";
import { capitalizeFirstChar, log, stringify } from "../util";
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
    const classes: Record<string, ((print: (node: ts.Node) => void, clsNamePostfix: string, allTypeSet: Record<string, string>)=> string)[]> = {};
    // 下面这个应该是个 Map，这样就能把 id -> Identifier 放进去了
    const typeMap: Record<string, string> = {
        id: 'Identifier',
        prefixOperator: 'PrefixOperator',
        infixOperator: 'InfixOperator',
    };

    for (const rule of grammar) {
        // const members: ts.ClassElement[] = [];
        // 这个 generator 还要涉及 translator 那边的语法
        const memberGens: Record<string, ((print: (node: ts.ClassElement) => void, getterNamePostfix: string, allTypeSet: Record<string, string>) => void)[]> = {};
        if ('main' in rule[1]) {
            
        } else {
            for (let i = 0; i < rule[1].length; i++) {
                const u = rule[1][i];
                const name = genIdName(u);
                if (!filter(name)) {
                    continue;
                }
                if (!(name in memberGens)) {
                    memberGens[name] = [];
                }
                memberGens[name].push((print: (node: ts.ClassElement) => void, postfix: string, allTypeMap: Record<string, string>) => {
                    const m = [ts.factory.createModifier(ts.SyntaxKind.PublicKeyword),];
                    const child = ts.factory.createPropertyAccessExpression(ts.factory.createThis(), 'Children');
                    const item = ts.factory.createElementAccessExpression(child, i);
                    // 其实下面可以支持下 or 这个运算符，但好麻烦。。。 TODO

                    // let returnType = capitalizeFirstChar(name);
                    let expInRetStmt: ts.Expression = item;
                    // if (returnType == 'Object') { // conflict with ES Object type
                    //     returnType = 'Object_0';
                    // }
                    // log('return type', returnType, returnType in allTypeMap);
                    if (name in allTypeMap) {
                        const destType = ts.factory.createTypeReferenceNode(allTypeMap[name]);
                        expInRetStmt = ts.factory.createAsExpression(item, destType);
                    }
                    const ret = ts.factory.createReturnStatement(expInRetStmt);
                    const b = ts.factory.createBlock([ret], false);
                    print(ts.factory.createGetAccessorDeclaration(undefined, m, name + postfix, [], undefined, b))
                });
            }
        }
        const m = ts.factory.createModifier(ts.SyntaxKind.ExportKeyword);
        const b = ts.factory.createExpressionWithTypeArguments(ts.factory.createIdentifier('UniversalNode'), undefined);
        const ext = ts.factory.createHeritageClause(ts.SyntaxKind.ExtendsKeyword, [b]);
        let clsName = capitalizeFirstChar(rule[0]);
        if (clsName == 'Object') { // conflict with ES Object type
            clsName = 'Object_0';
        }
        if (!(clsName in classes)) {
            classes[clsName] = [];
        }
        typeMap[rule[0]] = clsName;
        classes[clsName].push((print: (node: ts.Node)=> void, clsNamePostfix: string, allTypeSet: Record<string, string>) => {
            const r = ts.factory.createIdentifier('grammarRule');
            const ruleTag = ts.factory.createJSDocClassTag(r, serializeRule(rule));
            const comment = ts.factory.createJSDocComment('', [ruleTag]);
            print(comment);
            const name = clsName + clsNamePostfix;
            const members: ts.ClassElement[] = [];
            for (const name in memberGens) {
                const subs = memberGens[name];
                assert(subs.length != 0, 'subclasses has no items');
                const print = (node: ts.ClassElement) => {
                    members.push(node);
                };
                if (subs.length == 1) {
                    subs[0](print, '', allTypeSet);
                } else {
                    for (let i = 0; i < subs.length; i++) {
                        const nodeGen = subs[i];
                        nodeGen(print, `_${i}`, allTypeSet);
                    }
                }
            }
            const cls = ts.factory.createClassExpression(undefined, [m], name, undefined, [ext], members);
            print(cls);
            return name;
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
    const CreateImport = function (importType: string, path: string) {
        const nb = ts.factory.createNamedImports([
            ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier(importType)),
        ]);
        const imC = ts.factory.createImportClause(false, undefined, nb);
        const ms = ts.factory.createStringLiteral(path);
        const imD = ts.factory.createImportDeclaration(undefined, undefined, imC, ms, undefined);
        return imD;
    };
    print(CreateImport('UniversalNode', './UniversalNodeFactory'));
    print(CreateImport('PrefixOperator', './Expression'));
    print(CreateImport('InfixOperator', './Expression'));
    print(CreateImport('Identifier', './Identifier'));
    log('type set', typeMap);
    for (const name in classes) {
        const subClasses = classes[name];
        assert(subClasses.length != 0, 'subclasses has no items');
        if (subClasses.length == 1) {
            subClasses[0](print, '', typeMap);
        } else {
            const subTypeNames: string[] = [];
            for (let i = 0; i < subClasses.length; i++) {
                const clsGen = subClasses[i];
                const subClsName = clsGen(print, `_${i}`, typeMap);
                subTypeNames.push(subClsName);
            }
            // create union type to alias type which has multiple sub types
            const u = ts.factory.createUnionTypeNode(subTypeNames.map(x => ts.factory.createTypeReferenceNode(x)));
            const m = ts.factory.createModifier(ts.SyntaxKind.ExportKeyword);
            const unionType = ts.factory.createTypeAliasDeclaration(undefined, [m], capitalizeFirstChar(name), undefined, u);
            print(unionType);
        }
    }
};

export const GenDispatchFuncs = function (filename: string, funcInfos: [string, number, [string, string][]][]) {
    if (existsSync(filename)) {
        unlinkSync(filename);
    }
    appendFileSync(filename, 'import { Env } from "./Env";\n');
    const importsFromNodeDef = new Set<string>();
    const importsFromEvalRule = new Set<string>();
    const funcDefs: string[] = [];

    for (const x of funcInfos) {
        const f = GenDispatchFunc(x[0], x[1], x[2], importsFromNodeDef, importsFromEvalRule);
        funcDefs.push(f);
    }
    appendFileSync(filename, `import { ${Array.from(importsFromNodeDef).map(x => `${x}, `).join('')}} from "../LangSpec/NodeDef";\n`);
    appendFileSync(filename, `import { ${Array.from(importsFromEvalRule).map(x => `${x}, `).join('')}} from "./EvalRule";\n`);

    for (const f of funcDefs) {
        appendFileSync(filename, f);
        appendFileSync(filename, '\n');
    }
};

/**
 * @param paras [name, type]
 */
export const GenDispatchFunc = function (baseTypeName: string, subTypeCount: number, paras: [string, string][], importsFromNodeDef: Set<string>, importsFromEvalRule: Set<string>) {
    const base = baseTypeName;
    assert(subTypeCount > 1, 'dispatch need two sub types at least');
    const subTypeNames = Array.from(Array(subTypeCount)).map((_, i) => `${baseTypeName}_${i}`);
    const funcName = `Eval${base}`;
    const GenDispatchItem = (subType: string) => {
        const name = `Eval${subType}`;
        importsFromEvalRule.add(name);
        return `if (obj instanceof ${subType}) {
        ${name}(obj,${paras.map(x => ` ${x[0]},`).join('')}); 
    }`;
    };
    importsFromNodeDef.add(baseTypeName);
    for (const x of subTypeNames) {
        importsFromNodeDef.add(x);        
    }
    for (const x of paras) {
        if (x[1] != 'Env') {
            importsFromEvalRule.add(x[1]);
        }
    }
    const def = `export const ${funcName} = function (obj: ${base},${paras.map(x => ` ${x[0]}: ${x[1]},`).join('')}) {
    ${GenDispatchItem(subTypeNames[0])}${subTypeNames.slice(1).map(x => ` else ${GenDispatchItem(x)}`).join('')} else {
        throw new Error('encounter unknown type in ${funcName}');
    }
};`;
    return def;
};