
// 

// const consBlock = function(stmt: IParser<Statement>): IParser<Statement[]> {
//     function notWhiteSpace(value: Statement | Whitespace): value is Statement {
//         if (value instanceof Whitespace) { 
//             return false;
//         }
//         return true;
//     }
//     return from(or(stmt, whitespace, selectNotNullIn2DifferentType))
//                 .zeroOrMore(asArray)
//                 .transform(xs => xs.filter(notWhiteSpace))
//                 .raw;
// };

enum StmtKind {
    All,
    VarStmt,
}

// 加一个终止符的概念，到了终止符，返回
// 终止符应该是一个特别的设定，而不是一个普通的 parser
// 解析要有开始和终止的概念，也要有开始和终止之间这一段是某个 parser 全权负责解析的概念，所以之前 return 语句里的多级 refinement 应该有办法解决
// 要不要语法解析过程也搞成一个语法结点内，可以有哪些子结点，而不止是解析结果有结构


// // parse xxx, start
// //      parse sub part
// // parse xxx, result
// // parse yyy, result
// // log('evaluate consFunc and func');
// export const consFunc = function() : IParser<Func> { 
//     return from(makeWordParser('func', Func.New))
//                     .prefixComment('parse func keyword')
//                     .rightWith(blanks, selectLeft)
//                     .rightWith(varName, Func.SetName)
//                     .rightWith(optional(blanks), selectLeft)
//                     .rightWith(parasWithParen, Func.SetParameters)
//                     .rightWith(leftBrace, selectLeft)
//                     .rightWith(consBlock(consStmt(lazy(consFunc), StmtKind.All)), Func.SetBlock)
//                     .rightWith(rightBrace, selectLeft)
//                     .prefixComment('parse func')
//                     .raw;
// };
// export const func = consFunc();
// export const varStmt = consStmt(func, StmtKind.VarStmt) as IParser<Statement>;
