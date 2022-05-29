import { makeWordParser, oneOf, lazy, not, } from "../parser";
import {
    from,
    optional,
    appendString,
    withHandleNull,
    id,
    nullize,
    selectLeft,
    selectNonblank,
    selectRight,
    or,
} from "../combinator";
import { IParser, ParserResult, Text, Range, } from "../IParser";
import { ISyntaxNode, } from '../ISyntaxNode';

// leftWith 和 rightWith 容易在 IParser<T> 的 T 中引入 NoOption
// 有没有 NoOption 只有业务层知道
// export const handleNoOption = <T1, T2>(t1: T1, t2: T2) => (t2);
/**
 * @returns empty if both are null.
 */
const selectNotNull = (s1: Text | null, s2: Text | null): Text => {
    var a = s1;
    var b = s2;
    if (a) {
        return a;
    } else if (b) {
        return b;
    } else {
        throw new Error('all paras in selectNotNull are null');
    }
};
/**
 * @param texts must be adjacent.
 */
const combine = (texts: Text[]): Text => {
    return texts.reduce((prev, current) => (Text.Combine(prev, current)));
};

// 这里如何写出 " 匹配 "， ' 匹配 '呢，这好像正是正则表达式的缺陷
// 不是，这是上下文相关语法
// 感觉得有项机制从之前解析过的东西拿东西出来，然后设到后面的解析器中
const genString = (delimiter: string): IParser<Text> => {
    const content = from(or(
        not(delimiter, id),
        makeWordParser('\\' + delimiter, s => s.SubText(1)),
        selectNotNull))
        .zeroOrMore(combine)
        .raw;
    return from(makeWordParser(delimiter, nullize))
        .rightWith(content, selectRight)
        .rightWith(makeWordParser(delimiter, nullize), selectLeft)
        .raw;
};
// 检查各处 IParser<T> 中的 T 的类型是否正确
export const string = or(genString('"'), genString("'"), (a, b): String => {
    if (a) {
        return new String(a);
    } else if (b) {
        return new String(b);
    } else {
        throw new Error('either ');
    }
}) as IParser<String>;

// 这里测试的时候可能需要多次转义来测试，毕竟读取和在代码里用字符串字面量表示不一样
export class String implements ISyntaxNode {
    private mText: Text | null;

    // 转义的事情处理好了吗
    public constructor(text: Text) {
        this.mText = text;
    }

    get Valid(): boolean {
        return this.mText != null;
    }

    public get Range(): Range | null {
        if (this.mText) {
            return this.mText.Range;
        }
        return null;        
    }

    public set Range(range: Range | null) { // 这里和接口类型不一样也行嘛
        if (this.mText && range) {
            this.mText.Range = range;
        }
    }

    public get Content(): Text | null {
        return this.mText;
    }
}
