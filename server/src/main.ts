import { Channel } from './Channel';
import { ArithOperator, Calculate } from './Interpreter/ArithEval';
import { Grammar, } from './LangSpec/GrammarMap';
import { test, } from './LangSpec/Test/TestSuite';
import { or, translate } from './LangSpec/Translator';
import { GenDispatchFuncs, GenForwardFuncs, GenNodeType, Statistics } from './NodeTypeGenerator/CodeGen';
import { capitalizeFirstChar, log } from './util';

const __main = function() {
    // var c = new Channel<number>();
    // var p = c.GetValue();
    // c.PutValue(1);
    // test();
    // log(Calculate([ArithOperator.Add, ArithOperator.Minus, ArithOperator.Multiply, ArithOperator.Divide], [1, 2, 3, 4, 5]));
    // GenNodeType('NodeDef.ts', Grammar.nonTerminated);
    const reuslt = Statistics(Grammar.nonTerminated);
    // 加入相关 import，然后有些不能生成
    var d = [
        ['Items', 2, [['env', 'Env'], ['retCont', 'OnlyReturnCont']]],
        ['Pairs', 2, [['env', 'Env'], ['retCont', 'OnlyReturnCont']]],
        ['Stmt', 6, [['env', 'Env'], ['nextStepCont', 'OnlyNextStepCont'], ['otherConts', 'Continuations']]],
        ['VarStmt', 2, [['env', 'Env'], ['nextStepCont', 'OnlyNextStepCont'], ['otherConts', 'Continuations']]],
        ['Exp', 10, [['env', 'Env'], ['returnCont', 'OnlyReturnCont']]],
        ['Literal', 6, [['env', 'Env'], ['returnCont', 'OnlyReturnCont']]],
    ];
    GenDispatchFuncs('EvalDispatch.ts', reuslt.Dispatch.map(x => [capitalizeFirstChar(x[0]), x[1], [['env', 'Env'], ['retCont', 'OnlyReturnCont']]]));
    var f = {
        cls: [['env', 'Env'], ['nextStepCont', 'OnlyNextStepCont']],
        stmt: [['env', 'Env'], ['nextStepCont', 'OnlyNextStepCont'], ['otherConts', 'Continuations']],
        block: [['env', 'Env'], ['blockConts', 'OnlyBlockEndCont'], ['stmtCtrlFlowConts', 'Continuations']]
    };

    GenForwardFuncs('EvalForward.ts', reuslt.Forward.map(x => [capitalizeFirstChar(x[0]), x[1], [['env', 'Env'], ['retCont', 'OnlyReturnCont']]]));
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