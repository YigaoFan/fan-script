// 画图生成下面这些函数的组合，在画图的过程中考虑空格(Optional, OneOrMore)，空白也有很多种类型，换行，tab 之类
// 返回为 null，传入的 input 目前在哪个位置不保证，由调用者来控制
// input 参数应该在 parser 函数里用过一次，其他地方不再用于 parser 了
// 写单元测试

// stateful
export interface IInputStream {
    get NextChar(): string;
    Copy(): IInputStream;
}
type ParseFullResult<T1, T2> = { Result: T1 | T2, Remain: ParserInput };
type ParseFailResult = null;
export type ParserInput = IInputStream;
// null for optional result
export type ParserResult<T> = ParseFullResult<T, null> | ParseFailResult;
export type Parser<T> = (input: ParserInput) => ParserResult<T>; // 感觉这里的返回结果表示，和函数里返回类型表示形式不太统一，那里是冒号，这里是箭头

export function makeWordParser<T>(word: string, resultFactory: (w: string)=> T): Parser<T> {
    return (input: ParserInput): ParserResult<T> => {
        for (let i = 0; i < word.length; i++) {
            const c = input.NextChar;
            if (c) {
                if (word[i] == c) {
                    continue;
                }
            }
            return null;
        }

        return {
            Result: resultFactory(word),
            Remain: input,
        };
    };
}

export function oneOf<T>(chars: string, resultProcessor: (c: string)=> T) {
    return (input: ParserInput): ParserResult<T> => {
        const c = input.NextChar;
        if (chars.includes(c)) {
            return {
                Result: resultProcessor(c),
                Remain: input,
            };
        }
        return null;
    };
}
