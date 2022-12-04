import {
    from, id,
    nullize, or, selectLeft, selectRight
} from "../combinator";
import { IParser, Position, Text } from "../IParser";
import { IRange, ISyntaxNode } from "../ISyntaxNode";
import { makeWordParser, not } from "../parser";
import { combine, selectNotNull, stringify } from '../util';

// leftWith 和 rightWith 容易在 IParser<T> 的 T 中引入 NoOption
// 有没有 NoOption 只有业务层知道
// export const handleNoOption = <T1, T2>(t1: T1, t2: T2) => (t2);

// 这里如何写出 " 匹配 "， ' 匹配 '呢，这好像正是正则表达式的缺陷
// 不是，这是上下文相关语法
// 感觉得有项机制从之前解析过的东西拿东西出来，然后设到后面的解析器中
const genString = (delimiter: string): IParser<String> => {
    const content = from(or(
        not(delimiter, id),
        makeWordParser('\\' + delimiter, s => s.SubText(1)),
        selectNotNull))
        .zeroOrMore(combine)
        .raw;
    return from(makeWordParser(delimiter, nullize))
        .rightWith(content, selectRight)
        .rightWith(makeWordParser(delimiter, nullize), selectLeft)
        .transform(String.New)
        .raw;
};

// 这里测试的时候可能需要多次转义来测试，毕竟读取和在代码里用字符串字面量表示不一样
export class String implements ISyntaxNode {
    private mText: Text;

    public static New(content: Text): String {
        return new String(content);
    }

    // TODO 转义的事情处理好了吗
    private constructor(content: Text) {
        this.mText = content;
    }

    public get Range(): IRange {
        return this.mText.Range;
    }

    public Contains(p: Position): boolean {
        throw new Error("Method not implemented.");
    }

    public get Valid(): boolean {
        return this.mText != null;
    }

    public get Content() {
        return this.mText;
    }

    public toString(): string {
        return stringify(this.mText?.toString());
    }
}

// 检查各处 IParser<T> 中的 T 的类型是否正确
export const string = from(or(genString('"'), genString("'"), selectNotNull))
    .prefixComment('parse string')
    .raw;
