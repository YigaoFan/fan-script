import { Channel } from './Channel';
import { grammar } from './LangSpec/GrammarMap';
import { test, } from './LangSpec/Test/TestSuite';
import { or, translate } from './LangSpec/Translator';
import { GenDispatchFunc, GenDispatchFuncs, GenNodeType } from './NodeTypeGenerator/CodeGen';
import { log } from './util';

const __main = function() {
    // var c = new Channel<number>();
    // var p = c.GetValue();
    // c.PutValue(1);
    // test();
    GenNodeType('NodeDef.ts', grammar.nonTerminated);
    // GenDispatchFuncs('EvalDispatch.ts',[
    //     ['Items', 2, [['env', 'Env'], ['retCont', 'OnlyReturnCont']]],
    //     ['Pairs', 2, [['env', 'Env'], ['retCont', 'OnlyReturnCont']]],
    //     ['Stmt', 6, [['env', 'Env'], ['nextStepCont', 'OnlyNextStepCont'], ['otherConts', 'Continuations']]],
    //     ['VarStmt', 2, [['env', 'Env'], ['nextStepCont', 'OnlyNextStepCont'], ['otherConts', 'Continuations']]],
    // ]);
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