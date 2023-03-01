export const EvalDoc = function (obj: Doc, env: Env, retCont: OnlyReturnCont,) {
    return EvalCls(obj.cls, env, retCont,);
};
export const EvalStmt_0 = function (obj: Stmt_0, env: Env, retCont: OnlyReturnCont,) {
    return EvalReturnStmt(obj.returnStmt, env, retCont,);
};
export const EvalStmt_1 = function (obj: Stmt_1, env: Env, retCont: OnlyReturnCont,) {
    return EvalVarStmt(obj.varStmt, env, retCont,);
};
export const EvalStmt_2 = function (obj: Stmt_2, env: Env, retCont: OnlyReturnCont,) {
    return EvalIfStmt(obj.ifStmt, env, retCont,);
};
export const EvalStmt_3 = function (obj: Stmt_3, env: Env, retCont: OnlyReturnCont,) {
    return EvalExpStmt(obj.expStmt, env, retCont,);
};
export const EvalStmt_4 = function (obj: Stmt_4, env: Env, retCont: OnlyReturnCont,) {
    return EvalForStmt(obj.forStmt, env, retCont,);
};
export const EvalBlock = function (obj: Block, env: Env, retCont: OnlyReturnCont,) {
    return EvalStmts(obj.stmts, env, retCont,);
};
export const EvalAfterIdInExpStmt_0 = function (obj: AfterIdInExpStmt_0, env: Env, retCont: OnlyReturnCont,) {
    return EvalExp(obj.exp, env, retCont,);
};
export const EvalAfterIdInExpStmt_1 = function (obj: AfterIdInExpStmt_1, env: Env, retCont: OnlyReturnCont,) {
    return EvalExpStmt(obj.expStmt, env, retCont,);
};
export const EvalAfterIdInExpStmt_2 = function (obj: AfterIdInExpStmt_2, env: Env, retCont: OnlyReturnCont,) {
    return EvalExp(obj.exp, env, retCont,);
};
export const EvalAfterIdInExpStmt_3 = function (obj: AfterIdInExpStmt_3, env: Env, retCont: OnlyReturnCont,) {
    return EvalExp(obj.exp, env, retCont,);
};
export const EvalAfterIdInExpStmt_4 = function (obj: AfterIdInExpStmt_4, env: Env, retCont: OnlyReturnCont,) {
    return EvalInvocationCircle(obj.invocationCircle, env, retCont,);
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
    return EvalObject(obj.object, env, retCont,);
};
export const EvalLiteral_4 = function (obj: Literal_4, env: Env, retCont: OnlyReturnCont,) {
    return EvalArray(obj.array, env, retCont,);
};
export const EvalLiteral_5 = function (obj: Literal_5, env: Env, retCont: OnlyReturnCont,) {
    return EvalFun(obj.fun, env, retCont,);
};
export const EvalBoolean_0 = function (obj: Boolean_0, env: Env, retCont: OnlyReturnCont,) {
    return EvalTrue(obj.true, env, retCont,);
};
export const EvalBoolean_1 = function (obj: Boolean_1, env: Env, retCont: OnlyReturnCont,) {
    return EvalFalse(obj.false, env, retCont,);
};
export const EvalObject = function (obj: Object, env: Env, retCont: OnlyReturnCont,) {
    return EvalPairs(obj.pairs, env, retCont,);
};
export const EvalKey_0 = function (obj: Key_0, env: Env, retCont: OnlyReturnCont,) {
    return EvalString(obj.string, env, retCont,);
};
export const EvalKey_1 = function (obj: Key_1, env: Env, retCont: OnlyReturnCont,) {
    return EvalId(obj.id, env, retCont,);
};
export const EvalValue = function (obj: Value, env: Env, retCont: OnlyReturnCont,) {
    return EvalExp(obj.exp, env, retCont,);
};
export const EvalArray = function (obj: Array, env: Env, retCont: OnlyReturnCont,) {
    return EvalItems(obj.items, env, retCont,);
};
export const EvalInvocation = function (obj: Invocation, env: Env, retCont: OnlyReturnCont,) {
    return EvalItems(obj.items, env, retCont,);
};
export const EvalRefinement_0 = function (obj: Refinement_0, env: Env, retCont: OnlyReturnCont,) {
    return EvalId(obj.id, env, retCont,);
};
export const EvalRefinement_1 = function (obj: Refinement_1, env: Env, retCont: OnlyReturnCont,) {
    return EvalExp(obj.exp, env, retCont,);
};
