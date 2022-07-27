import { Text } from "./IParser";

export const log = console.log.bind(console);

export const combine = function(...texts: Text[]) {
    return texts.reduce(Text.Combine);
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

