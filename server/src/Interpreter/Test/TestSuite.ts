import { ChartParser } from "../../LangSpec/ChartParser";
import { Node } from "../../LangSpec/GrammarMap";
import { Doc, Exp, Fun } from "../../LangSpec/NodeDef";
import { StringStream } from "../../StringStream";
import { assert, log } from "../../util";
import { Env } from "../Env";
import { EvalExp } from "../EvalDispatch";
import { EvalDoc, EvalFun } from "../EvalRule";
import { Init } from "../Init";

const AstOf = (root: Node, code: string, ) => {
    const p = new ChartParser(root);
    const ss = StringStream.New(code, 'func.fs');
    const ast = p.parse(ss);
    assert(ast != null);
    return ast;
};

const testFuncDef = () => {
    const root = 'fun';
    const code = 'func add(a, b,) { return a + b; }';
    const ast = AstOf(root, code);
    const env = new Env();

    EvalFun(ast!.Result as Fun, env, {
        return(result) {
            // log('result', result.Value);
        },
    });
};

const testExp = () => {
    const root = 'exp';
    const code = '1 + -1';
    const ast = AstOf(root, code);
    const env = new Env();
    EvalExp(ast!.Result as Exp, env, {
        return(result) {
            // log('add result', result.Value);
            assert(result.Value == 0);
        },
    });
};

const testFuncInvoke = () => {
    const env = new Env();
    {// init env
        const root = 'fun';
        const code = 'func add(a, b,) { return a + b; }';
        const ast = AstOf(root, code);
        EvalFun(ast!.Result as Fun, env, {
            return(result) {
                // log('result', result.Value);
            },
        });
    }
    {
        const root = 'exp';
        const code = 'add(1, 2,)';
        const ast = AstOf(root, code);
        EvalExp(ast!.Result as Exp, env, {
            return(result) {
                // log('invoke result', result.Value);
                assert(result.Value == 3);
            },
        });
    }
};

const testBuiltInFuncInvoke = () => {
    const env = new Env();
    const newEnv = Init(env);
    {
        const root = 'exp';
        const code = 'print(1, 2,)';
        const ast = AstOf(root, code);
        EvalExp(ast!.Result as Exp, newEnv, {
            return(result) {
                // log('invoke result', result.Value);
                // assert(result.Value == 3);
            },
        });
    }
};

// TODO check 空格换成 tab 会有问题吗?
const testDoc = () => {
    const env = new Env();
    const newEnv = Init(env);
    {
        const root = 'doc';
        const code = `
        class Calculator { 
            func Add(a, b,) {
                return a + b;
            }
            func Minus(a, b,) {
                return a - b;
            }
        }
        func main() {
            print('hello world',);
        }
    `;
        const ast = AstOf(root, code);
        EvalDoc(ast!.Result as Doc, newEnv, {
            return(result) {
                // log('invoke result', result.Value);
                // assert(result.Value == 3);
            },
        });
    }
};


export const test = function () {
    testBuiltInFuncInvoke();
    testFuncDef();
    testExp();
    testFuncInvoke();
    testDoc();
};


