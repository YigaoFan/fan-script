import { id, or, from, nullize, selectRight, optional, eitherOf, } from "../combinator";
import { IParser, Range } from "../IParser";
import { makeWordParser, oneOf, lazy, } from "../parser";
import { ISyntaxNode } from "../ISyntaxNode";
import { identifier } from "./Identifier";

const selectNotNull = <T>(...ts: (T | null)[]): T => {
    for (const t of ts) {
        if (t) {
            return t;
        }
    }
    throw new Error('all item in ts are null');
};
const combineIntoArray = <T>(...ts: T[]) => {
    return ts;
};
// 建立 ast 相关 node 的类型的事要提上日程了
const consExp = function(): IParser<IExpression> {
    const expWithParen = lazy(consExp);
    const expWithPrefixOp = from(oneOf(['typeof', '+', '-', '!'], id)).rightWith(lazy(consExp), combineIntoArray).raw;
    const exp = eitherOf(selectNotNull, identifier, expWithParen, expWithPrefixOp);
    return exp;
};
export const expression: IParser<Expression> = ;
// typescript 里 IParser<IExpression> 可以赋给 IParser<SyntaxNode> 吗
export interface IExpression extends ISyntaxNode {

}

class ExpWithParen implements IExpression {
    private mInnerExp: IExpression;

    public constructor(innerExp: IExpression) {
        this.mInnerExp = innerExp;
    }
}

export class Expression implements IExpression {
    get Range(): Range | null {
        throw new Error("Method not implemented.");
    }
    set Range(range: Range | null) {
        throw new Error("Method not implemented.");
    }
    get Valid(): boolean {
        throw new Error("Method not implemented.");
    }

}