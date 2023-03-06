import { UniversalNode } from "./UniversalNodeFactory";
import { PrefixOperator } from "./Expression";
import { InfixOperator } from "./Expression";
import { Identifier } from "./Identifier";
import { String } from "./String";
import { Number } from "./Number";
/**
 * @grammarRule ["doc",["ow","cls","ow"]]
 */
export class Doc extends UniversalNode {
    public get cls() { return this.Children[1] as Cls; }
}
/**
 * @grammarRule ["cls",["class","w","id","ow","{","ow","funcs","ow","}"]]
 */
export class Cls extends UniversalNode {
    public get class() { return this.Children[0]; }
    public get id() { return this.Children[2] as Identifier; }
    public get funcs() { return this.Children[6] as Funcs; }
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
    public get fun() { return this.Children[0] as Fun; }
    public get funcs() { return this.Children[2] as Funcs; }
}
export type Funcs = Funcs_0 | Funcs_1;
/**
 * @grammarRule ["fun",["func","w","id","ow","(","ow","paras","ow",")","ow","block"]]
 */
export class Fun extends UniversalNode {
    public get func() { return this.Children[0]; }
    public get id() { return this.Children[2] as Identifier; }
    public get paras() { return this.Children[6] as Paras; }
    public get block() { return this.Children[10] as Block; }
}
/**
 * @grammarRule ["paras",["id","ow",",","ow","paras"]]
 */
export class Paras_0 extends UniversalNode {
    public get id() { return this.Children[0] as Identifier; }
    public get paras() { return this.Children[4] as Paras; }
}
/**
 * @grammarRule ["paras",[]]
 */
export class Paras_1 extends UniversalNode {
}
export type Paras = Paras_0 | Paras_1;
/**
 * @grammarRule ["stmt",["returnStmt",";"]]
 */
export class Stmt_0 extends UniversalNode {
    public get returnStmt() { return this.Children[0] as ReturnStmt; }
}
/**
 * @grammarRule ["stmt",["varStmt",";"]]
 */
export class Stmt_1 extends UniversalNode {
    public get varStmt() { return this.Children[0] as VarStmt; }
}
/**
 * @grammarRule ["stmt",["ifStmt"]]
 */
export class Stmt_2 extends UniversalNode {
    public get ifStmt() { return this.Children[0] as IfStmt; }
}
/**
 * @grammarRule ["stmt",["expStmt",";"]]
 */
export class Stmt_3 extends UniversalNode {
    public get expStmt() { return this.Children[0] as ExpStmt; }
}
/**
 * @grammarRule ["stmt",["forStmt"]]
 */
export class Stmt_4 extends UniversalNode {
    public get forStmt() { return this.Children[0] as ForStmt; }
}
export type Stmt = Stmt_0 | Stmt_1 | Stmt_2 | Stmt_3 | Stmt_4;
/**
 * @grammarRule ["varStmt",["var","w","id","ow","=","ow","exp","ow"]]
 */
export class VarStmt_0 extends UniversalNode {
    public get var() { return this.Children[0]; }
    public get id() { return this.Children[2] as Identifier; }
    public get exp() { return this.Children[6] as Exp; }
}
/**
 * @grammarRule ["varStmt",["var","w","id","ow"]]
 */
export class VarStmt_1 extends UniversalNode {
    public get var() { return this.Children[0]; }
    public get id() { return this.Children[2] as Identifier; }
}
export type VarStmt = VarStmt_0 | VarStmt_1;
/**
 * @grammarRule ["returnStmt",["return","w","exp","ow"]]
 */
export class ReturnStmt extends UniversalNode {
    public get return() { return this.Children[0]; }
    public get exp() { return this.Children[2] as Exp; }
}
/**
 * @grammarRule ["ifStmt",["if","ow","(","ow","exp","ow",")","ow","block","ow","else","ow","block"]]
 */
export class IfStmt_0 extends UniversalNode {
    public get if() { return this.Children[0]; }
    public get exp() { return this.Children[4] as Exp; }
    public get block_0() { return this.Children[8] as Block; }
    public get block_1() { return this.Children[12] as Block; }
    public get else() { return this.Children[10]; }
}
/**
 * @grammarRule ["ifStmt",["if","ow","(","ow","exp","ow",")","ow","block"]]
 */
export class IfStmt_1 extends UniversalNode {
    public get if() { return this.Children[0]; }
    public get exp() { return this.Children[4] as Exp; }
    public get block() { return this.Children[8] as Block; }
}
export type IfStmt = IfStmt_0 | IfStmt_1;
/**
 * @grammarRule ["forStmt",["for","ow","(","ow","varStmt","ow",";","ow","exp","ow",";","ow","stmt","ow",")","ow","block"]]
 */
export class ForStmt_0 extends UniversalNode {
    public get for() { return this.Children[0]; }
    public get varStmt() { return this.Children[4] as VarStmt; }
    public get exp() { return this.Children[8] as Exp; }
    public get stmt() { return this.Children[12] as Stmt; }
    public get block() { return this.Children[16] as Block; }
}
/**
 * @grammarRule ["forStmt",["for","ow","(","ow","expStmt","ow",";","ow","exp","ow",";","ow","stmt","ow",")","ow","block"]]
 */
export class ForStmt_1 extends UniversalNode {
    public get for() { return this.Children[0]; }
    public get expStmt() { return this.Children[4] as ExpStmt; }
    public get exp() { return this.Children[8] as Exp; }
    public get stmt() { return this.Children[12] as Stmt; }
    public get block() { return this.Children[16] as Block; }
}
export type ForStmt = ForStmt_0 | ForStmt_1;
/**
 * @grammarRule ["deleteStmt",["delete","w","exp","ow","refinement","ow"]]
 */
export class DeleteStmt extends UniversalNode {
    public get delete() { return this.Children[0]; }
    public get exp() { return this.Children[2] as Exp; }
    public get refinement() { return this.Children[4] as Refinement; }
}
/**
 * @grammarRule ["expStmt",["id","ow","afterIdInExpStmt","ow"]]
 */
export class ExpStmt extends UniversalNode {
    public get id() { return this.Children[0] as Identifier; }
    public get afterIdInExpStmt() { return this.Children[2] as AfterIdInExpStmt; }
}
/**
 * @grammarRule ["block",["{","ow","stmts","ow","}"]]
 */
export class Block extends UniversalNode {
    public get stmts() { return this.Children[2] as Stmts; }
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
    public get stmt() { return this.Children[0] as Stmt; }
    public get stmts() { return this.Children[2] as Stmts; }
}
export type Stmts = Stmts_0 | Stmts_1;
/**
 * @grammarRule ["afterIdInExpStmt",["=","ow","exp"]]
 */
export class AfterIdInExpStmt_0 extends UniversalNode {
    public get exp() { return this.Children[2] as Exp; }
}
/**
 * @grammarRule ["afterIdInExpStmt",["=","ow","expStmt"]]
 */
export class AfterIdInExpStmt_1 extends UniversalNode {
    public get expStmt() { return this.Children[2] as ExpStmt; }
}
/**
 * @grammarRule ["afterIdInExpStmt",["+=","ow","exp"]]
 */
export class AfterIdInExpStmt_2 extends UniversalNode {
    public get exp() { return this.Children[2] as Exp; }
}
/**
 * @grammarRule ["afterIdInExpStmt",["-=","ow","exp"]]
 */
export class AfterIdInExpStmt_3 extends UniversalNode {
    public get exp() { return this.Children[2] as Exp; }
}
/**
 * @grammarRule ["afterIdInExpStmt",["invocationCircle"]]
 */
export class AfterIdInExpStmt_4 extends UniversalNode {
    public get invocationCircle() { return this.Children[0] as InvocationCircle; }
}
/**
 * @grammarRule ["afterIdInExpStmt",["invocationCircle","ow","refinement","ow","afterIdInExpStmt"]]
 */
export class AfterIdInExpStmt_5 extends UniversalNode {
    public get invocationCircle() { return this.Children[0] as InvocationCircle; }
    public get refinement() { return this.Children[2] as Refinement; }
    public get afterIdInExpStmt() { return this.Children[4] as AfterIdInExpStmt; }
}
/**
 * @grammarRule ["afterIdInExpStmt",["refinement","ow","afterIdInExpStmt"]]
 */
export class AfterIdInExpStmt_6 extends UniversalNode {
    public get refinement() { return this.Children[0] as Refinement; }
    public get afterIdInExpStmt() { return this.Children[2] as AfterIdInExpStmt; }
}
export type AfterIdInExpStmt = AfterIdInExpStmt_0 | AfterIdInExpStmt_1 | AfterIdInExpStmt_2 | AfterIdInExpStmt_3 | AfterIdInExpStmt_4 | AfterIdInExpStmt_5 | AfterIdInExpStmt_6;
/**
 * @grammarRule ["invocationCircle",[]]
 */
export class InvocationCircle_0 extends UniversalNode {
}
/**
 * @grammarRule ["invocationCircle",["invocation","ow","invocationCircle"]]
 */
export class InvocationCircle_1 extends UniversalNode {
    public get invocation() { return this.Children[0] as Invocation; }
    public get invocationCircle() { return this.Children[2] as InvocationCircle; }
}
export type InvocationCircle = InvocationCircle_0 | InvocationCircle_1;
/**
 * @grammarRule ["exp",["literal"]]
 */
export class Exp_0 extends UniversalNode {
    public get literal() { return this.Children[0] as Literal; }
}
/**
 * @grammarRule ["exp",["id"]]
 */
export class Exp_1 extends UniversalNode {
    public get id() { return this.Children[0] as Identifier; }
}
/**
 * @grammarRule ["exp",["(","ow","exp","ow",")"]]
 */
export class Exp_2 extends UniversalNode {
    public get exp() { return this.Children[2] as Exp; }
}
/**
 * @grammarRule ["exp",["prefixOperator","ow","exp"]]
 */
export class Exp_3 extends UniversalNode {
    public get prefixOperator() { return this.Children[0] as PrefixOperator; }
    public get exp() { return this.Children[2] as Exp; }
}
/**
 * @grammarRule ["exp",["exp","ow","infixOperator","ow","exp"]]
 */
export class Exp_4 extends UniversalNode {
    public get exp_0() { return this.Children[0] as Exp; }
    public get exp_1() { return this.Children[4] as Exp; }
    public get infixOperator() { return this.Children[2] as InfixOperator; }
}
/**
 * @grammarRule ["exp",["exp","ow","?","ow","exp","ow",":","ow","exp"]]
 */
export class Exp_5 extends UniversalNode {
    public get exp_0() { return this.Children[0] as Exp; }
    public get exp_1() { return this.Children[4] as Exp; }
    public get exp_2() { return this.Children[8] as Exp; }
}
/**
 * @grammarRule ["exp",["exp","ow","invocation"]]
 */
export class Exp_6 extends UniversalNode {
    public get exp() { return this.Children[0] as Exp; }
    public get invocation() { return this.Children[2] as Invocation; }
}
/**
 * @grammarRule ["exp",["exp","ow","refinement"]]
 */
export class Exp_7 extends UniversalNode {
    public get exp() { return this.Children[0] as Exp; }
    public get refinement() { return this.Children[2] as Refinement; }
}
/**
 * @grammarRule ["exp",["new","w","exp","ow","invocation"]]
 */
export class Exp_8 extends UniversalNode {
    public get new() { return this.Children[0]; }
    public get exp() { return this.Children[2] as Exp; }
    public get invocation() { return this.Children[4] as Invocation; }
}
/**
 * @grammarRule ["exp",["delete","w","exp","ow","refinement"]]
 */
export class Exp_9 extends UniversalNode {
    public get delete() { return this.Children[0]; }
    public get exp() { return this.Children[2] as Exp; }
    public get refinement() { return this.Children[4] as Refinement; }
}
export type Exp = Exp_0 | Exp_1 | Exp_2 | Exp_3 | Exp_4 | Exp_5 | Exp_6 | Exp_7 | Exp_8 | Exp_9;
/**
 * @grammarRule ["literal",["string"]]
 */
export class Literal_0 extends UniversalNode {
    public get string() { return this.Children[0] as String; }
}
/**
 * @grammarRule ["literal",["boolean"]]
 */
export class Literal_1 extends UniversalNode {
    public get boolean() { return this.Children[0] as Boolean; }
}
/**
 * @grammarRule ["literal",["number"]]
 */
export class Literal_2 extends UniversalNode {
    public get number() { return this.Children[0] as Number; }
}
/**
 * @grammarRule ["literal",["object"]]
 */
export class Literal_3 extends UniversalNode {
    public get object() { return this.Children[0] as Object_0; }
}
/**
 * @grammarRule ["literal",["array"]]
 */
export class Literal_4 extends UniversalNode {
    public get array() { return this.Children[0] as Array; }
}
/**
 * @grammarRule ["literal",["fun"]]
 */
export class Literal_5 extends UniversalNode {
    public get fun() { return this.Children[0] as Fun; }
}
export type Literal = Literal_0 | Literal_1 | Literal_2 | Literal_3 | Literal_4 | Literal_5;
/**
 * @grammarRule ["boolean",["true"]]
 */
export class Boolean_0 extends UniversalNode {
    public get true() { return this.Children[0]; }
}
/**
 * @grammarRule ["boolean",["false"]]
 */
export class Boolean_1 extends UniversalNode {
    public get false() { return this.Children[0]; }
}
export type Boolean = Boolean_0 | Boolean_1;
/**
 * @grammarRule ["object",["{","ow","pairs","ow","}"]]
 */
export class Object_0 extends UniversalNode {
    public get pairs() { return this.Children[2] as Pairs; }
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
    public get pair() { return this.Children[0] as Pair; }
    public get pairs() { return this.Children[4] as Pairs; }
}
export type Pairs = Pairs_0 | Pairs_1;
/**
 * @grammarRule ["pair",["key","ow",":","ow","value"]]
 */
export class Pair extends UniversalNode {
    public get key() { return this.Children[0] as Key; }
    public get value() { return this.Children[4] as Value; }
}
/**
 * @grammarRule ["key",["string"]]
 */
export class Key_0 extends UniversalNode {
    public get string() { return this.Children[0] as String; }
}
/**
 * @grammarRule ["key",["id"]]
 */
export class Key_1 extends UniversalNode {
    public get id() { return this.Children[0] as Identifier; }
}
export type Key = Key_0 | Key_1;
/**
 * @grammarRule ["value",["exp"]]
 */
export class Value extends UniversalNode {
    public get exp() { return this.Children[0] as Exp; }
}
/**
 * @grammarRule ["array",["[","ow","items","ow","]"]]
 */
export class Array extends UniversalNode {
    public get items() { return this.Children[2] as Items; }
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
    public get exp() { return this.Children[0] as Exp; }
    public get items() { return this.Children[4] as Items; }
}
export type Items = Items_0 | Items_1;
/**
 * @grammarRule ["invocation",["(","ow","items","ow",")"]]
 */
export class Invocation extends UniversalNode {
    public get items() { return this.Children[2] as Items; }
}
/**
 * @grammarRule ["refinement",[".","ow","id"]]
 */
export class Refinement_0 extends UniversalNode {
    public get id() { return this.Children[2] as Identifier; }
}
/**
 * @grammarRule ["refinement",["[","ow","exp","ow","]"]]
 */
export class Refinement_1 extends UniversalNode {
    public get exp() { return this.Children[2] as Exp; }
}
export type Refinement = Refinement_0 | Refinement_1;
