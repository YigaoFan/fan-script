
// parse sample
// func hello() {
// }
import { log, } from './util';

// 结果里应该不会有 NoOption，这个要想下
// const leftCom = (ts: NoOption | (string | NoOption)[], t: string | NoOption): (NoOption | (string | NoOption)[])[] => {
const leftCombine = <T>(ts: T[], t: T): T[] => { // 我这里的类型和上面他期望的类型并不完全一样，改成具体类型 string 后就编译不行了，看来是泛型起了作用，类型体操还不会啊
    // if (NoOption.equal(ts)) {
    //     return [t];
    // }
    var s = ts as T[];
    s.push(t);
    return s;
};

const notEmpty = <TValue>(value: TValue | null | undefined): value is TValue => {
    if (value === null || value === undefined /*|| NoOption.equal(value)*/) {
        return false;
    }
    const testDummy: TValue = value;
    return true;
};
const nullToEmptyArray = <T>(ts: T[] | null): T[] => (ts == null ? [] : ts);



// unit test for each up parser
export const test = function() {

};