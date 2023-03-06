import { NonTerminatedRule } from "../LangSpec/GrammarMap";
import * as ts from 'typescript';
import { GeneratedRule, genIdName, toString, } from "../LangSpec/Translator";
import { capitalizeFirstChar, log, stringify } from "../util";
import { appendFileSync, exists, existsSync, unlinkSync } from "fs";
import { assert } from "console";

const Filter = function (node: string) {
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

/**
 * @returns [renamedRule, originalRule]
 */
const Rename = function (grammar: NonTerminatedRule[]) {
    const records: Record<string, NonTerminatedRule[]> = {};
    for (const r of grammar) {
        const name = r[0];
        if (!(name in records)) {
            records[name] = [];
        }
        records[name].push(r);
    }

    const renamedGrammar: [NonTerminatedRule, NonTerminatedRule][] = [];
    for (const name in records) {
        const rules = records[name];
        if (rules.length == 1) {
            renamedGrammar.push([rules[0], rules[0]]);
        } else {
            for (let i = 0; i < rules.length; i++) {
                const r = rules[i];
                renamedGrammar.push([[`${r[0]}_${i}`, r[1]], r]);
            }
        }
    }
    return renamedGrammar;
};

const GetOriginalName = function (renamedName: string) {
    if (!renamedName.includes('_')) {
        return renamedName;
    }
    return renamedName.substring(0, renamedName.lastIndexOf('_'));
};

const SerializeRule = function (rule: NonTerminatedRule) {
    // if ('main' in rule[1]) {
        // throw new Error('not support serialize rule which include main in grammar rule');
    // } else {
        return stringify([rule[0], rule[1].map(x => toString(x))]);
    // }
};

/**
 * [imports, exports, def]
 */
type GenReuslt = [string[], string[], string];

export const GenNodeType = function (grammar: NonTerminatedRule[]): GenReuslt {
    const exports: string[] = [];
    const imports: string[] = [];// 因为这里已经 hardcode 了,所以暂时不用这项
    const defs: string[] = [];

    const classes: Record<string, ((print: (node: ts.Node) => void, clsNamePostfix: string, allTypeSet: Record<string, string>)=> string)[]> = {};
    const typeMap: Record<string, string> = {
        id: 'Identifier',
        prefixOperator: 'PrefixOperator',
        infixOperator: 'InfixOperator',
        string: 'String',
        number: 'Number',
    };

    for (const rule of grammar) {
        const memberGens: Record<string, ((print: (node: ts.ClassElement) => void, getterNamePostfix: string, allTypeSet: Record<string, string>) => void)[]> = {};
        
        for (let i = 0; i < rule[1].length; i++) {
            const u = rule[1][i];
            const name = genIdName(u);
            if (!Filter(name)) {
                continue;
            }
            if (!(name in memberGens)) {
                memberGens[name] = [];
            }
            memberGens[name].push((print: (node: ts.ClassElement) => void, postfix: string, allTypeMap: Record<string, string>) => {
                const m = [ts.factory.createModifier(ts.SyntaxKind.PublicKeyword),];
                const child = ts.factory.createPropertyAccessExpression(ts.factory.createThis(), 'Children');
                const item = ts.factory.createElementAccessExpression(child, i);

                let expInRetStmt: ts.Expression = item;
                if (name in allTypeMap) {
                    const destType = ts.factory.createTypeReferenceNode(allTypeMap[name]);
                    expInRetStmt = ts.factory.createAsExpression(item, destType);
                }
                const ret = ts.factory.createReturnStatement(expInRetStmt);
                const b = ts.factory.createBlock([ret], false);
                print(ts.factory.createGetAccessorDeclaration(undefined, m, name + postfix, [], undefined, b));
            });
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
            const ruleTag = ts.factory.createJSDocClassTag(r, SerializeRule(rule));
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
    const resultFile = ts.createSourceFile('nodeType.ts', "", ts.ScriptTarget.Latest, false, ts.ScriptKind.TS);
    const print = (node: ts.Node) => {
        const result = printer.printNode(ts.EmitHint.Unspecified, node, resultFile);
        // log(result);
        defs.push(result);
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
    print(CreateImport('String', './String'));
    print(CreateImport('Number', './Number'));
    // log('type set', typeMap);
    for (const name in classes) {
        const subClasses = classes[name];
        assert(subClasses.length != 0, 'subclasses has no items');
        if (subClasses.length == 1) {
            subClasses[0](print, '', typeMap);
            exports.push(name);
        } else {
            const subTypeNames: string[] = [];
            for (let i = 0; i < subClasses.length; i++) {
                const clsGen = subClasses[i];
                const subClsName = clsGen(print, `_${i}`, typeMap);
                subTypeNames.push(subClsName);
                exports.push(subClsName);
            }
            // create union type to alias type which has multiple sub types
            const u = ts.factory.createUnionTypeNode(subTypeNames.map(x => ts.factory.createTypeReferenceNode(x)));
            const m = ts.factory.createModifier(ts.SyntaxKind.ExportKeyword);
            const unionTypeName = capitalizeFirstChar(name);
            const unionType = ts.factory.createTypeAliasDeclaration(undefined, [m], unionTypeName, undefined, u);
            print(unionType);
            exports.push(unionTypeName);
        }
    }

    return [imports, exports, defs.join('\n')];
};

const RemoveImportsFromExports = function (imports: string[], exports: string[]): string[] {
    for (let i = 0; i < exports.length; i++) {
        const x = exports[i];
        if (imports.includes(x)) {
            // log('imports', imports, 'includes', x);
            return RemoveImportsFromExports(imports.filter(y => x != y), exports.slice(i));
        }
    }
    log('after removed', imports);
    return imports;
};

export const GenDispatchFuncs = function (funcInfos: [string, number, [string, string][]][]): GenReuslt {
    const imports = new Set<string>();
    const exports: string[] = [];
    const defs: string[] = [];

    imports.add('Env');

    for (const x of funcInfos) {
        const f = GenDispatchFunc(x[0], x[1], x[2], imports);
        exports.push(f[0]);
        defs.push(f[1]);
    }

    return [RemoveImportsFromExports(Array.from(imports), exports), exports, defs.join('\n')];
};

const GenDispatchFunc = function (baseTypeName: string, subTypeCount: number, paras: [string, string][], imports: Set<string>): [string, string] {
    const base = baseTypeName;
    assert(subTypeCount > 1, 'dispatch need two sub types at least');
    const subTypeNames = Array.from(Array(subTypeCount)).map((_, i) => `${baseTypeName}_${i}`);
    const funcName = `Eval${base}`;
    const GenDispatchItem = (subType: string) => {
        const name = `Eval${subType}`;
        imports.add(name);
        return `if (obj instanceof ${subType}) {
        ${name}(obj,${paras.map(x => ` ${x[0]},`).join('')}); 
    }`;
    };
    imports.add(baseTypeName);
    for (const x of subTypeNames) {
        imports.add(x);        
    }
    for (const x of paras) {
        if (x[1] != 'Env') {
            imports.add(x[1]);
        }
    }
    const def = `export const ${funcName} = function (obj: ${base},${paras.map(x => ` ${x[0]}: ${x[1]},`).join('')}) {
    ${GenDispatchItem(subTypeNames[0])}${subTypeNames.slice(1).map(x => ` else ${GenDispatchItem(x)}`).join('')} else {
        throw new Error('encounter unknown type in ${funcName}');
    }
};`;
    return [funcName, def];
};

export const GenForwardFuncs = function (rulesInfo: [string, string, [string, string][]][]): GenReuslt {
    const imports = new Set<string>();
    const exports: string[] = [];
    const defs: string[] = [];

    const Write = function (funcDef: string) {
        defs.push(funcDef);
    };
    const Gen = function (clsName: string, paras: [string, string][], property: string) {
        imports.add(clsName);
        paras.forEach(x => imports.add(x[1]));

        let forwardFunc = `Eval${capitalizeFirstChar(property)}`;
        if (forwardFunc == 'EvalObject') {
            forwardFunc = 'EvalObject_0';
        }
        imports.add(forwardFunc);
        return `export const Eval${clsName} = function (obj: ${clsName},${paras.map(x => ` ${x[0]}: ${x[1]},`).join('')}) {
    return ${forwardFunc}(obj.${property},${paras.map(x => ` ${x[0]},`).join('')});
};`;
    };
    for (const r of rulesInfo) {
        let clsName = r[0];
        // log('clsname', clsName);
        if (clsName == 'Object') {
            clsName =  'Object_0';
        }
        const property = r[1];
        const paras = r[2];
        const def = Gen(clsName, paras, property);
        exports.push(`Eval${clsName}`);
        Write(def);
    }
    return [RemoveImportsFromExports(Array.from(imports), exports), exports, defs.join('\n')];
};

const Simplify = function (rule: NonTerminatedRule): NonTerminatedRule {
    const Filter = function (node: string) {
        const nos = ['ow', 'w'];
        if (nos.includes(node)) {
            return false;
        }

        if (node.length == 1) {
            if (node == '=') {
                return true;
            }
            return false;
        }
    
        return true;
    };
    return [rule[0], rule[1].filter(Filter)];
};


const ArrayEqual = function<T> (a0: T[], a1: T[]) {
    if (a0.length != a1.length) {
        return false;
    }

    for (let i = 0; i < a0.length; i++) {
        if (a0[i] != a1[i]) {
            return false;
        }
    }
    return true;
};

type StatisticsResult = {
    /**
     * [grammar node, sub type count]
     */
    Dispatch: [string, number][],
    /**
     * [renamed node, forward to node]
     */
    Forward: [string, string][],
};
export const Statistics = function (grammar: NonTerminatedRule[], notForwards: GeneratedRule[]): StatisticsResult {
    const log = function (...args: any[]) {};
    log('-------------------------');
    log('non-terminated rule count', grammar.length);
    const clsCounter: Record<string, number> = {};
    for (const r of grammar) {
        const cls = r[0];
        if (!(r[0] in clsCounter)) {
            clsCounter[cls] = 0;
        }
        ++clsCounter[cls];
    }

    log('-------------------------');
    log('dispatch function analyze');

    const dispatchDetails: [string, number][] = [];
    let dispatchFuncCount = 0;
    for (const k in clsCounter) {
        if (clsCounter[k] > 1) {
            log(`${k} should has dispatch function`);
            ++dispatchFuncCount;
            dispatchDetails.push([k, clsCounter[k]]);
        }
    }
    log('dispatch function count', dispatchFuncCount);

    log('-------------------------');
    log('forward function analyze');

    let forwardFuncCount = 0;
    const forwardDetails: [string, string][] = [];
    for (const pair of Rename(grammar)) {
        const renamedRule = pair[0];
        const raw = pair[1];
        if (notForwards.find(x => x[0] == raw[0] && ArrayEqual(x[1], raw[1])) != undefined) {
            continue;
        } 
        const sr = Simplify(renamedRule);
        if (sr[1].length == 1) {
            log(`${SerializeRule(renamedRule)} should has forward function`);
            ++forwardFuncCount;
            forwardDetails.push([sr[0], sr[1][0]]);
        }
    }
    log('forward function count', forwardFuncCount);
    return { Dispatch: dispatchDetails, Forward: forwardDetails, };
};

const RenameNode = function (node: string): string {
    if (node == 'object') { // 这个 rename 要梳理下 TODO
        return 'object_0';
    }
    return node;
};

type ParaType = [string, string][];
type AffectPath = string[];
type ParaTypeWithAffectPath = [ParaType, AffectPath];
const MergePossibleParaTypes = function (paraTypes: ParaTypeWithAffectPath[], paraType: ParaTypeWithAffectPath,): ParaTypeWithAffectPath[] {
    const ToKey = function (paraType: ParaType): string {
        let k = '';
        for (const pt of paraType) {
            k += pt[1];
        }
        return k;
    };
    for (const i of paraTypes) {
        if (ToKey(i[0]) == ToKey(paraType[0])) {
            return paraTypes;
        }
    }
    return [...paraTypes, paraType];
};
export const MapFwdDispFuncParaTypesFrom = function (originalParaTypes: Record<string, [string, string][]>, fwdInfo: [string, string][], dispInfo: [string, number][]) {
    const relationGraph: Record<string, string[]> = {};

    for (const i of fwdInfo) {
        const parent = `Eval${capitalizeFirstChar(RenameNode(i[0]))}`;
        const child = `Eval${capitalizeFirstChar(RenameNode(i[1]))}`;
        if (!(child in relationGraph)) {
            relationGraph[child] = [];    
        }
        relationGraph[child].push(parent);
    }
    for (const x of dispInfo) {
        const parent = `Eval${capitalizeFirstChar(RenameNode(x[0]))}`;
        for (let i = 0; i < x[1]; i++) {
            const child = `${parent}_${i}`;
            if (!(child in relationGraph)) {
                relationGraph[child] = [];    
            }
            relationGraph[child].push(parent);
        }
    }

    // child para type will affect parent para type, 
    // because child has implemented, parent wait for child implementation
    const funcParaTypes: Record<string, ParaTypeWithAffectPath[]> = {};
    const Spread = function (srcFunc: string, paraType: ParaType, history: string[], affectPath: AffectPath) {
        if (history.includes(srcFunc)) { //防止成环重复找
            // log('srcfunc', srcFunc, 'already be spread');
            return;
        }
        if (srcFunc in relationGraph) {
            // log('spread', srcFunc);
            const parents = relationGraph[srcFunc];
            history.push(srcFunc);// 每次 spread 所有递归、迭代的历史是共享的，所以用 push，而不是重新构建一个数组
            for (const i of parents) {
                if (!(i in funcParaTypes)) {
                    funcParaTypes[i] = [];
                }
                // log('left', i, funcParaTypes[i].length, 'right', srcFunc, possibleParaType.length);
                funcParaTypes[i] = MergePossibleParaTypes(funcParaTypes[i], [paraType, affectPath]);// funcParaTypes[i] 里面可能有重复
                // below pass paraType not funcParaTypes[i], because this spread action is caused by the srcFunc in originalParaTypes
                // so only pass its type
                Spread(i, paraType, history, [...affectPath, srcFunc]);
            }
        }
    };
    for (const srcFunc in originalParaTypes) {
        // 最终的源头是这里的 srcFunc，对所影响的所有节点都是一样的影响，所以每次这里的 history 是从零开始
        // log('spread from original src', srcFunc);
        Spread(srcFunc, originalParaTypes[srcFunc], [], []);
    }

    // log('all para types', stringify(funcParaTypes));
    for (const k in funcParaTypes) {
        if (funcParaTypes[k].length > 1) {
            const i = funcParaTypes[k];
            log(k, i, 'possible para type is not 1');// add affect path
        }
    }

    // validate the para type
};