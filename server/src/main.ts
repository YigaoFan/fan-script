import { Channel } from './Channel';
import { ArithOperator, Calculate } from './Interpreter/ArithEval';
import { ExportsOfEvalRule, ParaTypeOfEvalRule } from './Interpreter/EvalRule';
import { Grammar, } from './LangSpec/GrammarMap';
import { test, } from './LangSpec/Test/TestSuite';
import { or, translate } from './LangSpec/Translator';
import { GenDispatchFuncs, GenForwardFuncs, GenNodeType, MapFwdDispFuncParaTypesFrom, Statistics } from './NodeTypeGenerator/CodeGen';
import { File } from './NodeTypeGenerator/File';
import { capitalizeFirstChar, log } from './util';

const __main = function() {
    // var c = new Channel<number>();
    // var p = c.GetValue();
    // c.PutValue(1);
    // test();
    // log(Calculate([ArithOperator.Add, ArithOperator.Minus, ArithOperator.Multiply, ArithOperator.Divide], [1, 2, 3, 4, 5]));
    const exports: Record<string, string> = {
        // class name -> file path
        
    };
    const nodeDef = File.New('NodeDef.ts'); // ../LangSpec/NodeDef
    nodeDef.AddDefinition(...GenNodeType(Grammar.nonTerminated));
    const reuslt = Statistics(Grammar.nonTerminated, [['boolean', ['true']], ['boolean', ['false']]]);
    // 加入相关 import
    // var d = [
    //     ['Items', 2, [['env', 'Env'], ['retCont', 'OnlyReturnCont']]],
    //     ['Pairs', 2, [['env', 'Env'], ['retCont', 'OnlyReturnCont']]],
    //     ['Stmt', 6, [['env', 'Env'], ['nextStepCont', 'OnlyNextStepCont'], ['otherConts', 'Continuations']]],
    //     ['VarStmt', 2, [['env', 'Env'], ['nextStepCont', 'OnlyNextStepCont'], ['otherConts', 'Continuations']]],
    //     ['Exp', 10, [['env', 'Env'], ['returnCont', 'OnlyReturnCont']]],
    //     ['Literal', 6, [['env', 'Env'], ['returnCont', 'OnlyReturnCont']]],
    // ];
    // const evalDisp = File.New('./EvalDispatch.ts');
    // evalDisp.AddDefinition(...GenDispatchFuncs(reuslt.Dispatch.map(x => [capitalizeFirstChar(x[0]), x[1], [['env', 'Env'], ['retCont', 'OnlyReturnCont']]])));
    // var f = {
    //     cls: [['env', 'Env'], ['nextStepCont', 'OnlyNextStepCont']],
    //     stmt: [['env', 'Env'], ['nextStepCont', 'OnlyNextStepCont'], ['otherConts', 'Continuations']],
    //     block: [['env', 'Env'], ['blockConts', 'OnlyBlockEndCont'], ['stmtCtrlFlowConts', 'Continuations']]
    // };
    
    // const evalFwd = File.New('./EvalForward.ts');
    // evalFwd.AddDefinition(...GenForwardFuncs(reuslt.Forward.map(x => [capitalizeFirstChar(x[0]), x[1], [['env', 'Env'], ['retCont', 'OnlyReturnCont']]])));
    // const env: [string, string[]] = ['./Env', ["Env"]];
    // const evalRule: [string, string[]] = ['./EvalRule', ExportsOfEvalRule];
    // evalDisp.CompleteImportsFrom(nodeDef.Exports, evalFwd.Exports, env, evalRule);
    // evalFwd.CompleteImportsFrom(nodeDef.Exports, evalDisp.Exports, env, evalRule);
    MapFwdDispFuncParaTypesFrom(ParaTypeOfEvalRule, reuslt.Forward, reuslt.Dispatch);
    // log('node def exports', nodeDef.Exports);
    // nodeDef.SaveToDisk(); // ../LangSpec/NodeDef,算下引用路径
    // evalDisp.SaveToDisk();
    // evalFwd.SaveToDisk();
    // TODO import路径和参数类型问题
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