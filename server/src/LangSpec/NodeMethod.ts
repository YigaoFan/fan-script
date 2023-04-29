// 针对每个 rule 对应的 node 要挂载上去的方法，但目前想下来好像没有什么需要挂的方法
// {
//     Rule: xxxrule,
//     methodA: (thisArg: obj, ...args) {

//     }
// }
type IsEqual_1<A> = <T>() => T extends A ? 1 : 0;// 这好像是一个函数
type b = IsEqual_1<'cond'>;
type bb = b extends Function ? true : false;// 果然是一个模板函数
type IsEqual<A, B> = (<T>() => T extends A ? 1 : 0) extends <T>() => T extends B ? 1 : 0 ? true : false;
// 上面这个看不懂
type _IndexOf<T, U, Acc extends unknown[]> = T extends []
    ? -1
    : T extends readonly [infer Head, ...infer Tail]
    ? IsEqual<Head, U> extends true
    ? Acc['length']
    : _IndexOf<Tail, U, [...Acc, Head]>
    : never;

type IndexOf<T, U> = _IndexOf<T, U, []>;
const rule = ['if-stmt', 'cond', 'block'] as const;

type i = IndexOf<typeof rule, 'cond'>;
type IndexObjectOf<T extends readonly any[]> = { [Key in T[number]]: IndexOf<T, Key> };
type indexObj = IndexObjectOf<typeof rule>; // use this to help access specific node
type ObjGetter = { [key in keyof indexObj]: () => string; };
// const obj: ObjGetter = { [key in keyof IndexObj]: 1,};