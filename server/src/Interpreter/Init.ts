import { Env, ValueType } from "./Env";

export const Init = function (env: Env) {
    env = env.BornChildEnv();
    env.Add('print', {
        Type: ValueType.BuiltInFunc,
        Func: console.log.bind(console),
    });

    return env;
};