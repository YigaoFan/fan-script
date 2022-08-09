三个问题：
1. HtmlLogger 里的减缩进处理得对不对 indent 和 stack 的思路，具体详细思考
2. result 里如何以更好的形式打出来，把 stream 处理好
3. 加 comment 让 log 更可读

路线(demo 版):
变量名和调用成员方法补全 -> 实现静态类型检查以知道方法的返回类型(注意实现函数递归和匿名对象的类型，主要是算出返回语句的类型) -> 所以参数也要有类型 -> 检查返回类型的时候，for 和 if 内的 return 也要检查 -> 预感要为 ISyntaxNode 加接口求结点类型 evalNodeType
native Message host 的重写，来完成通信(binary mode 的问题)