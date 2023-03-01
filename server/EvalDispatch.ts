import { Env } from "./Env";
import { Funcs, Funcs_0, Funcs_1, Paras, Paras_0, Paras_1, Stmt, Stmt_0, Stmt_1, Stmt_2, Stmt_3, Stmt_4, VarStmt, VarStmt_0, VarStmt_1, IfStmt, IfStmt_0, IfStmt_1, ForStmt, ForStmt_0, ForStmt_1, Stmts, Stmts_0, Stmts_1, AfterIdInExpStmt, AfterIdInExpStmt_0, AfterIdInExpStmt_1, AfterIdInExpStmt_2, AfterIdInExpStmt_3, AfterIdInExpStmt_4, AfterIdInExpStmt_5, AfterIdInExpStmt_6, InvocationCircle, InvocationCircle_0, InvocationCircle_1, Exp, Exp_0, Exp_1, Exp_2, Exp_3, Exp_4, Exp_5, Exp_6, Exp_7, Exp_8, Exp_9, Literal, Literal_0, Literal_1, Literal_2, Literal_3, Literal_4, Literal_5, Boolean, Boolean_0, Boolean_1, Pairs, Pairs_0, Pairs_1, Key, Key_0, Key_1, Items, Items_0, Items_1, Refinement, Refinement_0, Refinement_1, } from "../LangSpec/NodeDef";
import { OnlyReturnCont, EvalFuncs_0, EvalFuncs_1, EvalParas_0, EvalParas_1, EvalStmt_0, EvalStmt_1, EvalStmt_2, EvalStmt_3, EvalStmt_4, EvalVarStmt_0, EvalVarStmt_1, EvalIfStmt_0, EvalIfStmt_1, EvalForStmt_0, EvalForStmt_1, EvalStmts_0, EvalStmts_1, EvalAfterIdInExpStmt_0, EvalAfterIdInExpStmt_1, EvalAfterIdInExpStmt_2, EvalAfterIdInExpStmt_3, EvalAfterIdInExpStmt_4, EvalAfterIdInExpStmt_5, EvalAfterIdInExpStmt_6, EvalInvocationCircle_0, EvalInvocationCircle_1, EvalExp_0, EvalExp_1, EvalExp_2, EvalExp_3, EvalExp_4, EvalExp_5, EvalExp_6, EvalExp_7, EvalExp_8, EvalExp_9, EvalLiteral_0, EvalLiteral_1, EvalLiteral_2, EvalLiteral_3, EvalLiteral_4, EvalLiteral_5, EvalBoolean_0, EvalBoolean_1, EvalPairs_0, EvalPairs_1, EvalKey_0, EvalKey_1, EvalItems_0, EvalItems_1, EvalRefinement_0, EvalRefinement_1, } from "./EvalRule";
export const EvalFuncs = function (obj: Funcs, env: Env, retCont: OnlyReturnCont,) {
    if (obj instanceof Funcs_0) {
        EvalFuncs_0(obj, env, retCont,); 
    } else if (obj instanceof Funcs_1) {
        EvalFuncs_1(obj, env, retCont,); 
    } else {
        throw new Error('encounter unknown type in EvalFuncs');
    }
};
export const EvalParas = function (obj: Paras, env: Env, retCont: OnlyReturnCont,) {
    if (obj instanceof Paras_0) {
        EvalParas_0(obj, env, retCont,); 
    } else if (obj instanceof Paras_1) {
        EvalParas_1(obj, env, retCont,); 
    } else {
        throw new Error('encounter unknown type in EvalParas');
    }
};
export const EvalStmt = function (obj: Stmt, env: Env, retCont: OnlyReturnCont,) {
    if (obj instanceof Stmt_0) {
        EvalStmt_0(obj, env, retCont,); 
    } else if (obj instanceof Stmt_1) {
        EvalStmt_1(obj, env, retCont,); 
    } else if (obj instanceof Stmt_2) {
        EvalStmt_2(obj, env, retCont,); 
    } else if (obj instanceof Stmt_3) {
        EvalStmt_3(obj, env, retCont,); 
    } else if (obj instanceof Stmt_4) {
        EvalStmt_4(obj, env, retCont,); 
    } else {
        throw new Error('encounter unknown type in EvalStmt');
    }
};
export const EvalVarStmt = function (obj: VarStmt, env: Env, retCont: OnlyReturnCont,) {
    if (obj instanceof VarStmt_0) {
        EvalVarStmt_0(obj, env, retCont,); 
    } else if (obj instanceof VarStmt_1) {
        EvalVarStmt_1(obj, env, retCont,); 
    } else {
        throw new Error('encounter unknown type in EvalVarStmt');
    }
};
export const EvalIfStmt = function (obj: IfStmt, env: Env, retCont: OnlyReturnCont,) {
    if (obj instanceof IfStmt_0) {
        EvalIfStmt_0(obj, env, retCont,); 
    } else if (obj instanceof IfStmt_1) {
        EvalIfStmt_1(obj, env, retCont,); 
    } else {
        throw new Error('encounter unknown type in EvalIfStmt');
    }
};
export const EvalForStmt = function (obj: ForStmt, env: Env, retCont: OnlyReturnCont,) {
    if (obj instanceof ForStmt_0) {
        EvalForStmt_0(obj, env, retCont,); 
    } else if (obj instanceof ForStmt_1) {
        EvalForStmt_1(obj, env, retCont,); 
    } else {
        throw new Error('encounter unknown type in EvalForStmt');
    }
};
export const EvalStmts = function (obj: Stmts, env: Env, retCont: OnlyReturnCont,) {
    if (obj instanceof Stmts_0) {
        EvalStmts_0(obj, env, retCont,); 
    } else if (obj instanceof Stmts_1) {
        EvalStmts_1(obj, env, retCont,); 
    } else {
        throw new Error('encounter unknown type in EvalStmts');
    }
};
export const EvalAfterIdInExpStmt = function (obj: AfterIdInExpStmt, env: Env, retCont: OnlyReturnCont,) {
    if (obj instanceof AfterIdInExpStmt_0) {
        EvalAfterIdInExpStmt_0(obj, env, retCont,); 
    } else if (obj instanceof AfterIdInExpStmt_1) {
        EvalAfterIdInExpStmt_1(obj, env, retCont,); 
    } else if (obj instanceof AfterIdInExpStmt_2) {
        EvalAfterIdInExpStmt_2(obj, env, retCont,); 
    } else if (obj instanceof AfterIdInExpStmt_3) {
        EvalAfterIdInExpStmt_3(obj, env, retCont,); 
    } else if (obj instanceof AfterIdInExpStmt_4) {
        EvalAfterIdInExpStmt_4(obj, env, retCont,); 
    } else if (obj instanceof AfterIdInExpStmt_5) {
        EvalAfterIdInExpStmt_5(obj, env, retCont,); 
    } else if (obj instanceof AfterIdInExpStmt_6) {
        EvalAfterIdInExpStmt_6(obj, env, retCont,); 
    } else {
        throw new Error('encounter unknown type in EvalAfterIdInExpStmt');
    }
};
export const EvalInvocationCircle = function (obj: InvocationCircle, env: Env, retCont: OnlyReturnCont,) {
    if (obj instanceof InvocationCircle_0) {
        EvalInvocationCircle_0(obj, env, retCont,); 
    } else if (obj instanceof InvocationCircle_1) {
        EvalInvocationCircle_1(obj, env, retCont,); 
    } else {
        throw new Error('encounter unknown type in EvalInvocationCircle');
    }
};
export const EvalExp = function (obj: Exp, env: Env, retCont: OnlyReturnCont,) {
    if (obj instanceof Exp_0) {
        EvalExp_0(obj, env, retCont,); 
    } else if (obj instanceof Exp_1) {
        EvalExp_1(obj, env, retCont,); 
    } else if (obj instanceof Exp_2) {
        EvalExp_2(obj, env, retCont,); 
    } else if (obj instanceof Exp_3) {
        EvalExp_3(obj, env, retCont,); 
    } else if (obj instanceof Exp_4) {
        EvalExp_4(obj, env, retCont,); 
    } else if (obj instanceof Exp_5) {
        EvalExp_5(obj, env, retCont,); 
    } else if (obj instanceof Exp_6) {
        EvalExp_6(obj, env, retCont,); 
    } else if (obj instanceof Exp_7) {
        EvalExp_7(obj, env, retCont,); 
    } else if (obj instanceof Exp_8) {
        EvalExp_8(obj, env, retCont,); 
    } else if (obj instanceof Exp_9) {
        EvalExp_9(obj, env, retCont,); 
    } else {
        throw new Error('encounter unknown type in EvalExp');
    }
};
export const EvalLiteral = function (obj: Literal, env: Env, retCont: OnlyReturnCont,) {
    if (obj instanceof Literal_0) {
        EvalLiteral_0(obj, env, retCont,); 
    } else if (obj instanceof Literal_1) {
        EvalLiteral_1(obj, env, retCont,); 
    } else if (obj instanceof Literal_2) {
        EvalLiteral_2(obj, env, retCont,); 
    } else if (obj instanceof Literal_3) {
        EvalLiteral_3(obj, env, retCont,); 
    } else if (obj instanceof Literal_4) {
        EvalLiteral_4(obj, env, retCont,); 
    } else if (obj instanceof Literal_5) {
        EvalLiteral_5(obj, env, retCont,); 
    } else {
        throw new Error('encounter unknown type in EvalLiteral');
    }
};
export const EvalBoolean = function (obj: Boolean, env: Env, retCont: OnlyReturnCont,) {
    if (obj instanceof Boolean_0) {
        EvalBoolean_0(obj, env, retCont,); 
    } else if (obj instanceof Boolean_1) {
        EvalBoolean_1(obj, env, retCont,); 
    } else {
        throw new Error('encounter unknown type in EvalBoolean');
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
export const EvalKey = function (obj: Key, env: Env, retCont: OnlyReturnCont,) {
    if (obj instanceof Key_0) {
        EvalKey_0(obj, env, retCont,); 
    } else if (obj instanceof Key_1) {
        EvalKey_1(obj, env, retCont,); 
    } else {
        throw new Error('encounter unknown type in EvalKey');
    }
};
export const EvalItems = function (obj: Items, env: Env, retCont: OnlyReturnCont,) {
    if (obj instanceof Items_0) {
        EvalItems_0(obj, env, retCont,); 
    } else if (obj instanceof Items_1) {
        EvalItems_1(obj, env, retCont,); 
    } else {
        throw new Error('encounter unknown type in EvalItems');
    }
};
export const EvalRefinement = function (obj: Refinement, env: Env, retCont: OnlyReturnCont,) {
    if (obj instanceof Refinement_0) {
        EvalRefinement_0(obj, env, retCont,); 
    } else if (obj instanceof Refinement_1) {
        EvalRefinement_1(obj, env, retCont,); 
    } else {
        throw new Error('encounter unknown type in EvalRefinement');
    }
};
