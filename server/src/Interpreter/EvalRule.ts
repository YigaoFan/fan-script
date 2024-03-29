import { assert } from 'console';
import { Calculate } from './ArithEval';
import { InfixOperatorKind, PrefixOperatorKind } from '../LangSpec/Expression';
import { Identifier } from '../LangSpec/Identifier';
import { AfterIdInExpStmt_0, AfterIdInExpStmt_1, AfterIdInExpStmt_2, AfterIdInExpStmt_3, AfterIdInExpStmt_5, AfterIdInExpStmt_6, Boolean_0, Boolean_1, Cls, Exp, ExpStmt, Exp_2, Exp_3, Exp_4, Exp_5, Exp_6, Exp_7, Exp_8, Exp_9, ForStmt_0, ForStmt_1, Fun, Funcs_0, Funcs_1, IfStmt_0, IfStmt_1, Invocation, InvocationCircle_0, InvocationCircle_1, Items_0, Items_1, PairKey_0, PairKey_1, Pair, Pairs_0, Pairs_1, Paras_0, Paras_1, Refinement_0, Refinement_1, ReturnStmt, Stmts_0, Stmts_1, VarStmt_0, VarStmt_1, Doc, Paras, Block, } from '../LangSpec/NodeDef';
import { Number } from '../LangSpec/Number';
import { String } from '../LangSpec/String';
import { Arr, Env, EvaledFun, Obj, Value, IValueRef, RValueRef, LObjInnerValueRef, BuiltInFunc, ValueType, } from './Env';
import { EvalAfterIdInExpStmt, EvalExp, EvalFuncs, EvalInvocationCircle, EvalItems, EvalPairKey, EvalPairs, EvalParas, EvalRefinement, EvalStmt, EvalStmts, EvalVarStmt } from './EvalDispatch';
import { EvalBlock } from './EvalForward';
import { log } from '../util';

// type Continuations = {
//     [t in continuationTypes]?: (...args: any[]) => void;
// };

export type OnlyReturnCont = {
    return: (arg: IValueRef) => void;
};
export type OnlyNextStepCont = {
    nextStep: (env: Env) => void; // last step have effect on next step env
};
export type OnlyBlockEndCont = {
    blockEnd: () => void;
};
export type Continuations = {
    // 下面这个？是不是用得有问题，我想的效果存在即有值，不是会存在 undefined 的情况
    return?: (arg: IValueRef) => void; // 这里的参数要不要有 cont？ TODO check，应该只要返回值吧，写到了就知道了
    nextStep?: (env: Env) => void;
    break?: (conts: OnlyReturnCont) => void; // but break or forStmt doesn't have effect on next step's env, so break is not same as nextStep
    continue?: () => void;
    blockEnd?: () => void;
};
// const Eval = function (node: ISyntaxNode | Text, env: Env, continuations: Continuations): void {

// };
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
export const EvalFun = function (func: Fun, env: Env, retCont: OnlyReturnCont) {
    const n = func.id.Text; // TODO judge a function has id name
    const f = { Func: func, Env: env, };
    env.Add(n, f);
    retCont.return(RValueRef.New(f));// TODO 这里该不该用 RValueRef 呢，或者右值 ref 在这里对不对呢
};

/** 
 * exp cannot change control flow, so only pass @param retCont to return value
 */
// const EvalExp = function (exp: Exp, env: Env, retCont: OnlyReturnCont): void {
    
// };

export const EvalId = function (id: Identifier, env: Env, retCont: OnlyReturnCont) {
    const valueRef = env.LookupValueRefOf(id.Text);
    retCont.return(valueRef);
};

export const EvalString = function (str: String, env: Env, retCont: OnlyReturnCont): void {
    retCont.return(RValueRef.New(str.Content.Value));
};

export const EvalBoolean_0 = function (boolean: Boolean_0, env: Env, retCont: OnlyReturnCont): void {
    retCont.return(RValueRef.New(true));
};

export const EvalBoolean_1 = function (boolean: Boolean_1, env: Env, retCont: OnlyReturnCont): void {
    retCont.return(RValueRef.New(false));
};


export const EvalNumber = function (num: Number, env: Env, retCont: OnlyReturnCont): void {
    retCont.return(RValueRef.New(num.Value));
};

export const EvalPairKey_1 = function (key: PairKey_1, env: Env, retCont: OnlyReturnCont): void {
    retCont.return(RValueRef.New(key.string.Content.Value));
};

export const EvalPairKey_0 = function (key: PairKey_0, env: Env, retCont: OnlyReturnCont): void {
    retCont.return(RValueRef.New(key.id.Text));
};

export const EvalPair = function (pair: Pair, env: Env, retCont: OnlyReturnCont): void {
    // 可能要在生成代码的函数那里加一些可以控制 env 操作的配置
    EvalPairKey(pair.pairKey, env, {
        return: (keyRef) => {
            const k = keyRef.Value;
            assert(typeof k == 'string', 'return value of EvalKey is not a string');
            const key = k as string;
            EvalExp(pair.pairValue, env, {
                return: (valueRef) => {
                    const v = valueRef.Value;
                    const evaledPair: Record<typeof key, Value> = {};
                    evaledPair[key] = v;
                    retCont.return(RValueRef.New(evaledPair));
                },
            },);
        },
    });
};

export const EvalPairs_1 = function (pairs: Pairs_1, env: Env, retCont: OnlyReturnCont): void {
    const newEnv = env.BornChildEnv();
    EvalPair(pairs.pair, newEnv, {
        return: (pairRef) => {
            const pair = pairRef.Value;
            assert(typeof pair == 'object', 'return value of EvalPair is not a object');
            const typedPair = pair as Obj;
            EvalPairs(pairs.pairs, env, {
                return: (remainPairsRef) => {                    
                    const remainPairs = remainPairsRef.Value;
                    assert(typeof remainPairs == 'object', 'return value of EvalPair is not a object');
                    const typedRemainPairs = remainPairs as Obj;
                    retCont.return(RValueRef.New({ ...typedPair, ...typedRemainPairs, }));
                }
            });
        }
    });
};

export const EvalPairs_0 = function (pairs: Pairs_0, env: Env, retCont: OnlyReturnCont): void {
    retCont.return(RValueRef.New({}));
};

export const EvalItems_0 = function (items: Items_0, env: Env, retCont: OnlyReturnCont): void {
    retCont.return(RValueRef.New([]));
};

export const EvalItems_1 = function (items: Items_1, env: Env, retCont: OnlyReturnCont): void {
    const newEnv = env.BornChildEnv();
    EvalExp(items.exp, newEnv, {
        return: (itemRef) => {
            const item = itemRef.Value; 
            // assert(typeof item == 'object', 'return value of EvalItems_1 is not a object');
            // const typedItem = item as Value;
            EvalItems(items.items, env, {
                return: (remainItemsRef) => {
                    const remainItems = remainItemsRef.Value;
                    assert(typeof remainItems == 'object', 'return value of EvalItems_1 is not a object');
                    const typedRemainItems = remainItems as Arr;
                    retCont.return(RValueRef.New([item, ...typedRemainItems]));
                }
            });
        }
    });
};

export const EvalExp_2 = function (exp: Exp_2, env: Env, retCont: OnlyReturnCont): void {
    EvalExp(exp.exp, env, retCont);
};

export const EvalExp_3 = function (exp: Exp_3, env: Env, retCont: OnlyReturnCont): void {
    EvalExp(exp.exp, env, {
        return(valueRef) {
            switch (exp.prefixOperator.Kind) {
                case PrefixOperatorKind.Add:
                    if (typeof valueRef.Value != 'number') {
                        throw new Error('+ operand is not number');
                    }
                    retCont.return(RValueRef.New(valueRef.Value));
                    break;
                case PrefixOperatorKind.Minus:
                    if (typeof valueRef.Value != 'number') {
                        throw new Error('- operand is not number');
                    }
                    retCont.return(RValueRef.New(-valueRef.Value));
                    break;
                case PrefixOperatorKind.Not:
                    if (typeof valueRef.Value != 'boolean') {
                        throw new Error('! operand is not boolean');
                    }
                    retCont.return(RValueRef.New(!valueRef.Value));
                    break;
                case PrefixOperatorKind.TypeOf:
                    throw new Error('not support typeof operator');
            }
        },
    });
};

type Operations = [InfixOperatorKind[], IValueRef[]];
const IterateOperationIn = function (exp: Exp_4, env: Env, returnCont: { return: (operations: Operations) => void }) {
    const ProcessSub = function (subExp: Exp, subReturnCont: typeof returnCont) {
        if (subExp instanceof Exp_4) {
            IterateOperationIn(subExp, env, {
                return(part1) {
                    subReturnCont.return(part1);
                },
            });
        } else {
            EvalExp(subExp, env, {
                return(arg) {
                    subReturnCont.return([[], [arg]]);
                },
            });
        }
    };

    ProcessSub(exp.exp_0, {
        return(operations0) {
            ProcessSub(exp.exp_1, {
                return(operations1) {
                    const operators = [...operations0[0], exp.infixOperator.Kind, ...operations1[0]];
                    const operands = [...operations0[1], ...operations1[1]];
                    returnCont.return([operators, operands]);
                },
            });
        },
    });
};

export const EvalExp_4 = function (exp: Exp_4, env: Env, returnCont: OnlyReturnCont) {
    const priorityMap: Record<number, InfixOperatorKind[]> = {
        0: [InfixOperatorKind.Or],
        1: [InfixOperatorKind.And],
        2: [InfixOperatorKind.Equal, InfixOperatorKind.NotEqual],
        3: [InfixOperatorKind.Greater, InfixOperatorKind.GreaterEqual, InfixOperatorKind.Less, InfixOperatorKind.LessEqual],
        4: [InfixOperatorKind.Add, InfixOperatorKind.Minus],
        5: [InfixOperatorKind.Multiply, InfixOperatorKind.Divide, InfixOperatorKind.Remain],
    };
    const operatorFuncs: Record<InfixOperatorKind, (p0: IValueRef, p1: IValueRef) => IValueRef> = {
        '*': function (p0: IValueRef, p1: IValueRef): IValueRef {
            if (typeof p0.Value == 'number' && typeof p1.Value == 'number') {
                const v0 = p0.Value;
                const v1 = p1.Value;
                return RValueRef.New(v0 * v1);
            }
            throw new Error(`${p0.Value} or ${p1.Value} not support * operator`);
        },
        '/': function (p0: IValueRef, p1: IValueRef): IValueRef {
            if (typeof p0.Value == 'number' && typeof p1.Value == 'number') {
                const v0 = p0.Value;
                const v1 = p1.Value;
                return RValueRef.New(v0 / v1);
            }
            throw new Error(`${p0.Value} or ${p1.Value} not support / operator`);
        },
        '%': function (p0: IValueRef, p1: IValueRef): IValueRef {
            if (typeof p0.Value == 'number' && typeof p1.Value == 'number') {
                const v0 = p0.Value;
                const v1 = p1.Value;
                return RValueRef.New(v0 % v1);
            }
            throw new Error(`${p0.Value} or ${p1.Value} not support % operator`);
        },
        '+': function (p0: IValueRef, p1: IValueRef): IValueRef {
            if (typeof p0.Value == 'number' && typeof p1.Value == 'number') {
                const v0 = p0.Value;
                const v1 = p1.Value;
                return RValueRef.New(v0 + v1);
            }
            throw new Error(`${p0.Value} or ${p1.Value} not support + operator`);
        },
        '-': function (p0: IValueRef, p1: IValueRef): IValueRef {
            if (typeof p0.Value == 'number' && typeof p1.Value == 'number') {
                const v0 = p0.Value;
                const v1 = p1.Value;
                return RValueRef.New(v0 - v1);
            }
            throw new Error(`${p0.Value} or ${p1.Value} not support - operator`);
        },
        '>=': function (p0: IValueRef, p1: IValueRef): IValueRef {
            if (typeof p0.Value == 'number' && typeof p1.Value == 'number') {
                const v0 = p0.Value;
                const v1 = p1.Value;
                return RValueRef.New(v0 >= v1);
            }
            throw new Error(`${p0.Value} or ${p1.Value} not support >= operator`);
        },
        '<=': function (p0: IValueRef, p1: IValueRef): IValueRef {
            if (typeof p0.Value == 'number' && typeof p1.Value == 'number') {
                const v0 = p0.Value;
                const v1 = p1.Value;
                return RValueRef.New(v0 <= v1);
            }
            throw new Error(`${p0.Value} or ${p1.Value} not support <= operator`);
        },
        '>': function (p0: IValueRef, p1: IValueRef): IValueRef {
            if (typeof p0.Value == 'number' && typeof p1.Value == 'number') {
                const v0 = p0.Value;
                const v1 = p1.Value;
                return RValueRef.New(v0 > v1);
            }
            throw new Error(`${p0.Value} or ${p1.Value} not support > operator`);
        },
        '<': function (p0: IValueRef, p1: IValueRef): IValueRef {
            if (typeof p0.Value == 'number' && typeof p1.Value == 'number') {
                const v0 = p0.Value;
                const v1 = p1.Value;
                return RValueRef.New(v0 < v1);
            }
            throw new Error(`${p0.Value} or ${p1.Value} not support < operator`);
        },
        '==': function (p0: IValueRef, p1: IValueRef): IValueRef {
            if (typeof p0.Value == 'number' && typeof p1.Value == 'number') {
                const v0 = p0.Value;
                const v1 = p1.Value;
                return RValueRef.New(v0 == v1);
            }
            if (typeof p0.Value == 'boolean' && typeof p1.Value == 'boolean') {
                const v0 = p0.Value;
                const v1 = p1.Value;
                return RValueRef.New(v0 == v1);
            }
            throw new Error(`${p0.Value} or ${p1.Value} not support == operator`);
        },
        '!=': function (p0: IValueRef, p1: IValueRef): IValueRef {
            if (typeof p0.Value == 'number' && typeof p1.Value == 'number') {
                const v0 = p0.Value;
                const v1 = p1.Value;
                return RValueRef.New(v0 != v1);
            }
            if (typeof p0.Value == 'boolean' && typeof p1.Value == 'boolean') {
                const v0 = p0.Value;
                const v1 = p1.Value;
                return RValueRef.New(v0 != v1);
            }
            throw new Error(`${p0.Value} or ${p1.Value} not support != operator`);
        },
        '||': function (p0: IValueRef, p1: IValueRef): IValueRef {
            if (typeof p0.Value == 'boolean' && typeof p1.Value == 'boolean') {
                const v0 = p0.Value;
                const v1 = p1.Value;
                return RValueRef.New(v0 || v1);
            }
            throw new Error(`${p0.Value} or ${p1.Value} not support || operator`);
        },
        '&&': function (p0: IValueRef, p1: IValueRef): IValueRef {
            if (typeof p0.Value == 'boolean' && typeof p1.Value == 'boolean') {
                const v0 = p0.Value;
                const v1 = p1.Value;
                return RValueRef.New(v0 && v1);
            }
            throw new Error(`${p0.Value} or ${p1.Value} not support && operator`);
        }
    };
    IterateOperationIn(exp, env, {
        return(operations) {
            returnCont.return(Calculate(operations[0], operations[1], priorityMap, operatorFuncs));
        },
    });
};

export const EvalExp_5 = function (exp: Exp_5, env: Env, returnCont: OnlyReturnCont) {
    EvalExp(exp.exp_0, env, {
        return(valueRef) {
            if (typeof valueRef.Value != 'boolean') {
                throw new Error(typeof valueRef.Value + ' should be boolean in trinocular operator');
            }
            const cond = valueRef.Value;
            if (cond) {
                EvalExp(exp.exp_1, env, returnCont);
            } else {
                EvalExp(exp.exp_2, env, returnCont);
            }
        },
    });
};

export const EvalExp_6 = function (exp: Exp_6, env: Env, returnCont: OnlyReturnCont) {
    EvalExp(exp.exp, env, {
        return(func) {
            EvalInvocation(exp.invocation, func, env, returnCont);
        },
    });
};

export const EvalExp_7 = function (exp: Exp_7, env: Env, returnCont: OnlyReturnCont) {
    EvalExp(exp.exp, env, {
        return(valueRef) {
            EvalRefinement(exp.refinement, valueRef, env, returnCont);
        },
    });
};

export const EvalExp_8 = function (exp: Exp_8, env: Env, returnCont: OnlyReturnCont) {
    throw new Error('not implement');
};

export const EvalExp_9 = function (exp: Exp_9, env: Env, returnCont: OnlyReturnCont) {
    throw new Error('not implement');
};

// 语法map 里每一个左边的 node 都要有个对应的 eval，可能之后可能自动生成下面这些函数
// 简单的 rule 可以生成，复杂的还是要手写
export const EvalForStmt_0 = function (forStmt: ForStmt_0, env: Env, nextStepCont: OnlyNextStepCont, otherConts: Continuations): void {
    // below it's for grammar check(), should be sorted out from control flow
    // if not exist, it's a eval bug, must be fixed
    // assert('nextStep' in continuations, 'nextStep not be passed in continuations');
    // assert('return' in continuations, 'return not be passed in continuations');

    const init = forStmt.varStmt;
    const cond = forStmt.exp;
    const update = forStmt.stmt;
    const block = forStmt.block;
    EvalVarStmt(init, env, { nextStep: (envAfterInit: Env): void => {
        const EvalIter = (): void => {
            // 下面这个 cond 还不对，因为也要变成 CPS 风格，所以 if 也是在回调里做，所以 Eval 应该就没有返回值了
            // 看要不要统一风格了
            // 当然要，凡是涉及程序里执行的逻辑流都要用 CPS 风格

            EvalExp(cond, envAfterInit, {
                return: (condResultRef) => {
                    const condResult = condResultRef.Value;
                    if (typeof condResult != 'boolean') {
                        throw new Error('cond result type is not boolean');
                    }
                    if (condResult) {
                        // 检查下各个 cont 类型是否匹配上面定的
                        // () => void can be passed to (a: int) => void? yes.
                        const forContinue = (): void => {
                            EvalStmt(update, envAfterInit, { nextStep: EvalIter, }, {});
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
            },},);
        };
        EvalIter();
    }}, {});
};

export const EvalForStmt_1 = function (forStmt: ForStmt_1, env: Env, nextStepCont: OnlyNextStepCont, otherConts: Continuations): void {
    // below it's for grammar check(), should be sorted out from control flow
    // if not exist, it's a eval bug, must be fixed
    // assert('nextStep' in continuations, 'nextStep not be passed in continuations');
    // assert('return' in continuations, 'return not be passed in continuations');

    const init = forStmt.expStmt;
    const cond = forStmt.exp;
    const update = forStmt.stmt;
    const block = forStmt.block;
    EvalExpStmt(init, env, {
        nextStep: (envAfterInit: Env): void => {
            const EvalIter = (): void => {
                // 下面这个 cond 还不对，因为也要变成 CPS 风格，所以 if 也是在回调里做，所以 Eval 应该就没有返回值了
                // 看要不要统一风格了
                // 当然要，凡是涉及程序里执行的逻辑流都要用 CPS 风格

                EvalExp(cond, envAfterInit, {
                    return: (condResultRef) => {
                        const condResult = condResultRef.Value;
                        if (typeof condResult != 'boolean') {
                            throw new Error('cond result type is not boolean');
                        }
                        if (condResult) {
                            // 检查下各个 cont 类型是否匹配上面定的
                            // () => void can be passed to (a: int) => void? yes.
                            const forContinue = (): void => {
                                EvalStmt(update, envAfterInit, { nextStep: EvalIter, }, {});
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
                    },
                });
            };
            EvalIter();
        }
    }, {});
};

// TODO 检查下大括号作用域实现了没
export const EvalIfStmt_0 = function (ifStmt: IfStmt_0, env: Env, nextStepCont: OnlyNextStepCont, otherConts: Continuations): void {
    const cond = ifStmt.exp;
    EvalExp(cond, env, {
        return: (condResultRef) => {
            const condResult = condResultRef.Value;
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
};

export const EvalIfStmt_1 = function (ifStmt: IfStmt_1, env: Env, nextStepCont: OnlyNextStepCont, otherConts: Continuations): void {
    const cond = ifStmt.exp;
    EvalExp(cond, env, {
        return: (condResultRef) => {
            const condResult = condResultRef.Value;
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
};

export const EvalReturnStmt = function (stmt: ReturnStmt, env: Env, nextStepCont: OnlyNextStepCont, otherConts: Continuations) {
    assert(otherConts.return, 'return continuation should be passed');
    EvalExp(stmt.exp, env, { return: otherConts.return! });    
};

export const EvalVarStmt_0 = function (stmt: VarStmt_0, env: Env, nextStepCont: OnlyNextStepCont, otherConts: Continuations) {
    EvalExp(stmt.exp, env, {
        return: (valueRef) => {
            const value = valueRef.Value;
            env.Add(stmt.id.Text, value);
            nextStepCont.nextStep(env);
        }
    });
};

export const EvalVarStmt_1 = function (stmt: VarStmt_1, env: Env, nextStepCont: OnlyNextStepCont, otherConts: Continuations) {
    env.Add(stmt.id.Text, undefined);
    nextStepCont.nextStep(env);
};

// 整理下这些 Eval 函数的位置 TODO
export const EvalInvocation = function (obj: Invocation, funValueRef: IValueRef, env: Env, returnCont: OnlyReturnCont) {
    if (typeof funValueRef.Value == 'object') {
        if ('Type' in funValueRef.Value && funValueRef.Value.Type == ValueType.BuiltInFunc) {
            const f = funValueRef.Value as BuiltInFunc;
            EvalItems(obj.items, env, {
                return: (argsRef: IValueRef) => {
                    const args = argsRef.Value;
                    assert(typeof args == 'object', 'args should be Value[](alias Arr)');
                    f.Func(...(args as Arr));
                },
            });
            return;
        } else if ('Func' in funValueRef.Value && 'Env' in funValueRef.Value) {
            const f = funValueRef.Value as EvaledFun;
            EvalItems(obj.items, env, {
                return: (argsRef: IValueRef) => {
                    const args = argsRef.Value;
                    assert(typeof args == 'object', 'args should be Value[](alias Arr)');
                    Apply(f.Func, args as Arr, f.Env, returnCont);
                    // 这里涉及调用函数传引用，思考下来是和 js 一样
                },
            });
            return;
        }
    }
    throw new Error(funValueRef.Value + ' is not a function');
};

export const EvalRefinement_0 = function (refinement: Refinement_0, valueRef: IValueRef, env: Env, returnCont: OnlyReturnCont) {
    const propertyName = refinement.id.Text;
    const obj = valueRef.Value;
    if (typeof obj != 'object') {
        throw new Error('obj is not a object');
    }
    if (!(propertyName in obj)) {
        throw new Error(`${propertyName} not found in obj`);
    }
    returnCont.return(LObjInnerValueRef.New(obj as Obj, propertyName));
};

export const EvalRefinement_1 = function (refinement: Refinement_1, valueRef: IValueRef, env: Env, returnCont: OnlyReturnCont) {
    const obj = valueRef.Value;
    if (typeof obj != 'object') {
        throw new Error('obj is not a object');
    }
    EvalExp(refinement.exp, env, {
        return(argRef) {
            const arg = argRef.Value;
            if (typeof arg != 'string' && typeof arg != 'number') {
                throw new Error('index of refinement should be string or number');
            }
            const propertyName = arg;
            if (!(propertyName in obj)) {
                throw new Error(`${propertyName} not found in obj`);
            }
            returnCont.return(LObjInnerValueRef.New(obj as Obj, propertyName));
        },
    });
};

// 编译器代码错误用 assert，用户语法使用错误用 if-throw? TODO 检查下代码
export const EvalInvocationCircle_1 = function (obj: InvocationCircle_1, func: IValueRef, env: Env, returnCont: OnlyReturnCont) {
    EvalInvocation(obj.invocation, func, env, {
        return(nextFunc) {
            EvalInvocationCircle(obj.invocationCircle, nextFunc, env, returnCont);
        },
    });
};

export const EvalInvocationCircle_0 = function (obj: InvocationCircle_0, valueRef: IValueRef, env: Env, returnCont: OnlyReturnCont) {
    returnCont.return(valueRef);
};

export const EvalAfterIdInExpStmt_0 = function (obj: AfterIdInExpStmt_0, leftPartValueRef: IValueRef, env: Env, returnCont: OnlyReturnCont) {
    EvalExp(obj.exp, env, {
        return(valueRef) {
            leftPartValueRef.Value = valueRef.Value; // 这里要不要 .Value 出来然后赋 TODO
            returnCont.return(leftPartValueRef);
        },
    });
};

export const EvalAfterIdInExpStmt_1 = function (obj: AfterIdInExpStmt_1, leftPartValueRef: IValueRef, env: Env, returnCont: OnlyReturnCont) {
    EvalInternalExpStmt(obj.expStmt, env, {
        return(valueRef) {
            leftPartValueRef.Value = valueRef.Value; // 这里要不要 .Value 出来然后赋 TODO
            returnCont.return(leftPartValueRef);
        },
    }, {});
};

export const EvalAfterIdInExpStmt_2 = function (obj: AfterIdInExpStmt_2, leftPartValueRef: IValueRef, env: Env, returnCont: OnlyReturnCont) {
    EvalExp(obj.exp, env, {
        return: (incrementRef) => {
            const increment = incrementRef.Value;
            if (typeof increment != 'number') {
                throw new Error('right of += should be a number');
            }
            const oldValue = leftPartValueRef.Value;
            if (typeof oldValue != 'number') {
                throw new Error('left of += should be a number');
            }
            const newValue = oldValue + increment;
            leftPartValueRef.Value = newValue;
            returnCont.return(leftPartValueRef);
        }
    });
};

export const EvalAfterIdInExpStmt_3 = function (obj: AfterIdInExpStmt_3, leftPartValueRef: IValueRef, env: Env, returnCont: OnlyReturnCont) {
    EvalExp(obj.exp, env, {
        return: (decrementRef) => {
            const decrement = decrementRef.Value;
            if (typeof decrement != 'number') {
                throw new Error('right of -= should be a number');
            }
            const oldValue = leftPartValueRef.Value;
            if (typeof oldValue != 'number') {
                throw new Error('left of -= should be a number');
            }
            const newValue = oldValue - decrement;
            leftPartValueRef.Value = newValue;
            returnCont.return(leftPartValueRef);
        }
    });
};

export const EvalAfterIdInExpStmt_5 = function (obj: AfterIdInExpStmt_5, leftPartValueRef: IValueRef, env: Env, returnCont: OnlyReturnCont) {
    EvalInvocationCircle(obj.invocationCircle, leftPartValueRef, env, {
        return(o) {
            EvalRefinement(obj.refinement, o, env, {
                return(value) {
                    EvalAfterIdInExpStmt(obj.afterIdInExpStmt, value, env, returnCont);
                },
            });
        },
    });
};

export const EvalAfterIdInExpStmt_6 = function (obj: AfterIdInExpStmt_6, leftPartValueRef: IValueRef, env: Env, returnCont: OnlyReturnCont) {
    EvalRefinement(obj.refinement, leftPartValueRef, env, {
        return(valueRef) {
            EvalAfterIdInExpStmt(obj.afterIdInExpStmt, valueRef, env, returnCont);
        },
    });
};

export const EvalInternalExpStmt = function (stmt: ExpStmt, env: Env, retCont: OnlyReturnCont, otherConts: Continuations) {
    EvalId(stmt.id, env, {
        return(varValueRef) {
            EvalAfterIdInExpStmt(stmt.afterIdInExpStmt, varValueRef, env, {
                return: (valueRef) => {
                    retCont.return(valueRef);
                },
            });
        },
    });
};

/**
 * @param nextStepCont use return cont to call as nested ExpStmt, 
 * next step cont to call as complete standalone ExpStmt
 */
export const EvalExpStmt = function (stmt: ExpStmt, env: Env, nextStepCont: OnlyNextStepCont, otherConts: Continuations) {
    EvalId(stmt.id, env, {
        return(varValueRef) {
            EvalAfterIdInExpStmt(stmt.afterIdInExpStmt, varValueRef, env, {
                return: (valueRef) => {
                    nextStepCont.nextStep(env);
                },
            });
        },
    });
};

/**
 * @param blockConts OnlyBlockEndCont is for Stmts self contintuation,
 * @param stmtCtrlFlowConts conts is for Stmt continuation
 */
export const EvalStmts_0 = function (stmts: Stmts_0, env: Env, blockConts: OnlyBlockEndCont, stmtCtrlFlowConts: Continuations) {
    blockConts.blockEnd();
};

/**
 * @param blockConts OnlyBlockEndCont is for Stmts self contintuation,
 * @param stmtCtrlFlowConts conts is for Stmt continuation
 */
export const EvalStmts_1 = function (stmts: Stmts_1, env: Env, blockConts: OnlyBlockEndCont, stmtCtrlFlowConts: Continuations) {
    EvalStmt(stmts.stmt, env, {
        nextStep: (env) => EvalStmts(stmts.stmts, env, blockConts, stmtCtrlFlowConts),
    }, stmtCtrlFlowConts);
};

export const EvalParas_0 = function (paras: Paras_0, args: Value[], env: Env, cont: OnlyNextStepCont) {
    const p = paras.id.Text;
    env.Add(p, args[0]);
    EvalParas(paras.paras, args.slice(1), env, cont);
};

export const EvalParas_1 = function (paras: Paras_1, args: Value[], env: Env, cont: OnlyNextStepCont) {
    cont.nextStep(env);
};

export const EvalFuncs_0 = function (funcs: Funcs_0, env: Env, nextStep: OnlyNextStepCont) {
    nextStep.nextStep(env);
};

export const EvalFuncs_1 = function (funcs: Funcs_1, env: Env, nextStep: OnlyNextStepCont) {
    EvalFun(funcs.fun, env, {
        return(arg) {
            EvalFuncs(funcs.funcs, env, nextStep);
        },
    });
};

export const EvalCls = function (cls: Cls, env: Env, nextStep: OnlyNextStepCont) {
    const t = cls.id.Text;
    env.Add(t, { Cls: cls, Env: env, });
    nextStep.nextStep(env);
    // const clsEnv = env.BornChildEnv();
    // EvalFuncs(cls.funcs, clsEnv, { nextStep: () => {
    //     nextStep.nextStep(env);
    // }});
};

export const EvalDoc = function (doc: Doc, env: Env, retCont: OnlyReturnCont) {
    EvalCls(doc.cls, env, {
        nextStep(env) {
            Apply(doc.entry, [], env, retCont);
        },
    });
};

// Evalxxx 里不要调用具体的 Evalxxx 而是调用 Eval 来自动分派，防止依赖具体类型的子元素
// 感觉上面这个也不一定对
const Apply = function (func: { get paras(): Paras; get block(): Block; }, args: Arr, env: Env, cont: OnlyReturnCont) {
    const childEnv = env.BornChildEnv();
    EvalParas(func.paras, args, env, { nextStep: (env) => {
        const defaultReturnValue = undefined;
        EvalBlock(func.block, childEnv, { blockEnd: () => cont.return(RValueRef.New(defaultReturnValue)), },
            { return: cont.return, });    
    }});
};
// 检查下所有单独使用 Eval 的地方，可能 conts 有问题
// 要做个 dispatcher 机制，生成代码也行，之后把这里所有判断 instanceof 的地方去掉
// as 也要去掉
// 两种 dispatch 的情况，一种是 object->{ pairs }，一种是 pairs->pairs_0|pairs_1

/////////////////////////////////////////////////////////
// Attention!!! below not comment, it's used for code gen
/////////////////////////////////////////////////////////
// TODO: 写一个加入新语法规则的 Guide，知道操作的先后顺序
export const ExportsOfEvalRule = [
    'OnlyReturnCont',
    'OnlyNextStepCont',
    'OnlyBlockEndCont',
    'Continuations',

    'EvalFun',
    'EvalId',
    'EvalString',
    'EvalBoolean_0',
    'EvalBoolean_1',
    'EvalNumber',
    'EvalPairKey_0',
    'EvalPairKey_1',
    'EvalPair',
    'EvalPairs_0',
    'EvalPairs_1',
    'EvalItems_0',
    'EvalItems_1',
    'EvalExp_2',
    'EvalExp_3',
    'EvalExp_4',
    'EvalExp_5',
    'EvalExp_6',
    'EvalExp_7',
    'EvalExp_8',
    'EvalExp_9',
    'EvalForStmt_0',
    'EvalForStmt_1',
    'EvalIfStmt_0',
    'EvalIfStmt_1',
    'EvalReturnStmt',
    'EvalVarStmt_0',
    'EvalVarStmt_1',
    'EvalInvocation',
    'EvalRefinement_0',
    'EvalRefinement_1',
    'EvalInvocationCircle_1',
    'EvalInvocationCircle_0',
    'EvalAfterIdInExpStmt_0',
    'EvalAfterIdInExpStmt_1',
    'EvalAfterIdInExpStmt_2',
    'EvalAfterIdInExpStmt_3',
    'EvalAfterIdInExpStmt_5',
    'EvalAfterIdInExpStmt_6',
    'EvalExpStmt',
    'EvalStmts_0',
    'EvalStmts_1',
    'EvalParas_0',
    'EvalParas_1',
    'EvalFuncs_0',
    'EvalFuncs_1',
    'EvalCls',
    'EvalDoc',
];

export const ParaTypeOfEvalRule: Record<string, [string, string][]> = {
    EvalFun: [['env', 'Env'], ['retCont', 'OnlyReturnCont']],
    EvalId: [['env', 'Env'], ['retCont', 'OnlyReturnCont']],
    EvalString: [['env', 'Env'], ['retCont', 'OnlyReturnCont']],
    EvalBoolean_0: [['env', 'Env'], ['retCont', 'OnlyReturnCont']],
    EvalBoolean_1: [['env', 'Env'], ['retCont', 'OnlyReturnCont']],
    EvalNumber: [['env', 'Env'], ['retCont', 'OnlyReturnCont']],
    EvalPairKey_0: [['env', 'Env'], ['retCont', 'OnlyReturnCont']],
    EvalPairKey_1: [['env', 'Env'], ['retCont', 'OnlyReturnCont']],
    EvalPair: [['env', 'Env'], ['retCont', 'OnlyReturnCont']],
    EvalPairs_0: [['env', 'Env'], ['retCont', 'OnlyReturnCont']],
    EvalPairs_1: [['env', 'Env'], ['retCont', 'OnlyReturnCont']],
    EvalItems_0: [['env', 'Env'], ['retCont', 'OnlyReturnCont']],
    EvalItems_1: [['env', 'Env'], ['retCont', 'OnlyReturnCont']],
    EvalExp_2: [['env', 'Env'], ['retCont', 'OnlyReturnCont']],
    EvalExp_3: [['env', 'Env'], ['retCont', 'OnlyReturnCont']],
    EvalExp_4: [['env', 'Env'], ['retCont', 'OnlyReturnCont']],
    EvalExp_5: [['env', 'Env'], ['retCont', 'OnlyReturnCont']],
    EvalExp_6: [['env', 'Env'], ['retCont', 'OnlyReturnCont']],
    EvalExp_7: [['env', 'Env'], ['retCont', 'OnlyReturnCont']],
    EvalExp_8: [['env', 'Env'], ['retCont', 'OnlyReturnCont']],
    EvalExp_9: [['env', 'Env'], ['retCont', 'OnlyReturnCont']],
    EvalForStmt_0: [['env', 'Env'], ['nextStepCont', 'OnlyNextStepCont'], ['otherConts', 'Continuations']],
    EvalForStmt_1: [['env', 'Env'], ['nextStepCont', 'OnlyNextStepCont'], ['otherConts', 'Continuations']],
    EvalIfStmt_0: [['env', 'Env'], ['nextStepCont', 'OnlyNextStepCont'], ['otherConts', 'Continuations']],
    EvalIfStmt_1: [['env', 'Env'], ['nextStepCont', 'OnlyNextStepCont'], ['otherConts', 'Continuations']],
    EvalReturnStmt: [['env', 'Env'], ['nextStepCont', 'OnlyNextStepCont'], ['otherConts', 'Continuations']],
    EvalVarStmt_0: [['env', 'Env'], ['nextStepCont', 'OnlyNextStepCont'], ['otherConts', 'Continuations']],
    EvalVarStmt_1: [['env', 'Env'], ['nextStepCont', 'OnlyNextStepCont'], ['otherConts', 'Continuations']],
    EvalInvocation: [['fun', 'IValueRef'], ['env', 'Env'], ['returnCont', 'OnlyReturnCont']],
    EvalRefinement_0: [['valueRef', 'IValueRef'], ['env', 'Env'], ['returnCont', 'OnlyReturnCont']],
    EvalRefinement_1: [['valueRef', 'IValueRef'], ['env', 'Env'], ['returnCont', 'OnlyReturnCont']],
    EvalInvocationCircle_1: [['valueRef', 'IValueRef'], ['env', 'Env'], ['returnCont', 'OnlyReturnCont']],
    EvalInvocationCircle_0: [['valueRef', 'IValueRef'], ['env', 'Env'], ['returnCont', 'OnlyReturnCont']],
    EvalAfterIdInExpStmt_0: [['valueRef', 'IValueRef'], ['env', 'Env'], ['returnCont', 'OnlyReturnCont']],
    EvalAfterIdInExpStmt_1: [['valueRef', 'IValueRef'], ['env', 'Env'], ['returnCont', 'OnlyReturnCont']],
    EvalAfterIdInExpStmt_2: [['valueRef', 'IValueRef'], ['env', 'Env'], ['returnCont', 'OnlyReturnCont']],
    EvalAfterIdInExpStmt_3: [['valueRef', 'IValueRef'], ['env', 'Env'], ['returnCont', 'OnlyReturnCont']],
    EvalAfterIdInExpStmt_5: [['valueRef', 'IValueRef'], ['env', 'Env'], ['returnCont', 'OnlyReturnCont']],
    EvalAfterIdInExpStmt_6: [['valueRef', 'IValueRef'], ['env', 'Env'], ['returnCont', 'OnlyReturnCont']],
    EvalExpStmt: [['env', 'Env'], ['nextStepCont', 'OnlyNextStepCont'], ['otherConts', 'Continuations']],
    EvalStmts_0: [['env', 'Env'], ['blockConts', 'OnlyBlockEndCont'], ['stmtCtrlFlowConts', 'Continuations']],
    EvalStmts_1: [['env', 'Env'], ['blockConts', 'OnlyBlockEndCont'], ['stmtCtrlFlowConts', 'Continuations']],
    EvalParas_0: [['args', 'Value[]'], ['env', 'Env'], ['cont', 'OnlyNextStepCont']],
    EvalParas_1: [['args', 'Value[]'], ['env', 'Env'], ['cont', 'OnlyNextStepCont']],
    EvalFuncs_0: [['env', 'Env'], ['nextStepCont', 'OnlyNextStepCont']],
    EvalFuncs_1: [['env', 'Env'], ['nextStepCont', 'OnlyNextStepCont']],
    EvalCls: [['env', 'Env'], ['nextStepCont', 'OnlyNextStepCont']],
    EvalDoc: [['env', 'Env'], ['retCont', 'OnlyReturnCont']],
};
// 这个要由 CodeGen 来生成
const Dispatch = [
    'EvalFuncs',
    'EvalParas',
    'EvalStmt',
    'EvalVarStmt',
    'EvalIfStmt'
];

// 这个要由 CodeGen 来生成
const Forward = [
    'EvalStmt_0',
    'EvalStmt_1',
    'EvalStmt_2',
    'EvalStmt_3',
    'EvalStmt_4',
    'EvalBlock',
    'EvalAfterIdInExpStmt_4',// 只有 ["afterIdInExpStmt",["invocationCircle"]] 可以创建 forward 函数
    'EvalExp_0',
    'EvalExp_1',
    'EvalExp_2',
    'EvalLiteral_0',
    'EvalLiteral_1',
    'EvalLiteral_2',
    'EvalLiteral_3',
    'EvalLiteral_4',
    'EvalLiteral_5',
    // 'EvalBoolean_0', // not generate
    // 'EvalBoolean_1',
    'EvalObject_0',
    'EvalPairKey_0',
    'EvalPairKey_1',
    'EvalValue',
    'EvalArray',
    'EvalInvocation',
    'EvalRefinement_0',
    'EvalRefinement_1',
];