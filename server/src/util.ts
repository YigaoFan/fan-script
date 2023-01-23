import { appendFileSync } from "fs";
import { format } from "util";
import { Text } from "./IParser";
import { ParserResult, } from "./IParser";

export const log = console.log.bind(console);
// export const log = function(...args: any[]) {
//     appendFileSync('debug.log', format(...args), 'utf-8');
//     appendFileSync('debug.log', '\n', 'utf-8');
// };

export const combine = function(...texts: Text[]) {
    return texts.reduce(Text.Combine, Text.Empty());
};

export const capitalizeFirstChar = function (s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
};

export const selectNotNull = <T>(...ts: (T | null)[]): T => {
    for (const t of ts) {
        if (t) {
            return t;
        }
    }
    throw new Error('all items in ts are null');
};

export const selectNotNullIn2DifferentType = <T1, T2>(t1: T1 | null, t2: T2 | null): T1 | T2 => {
    if (t1) {
        return t1;
    } else if (t2) {
        return t2;
    }
    throw new Error('two items are null');
};

export const asArray = <T>(...ts: T[]) => (ts);
export const exchangeParas = <T1, T2, T3>(func: (t1: T1, t2: T2)=> T3) => {
    return (t2: T2, t1: T1): T3 => {
        return func(t1, t2);
    };
};

export const formatParserResult = <T>(result: ParserResult<T>): string => {
    if (result === null) {
        return 'null';
    }

    // @ts-expect-error
    return `result: ${result.Result ? result.Result.constructor.name : ''} ${/*JSON.stringify(*/result.Result/*)*/} \n remain: ${result.Remain}`;
    // 建议给每个 ISyntaxNode 加个 toString() 接口来方便调试格式化
};

export const stringify = (obj: any): string => {
    return JSON.stringify(obj);
};

export const makeQuerablePromise = function<T>(promise: Promise<T>) {
    // Set initial state
    var isPending = true;
    var isRejected = false;
    var isFulfilled = false;

    // Observe the promise, saving the fulfillment in a closure scope.
    var result = promise.then(
        function(v) {
            isFulfilled = true;
            isPending = false;
            return v; 
        }, 
        function(e) {
            isRejected = true;
            isPending = false;
            throw e; 
        }
    );

    // @ts-expect-error
    result.isFulfilled = function() { return isFulfilled; };
    // @ts-expect-error
    result.isPending = function() { return isPending; };
    // @ts-expect-error
    result.isRejected = function() { return isRejected; };
    return result;
};

export const wait1 = async () => {
    return new Promise<void>(res => { setTimeout(res, 1000); });
};
