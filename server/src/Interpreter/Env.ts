import { Cls, Fun } from "../LangSpec/NodeDef";

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

export interface IValueRef {
    set Value(value: Value);
    get Value(): Value;
}

/**
 * R means right value
 */
export class RValueRef implements IValueRef {
    private mValue: Value;
    public static New(value: Value): RValueRef {
        return new RValueRef(value);
    }

    private constructor(value: Value) {
        this.mValue = value;
    }
    
    // 按理说，右值不能被 set
    public set Value(value: Value) {
        this.mValue = value;
    }
    public get Value(): Value {
        return this.mValue;
    }
}
/**
 * L means left value
 */
export class LNamedVarValueRef implements IValueRef {
    private mEnv: Env;
    private mName: string;

    public constructor(env: Env, name: string) {
        this.mEnv = env;
        this.mName = name;
    }

    public set Value(value: Value) {
        this.mEnv.Update(this.mName, value);
    }

    public get Value() {
        return this.mEnv.Lookup(this.mName);
    }    
}

export class LObjInnerValueRef implements IValueRef {
    private mObj: Obj;
    private mKey: string | number;

    public static New(obj: Obj, key: string | number): LObjInnerValueRef {
        return new LObjInnerValueRef(obj, key);
    }

    private constructor(obj: Obj, key: string | number) {
        this.mObj = obj;
        this.mKey = key;
    }
    public set Value(value: Value) {
        this.mObj[this.mKey] = value;
    }
    public get Value(): Value {
        return this.mObj[this.mKey];
    }
}

export type Obj = { [key: string]: Value };
export type Arr = Value[];
export type EvaledFun = { Func: Fun, Env: Env, };
// 下面这个 item 多了后可以换成接口，供外面实现
// evaluate 的返回值类型, evaled type
// TODO 下面最后两个类型好像有问题，因为里面的项也能携带当前 Env，所以变量定义就变了
// 先暂时直接用 js 里的类型，如 string，之后可能会用自定义的类型
// undefined as default return value
export type Value = { Cls: Cls, Env: Env, } | CustomType | string | boolean | EvaledFun | number | Obj | Arr | undefined;
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

    public LookupValueRefOf(name: string): LNamedVarValueRef {
        if (name in this.mEnv) {
            return new LNamedVarValueRef(this, name);
        } else if (this.mParentEnv) {
            return this.mParentEnv.LookupValueRefOf(name);
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