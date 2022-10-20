import { assert } from 'console';
import { readFileSync } from 'fs';
import path = require('path');
import { htmlLogger } from '../../IParser';
import { GenerateParserInputTable } from '../../ParserInputTable';
import { StringStream } from '../../StringStream';
import { log } from '../../util';
import { identifier } from '../Identifier';
import { ChartParser } from '../ChartParser';
import { Node } from '../GrammarMap';

const tests: (() => void)[] = [];

export const registerTest = function(test: () => void) {
    tests.push(test);
};

const readCodeFrom = (path: string) => {
    return readFileSync(path, 'utf-8');
};

const testClass = () => {
    const cls = 'cls';
    testUnit(cls, 
    `class Calculator { 
        func Add(a, b,) {
            return a + b;
        }
        func Minus(a, b,) {
            return a - b;
        }
    }`);
};

const testDoc = () => {
    const doc = 'doc';
    testUnit(doc, `
    class Calculator { 
        func Add(a, b,) {
            return a + b;
        }
        func Minus(a, b,) {
            return a - b;
        }
    }`);
};

const testIdentifier = () => {
    const testUnit = (code: string) => {
        const s = StringStream.New(code, 'id.fs');
        const r = identifier.parse(s);
        assert(r !== null);
        assert(r!.Result.Value === code);
    };
    testUnit('a');
    testUnit('a1abc');
    testUnit('_');
    testUnit('_1');
};

const testNumber = () => {
    // TODO
};

const testUnit = (root: Node, code: string) => {
    const ss = StringStream.New(code, 'func.fs');
    const p = new ChartParser(root);
    const r = p.parse(ss);
    // log('parse result', r);
    assert(r != null);
};
const testExp = () => {
    const exp = 'exp';

    testUnit(exp, 'a');
    testUnit(exp, '"abc"');
    
    testUnit(exp, 'a.b');
    testUnit(exp, 'a.b.c');

    testUnit(exp, '[]');
    testUnit(exp, '[a,]');
    testUnit(exp, '[a,b,]');
    testUnit(exp, '[ ]');
    testUnit(exp, '[a, ]');
    testUnit(exp, '[a,b, ]');
    testUnit(exp, '[]');
    testUnit(exp, '[ a,]');
    testUnit(exp, '[ a, b,]');

    testUnit(exp, '{}');
    testUnit(exp, '{ a: b, }');
    testUnit(exp, '{ "a": b, }');
    testUnit(exp, '{ "a": c+d, }');
    testUnit(exp, '{ "a" : c +  d, }');

    testUnit(exp, '(a)');

    testUnit(exp, 'func f(a,) { return a; }');
};

const testStmt = () => {
    const stmt = 'stmt';
    // var statement
    testUnit(stmt, 'var a;');
    testUnit(stmt, 'var a = 1;');
    // return statement
    testUnit(stmt,'return a;');
    testUnit(stmt, 'return a.b.c;');
    testUnit(stmt, 'return a().b.c;');
    testUnit(stmt, 'return a().b().c();');
    testUnit(stmt, 'return [a, b, c,];');
    // expression statement
    testUnit(stmt, 'a = b;');
    testUnit(stmt, 'a += b;');
    testUnit(stmt, 'a -= b;');
    testUnit(stmt, 'a.b();');
    testUnit(stmt, 'a.b().c = d;');
    // delete statement
    testUnit(stmt, 'delete a.b.c;');
    // if statement
    testUnit(stmt, 'if (b) { return a; }');
    testUnit(stmt, 'if (a + b > c) { return a; }');
    testUnit(stmt, 'if (a + b > c) { return a; } else { return c; }');
    // 👆好像解析结果的表格里 termin 部分有些无用没删，non-termin 部分有重复
};

const testParas = () => {
    const paras = 'paras';
    {
        const s = '';
        const ss = StringStream.New(s, 'func.fs');
        GenerateParserInputTable('parser-input.html', ss.Copy());
        const p = new ChartParser(paras);
        const r = p.parse(ss);
        // log('parse result', r);
        assert(r != null);
    }
};

const testFunc = () => {
    const fun = 'fun';
    // 要允许函数可以直接定义，不用非在 stmt 里 TODO
    testUnit(fun, 'func f (){return 1;}');
    testUnit(fun, 'func f (a,){return a;}');
    testUnit(fun, 'func min(a, b,){ if (a < b) { return a; } else { return b; }}');
    testUnit(fun, 'func f(a1, a2, a3,){ return a1 ? a2 :a3; }');
    testUnit(fun, 'func f(a1, a2, a3, ){ return a1.pro[a2][a3]; }');
    testUnit(fun, 'func f(a1, a2, a3, ){ var v; v = a1.pro[a2][a3](); return v; }');
    testUnit(fun, 'func f(a1, a2, a3, ){ return func closure() { return a1 + a2 + a3; }; }');
};

export const test = function() {
    // Error.stackTraceLimit = Infinity;
    testIdentifier();
    testParas();
    testExp();
    testStmt();
    testFunc();
    testClass();
    testDoc();
};
// 可能要实现受损区域分割，比如一个函数的右大括号没写，但不能影响别的函数的补全
