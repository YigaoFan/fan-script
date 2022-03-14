note for [Writing a TextMate Grammar: Some Lessons Learned](https://www.apeth.com/nonblog/stories/textmatebundle.html)
* The top level of a language grammar, is a dictionary — that is, it’s a pair of curly braces {}
* top level dictionary can contain:
  * a match rule(also known as a pattern) is a dictionary. Instructs TextMate’s parser what to do: as you walk through the text, look for this pattern and **assign this scope**(一个 pattern 的 scope 是 name 这个属性).
  * a patterns array is a array of match rules. Order matters.
  * a repository is a dictionary.
      * named match rules.
      * named top levels(这也是 top level，代表着可以嵌套).
> 可以看出：  
> * A match rule can be one entry in a patterns array.  
> * A match rule can be a named dictionary in a repository.

A match rule has three kinds:
* An include
* A match pattern
* A begin/end(or begin/while) pattern
> Any match rule can contain:
> * A comment. This is a key-value pair, key is comment.
> * An off switch. ...key is disabled, with value 1.

scope name 不知道如何取的情况下，可以打开一个 typescript 文件然后用 Developer: Inspect Editor Tokens and Scopes 来抄你需要的 scope 名字。因为已有的 scope 会有设置好的高亮支持。

[LSP implementation](https://microsoft.github.io/language-server-protocol/implementors/sdks/)