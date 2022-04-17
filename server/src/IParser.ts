// stateful internal
export interface IInputStream {
    get NextChar(): string;
    Copy(): IInputStream;
}

type ParseFullResult<T1, T2> = { Result: T1 | T2, Remain: ParserInput };
type ParseFailResult = null;
export type ParserInput = IInputStream;
// null for optional result
export type ParserResult<T> = ParseFullResult<T, null> | ParseFailResult;

const log = console.log.bind(console);
enum Indent {
    NextLineAdd,
    CurrentLineReduce,
}

/**
 * @param indentSetting is set for the next log statement
 * @var indent is global variable to store indent count
 */
var indent = 0;
const logWith = function (indentSetting: Indent, ...args: any[]) {
    const genSpaces = (count: number) => Array(count).join(' ');
    switch (indentSetting) {
        case Indent.CurrentLineReduce: --indent;
    }

    log(genSpaces(indent), ...args);
    
    switch (indentSetting) {
        case Indent.NextLineAdd: ++indent;
    }
};
export const enableDebug = true;

// 下面这个是一个方法，更好的方法，是可以通过反射，反射到某个包下所有的 parser 类型，然后动态地给 parser.parse 做代理
export const debug = function (enable: boolean = enableDebug) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        var d = descriptor;
        if (!enable) {
            return d;
        }
        var k = propertyKey;
        var v = d.value;
        d.value = function (this: any, ...args: any[]) {
            var title = `${this.constructor.name} ${k}`;
            logWith(Indent.NextLineAdd, `start ${title}`);
            var r = v.apply(this, args);
            logWith(Indent.CurrentLineReduce, `end ${title}, result ${r}`);
            return r;
        };

        return d;
    };
};

// 发现可以用接口，不用修饰器来获取信息，那就不是非得用抽象类，但其实包含一些通用逻辑的，抽象类还是有用武之地
export abstract class IParser<T> {
    // decorator will call on derived class?
    abstract parse(input: ParserInput): ParserResult<T>;
    abstract get operation(): string;
    @debug()
    debugParse(input: ParserInput): ParserResult<T> {
        // if have any sub, call sub debug parse first
        throw new Error();
    }
}

export class WordParser<T> extends IParser<T> {
    private static flag = false;

    @debug(true)
    parse(input: IInputStream): ParserResult<T> {
        throw new Error("Method not implemented.");
    }
    get operation(): string {
        throw new Error("Method not implemented.");
    }
    
}