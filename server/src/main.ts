import { Channel } from './Channel';
import { ArithOperator, Calculate } from './Interpreter/ArithEval';
import { EvalDoc, ExportsOfEvalRule, ParaTypeOfEvalRule } from './Interpreter/EvalRule';
import { Grammar, Node, } from './LangSpec/GrammarMap';
import { test as testParser, } from './LangSpec/Test/TestSuite';
import { test as testInterpreter, } from './Interpreter/Test/TestSuite';
import { or, translate } from './LangSpec/Translator';
import { GenDispatchFuncs, GenForwardFuncs, GenNodeType, MapFwdDispFuncParaTypesFrom, Statistics } from './NodeTypeGenerator/CodeGen';
import { File } from './NodeTypeGenerator/File';
import { assert, capitalizeFirstChar, log, stringify } from './util';
import { Env } from './Interpreter/Env';
import { Init } from './Interpreter/Init';
import { readFileSync } from 'fs';
import { StringStream } from './StringStream';
import { ChartParser } from './LangSpec/ChartParser';
import { Doc } from './LangSpec/NodeDef';

const __main = function() {
    InterpreterMain();
    // testParser();
    // testInterpreter();

    // log('Grammar', stringify(Grammar.nonTerminated));
    // return;
    // var c = new Channel<number>();
    // var p = c.GetValue();
    // c.PutValue(1);
    // log(Calculate([ArithOperator.Add, ArithOperator.Minus, ArithOperator.Multiply, ArithOperator.Divide], [1, 2, 3, 4, 5]));
    
    // GenCode();
    // EvalRule 里统计下有哪几种参数类型，以此算出 dispatch 和 forward 函数的参数类型
    
    // {
    //     const r = translate(['a', [or('b', 'c'), 'd']]);
    //     log('translate result', r);
    // }
    // {
    //     const r = translate(['a', { main: [or('left', 'right')], left: [or('b', 'c'), 'd']}]);
    //     log('translate result', r);
    // }
};

__main();

function InterpreterMain () {
    const env = Init(new Env());
    if (process.argv.length < 3) {
        console.log('please run with fan-script source file');
        return;
    }
    const readCodeFrom = (path: string) => {
        return readFileSync(path, 'utf-8');
    };
    const AstOf = (root: Node, code: string,) => {
        const p = new ChartParser(root);
        const ss = StringStream.New(code, 'func.fs');
        const ast = p.parse(ss);
        assert(ast != null, 'parse code failed');
        return ast;
    };
    const filename = process.argv[2];
    const code = readCodeFrom(filename); // TODO optimize by using file stream
    const root = 'doc';
    const ast = AstOf(root, code);
    EvalDoc(ast!.Result as Doc, env, {
        return(result) {
            // log('invoke result', result.Value);
            // assert(result.Value == 3);
        },
    });
};

function GenCode() {
    const nodeDef = File.New('./src/LangSpec/NodeDef.ts');
    nodeDef.AddDefinition(...GenNodeType(Grammar.nonTerminated));
    const infoOfGen = Statistics(Grammar.nonTerminated, [
        ['boolean', ['true']],
        ['boolean', ['false']],
        ['refinement', ['.', 'ow', 'id']],
        ['refinement', ['[', 'ow', 'exp', 'ow', ']']],
        ['invocation', ['(', 'ow', 'items', 'ow', ')']],
    ]);
    const funcsParaInfo = MapFwdDispFuncParaTypesFrom(ParaTypeOfEvalRule, infoOfGen.Forward, infoOfGen.Dispatch);
    const evalDisp = File.New('./src/Interpreter/EvalDispatch.ts');
    evalDisp.AddDefinition(...GenDispatchFuncs(infoOfGen.Dispatch, funcsParaInfo));

    const evalFwd = File.New('./src/Interpreter/EvalForward.ts');
    evalFwd.AddDefinition(...GenForwardFuncs(infoOfGen.Forward, funcsParaInfo));
    const env: [string, string[]] = ['./src/Interpreter/Env', ['Env', 'IValueRef', 'EvaledFun', 'Value']];
    const evalRule: [string, string[]] = ['./src/Interpreter/EvalRule', ExportsOfEvalRule];
    // env has a 'Value', nodeDef also has, so make env at first position, then it will be choosen
    // TODO 不行，也有的地方需要 NodeDef 的 Value，
    //然后生成过程构建的时候能不能忽略某些问题，这样没有编译错误
    evalDisp.CompleteImportsFrom(env, nodeDef.Exports, evalFwd.Exports, evalRule);
    evalFwd.CompleteImportsFrom(env, nodeDef.Exports, evalDisp.Exports, evalRule);
    // log('node def exports', nodeDef.Exports);
    nodeDef.SaveToDisk(); // ../LangSpec/NodeDef,算下引用路径
    evalDisp.SaveToDisk();
    evalFwd.SaveToDisk();
}
