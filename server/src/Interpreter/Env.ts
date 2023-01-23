import { Array, Boolean, Fun, Object_0 } from "../LangSpec/NodeDef";
import { Number } from "../LangSpec/Number";
import { String } from "../LangSpec/String";




class CustomType {
    private mObject: any;

    public New(): CustomType {
        throw new Error('not implement');
    }

    public Invoke(methodName: string) {

    }

    public Get(propertyName: string) {

    }
}
// 下面这个 item 多了后可以换成接口，供外面实现
// evaluate 的返回值类型
// TODO 下面最后两个类型好像有问题，因为里面的项也能携带当前 Env，所以变量定义就变了
export type Value = CustomType | String | Boolean | { Func: Fun, Env: Env, } | Number | { [key: string]: Value } | Value[];
// Eval 过程中最好在当前 Env 的基础上，返回一个新的 Env，这样方便隔离：哪些语句共享一个 Env
export class Env {
    private mEnv: Record<string, Value>;
    private mParentEnv?: Env;

    public constructor(parentEnv?: Env) {
        this.mEnv = {};
        this.mParentEnv = parentEnv;
    }

    public Lookup(name: string): Value {
        if (name in this.mEnv) {
            return this.mEnv[name];
        } else if (this.mParentEnv) {
            return this.mParentEnv.Lookup(name);
        } else {
            throw new Error(`${name} not defined`);
        }
    }

    // Env 的 Update 的实现方式，导致允许状态（更新）的存在，以及共享一个 Env、共享更新
    public Update(name: string, value: Value) {
        if (name in this.mEnv) {
            this.mEnv[name] = value;
        } else if (this.mParentEnv) {
            this.mParentEnv.Update(name, value);
        } else {
            throw new Error(`${name} not defined, cannot update`);
        }
    }

    public Add(name: string, value: Value) {
        this.mEnv[name] = value;
    }

    public BornChildEnv(): Env {
        return new Env(this);
    }
}