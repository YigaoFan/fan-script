import { assert } from 'console';
import { Text } from '../IParser';
import { ISyntaxNode } from '../ISyntaxNode';
import { Keyword } from '../LangSpec/Expression';
import { Identifier } from '../LangSpec/Identifier';
import { AfterIdInExpStmt, AfterIdInExpStmt_0, AfterIdInExpStmt_1, AfterIdInExpStmt_2, AfterIdInExpStmt_3, AfterIdInExpStmt_4, AfterIdInExpStmt_5, AfterIdInExpStmt_6, Args, Array, Block, Boolean, Cls, Exp, ExpStmt, Exp_0, ForStmt, Fun, Funcs, Funcs_0, Funcs_1, IfStmt, IfStmt_0, IfStmt_1, Invocation, InvocationCircle, InvocationCircle_0, InvocationCircle_1, Items, Items_0, Items_1, Key, Key_0, Key_1, Object_0, Pair, Pairs, Pairs_0, Pairs_1, Paras, Paras_0, Paras_1, Refinement, Refinement_0, Refinement_1, ReturnStmt, Stmt, Stmts, Stmts_0, Stmts_1, Stmt_0, Stmt_1, Stmt_2, Stmt_3, Stmt_4, Stmt_5, VarStmt, VarStmt_0, VarStmt_1, } from '../LangSpec/NodeDef';
import { Number } from '../LangSpec/Number';
import { string, String } from '../LangSpec/String';
import { Arr, Env, EvaledFun as EvaledFunc, Obj, Value, ValueRef, } from './Env';

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

export type OnlyReturnCont = {
    return: (arg: Value) => void;
};
type OnlyNextStepCont = {
    nextStep: (env: Env) => void; // last step have effect on next step env
};
type OnlyBlockEndCont = {
    blockEnd: () => void;
};
type Continuations = {
    // 下面这个？是不是用得有问题，我想的效果存在即有值，不是会存在 undefined 的情况
    return?: (arg: Value) => void; // 这里的参数要不要有 cont？ TODO check，应该只要返回值吧，写到了就知道了
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
/**
 * Like EvalStmts
 * @param nextStepCont in EvalStmt is for stmt logic cont
 * @param otherConts is for other control flow in other specific Stmt
 * 像上面这样写，可以让各个节点功能更明确，如确定 nextStepCont，也开放自由度给 otherConts
 */
// const EvalStmt = function (stmt: Stmt, env: Env, nextStepCont: OnlyNextStepCont, otherConts: Continuations) {
//     // 这种 dispatch 函数是没有必要的
//     if (stmt instanceof Stmt_0) { // return stmt
//         // continuations.return();
//     } else if (stmt instanceof Stmt_1) { // delete stmt

//     } else if (stmt instanceof Stmt_2) { // var stmt

//     } else if (stmt instanceof Stmt_3) { // if stmt
//         EvalIfStmt(stmt.ifStmt, env, nextStepCont, otherConts);
//     } else if (stmt instanceof Stmt_4) { // exp stmt

//     } else if (stmt instanceof Stmt_5) { // for stmt
//         EvalForStmt(stmt.forStmt, env, nextStepCont, otherConts);
//     } else {
//         throw new Error('encounter unknown type in EvalStmt');
//     }
// };

// 外面调用时能传入超过 OnlyNextStepCont 接口规定的对象吗？
const EvalFunc = function (func: Fun, env: Env, conts: OnlyNextStepCont) {
    const n = func.id.toString(); // get function name, maybe toString not fit here TODO
    env.Add(n, { Func: func, Env: env, });
    conts.nextStep(env);
};

/** 
 * exp cannot change control flow, so only pass @param retCont to return value
 */
const EvalExp = function (exp: Exp, env: Env, retCont: OnlyReturnCont): void {
    
};

const EvalString = function (str: String, env: Env, retCont: OnlyReturnCont): void {
    retCont.return(str.Content.Value);
};

const EvalBoolean = function (boolean: Boolean, env: Env, retCont: OnlyReturnCont): void {
    retCont.return((boolean.trueOrFalse as Keyword).Text == 'true');
};

const EvalNumber = function (num: Number, env: Env, retCont: OnlyReturnCont): void {
    retCont.return(num.Value);
};

const EvalKey = function (key: Key, env: Env, retCont: OnlyReturnCont): void {
    if (key instanceof Key_0) {
        EvalString(key.string as String, env, retCont);
    } else if (key instanceof Key_1) {
       retCont.return((key.id as Identifier).Text);
    } else {
        throw new Error('encounter unknown type in EvalKey');
    }
};

const EvalPair = function (pair: Pair, env: Env, retCont: OnlyReturnCont): void {
    EvalKey(pair.key, env, {
        return: (k: Value) => {
            assert(typeof k == 'string', 'return value of EvalKey is not a string');
            const key = k as string;
            EvalExp(pair.value, env, {
                return: (v: Value) => {
                    const evaledPair: Record<typeof key, Value> = {};
                    evaledPair[key] = v;
                    retCont.return(evaledPair);
                },
            },);
        },
    });
};

export const EvalPairs_1 = function (pairs: Pairs_1, env: Env, retCont: OnlyReturnCont): void {
    EvalPair(pairs.pair, env, {
        return: (pair: Value) => {
            assert(typeof pair == 'object', 'return value of EvalPair is not a object');
            const typedPair = pair as Obj;
            EvalPairs(pairs.pairs, env, {
                return: (remainPairs: Value) => {                    
                    assert(typeof remainPairs == 'object', 'return value of EvalPair is not a object');
                    const typedRemainPairs = remainPairs as Obj;
                    retCont.return({ ...typedPair, ...typedRemainPairs, });
                }
            });
        }
    });
};

export const EvalPairs_0 = function (pairs: Pairs_0, env: Env, retCont: OnlyReturnCont): void {
    retCont.return({});
};

// const EvalPairs = function (pairs: Pairs, env: Env, retCont: OnlyReturnCont): void {
//     if (pairs instanceof Pairs_0) {
//         EvalPairs_0(pairs, env, retCont);
//     } else if (pairs instanceof Pairs_1) {
//         EvalPairs_1(pairs, env, retCont);
//     } else {
//         throw new Error('encounter unknown type in EvalPairs');
//     }
// };

const EvalObject = function (obj: Object_0, env: Env, retCont: OnlyReturnCont): void {
    EvalPairs(obj.pairs, env, retCont);
};

export const EvalItems_0 = function (items: Items_0, env: Env, retCont: OnlyReturnCont): void {
    retCont.return([]);
};

export const EvalItems_1 = function (items: Items_1, env: Env, retCont: OnlyReturnCont): void {
    EvalExp(items.exp, env, {
        return: (item: Value) => {
            assert(typeof item == 'object', 'return value of EvalItems_1 is not a object');
            const typedItem = item as Arr;
            EvalItems(items.items, env, {
                return: (remainItems: Value) => {
                    assert(typeof remainItems == 'object', 'return value of EvalItems_1 is not a object');
                    const typedRemainItems = remainItems as Arr;
                    retCont.return([...typedItem, ...typedRemainItems]);
                }
            });
        }
    });
};

const EvalArray = function (array: Array, env: Env, retCont: OnlyReturnCont): void {
    EvalItems(array.items, env, retCont);
};

// 语法map 里每一个左边的 node 都要有个对应的 eval，可能之后可能自动生成下面这些函数
// 简单的 rule 可以生成，复杂的还是要手写
const EvalForStmt = function (forStmt: ForStmt, env: Env, nextStepCont: OnlyNextStepCont, otherConts: Continuations): void {
    // below it's for grammar check(), should be sorted out from control flow
    // if not exist, it's a eval bug, must be fixed
    // assert('nextStep' in continuations, 'nextStep not be passed in continuations');
    // assert('return' in continuations, 'return not be passed in continuations');

    const init = forStmt.varStmtOrExpStmt;
    const cond = forStmt.exp;
    const update = forStmt.stmt;
    const block = forStmt.block;
    Eval(init, env, { nextStep: (envAfterInit: Env): void => {
        const EvalIter = (): void => {
            // 下面这个 cond 还不对，因为也要变成 CPS 风格，所以 if 也是在回调里做，所以 Eval 应该就没有返回值了
            // 看要不要统一风格了
            // 当然要，凡是涉及程序里执行的逻辑流都要用 CPS 风格

            EvalExp(cond, envAfterInit, {
                return: (condResult: Value) => {
                    if (typeof condResult != 'boolean') {
                        throw new Error('cond result type is not boolean');
                    }
                    if (condResult) {
                        // 检查下各个 cont 类型是否匹配上面定的
                        // () => void can be passed to (a: int) => void? yes.
                        const forContinue = (): void => {
                            Eval(update, envAfterInit, { nextStep: EvalIter, });
                        };
                        const forBreak = (): void => {
                            nextStepCont.nextStep(env);
                        };
                        EvalBlock(block, envAfterInit, {
                            blockEnd: forContinue,
                        }, {
                            ...otherConts,// TODO 如果嵌套 for 循环，这里就出问题了，有重名，看来最后还是要变成像 Env 那样，只不过不允许修改
                            continue: forContinue,
                            break: forBreak,
                        });
                    } else {
                        nextStepCont.nextStep(env);
                    }
            },});
        };
        EvalIter();
    }});
};

const EvalIfStmt = function (ifStmt: IfStmt, env: Env, nextStepCont: OnlyNextStepCont, otherConts: Continuations): void {
    const cond = ifStmt.exp;
    if (ifStmt instanceof IfStmt_0) {
        EvalExp(cond, env, {
            return: (condResult: Value) => {
                if (typeof condResult != 'boolean') {
                    throw new Error('cond result type is not boolean');
                }
                if (condResult) {
                    EvalBlock(ifStmt.block_0, env, { blockEnd: () => nextStepCont.nextStep(env), }, otherConts);
                } else {
                    EvalBlock(ifStmt.block_1, env, { blockEnd: () => nextStepCont.nextStep(env), }, otherConts);
                }
            }
        });
    } else if (ifStmt instanceof IfStmt_1) {
        EvalExp(cond, env, {
            return: (condResult: Value) => {
                if (typeof condResult != 'boolean') {
                    throw new Error('cond result type is not boolean');
                }
                if (condResult) {
                    EvalBlock(ifStmt.block, env, { blockEnd: () => nextStepCont.nextStep(env), }, otherConts);
                } else {
                    nextStepCont.nextStep(env);
                }
            }
        });
    } else {
        throw new Error('encounter unknown type in EvalIfStmt');
    }
};

const EvalReturnStmt = function (stmt: ReturnStmt, env: Env, nextStepCont: OnlyNextStepCont, otherConts: Continuations) {
    assert(otherConts.return, 'return continuation should be passed');
    EvalExp(stmt.exp, env, { return: (value: Value) => {
        otherConts.return!(value);
    }});    
};
const EvalStmt_0 = function (stmt: Stmt_0, env: Env, nextStepCont: OnlyNextStepCont, otherConts: Continuations) {
    EvalReturnStmt(stmt.returnStmt, env, nextStepCont, otherConts);
};

const EvalVarStmt_0 = function (stmt: VarStmt_0, env: Env, nextStepCont: OnlyNextStepCont, otherConts: Continuations) {
    EvalExp(stmt.exp, env, {
        return: (value: Value) => {
            env.Add((stmt.id as Identifier).Text, value);
            nextStepCont.nextStep(env);
        }
    });
};
const EvalVarStmt_1 = function (stmt: VarStmt_1, env: Env, nextStepCont: OnlyNextStepCont, otherConts: Continuations) {
    env.Add((stmt.id as Identifier).Text, undefined);
    nextStepCont.nextStep(env);
};
const EvalVarStmt = function (stmt: VarStmt, env: Env, nextStepCont: OnlyNextStepCont, otherConts: Continuations) {
    // TODO generate
};
const EvalStmt_2 = function (stmt: Stmt_2, env: Env, nextStepCont: OnlyNextStepCont, otherConts: Continuations) {
    EvalVarStmt(stmt.varStmt, env, nextStepCont, otherConts);
};

const EvalArgs = function (args: Args, env: Env, returnCont: OnlyReturnCont) {

};
// 整理下这些 Eval 函数的位置 TODO
const EvalInvocation = function (obj: Invocation, fun: EvaledFunc, env: Env, returnCont: OnlyReturnCont) {
    EvalArgs(obj.args, env, {
        return: (args) => {
            assert(typeof args == 'object', 'args should be Value[](alias Arr)');
            Apply(fun.Func, args as Arr, fun.Env, returnCont);
        }
    });
};

const EvalRefinement_0 = function (refinement: Refinement_0, obj: Value, env: Env, returnCont: OnlyReturnCont) {
    const propertyName = (refinement.id as Identifier).Text;
    if (typeof obj != 'object') {
        throw new Error('obj is not a object');
    }
    if (!(propertyName in obj)) {
        throw new Error(`${propertyName} not found in obj`);
    }
    returnCont.return((obj as Obj)[propertyName]);
};
const EvalRefinement_1 = function (refinement: Refinement_1, obj: Value, env: Env, returnCont: OnlyReturnCont) {
    if (typeof obj != 'object') {
        throw new Error('obj is not a object');
    }
    EvalExp(refinement.exp, env, {
        return(arg) {
            if (typeof arg != 'string' && typeof arg != 'number') {
                throw new Error('index of refinement should be string or number');
            }
            const propertyName = arg;
            if (!(propertyName in obj)) {
                throw new Error(`${propertyName} not found in obj`);
            }
            returnCont.return((obj as Obj)[propertyName]);
        },
    });
};
const EvalRefinement = function (refinement: Refinement, obj: Value, env: Env, returnCont: OnlyReturnCont) {

};
// 编译器代码错误用 assert，用户语法使用错误用 if-throw? TODO 检查下代码
const EvalInvocationCircle_1 = function (obj: InvocationCircle_1, value: Value, env: Env, returnCont: OnlyReturnCont) {
    if (typeof value == 'object' && 'Func' in value && 'Env' in value) {
        const fun = value as EvaledFunc;
        EvalInvocation(obj.invocation, fun, env, {
            return(arg) {
                EvalInvocationCircle(obj.invocationCircle, arg, env, returnCont);
            },
        });
        return;
    }
    throw new Error('value is not callable');    
};
const EvalInvocationCircle_0 = function (obj: InvocationCircle_0, value: Value, env: Env, returnCont: OnlyReturnCont) {
    returnCont.return(value);
};
const EvalInvocationCircle = function (obj: InvocationCircle, value: Value, env: Env, returnCont: OnlyReturnCont) {
    // TODO generate
};

const EvalAfterIdInExpStmt_0 = function (obj: AfterIdInExpStmt_0, id: Identifier, env: Env, returnCont: OnlyReturnCont) {
    EvalExp(obj.exp, env, {
        return(value) {
            env.Update(id.Text, value);
            returnCont.return(value);
        },
    });
};
const EvalAfterIdInExpStmt_1 = function (obj: AfterIdInExpStmt_1, id: Identifier, env: Env, returnCont: OnlyReturnCont) {
    EvalExpStmt(obj.expStmt, env, {
        return(value) {
            env.Update(id.Text, value);
            returnCont.return(value);
        },
    });
};
const EvalAfterIdInExpStmt_2 = function (obj: AfterIdInExpStmt_2, id: Identifier, env: Env, returnCont: OnlyReturnCont) {
    EvalExp(obj.exp, env, {
        return: (value) => {
            if (typeof value != 'number') {
                throw new Error('right of += should be a number');
            }
            const oldValue = env.Lookup(id.Text);
            if (typeof oldValue != 'number') {
                throw new Error('left of += should be a number');
            }
            const newValue = oldValue + value;
            env.Update(id.Text, newValue);
            returnCont.return(newValue);
        }
    });
};
const EvalAfterIdInExpStmt_3 = function (obj: AfterIdInExpStmt_3, id: Identifier, env: Env, returnCont: OnlyReturnCont) {
    EvalExp(obj.exp, env, {
        return: (value) => {
            if (typeof value != 'number') {
                throw new Error('right of -= should be a number');
            }
            const oldValue = env.Lookup(id.Text);
            if (typeof oldValue != 'number') {
                throw new Error('left of -= should be a number');
            }
            const newValue = oldValue - value;
            env.Update(id.Text, newValue);
            returnCont.return(newValue);
        }
    });
};
const EvalAfterIdInExpStmt_4 = function (obj: AfterIdInExpStmt_4, id: Identifier, env: Env, returnCont: OnlyReturnCont) {
    const f = env.Lookup(id.Text);
    EvalInvocationCircle(obj.invocationCircle, f, env, returnCont);
};
const EvalAfterIdInExpStmt_5 = function (obj: AfterIdInExpStmt_5, id: Identifier, env: Env, returnCont: OnlyReturnCont) {
    const f = env.Lookup(id.Text);
    EvalInvocationCircle(obj.invocationCircle, f, env, {
        return(o) {
            EvalRefinement(obj.refinement, o, env, {
                return(value) {
                    EvalAfterIdInExpStmt(obj.afterIdInExpStmt, value, env, returnCont);
                },
            });
        },
    });
};

const EvalAfterIdInExpStmt_6 = function (obj: AfterIdInExpStmt_6, id: Identifier, env: Env, returnCont: OnlyReturnCont) {
    const o = env.Lookup(id.Text);
    EvalRefinement(obj.refinement, o, env, {
        return(value) {
            EvalAfterIdInExpStmt(obj.afterIdInExpStmt, value, env, returnCont);
        },
    });
};
const EvalAfterIdInExpStmt = function (obj: AfterIdInExpStmt, leftValueRef: ValueRef, env: Env, returnCont: OnlyReturnCont) {
    // TODO generate
};
/**
 * @param conts use return cont to call as nested ExpStmt, 
 * next step cont to call as complete standalone ExpStmt
 */
const EvalExpStmt = function (stmt: ExpStmt, env: Env, conts: OnlyNextStepCont | OnlyReturnCont) {
    assert('return' in conts || 'nextStep' in conts, 'conts must contain return or nextStep cont');
    const v = env.LookupValueRefOf((stmt.id as Identifier).Text);
    
    EvalAfterIdInExpStmt(stmt.afterIdInExpStmt, v, env, {
        return: (value) => {
            if ('return' in conts) {
                conts.return(value);
            } else if ('nextStep' in conts) {
                conts.nextStep(env);
            }
        },
    });
};
const EvalStmt_4 = function (stmt: Stmt_4, env: Env, nextStepCont: OnlyNextStepCont, otherConts: Continuations) {
    EvalExpStmt(stmt.expStmt, env, nextStepCont);
};

/**
 * @param blockConts OnlyBlockEndCont is for Stmts self contintuation,
 * @param stmtCtrlFlowConts conts is for Stmt continuation
 */
const EvalStmts = function (stmts: Stmts, env: Env, blockConts: OnlyBlockEndCont, stmtCtrlFlowConts: Continuations) {
    if (stmts instanceof Stmts_1) {
        EvalStmt(stmts.stmt, env, {
            nextStep: (env) => EvalStmts(stmts.stmts, env, blockConts, stmtCtrlFlowConts),
        }, stmtCtrlFlowConts);
    } else if (stmts instanceof Stmts_0) {
        blockConts.blockEnd();
    } else {
        throw new Error('encounter unknown type in EvalStmts');
    }
};

const EvalBlock = function (block: Block, env: Env, blockEndCont: OnlyBlockEndCont, stmtConts: Continuations) {
    return EvalStmts(block.stmts, env, blockEndCont, stmtConts);
};

const EvalParas_0 = function (paras: Paras_0, args: Value[], env: Env, conts: OnlyNextStepCont) {
    const p = (paras.id as Identifier).Text;// TODO NodeDef 里 getter 把这些自定义类型给支持了
    env.Add(p, args[0]);
    EvalParas(paras.paras, args.slice(1), env, conts);
};
const EvalParas_1 = function (paras: Paras_0, args: Value[], env: Env, cont: OnlyNextStepCont) {
    cont.nextStep(env);
};
const EvalParas = function (paras: Paras, args: Value[], env: Env, cont: OnlyNextStepCont) {
    
};

const EvalFuncs = function (funcs: Funcs, env: Env, nextStep: OnlyNextStepCont) {
    if (funcs instanceof Funcs_1) {
        EvalFunc(funcs.fun, env, { nextStep: (env) => {
            EvalFuncs(funcs.funcs, env, nextStep);
        }});
    } else if (funcs instanceof Funcs_0) {
        nextStep.nextStep(env);
    } else {
        throw new Error('encounter unknown type in EvalFuncs');
    }
};
const EvalCls = function (cls: Cls, env: Env, nextStep: OnlyNextStepCont) {
    const t = (cls.id as Identifier).Text; // TODO remove as
    env.Add(t, { Cls: cls, Env: env, });
    nextStep.nextStep(env);
    // const clsEnv = env.BornChildEnv();
    // EvalFuncs(cls.funcs, clsEnv, { nextStep: () => {
    //     nextStep.nextStep(env);
    // }});
};

// Evalxxx 里不要调用具体的 Evalxxx 而是调用 Eval 来自动分派，防止依赖具体类型的子元素
// 感觉上面这个也不一定对
const Apply = function (func: Fun, args: Arr, env: Env, cont: OnlyReturnCont) {
    const childEnv = env.BornChildEnv();
    EvalParas(func.paras, args, env, { nextStep: (env) => {
        const defaultReturnValue = undefined;
        EvalBlock(func.block, childEnv, { blockEnd: () => cont.return(defaultReturnValue), }, { return: cont.return, });    
    }});
};
// 检查下所有单独使用 Eval 的地方，可能 conts 有问题
// 要做个 dispatcher 机制，生成代码也行，之后把这里所有判断 instanceof 的地方去掉
// as 也要去掉
// 两种 dispatch 的情况，一种是 object->{ pairs }，一种是 pairs->pairs_0|pairs_1

const EvalMap = {
    EvalFunc,
    
    EvalString,
    EvalBoolean,
    EvalNumber,
    EvalKey,
    EvalPair,
    EvalPairs_1,
    EvalPairs_0,
    // EvalObject, directly forward
    EvalItems_0,
    EvalItems_1,
    // EvalArray
    EvalForStmt,
    EvalIfStmt,
    EvalStmts,
    // EvalBlock,
    EvalParas,

    EvalFuncs,
    EvalCls,
};
// Apply