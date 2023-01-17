import { UniversalNode } from "./UniversalNodeFactory";
/**
 * @grammarRule ["doc",["ow","cls","ow"]]
 */
export class Doc extends UniversalNode {
    public get cls() { return this.Children[1]; }
}
/**
 * @grammarRule ["cls",["class","w","id","ow","{","ow","funcs","ow","}"]]
 */
export class Cls extends UniversalNode {
    public get class() { return this.Children[0]; }
    public get id() { return this.Children[2]; }
    public get funcs() { return this.Children[6]; }
}
/**
 * @grammarRule ["funcs",[]]
 */
export class Funcs_0 extends UniversalNode {
}
/**
 * @grammarRule ["funcs",["fun","ow","funcs"]]
 */
export class Funcs_1 extends UniversalNode {
    public get fun() { return this.Children[0]; }
    public get funcs() { return this.Children[2]; }
}
/**
 * @grammarRule ["fun",["func","w","id","ow","(","ow","paras","ow",")","ow","block"]]
 */
export class Fun extends UniversalNode {
    public get func() { return this.Children[0]; }
    public get id() { return this.Children[2]; }
    public get paras() { return this.Children[6]; }
    public get block() { return this.Children[10]; }
}
/**
 * @grammarRule ["paras",["id","ow",",","ow","paras"]]
 */
export class Paras_0 extends UniversalNode {
    public get id() { return this.Children[0]; }
    public get paras() { return this.Children[4]; }
}
/**
 * @grammarRule ["paras",[]]
 */
export class Paras_1 extends UniversalNode {
}
/**
 * @grammarRule ["stmt",["returnStmt",";"]]
 */
export class Stmt_0 extends UniversalNode {
    public get returnStmt() { return this.Children[0]; }
}
/**
 * @grammarRule ["stmt",["deleteStmt",";"]]
 */
export class Stmt_1 extends UniversalNode {
    public get deleteStmt() { return this.Children[0]; }
}
/**
 * @grammarRule ["stmt",["varStmt",";"]]
 */
export class Stmt_2 extends UniversalNode {
    public get varStmt() { return this.Children[0]; }
}
/**
 * @grammarRule ["stmt",["ifStmt"]]
 */
export class Stmt_3 extends UniversalNode {
    public get ifStmt() { return this.Children[0]; }
}
/**
 * @grammarRule ["stmt",["expStmt",";"]]
 */
export class Stmt_4 extends UniversalNode {
    public get expStmt() { return this.Children[0]; }
}
/**
 * @grammarRule ["stmt",["forStmt"]]
 */
export class Stmt_5 extends UniversalNode {
    public get forStmt() { return this.Children[0]; }
}
/**
 * @grammarRule ["varStmt",["var","w","id","ow","=","ow","exp","ow"]]
 */
export class VarStmt_0 extends UniversalNode {
    public get var() { return this.Children[0]; }
    public get id() { return this.Children[2]; }
    public get exp() { return this.Children[6]; }
}
/**
 * @grammarRule ["varStmt",["var","w","id","ow"]]
 */
export class VarStmt_1 extends UniversalNode {
    public get var() { return this.Children[0]; }
    public get id() { return this.Children[2]; }
}
/**
 * @grammarRule ["returnStmt",["return","w","exp","ow"]]
 */
export class ReturnStmt extends UniversalNode {
    public get return() { return this.Children[0]; }
    public get exp() { return this.Children[2]; }
}
/**
 * @grammarRule ["ifStmt",["if","ow","(","ow","exp","ow",")","ow","block","ow","else","ow","block"]]
 */
export class IfStmt_0 extends UniversalNode {
    public get if() { return this.Children[0]; }
    public get exp() { return this.Children[4]; }
    public get block_0() { return this.Children[8]; }
    public get block_1() { return this.Children[12]; }
    public get else() { return this.Children[10]; }
}
/**
 * @grammarRule ["ifStmt",["if","ow","(","ow","exp","ow",")","ow","block"]]
 */
export class IfStmt_1 extends UniversalNode {
    public get if() { return this.Children[0]; }
    public get exp() { return this.Children[4]; }
    public get block() { return this.Children[8]; }
}
/**
 * @grammarRule ["forStmt",["for","ow","(","ow","or(varStmt, expStmt)","ow",";","ow","exp","ow",";","ow","stmt","ow",")","ow","block"]]
 */
export class ForStmt extends UniversalNode {
    public get for() { return this.Children[0]; }
    public get varStmtOrexpStmt() { return this.Children[4]; }
    public get exp() { return this.Children[8]; }
    public get stmt() { return this.Children[12]; }
    public get block() { return this.Children[16]; }
}
/**
 * @grammarRule ["deleteStmt",["delete","w","exp","ow","refinement","ow"]]
 */
export class DeleteStmt extends UniversalNode {
    public get delete() { return this.Children[0]; }
    public get exp() { return this.Children[2]; }
    public get refinement() { return this.Children[4]; }
}
/**
 * @grammarRule ["expStmt",["id","ow","afterIdInExpStmt","ow"]]
 */
export class ExpStmt extends UniversalNode {
    public get id() { return this.Children[0]; }
    public get afterIdInExpStmt() { return this.Children[2]; }
}
/**
 * @grammarRule ["block",["{","ow","stmts","ow","}"]]
 */
export class Block extends UniversalNode {
    public get stmts() { return this.Children[2]; }
}
/**
 * @grammarRule ["stmts",[]]
 */
export class Stmts_0 extends UniversalNode {
}
/**
 * @grammarRule ["stmts",["stmt","ow","stmts"]]
 */
export class Stmts_1 extends UniversalNode {
    public get stmt() { return this.Children[0]; }
    public get stmts() { return this.Children[2]; }
}
/**
 * @grammarRule ["afterIdInExpStmt",["=","ow","exp"]]
 */
export class AfterIdInExpStmt_0 extends UniversalNode {
    public get exp() { return this.Children[2]; }
}
/**
 * @grammarRule ["afterIdInExpStmt",["=","ow","expStmt"]]
 */
export class AfterIdInExpStmt_1 extends UniversalNode {
    public get expStmt() { return this.Children[2]; }
}
/**
 * @grammarRule ["afterIdInExpStmt",["+=","ow","exp"]]
 */
export class AfterIdInExpStmt_2 extends UniversalNode {
    public get exp() { return this.Children[2]; }
}
/**
 * @grammarRule ["afterIdInExpStmt",["-=","ow","exp"]]
 */
export class AfterIdInExpStmt_3 extends UniversalNode {
    public get exp() { return this.Children[2]; }
}
/**
 * @grammarRule ["afterIdInExpStmt",["invocationCircle"]]
 */
export class AfterIdInExpStmt_4 extends UniversalNode {
    public get invocationCircle() { return this.Children[0]; }
}
/**
 * @grammarRule ["afterIdInExpStmt",["invocationCircle","ow","refinement","ow","afterIdInExpStmt"]]
 */
export class AfterIdInExpStmt_5 extends UniversalNode {
    public get invocationCircle() { return this.Children[0]; }
    public get refinement() { return this.Children[2]; }
    public get afterIdInExpStmt() { return this.Children[4]; }
}
/**
 * @grammarRule ["afterIdInExpStmt",["refinement","ow","afterIdInExpStmt"]]
 */
export class AfterIdInExpStmt_6 extends UniversalNode {
    public get refinement() { return this.Children[0]; }
    public get afterIdInExpStmt() { return this.Children[2]; }
}
/**
 * @grammarRule ["invocationCircle",["invocation"]]
 */
export class InvocationCircle_0 extends UniversalNode {
    public get invocation() { return this.Children[0]; }
}
/**
 * @grammarRule ["invocationCircle",["invocation","ow","invocationCircle"]]
 */
export class InvocationCircle_1 extends UniversalNode {
    public get invocation() { return this.Children[0]; }
    public get invocationCircle() { return this.Children[2]; }
}
/**
 * @grammarRule ["exp",["literal"]]
 */
export class Exp_0 extends UniversalNode {
    public get literal() { return this.Children[0]; }
}
/**
 * @grammarRule ["exp",["id"]]
 */
export class Exp_1 extends UniversalNode {
    public get id() { return this.Children[0]; }
}
/**
 * @grammarRule ["exp",["(","ow","exp","ow",")"]]
 */
export class Exp_2 extends UniversalNode {
    public get exp() { return this.Children[2]; }
}
/**
 * @grammarRule ["exp",["prefix-operator","ow","exp"]]
 */
export class Exp_3 extends UniversalNode {
    public get exp() { return this.Children[2]; }
}
/**
 * @grammarRule ["exp",["exp","ow","infix-operator","ow","exp"]]
 */
export class Exp_4 extends UniversalNode {
    public get exp_0() { return this.Children[0]; }
    public get exp_1() { return this.Children[4]; }
}
/**
 * @grammarRule ["exp",["exp","ow","?","ow","exp","ow",":","ow","exp"]]
 */
export class Exp_5 extends UniversalNode {
    public get exp_0() { return this.Children[0]; }
    public get exp_1() { return this.Children[4]; }
    public get exp_2() { return this.Children[8]; }
}
/**
 * @grammarRule ["exp",["exp","ow","invocation"]]
 */
export class Exp_6 extends UniversalNode {
    public get exp() { return this.Children[0]; }
    public get invocation() { return this.Children[2]; }
}
/**
 * @grammarRule ["exp",["exp","ow","refinement"]]
 */
export class Exp_7 extends UniversalNode {
    public get exp() { return this.Children[0]; }
    public get refinement() { return this.Children[2]; }
}
/**
 * @grammarRule ["exp",["new","w","exp","ow","invocation"]]
 */
export class Exp_8 extends UniversalNode {
    public get new() { return this.Children[0]; }
    public get exp() { return this.Children[2]; }
    public get invocation() { return this.Children[4]; }
}
/**
 * @grammarRule ["exp",["delete","w","exp","ow","refinement"]]
 */
export class Exp_9 extends UniversalNode {
    public get delete() { return this.Children[0]; }
    public get exp() { return this.Children[2]; }
    public get refinement() { return this.Children[4]; }
}
/**
 * @grammarRule ["literal",["string"]]
 */
export class Literal_0 extends UniversalNode {
    public get string() { return this.Children[0]; }
}
/**
 * @grammarRule ["literal",["number"]]
 */
export class Literal_1 extends UniversalNode {
    public get number() { return this.Children[0]; }
}
/**
 * @grammarRule ["literal",["object"]]
 */
export class Literal_2 extends UniversalNode {
    public get object() { return this.Children[0]; }
}
/**
 * @grammarRule ["literal",["array"]]
 */
export class Literal_3 extends UniversalNode {
    public get array() { return this.Children[0]; }
}
/**
 * @grammarRule ["literal",["fun"]]
 */
export class Literal_4 extends UniversalNode {
    public get fun() { return this.Children[0]; }
}
/**
 * @grammarRule ["object",["{","ow","pairs","ow","}"]]
 */
export class Object_0 extends UniversalNode {
    public get pairs() { return this.Children[2]; }
}
/**
 * @grammarRule ["pairs",[]]
 */
export class Pairs_0 extends UniversalNode {
}
/**
 * @grammarRule ["pairs",["pair","ow",",","ow","pairs"]]
 */
export class Pairs_1 extends UniversalNode {
    public get pair() { return this.Children[0]; }
    public get pairs() { return this.Children[4]; }
}
/**
 * @grammarRule ["pair",["key","ow",":","ow","value"]]
 */
export class Pair extends UniversalNode {
    public get key() { return this.Children[0]; }
    public get value() { return this.Children[4]; }
}
/**
 * @grammarRule ["key",["string"]]
 */
export class Key_0 extends UniversalNode {
    public get string() { return this.Children[0]; }
}
/**
 * @grammarRule ["key",["id"]]
 */
export class Key_1 extends UniversalNode {
    public get id() { return this.Children[0]; }
}
/**
 * @grammarRule ["value",["exp"]]
 */
export class Value extends UniversalNode {
    public get exp() { return this.Children[0]; }
}
/**
 * @grammarRule ["array",["[","ow","items","ow","]"]]
 */
export class Array extends UniversalNode {
    public get items() { return this.Children[2]; }
}
/**
 * @grammarRule ["items",[]]
 */
export class Items_0 extends UniversalNode {
}
/**
 * @grammarRule ["items",["exp","ow",",","ow","items"]]
 */
export class Items_1 extends UniversalNode {
    public get exp() { return this.Children[0]; }
    public get items() { return this.Children[4]; }
}
/**
 * @grammarRule ["invocation",["(","ow","args","ow",")"]]
 */
export class Invocation extends UniversalNode {
    public get args() { return this.Children[2]; }
}
/**
 * @grammarRule ["args",["exp","ow",",","ow","args"]]
 */
export class Args_0 extends UniversalNode {
    public get exp() { return this.Children[0]; }
    public get args() { return this.Children[4]; }
}
/**
 * @grammarRule ["args",[]]
 */
export class Args_1 extends UniversalNode {
}
/**
 * @grammarRule ["refinement",[".","ow","id"]]
 */
export class Refinement_0 extends UniversalNode {
    public get id() { return this.Children[2]; }
}
/**
 * @grammarRule ["refinement",["[","ow","exp","ow","]"]]
 */
export class Refinement_1 extends UniversalNode {
    public get exp() { return this.Children[2]; }
}
