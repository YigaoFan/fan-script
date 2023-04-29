2022/11/24
* 把 universal Factory 加进去
    - [x] 删掉不必要的 untermainated node 类型
    - [ ] 顺便检查所有 node 类型
2022/12/6
* 完善语法
2022/12/26
* 整理下 ChartParser
* 写一下 Parser Combinator 之前遇到问题的文章
2023/1/16
* id 命名用小驼峰还是大驼峰啊，统一一下
2023/2/2
* 左值和右值的问题
* 思考下函数调用传参是传引用还是什么情况
* 一些内置函数的绑定，比如 console.log
2023/2/21
* Continuations 要支持嵌套，因为for循环里可以套for循环
2023/2/23
* - [x] 补全生成的 Eval dispatch 代码，两种
  * a-> b, c
  * a-> d, e

  * e-> f
2023/3/11
EvalFun 的参数类型原先是接受 NextStep 的 Cont。类型冲突在于，func 在 literal 情况下想作为返回值返回出去，而作为单独出现的语句时，则想影响环境，经过写一些 JS 代码，发现其实 literal 里也影响环境了，只不过很局部。比如作为obj.value 的 function 可以看到自己，所以可以递归调用自己。
* 让生成代码的过程只看那些相关的文件，这样就不用处理已有的 EvalDispatch 等文件
2023/3/19
把 console.log 绑定到 env 中让 script 中可以调用
