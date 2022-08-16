// 画图生成下面这些函数的组合，在画图的过程中考虑空格(Optional, OneOrMore)，空白也有很多种类型，换行，tab 之类
// 返回为 null，传入的 input 目前在哪个位置不保证，由调用者来控制
// input 参数应该在 parser 函数里用过一次，其他地方不再用于 parser 了
// 写单元测试

import {
    ParserInput,
    ParserResult,
    IParser,
    debug,
    Text,
    logWith,
    Indent,
} from "./IParser";
import { log } from "./util";

// export type Parser<T> = (input: ParserInput) => ParserResult<T>; // 感觉这里的返回结果表示，和函数里返回类型表示形式不太统一，那里是冒号，这里是箭头

export class WordParser<T> implements IParser<T> {
    private mWord: string;
    private mResultFactory: (w: Text) => T;

    constructor(word: string, resultFactory: (w: Text) => T) {
        this.mWord = word;
        this.mResultFactory = resultFactory;
    }

    @debug()
    public parse(input: ParserInput): ParserResult<T> {
        let word = this.mWord;
        const t = Text.Empty();
        // log(`word parse "${word}"`);
        for (let i = 0; i < word.length; i++) {
            const c = input.NextChar;
            if (c.Equal(word[i])) {
                t.Append(c);
                continue;
            }
            logWith(Indent.SameToCurrent, `failed on ${i}, expect "${word[i]}", actual: "${JSON.stringify(c)}"`);
            return null;
        }

        return {
            Result: this.mResultFactory(t),
            Remain: input,
        };
    }
}
export function makeWordParser<T>(word: string, resultFactory: (w: Text) => T): IParser<T> {
    return new WordParser(word, resultFactory);
}

interface IIncludes {
    includes(s: string): boolean;
}

export class OneOfCharsParser<T> implements IParser<T> {
    private mChars: IIncludes;
    private mResultFactory: (w: Text) => T;

    constructor(chars: IIncludes, resultFactory: (w: Text) => T) {
        this.mChars = chars;
        this.mResultFactory = resultFactory;
    }

    @debug()
    public parse(input: ParserInput): ParserResult<T> {
        const c = input.NextChar;
        let chars = this.mChars;
        // log('chars', chars, 'c', c.Value);
        if (chars.includes(c.Value)) {
            return {
                Result: this.mResultFactory(c),
                Remain: input,
            };
        }
        return null;
    }
}
export function oneOf<T>(chars: IIncludes, resultProcessor: (c: Text) => T): IParser<T> {
    return new OneOfCharsParser(chars, resultProcessor);
}

class LazyParser<T> implements IParser<T> {
    private mActualParserGentor: () => IParser<T>;

    constructor(actualParserGentor: () => IParser<T>) {
        this.mActualParserGentor = actualParserGentor;
    }

    @debug()
    parse(input: ParserInput): ParserResult<T> {
        // log('lazy', this.mActualParserGentor);
        const p = this.mActualParserGentor();
        return p.parse(input);
    }
}

export const lazy = <T>(actualParserGentor: () => IParser<T>): LazyParser<T> => {
    return new LazyParser(actualParserGentor);
};

class NotParser<T> implements IParser<T> {
    private mChars: IIncludes;
    private mResultFactory: (w: Text) => T;

    constructor(chars: IIncludes, resultProcessor: (c: Text) => T) {
        this.mChars = chars;
        this.mResultFactory = resultProcessor;
    }

    @debug()
    public parse(input: ParserInput): ParserResult<T> {
        const c = input.NextChar;
        let chars = this.mChars;
        if (!chars.includes(c.Value)) {
            return {
                Result: this.mResultFactory(c),
                Remain: input,
            };
        } else {
            return null;
        }
    }    
}

export const not = <T>(chars: IIncludes, resultProcessor: (c: Text) => T): NotParser<T> => {
    return new NotParser(chars, resultProcessor);
};