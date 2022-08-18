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
import { ExpressionChartParser } from '../ExpressionChartParser';

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

const testIdentifier = async () => {
    {
        const s = 'a';// id parser 还没 parse 完，mapparser 就退出了
        const ss = AsyncStringStream.New(s, 'func.fs');
        const sss = SignalStringStream.New(ss);
        const pr = identifier.asyncParse(sss);
        sss.Signal();
        sss.Signal();
        await pr.then((r) => {
            log('check id a');
            assert(r != null);
            assert(r!.Result.Value === 'a');
        }, (r) => log('faild', r));        
    }

    // {
    //     const s = StringStream.New('a', 'id.fs');
    //     const r = identifier.parse(s);
    //     assert(r !== null);
    //     assert(r!.Result.Value === 'a');
    // }

    // {
    //     const s = StringStream.New('a1abc', 'id.fs');
    //     const r = identifier.parse(s);
    //     assert(r !== null);
    //     assert(r!.Result.Value === 'a1abc');
    // }

    // {
    //     const s = StringStream.New('_', 'id.fs');
    //     const r = identifier.parse(s);
    //     assert(r !== null);
    //     assert(r!.Result.Value === '_');
    // }

    // {
    //     const s = StringStream.New('_1', 'id.fs');
    //     const r = identifier.parse(s);
    //     assert(r !== null);
    //     assert(r!.Result.Value === '_1');
    // }
};

const testNumber = () => {
    // TODO
};

const testFunc = () => {
    // {
    //     const s = 'func f() { }';
    //     const ss = StringStream.New(s, 'func.fs');
    //     const r = func.parse(ss);
    //     assert(r !== null);
    // }

    // {
    //     const s = 'func f(a, b) { }';
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

const testExp = async () => {
    // 目前还不支持加空格
    {
        // id
        const s = 'a';// id parser 还没 parse 完，mapparser 就退出了
        const ss = StringStream.New(s, 'func.fs');
        const p = new ExpressionChartParser(';');
        const r = p.parse(ss);
        log('parse result', r);
        assert(r != null);
    }
    // {
    //     // string
    //     const s = '"abc"';
    //     const ss = StringStream.New(s, 'func.fs');
    //     const p = new ExpressionChartParser(';');
    //     const r = p.parse(ss);
    //     assert(r != null);
    // }
};

export const test = function() {
    // Error.stackTraceLimit = Infinity;
    // testClass();
    // await testIdentifier();
    // testFunc();
    // htmlLogger.Close();
    testExp();
};
// 可能要实现受损区域分割，比如一个函数的右大括号没写，但不能影响别的函数的补全
