import { NonTerminatedRule } from "../LangSpec/GrammarMap";
import * as ts from 'typescript';
import { GeneratedRule, toString, } from "../LangSpec/Translator";
import { capitalizeFirstChar, log, stringify } from "../util";
import { assert } from "console";

const f = ts.factory;

// 说一下这些 参数里的字符串 大小写情况
// Grammar(指GrammarMap里那个变量) 里都是小写驼峰，因为 translate 的原因，中间可能夹杂.
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
 * Rename to make left node in grammar rule uniquely
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

const SerializeRule = function (rule: NonTerminatedRule) {
    return stringify([rule[0], rule[1].map(x => toString(x))]);
};

const RuleNode2ClsName = function (node: string) {
    const parts = node.split('.'); // due to translate
    let clsName = parts.map(capitalizeFirstChar).join('');
    if (clsName == 'Object') { // conflict with ES Object type
        clsName = 'Object_0';
    }
    return clsName;
};

/**
 * mainly remove dot in node
 */
const RuleNode2PropertyName = function (node: string) {
    if (node.trim() == '.') {
        return node;
    }
    const parts = node.split('.'); // due to translate
    const capitalizedParts = parts.map(capitalizeFirstChar);
    capitalizedParts[0] = parts[0]; // small camel
    let name = capitalizedParts.join('');
    // if (name == 'Object') { // conflict with ES Object type
    //     name = 'Object_0';
    // }
    return name;
};

const RuleToKey = (rule: NonTerminatedRule): string => {
    let k = rule[0];
    for (const i of rule[1]) {
        k += i;
    }
    return k;
};
export { RuleToKey };

/**
 * [imports, exports, def]
 */
type GenReuslt = [string[], string[], string];

export const GenNodeType = function (grammar: NonTerminatedRule[]): GenReuslt {
    const exports: string[] = [];
    const imports: string[] = [];// 因为这里已经 hardcode 了,所以暂时不用这项
    const defs: string[] = [];

    const classGens: Record<string, ((print: (node: ts.Node) => void, clsNamePostfix: string, allTypeSet: Record<string, string>)=> string)[]> = {};
    const propertyTypes: Record<string, string> = {
        id: 'Identifier',
        prefixOperator: 'PrefixOperator',
        infixOperator: 'InfixOperator',
        string: 'String',
        number: 'Number',
    };
    const rule2FinalClsNameMap: Record<string, string> = {};
    
    const publicKeyword = f.createModifier(ts.SyntaxKind.PublicKeyword);
    const exportKeyword = f.createModifier(ts.SyntaxKind.ExportKeyword);
    const constKeyword = f.createModifier(ts.SyntaxKind.ConstKeyword);
    const CreatePara = function (name: string, type: string) {
        const t = f.createTypeReferenceNode(type);
        const para = f.createParameterDeclaration(undefined, undefined, undefined, name, undefined, t, undefined);
        return para;
    };

    for (const rule of grammar) {
        const memberGens: Record<string, ((print: (node: ts.ClassElement) => void, getterNamePostfix: string, propertyTypes: Record<string, string>) => void)[]> = {};
        // add constructor
        memberGens['constructor'] = [print => {
            const parasInfo: [string, string][] = [
                ['rule', 'NonTerminatedRule'],
                ['type', 'string[]'],
                ['children', '(ISyntaxNode | Text)[]']
            ];
            const args = parasInfo.map(x => f.createIdentifier(x[0]));
            const callBaseCons = f.createExpressionStatement(f.createCallExpression(f.createSuper(), undefined, args));
            const block = f.createBlock([callBaseCons], false);
            const paras = parasInfo.map(x => CreatePara(...x));
            const cons = f.createConstructorDeclaration(undefined, [publicKeyword,], paras, block);
            print(cons);
        }];
        // handle unit in rule
        for (let i = 0; i < rule[1].length; i++) {
            const u = rule[1][i];
            const name = RuleNode2PropertyName(u);
            // log('before', u, 'after', name);
            if (!Filter(name)) {
                continue;
            }
            if (!(name in memberGens)) {
                memberGens[name] = [];
            }
            
            memberGens[name].push((print: (node: ts.ClassElement) => void, postfix: string, propertyTypes: Record<string, string>) => {
                const child = f.createPropertyAccessExpression(f.createThis(), 'Children');
                const item = f.createElementAccessExpression(child, i);

                let expInRetStmt: ts.Expression = item;
                if (name in propertyTypes) {
                    const destType = f.createTypeReferenceNode(propertyTypes[name]);
                    expInRetStmt = f.createAsExpression(item, destType);
                }
                const ret = f.createReturnStatement(expInRetStmt);
                const b = f.createBlock([ret], false);
                print(f.createGetAccessorDeclaration(undefined, [publicKeyword,], name + postfix, [], undefined, b));
            });
        }

        // handle this class generate
        const b = f.createExpressionWithTypeArguments(f.createIdentifier('UniversalNode'), undefined);
        const ext = f.createHeritageClause(ts.SyntaxKind.ExtendsKeyword, [b]);
        let clsName = RuleNode2ClsName(rule[0]);
        if (!(clsName in classGens)) {
            classGens[clsName] = [];
        }
        propertyTypes[RuleNode2PropertyName(rule[0])] = clsName;
        classGens[clsName].push((print: (node: ts.Node)=> void, clsNamePostfix: string, allTypeSet: Record<string, string>) => {
            const r = f.createIdentifier('grammarRule');
            const ruleTag = f.createJSDocClassTag(r, SerializeRule(rule));
            const comment = f.createJSDocComment('', [ruleTag]);
            print(comment);
            const finalClsName = clsName + clsNamePostfix;
            rule2FinalClsNameMap[RuleToKey(rule)] = finalClsName;

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
            const cls = f.createClassExpression(undefined, [exportKeyword,], finalClsName, undefined, [ext], members);
            print(cls);
            return finalClsName;
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
        const nb = f.createNamedImports([
            f.createImportSpecifier(false, undefined, f.createIdentifier(importType)),
        ]);
        const imC = f.createImportClause(false, undefined, nb);
        const ms = f.createStringLiteral(path);
        const imD = f.createImportDeclaration(undefined, undefined, imC, ms, undefined);
        return imD;
    };
    print(CreateImport('UniversalNode', './UniversalNodeFactory'));
    print(CreateImport('PrefixOperator', './Expression'));
    print(CreateImport('InfixOperator', './Expression'));
    print(CreateImport('Identifier', './Identifier'));
    print(CreateImport('String', './String'));
    print(CreateImport('Number', './Number'));
    // below is used for constructor
    print(CreateImport('ISyntaxNode', '../ISyntaxNode'));
    print(CreateImport('Text', '../IParser'));
    print(CreateImport('NonTerminatedRule', './GrammarMap'));
    // log('type set', typeMap);
    for (const name in classGens) {
        const subClasses = classGens[name];
        assert(subClasses.length != 0, 'subclasses has no items');
        if (subClasses.length == 1) {
            subClasses[0](print, '', propertyTypes);
            exports.push(name);
        } else {
            const subTypeNames: string[] = [];
            for (let i = 0; i < subClasses.length; i++) {
                const clsGen = subClasses[i];
                const subClsName = clsGen(print, `_${i}`, propertyTypes);
                subTypeNames.push(subClsName);
                exports.push(subClsName);
            }
            // create union type to alias type which has multiple sub types
            const u = f.createUnionTypeNode(subTypeNames.map(x => f.createTypeReferenceNode(x)));
            const m = f.createModifier(ts.SyntaxKind.ExportKeyword);
            const unionTypeName = capitalizeFirstChar(name);
            const unionType = f.createTypeAliasDeclaration(undefined, [m], unionTypeName, undefined, u);
            print(unionType);
            exports.push(unionTypeName);
        }
    }
    
    const RuleToFactory = function (rule: NonTerminatedRule) {
        const paraInfo: [string, string][] = [
            ['rule', 'NonTerminatedRule'],
            ['type', 'string[]'],
            ['nodes', '(ISyntaxNode | Text)[]'],
        ];
        return f.createArrowFunction(undefined, undefined, 
            paraInfo.map(x => CreatePara(...x)), undefined, undefined,
            f.createNewExpression(f.createIdentifier(rule2FinalClsNameMap[RuleToKey(rule)]), undefined, paraInfo.map(x => f.createIdentifier(x[0]))));
    };
    const nodeFactories = 'NodeFactories';
    const properties = grammar.map(x => f.createPropertyAssignment(f.createStringLiteral(RuleToKey(x)), RuleToFactory(x)));
    const objLit = f.createObjectLiteralExpression(properties, true);
    // default has a var keyword, maybe a bug, so cannot use const keyword
    const varAssign = f.createVariableStatement([exportKeyword, /*constKeyword,*/], 
        [f.createVariableDeclaration(nodeFactories,
                                     undefined, 
                                     // Record<string, (rule: NonTerminatedRule, type: string[], nodes: (ISyntaxNode | Text)[]) => UniversalNode>
                                     f.createTypeReferenceNode('Record', [
                                        f.createTypeReferenceNode('string'), 
                                        f.createFunctionTypeNode(undefined, 
                                            ([
                                                ['rule', 'NonTerminatedRule'], 
                                                ['type', 'string[]'], 
                                                ['nodes', '(ISyntaxNode | Text)[]']
                                            ] as [string, string][]).map(x => CreatePara(...x)), f.createTypeReferenceNode('UniversalNode'))]), 
                                     objLit)]);
    exports.push(nodeFactories);
    print(varAssign);

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
    // log('after removed', imports);
    return imports;
};

export const GenDispatchFuncs = function (dispatchInfo: [string, number][], funcParaTypes: Record<string, ParaType>): GenReuslt {
    const imports = new Set<string>();
    const exports: string[] = [];
    const defs: string[] = [];

    for (const x of dispatchInfo) {
        const f = GenDispatchFunc(RuleNode2ClsName(x[0]), x[1], funcParaTypes, imports);
        exports.push(f[0]);
        defs.push(f[1]);
    }

    return [RemoveImportsFromExports(Array.from(imports), exports), exports, defs.join('\n')];
};

const GenDispatchFunc = function (baseTypeName: string, subTypeCount: number, funcParaTypes: Record<string, ParaType>, imports: Set<string>): [string, string] {
    const base = baseTypeName;
    assert(subTypeCount > 1, 'dispatch need two sub types at least');
    const subTypeNames = Array.from(Array(subTypeCount)).map((_, i) => `${base}_${i}`);
    const funcName = `Eval${base}`;
    const GenDispatchItem = (subType: string) => {
        const name = `Eval${subType}`;
        const paras = GetParaTypeFrom(funcParaTypes, name);
        imports.add(name);
        return `if (obj instanceof ${subType}) {
        ${name}(obj,${paras.map(x => ` ${x[0]},`).join('')}); 
    }`;
    };
    imports.add(base);
    for (const x of subTypeNames) {
        imports.add(x);        
    }
    const baseFuncParas = GetParaTypeFrom(funcParaTypes, funcName);
    for (const x of baseFuncParas) {
        imports.add(x[1]);
    }
    const def = `export const ${funcName} = function (obj: ${base},${baseFuncParas.map(x => ` ${x[0]}: ${x[1]},`).join('')}) {
    ${GenDispatchItem(subTypeNames[0])}${subTypeNames.slice(1).map(x => ` else ${GenDispatchItem(x)}`).join('')} else {
        throw new Error('encounter unknown type in ${funcName}');
    }
};`;
    return [funcName, def];
};

const GetParaTypeFrom = function (funcParaTypes: Record<string, ParaType>, funcName: string): ParaType {
    const pt = funcParaTypes[funcName];
    if (pt != undefined) {
        return pt;
    }
    throw new Error(`warn: para type of ${funcName} not found`);
};
export const GenForwardFuncs = function (fwdRulesInfo: [string, string][], funcParaTypes: Record<string, ParaType>): GenReuslt {
    const imports = new Set<string>();
    const exports: string[] = [];
    const defs: string[] = [];

    const Write = function (funcDef: string) {
        defs.push(funcDef);
    };
    const Gen = function (clsName: string, paras: [string, string][], property: string) {
        imports.add(clsName);
        paras.forEach(x => imports.add(x[1]));

        let forwardFunc = `Eval${RuleNode2ClsName(property)}`;
        imports.add(forwardFunc);
        return `export const Eval${clsName} = function (obj: ${clsName},${paras.map(x => ` ${x[0]}: ${x[1]},`).join('')}) {
    return ${forwardFunc}(obj.${property},${paras.map(x => ` ${x[0]},`).join('')});
};`;
    };
    for (const r of fwdRulesInfo) {
        let clsName = RuleNode2ClsName(r[0]);
        // log('clsname', clsName);
        const funcName = `Eval${clsName}`;
        const property = r[1];
        const paras = GetParaTypeFrom(funcParaTypes, funcName);
        const def = Gen(clsName, paras, property);
        exports.push(funcName);
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
/**
 * @returns StatisticsResult.Dispatch's string is same as Grammar-small camel with dot
 * StatisticsResult.Forward's string is same as Grammar-small camel with dot and renamed
 */
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
type SpreadPath = string[];
type ParaTypeWithSpreadPath = [ParaType, SpreadPath];
const MergePossibleParaTypes = function (paraTypes: ParaTypeWithSpreadPath[], paraType: ParaTypeWithSpreadPath,): ParaTypeWithSpreadPath[] {
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

/**
 * @returns dispatch, forward and orginial para types, key is function name: Eval${RuleNode2ClsName}
 */
export const MapFwdDispFuncParaTypesFrom = function (originalParaTypes: Record<string, [string, string][]>, fwdInfo: [string, string][], dispInfo: [string, number][]) {
    const relationGraph: Record<string, string[]> = {};

    for (const i of fwdInfo) {
        const parent = `Eval${RuleNode2ClsName(i[0])}`;
        const child = `Eval${RuleNode2ClsName(i[1])}`;
        if (!(child in relationGraph)) {
            relationGraph[child] = [];    
        }
        relationGraph[child].push(parent);
    }
    for (const x of dispInfo) {
        const parent = `Eval${RuleNode2ClsName(x[0])}`;
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
    const funcParaTypes: Record<string, ParaTypeWithSpreadPath[]> = {};
    const Spread = function (srcFunc: string, paraType: ParaType, history: string[], previousSpreadPath: SpreadPath) {
        if (history.includes(srcFunc)) { //防止成环重复找
            // log('srcfunc', srcFunc, 'already be spread');
            return;
        }
        if (srcFunc in relationGraph) {
            // log('spread', srcFunc);
            const parents = relationGraph[srcFunc];
            history.push(srcFunc);// 每次 spread 所有递归、迭代的历史是共享的，所以用 push，而不是重新构建一个数组
            const currentSpreadPath = [...previousSpreadPath, srcFunc];
            for (const i of parents) {
                if (!(i in funcParaTypes)) {
                    funcParaTypes[i] = [];
                }
                // log('left', i, funcParaTypes[i].length, 'right', srcFunc, possibleParaType.length);
                funcParaTypes[i] = MergePossibleParaTypes(funcParaTypes[i], [paraType, currentSpreadPath]);// funcParaTypes[i] 里面可能有重复
                // below pass paraType not funcParaTypes[i], because this spread action is caused by the srcFunc in originalParaTypes
                // so only pass its type
                Spread(i, paraType, history, currentSpreadPath);
            }
        }
    };
    for (const srcFunc in originalParaTypes) {
        // 最终的源头是这里的 srcFunc，对所影响的所有节点都是一样的影响，所以每次这里的 history 是从零开始
        // log('spread from original src', srcFunc);
        Spread(srcFunc, originalParaTypes[srcFunc], [], []);
    }

    // log('all para types', stringify(funcParaTypes));
    // validate the para type
    let valid = true;
    for (const k in funcParaTypes) {
        if (funcParaTypes[k].length > 1) {
            valid = false;
            const i = funcParaTypes[k];
            log(k, stringify(i), 'possible para type is not 1');// add affect path
        }
    }

    if (!valid) {
        throw new Error('invalid deduced func para type');
    }

    const validFuncParaTypes: Record<string, ParaType> = {};
    for (const k in funcParaTypes) {
        validFuncParaTypes[k] = funcParaTypes[k][0][0];
    }
    for (const k in originalParaTypes) {
        validFuncParaTypes[k] = originalParaTypes[k];
    }
    
    return validFuncParaTypes;
};