import { assert } from 'console';
import { Text } from '../IParser';
import { ISyntaxNode } from '../ISyntaxNode';
import { Block, Exp, Exp_0, ForStmt, Fun, Funcs_0, Paras, Paras_0, Paras_1, Stmt, Stmts, Stmts_0, Stmts_1, Stmt_0, } from '../LangSpec/NodeDef';
import { Env, Value, } from './Env';

const EvalRule = [
    // Select(1),
    // Select(1, 2).Then(Select(3)),
];
const debug = console.log.bind(console);

interface IEvalResult {

}
type continuationTypes = 'return' | 'nextStep';

// type Continuations = {
//     [t in continuationTypes]?: (...args: any[]) => void;
// };

type OnlyReturnCont = {
    return: (...args: any[]) => void;
};
type OnlyNextStepCont = {
    nextStep: (env: Env) => void; // last step have effect on next step env
};
type OnlyBlockEndCont = {
    blockEnd: () => void;
};
type Continuations = {
    // 下面这个？是不是用得有问题，我想的效果存在即有值，不是会存在 undefined 的情况
    return?: (...args: any[]) => void; // 这里的参数要不要有 cont？ TODO check，应该只要返回值吧，写到了就知道了
    nextStep?: (env: Env) => void;
    break?: (conts: OnlyReturnCont) => void; // but break or forStmt doesn't have effect on next step's env, so break is not same as nextStep
    continue?: () => void;
    blockEnd?: () => void;
};
const Eval = function (node: ISyntaxNode | Text, env: Env, continuations: Continuations): void {

};
// 下面这些方法都作为名为 Eval 的方法绑定到相应的 node 节点上
// 所以最终是可以写一个 Eval(ISyntaxNode) 的方法
// Eval 还应该有个 Env 的参数
// 要确定哪些语句可以定义变量，从而对环境产生影响，那它的后续步骤就要开放接口让上一步传环境进来
// 同理，上一步对下一步（时间上的，比如 apply function 对 eval 里面的 stmts 在控制流上有影响）在控制流上有影响
// 就要在 Continuations 里传，否则不用传
const EvalStmt = function (stmt: Stmt, env: Env, continuations: Continuations & OnlyNextStepCont) {
    // EvalExp()
    // if (stmt is retStmt) {
    //     continuations.return();
    // }
};

// 外面调用时能传入超过 OnlyNextStepCont 接口规定的对象吗？
const EvalFunc = function (func: Fun, env: Env, continuations: OnlyNextStepCont) {
    const n = func.id.toString(); // get function name, maybe toString not fit here TODO
    env.Add(n, { Func: func, Env: env, });
    continuations.nextStep(env);
};
// TODO 暂定为 Exp_0，之后加个 EvalExp，或者想别的方法把 EvalExp 给合成出来
const EvalExp = function (exp: Exp, continuations: Continuations): void {
    
};
// 语法map 里每一个左边的 node 都要有个对应的 eval，可能之后可能自动生成下面这些函数
// 简单的 rule 可以生成，复杂的还是要手写
const EvalForStmt = function (forStmt: ForStmt, env: Env, continuations: OnlyReturnCont & OnlyNextStepCont): void {
    // below it's for grammar check(), should be sorted out from control flow
    // if not exist, it's a eval bug, must be fixed
    assert('nextStep' in continuations, 'nextStep not be passed in continuations');
    assert('return' in continuations, 'return not be passed in continuations');

    const init = forStmt.varStmtOrExpStmt;
    const cond = forStmt.exp;
    const update = forStmt.stmt;
    const block = forStmt.block;
    Eval(init, env, { nextStep: (envAfterInit: Env): void => {
        const EvalIter = (): void => {
            // 下面这个 cond 还不对，因为也要变成 CPS 风格，所以 if 也是在回调里做，所以 Eval 应该就没有返回值了
            // 看要不要统一风格了
            // 当然要，凡是涉及程序里执行的逻辑流都要用 CPS 风格

            Eval(cond, envAfterInit, { return: (condResult: boolean): void => {
                if (condResult) {
                    // 检查下各个 cont 类型是否匹配上面定的
                    // () => void can be passed to (a: int) => void? yes.
                    const forContinue = (): void => {
                        Eval(update, envAfterInit, { nextStep: EvalIter, });
                    };
                    const forBreak = (): void => {
                        continuations.nextStep(env);
                    };
                    Eval(block, envAfterInit, {
                        return: continuations.return,
                        continue: forContinue,
                        break: forBreak,
                        blockEnd: forContinue,
                    });
                } else {
                    continuations.nextStep(env);
                }
            },});
        };
        EvalIter();
    }});
};

/**
 * @param blockConts OnlyBlockEndCont is for Stmts self contintuation,
 * @param stmtCtrlFlowConts conts is for Stmt continuation
 */
const EvalStmts = function (stmts: Stmts, env: Env, blockConts: OnlyBlockEndCont, stmtCtrlFlowConts: Continuations) {
    if (stmts instanceof Stmts_1) {
        EvalStmt(stmts.stmt, env, {
            nextStep: (env) => EvalStmts(stmts.stmts, env, blockConts, stmtCtrlFlowConts),
            ...stmtCtrlFlowConts,
        });
    } else if (stmts instanceof Stmts_0) {
        blockConts.blockEnd();
    } else {
        throw new Error('encounter unknown type in EvalStmts');
    }
    // const TraverseStmts = (i: number, env: Env): void => {
    //     if (i < stmts.length) {
    //         EvalStmt(stmts[i], {
    //             return: continuations.return,
    //             nextStep: (env: Env): void => {
    //                 TraverseStmts(i + 1, env);
    //             },
    //         });
    //     } else {
    //         continuations.blockEnd();
    //     }
    // };
    // TraverseStmts(0, env);
};

// return is a must-have cont
const EvalBlock = function (block: Block, env: Env, blockEndCont: OnlyBlockEndCont, stmtConts: Continuations) {
    return EvalStmts(block.stmts, env, blockEndCont, stmtConts);
};

const EvalParas = function (paras: Paras, args: Value[], env: Env, continuations: OnlyNextStepCont) {
    if (paras instanceof Paras_0) {
        const p = paras.id.toString();// TODO 这里可能不对，不是专门将 id 转为 string 的函数
        env.Add(p, args[0]);
        EvalParas(paras.paras, args.slice(1), env, continuations);
    } else if (paras instanceof Paras_1) {
        continuations.nextStep(env);
    } else {
        throw new Error('encounter unknown type in EvalParas');
    }
};

// Evalxxx 里不要调用具体的 Evalxxx 而是调用 Eval 来自动分派，防止依赖具体类型的子元素
// 感觉上面这个也不一定对
const Apply = function (func: Fun, args: Value[], env: Env, continuations: OnlyReturnCont) {
    const childEnv = env.BornChildEnv();
    // eval each para's name
    const paraNames: string[] = [];
    assert(args.length == paraNames.length, 'passed args count not same as function para count');
    EvalParas(func.paras, args, env, { nextStep: (env) => {
        const defaultReturnValue = undefined;
        EvalBlock(func.block, childEnv, { blockEnd: () => continuations.return(defaultReturnValue), }, { return: continuations.return, });    
    }});
};