import { Env } from "./Env";
import { Items, Items_0, Items_1, Pairs, Pairs_0, Pairs_1, Stmt, Stmt_0, Stmt_1, Stmt_2, Stmt_3, Stmt_4, Stmt_5, } from "../LangSpec/NodeDef";
import { OnlyReturnCont, EvalItems_0, EvalItems_1, EvalPairs_0, EvalPairs_1, OnlyNextStepCont, Continuations, EvalStmt_0, EvalStmt_1, EvalStmt_2, EvalStmt_3, EvalStmt_4, EvalStmt_5, } from "./EvalRule";
export const EvalItems = function (obj: Items, env: Env, retCont: OnlyReturnCont,) {
    if (obj instanceof Items_0) {
        EvalItems_0(obj, env, retCont,); 
    } else if (obj instanceof Items_1) {
        EvalItems_1(obj, env, retCont,); 
    } else {
        throw new Error('encounter unknown type in EvalItems');
    }
};
export const EvalPairs = function (obj: Pairs, env: Env, retCont: OnlyReturnCont,) {
    if (obj instanceof Pairs_0) {
        EvalPairs_0(obj, env, retCont,); 
    } else if (obj instanceof Pairs_1) {
        EvalPairs_1(obj, env, retCont,); 
    } else {
        throw new Error('encounter unknown type in EvalPairs');
    }
};
export const EvalStmt = function (obj: Stmt, env: Env, nextStepCont: OnlyNextStepCont, otherConts: Continuations,) {
    if (obj instanceof Stmt_0) {
        EvalStmt_0(obj, env, nextStepCont, otherConts,); 
    } else if (obj instanceof Stmt_1) {
        EvalStmt_1(obj, env, nextStepCont, otherConts,); 
    } else if (obj instanceof Stmt_2) {
        EvalStmt_2(obj, env, nextStepCont, otherConts,); 
    } else if (obj instanceof Stmt_3) {
        EvalStmt_3(obj, env, nextStepCont, otherConts,); 
    } else if (obj instanceof Stmt_4) {
        EvalStmt_4(obj, env, nextStepCont, otherConts,); 
    } else if (obj instanceof Stmt_5) {
        EvalStmt_5(obj, env, nextStepCont, otherConts,); 
    } else {
        throw new Error('encounter unknown type in EvalStmt');
    }
};
