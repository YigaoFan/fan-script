三个问题：
1. HtmlLogger 里的减缩进处理得对不对 indent 和 stack 的思路，具体详细思考
2. result 里如何以更好的形式打出来，把 stream 处理好
3. 加 comment 让 log 更可读

路线(demo 版):
变量名和调用成员方法补全 -> 实现静态类型检查以知道方法的返回类型(注意实现函数递归和匿名对象的类型，主要是算出返回语句的类型) -> 所以参数也要有类型 -> 检查返回类型的时候，for 和 if 内的 return 也要检查 -> 预感要为 ISyntaxNode 加接口求结点类型 evalNodeType
native Message host 的重写，来完成通信(binary mode 的问题)

最终，整理下语法规则，比如一些地方加不加逗号。
检查所有的代码的 blanks 加没加。block 内部用 or 加 blank 出来处理空白。

SICP: eval apply
python metaclass

lazy 的地方好多，现在有点分不清楚了，之后可能出 bug，要仔细思考下。应该只有在大结点的 consXXX 内部才需要 lazy，这种和递归的形式是一致的。func 和 literal 那个关系比较特殊，因为 literal 显式依赖了，所以最初构造 func 传到 literal 的地方要 lazy 一下。
为什么 array、object、invoke、refine 那里要新加 lazy ？因为之前 expression 可以直接拿到一个 IParser，现在变了，所以。。。

空格的问题要解决 搞一个两边加空格的函数，很多地方有这个需求
native message 64位的问题