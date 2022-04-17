// 画图生成下面这些函数的组合，在画图的过程中考虑空格(Optional, OneOrMore)，空白也有很多种类型，换行，tab 之类
// 返回为 null，传入的 input 目前在哪个位置不保证，由调用者来控制
// input 参数应该在 parser 函数里用过一次，其他地方不再用于 parser 了
// 写单元测试

import {
    ParserInput,
    ParserResult,
    IParser,
    debug,
} from "./IParser";

// export type Parser<T> = (input: ParserInput) => ParserResult<T>; // 感觉这里的返回结果表示，和函数里返回类型表示形式不太统一，那里是冒号，这里是箭头

export class WordParser<T> implements IParser<T> {
    private mWord: string;
    private mResultFactory: (w: string) => T;

    constructor(word: string, resultFactory: (w: string) => T) {
        this.mWord = word;
        this.mResultFactory = resultFactory;
    }

    @debug()
    public parse(input: ParserInput): ParserResult<T> {
        let word = this.mWord;
        for(let i = 0; i <word.length; i++) {
            const c = input.NextChar;
            if (c) {
                if (word[i] == c) {
                    continue;
                }
            }
            return null;
        }

        return {
            Result: this.mResultFactory(this.mWord),
            Remain: input,
        };
    }
}
export function makeWordParser<T>(word: string, resultFactory: (w: string) => T): IParser<T> {
    return new WordParser(word, resultFactory);
}

export class OneOfCharsParser<T> implements IParser<T> {
    private mChars: string;
    private mResultFactory: (w: string) => T;

    public static make<T>(chars: string, resultFactory: (w: string) => T): WordParser<T> {
        return new WordParser(chars, resultFactory);
    }

    constructor(chars: string, resultFactory: (w: string) => T) {
        this.mChars = chars;
        this.mResultFactory = resultFactory;
    }

    @debug()
    public parse(input: ParserInput): ParserResult<T> {
        const c = input.NextChar;
        let chars = this.mChars;
        if (chars.includes(c)) {
            return {
                Result: this.mResultFactory(c),
                Remain: input,
            };
        }
        return null;
    }
}
export function oneOf<T>(chars: string, resultProcessor: (c: string) => T): IParser<T> {
    return new OneOfCharsParser(chars, resultProcessor);
}
