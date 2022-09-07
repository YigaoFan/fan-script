import { assert } from 'console';
import { readFileSync } from 'fs';
import path = require('path');
import { AsyncStringStream } from '../../AsyncStringStream';
import { htmlLogger } from '../../IParser';
import { GenerateParserInputTable } from '../../ParserInputTable';
import { SignalStringStream } from '../../SignalStringStream';
import { StringStream } from '../../StringStream';
import { log } from '../../util';
// import { classs } from '../Class';
// import { func } from '../Func';
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
    var c = readCodeFrom(path.resolve(__dirname, 'CodeSample/class.fs'));
    var s = StringStream.New(c, 'class.fs');
    GenerateParserInputTable('parser-input.html', s.Copy());
    try {
        // var o = classs.parse(s);
    } finally {
        htmlLogger.Close();
    }
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
};

const testStmt = () => {
    const stmt = 'stmt';
    testUnit(stmt,'return a;');
    testUnit(stmt, 'return a.b.c;');
    testUnit(stmt, 'return a().b.c;');
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
    {
        const s = 'func f (a,){return a;}';
        const ss = StringStream.New(s, 'func.fs');
        GenerateParserInputTable('parser-input.html', ss.Copy());
        const p = new ChartParser(fun);
        const r = p.parse(ss);
        // log('parse result', r);
        assert(r != null);
    }

    // {
    //     const s = 'func f(a, b,) { }';
    //     const ss = StringStream.New(s, 'func.fs');
    //     const r = func.parse(ss);
    //     assert(r !== null);
    // }

    // {
    //     const s = 'func f(a1, a2) { }';
    //     const ss = StringStream.New(s, 'func.fs');
    //     const r = func.parse(ss);
    //     assert(r !== null);
    // }

    // {
    //     const s = 'func f(a1, a2){ }';
    //     const ss = StringStream.New(s, 'func.fs');
    //     const r = func.parse(ss);
    //     assert(r !== null);
    // }

    // {
    //     const s = 'func f(a1, a2){}';
    //     const ss = StringStream.New(s, 'func.fs');
    //     const r = func.parse(ss);
    //     assert(r !== null);
    // }

    // {
    //     const s = 'func f(a1, a2){ return a1 + a2; }';
    //     const ss = StringStream.New(s, 'func.fs');
    //     GenerateParserInputTable('parser-input.html', ss.Copy());
    //     try {
    //         const r = func.parse(ss);
    //         assert(r !== null);
    //     } finally {
    //         htmlLogger.Close();
    //     }    
    // }

    // {
    //     const s = 'func f(a1, a2, a3){ return a1 + a2 +a3; }';
    //     const ss = StringStream.New(s, 'func.fs');
    //     GenerateParserInputTable('parser-input.html', ss.Copy());
    //     try {
    //         const r = func.parse(ss);
    //         assert(r !== null);
    //     } finally {
    //         htmlLogger.Close();
    //     }    
    // }

    // {
    //     const s = 'func f(a1, a2, a3){ return a1 ? a2 :a3; }';
    //     const ss = StringStream.New(s, 'func.fs');
    //     GenerateParserInputTable('parser-input.html', ss.Copy());
    //     try {
    //         const r = func.parse(ss);
    //         assert(r !== null);
    //     } finally {
    //         htmlLogger.Close();
    //     }    
    // }

    {
        // const s = 'func f(a1, a2, a3){ return a1.pro[a2][a3]; }'; // 目前 return 里的 exp 不支持这种复杂的 exp
        // const ss = StringStream.New(s, 'func.fs');
        // GenerateParserInputTable('parser-input.html', ss.Copy());
        // try {
        //     const r = func.parse(ss);
        //     assert(r !== null);
        // } finally {
        //     htmlLogger.Close();
        // }    
    }

    {
        // const s = 'func f(a1, a2, a3){ var v; v = a1.pro[a2][a3](); return v; }';
        // const ss = StringStream.New(s, 'func.fs');
        // GenerateParserInputTable('parser-input.html', ss.Copy());
        // try {
        //     const r = func.parse(ss);
        //     assert(r !== null);
        // } finally {
        //     htmlLogger.Close();
        // }
    }
};

export const test = function() {
    // Error.stackTraceLimit = Infinity;
    // testClass();
    // testIdentifier();
    // testParas();
    // testFunc();
    // testExp();
    testStmt();
};
// 可能要实现受损区域分割，比如一个函数的右大括号没写，但不能影响别的函数的补全
