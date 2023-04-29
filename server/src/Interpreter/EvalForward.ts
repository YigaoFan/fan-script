import { Stmt_0, Stmt_1, Stmt_2, Stmt_3, Stmt_4, Block, AfterIdInExpStmt_4, Exp_0, Exp_1, Exp_2, Literal_0, Literal_1, Literal_2, Literal_3, Literal_4, Literal_5, Object_0, PairKey_0, PairKey_1, PairValue, Array, } from "../LangSpec/NodeDef";
import { Env, IValueRef, } from "./Env";
import { OnlyNextStepCont, Continuations, EvalReturnStmt, EvalExpStmt, OnlyBlockEndCont, OnlyReturnCont, EvalId, EvalString, EvalNumber, EvalFun, } from "./EvalRule";
import { EvalVarStmt, EvalIfStmt, EvalForStmt, EvalStmts, EvalInvocationCircle, EvalLiteral, EvalExp, EvalBoolean, EvalPairs, EvalItems, } from "./EvalDispatch";
export const EvalStmt_0 = function (obj: Stmt_0, env: Env, nextStepCont: OnlyNextStepCont, otherConts: Continuations,) {
    return EvalReturnStmt(obj.returnStmt, env, nextStepCont, otherConts,);
};
export const EvalStmt_1 = function (obj: Stmt_1, env: Env, nextStepCont: OnlyNextStepCont, otherConts: Continuations,) {
    return EvalVarStmt(obj.varStmt, env, nextStepCont, otherConts,);
};
export const EvalStmt_2 = function (obj: Stmt_2, env: Env, nextStepCont: OnlyNextStepCont, otherConts: Continuations,) {
    return EvalIfStmt(obj.ifStmt, env, nextStepCont, otherConts,);
};
export const EvalStmt_3 = function (obj: Stmt_3, env: Env, nextStepCont: OnlyNextStepCont, otherConts: Continuations,) {
    return EvalExpStmt(obj.expStmt, env, nextStepCont, otherConts,);
};
export const EvalStmt_4 = function (obj: Stmt_4, env: Env, nextStepCont: OnlyNextStepCont, otherConts: Continuations,) {
    return EvalForStmt(obj.forStmt, env, nextStepCont, otherConts,);
};
export const EvalBlock = function (obj: Block, env: Env, blockConts: OnlyBlockEndCont, stmtCtrlFlowConts: Continuations,) {
    return EvalStmts(obj.stmts, env, blockConts, stmtCtrlFlowConts,);
};
export const EvalAfterIdInExpStmt_4 = function (obj: AfterIdInExpStmt_4, valueRef: IValueRef, env: Env, returnCont: OnlyReturnCont,) {
    return EvalInvocationCircle(obj.invocationCircle, valueRef, env, returnCont,);
};
export const EvalExp_0 = function (obj: Exp_0, env: Env, retCont: OnlyReturnCont,) {
    return EvalLiteral(obj.literal, env, retCont,);
};
export const EvalExp_1 = function (obj: Exp_1, env: Env, retCont: OnlyReturnCont,) {
    return EvalId(obj.id, env, retCont,);
};
export const EvalExp_2 = function (obj: Exp_2, env: Env, retCont: OnlyReturnCont,) {
    return EvalExp(obj.exp, env, retCont,);
};
export const EvalLiteral_0 = function (obj: Literal_0, env: Env, retCont: OnlyReturnCont,) {
    return EvalString(obj.string, env, retCont,);
};
export const EvalLiteral_1 = function (obj: Literal_1, env: Env, retCont: OnlyReturnCont,) {
    return EvalBoolean(obj.boolean, env, retCont,);
};
export const EvalLiteral_2 = function (obj: Literal_2, env: Env, retCont: OnlyReturnCont,) {
    return EvalNumber(obj.number, env, retCont,);
};
export const EvalLiteral_3 = function (obj: Literal_3, env: Env, retCont: OnlyReturnCont,) {
    return EvalObject_0(obj.object, env, retCont,);
};
export const EvalLiteral_4 = function (obj: Literal_4, env: Env, retCont: OnlyReturnCont,) {
    return EvalArray(obj.array, env, retCont,);
};
export const EvalLiteral_5 = function (obj: Literal_5, env: Env, retCont: OnlyReturnCont,) {
    return EvalFun(obj.fun, env, retCont,);
};
export const EvalObject_0 = function (obj: Object_0, env: Env, retCont: OnlyReturnCont,) {
    return EvalPairs(obj.pairs, env, retCont,);
};
export const EvalPairKey_0 = function (obj: PairKey_0, env: Env, retCont: OnlyReturnCont,) {
    return EvalId(obj.id, env, retCont,);
};
export const EvalPairKey_1 = function (obj: PairKey_1, env: Env, retCont: OnlyReturnCont,) {
    return EvalString(obj.string, env, retCont,);
};
export const EvalPairValue = function (obj: PairValue, env: Env, retCont: OnlyReturnCont,) {
    return EvalExp(obj.exp, env, retCont,);
};
export const EvalArray = function (obj: Array, env: Env, retCont: OnlyReturnCont,) {
    return EvalItems(obj.items, env, retCont,);
};