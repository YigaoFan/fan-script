// TODO add space
const grammarMap: (readonly [string, string[]])[] = [
    ['exp', ['literal']],
    ['exp', ['id']],
    ['exp', ['(', 'exp', ')']],
    ['exp', ['prefix-operator', 'exp']],
    ['exp', ['exp', 'infix-operator', 'exp']],
    ['exp', ['exp', '?', 'exp', ':', 'exp']],
    ['exp', ['exp', 'invocation']],
    ['exp', ['exp', 'refinement']],
    ['exp', ['new', 'exp', 'invocation']],
    ['exp', ['delete', 'exp', 'refinement']],

    ['literal', ['string']],
    ['literal', ['number']],
    ['literal', ['object']],
    ['literal', ['array']],
    ['literal', ['func']],

    ['object', ['{', 'pairs', '}']],
    ['pairs', []],
    ['pairs', [ 'pair', ',', 'pairs']],
    ['pair', ['key', ':', 'value']],
    ['key', ['string']],
    ['key', ['id']],
    ['value', ['exp']],

    ['array', ['[', 'items', ']']],
    ['items', []],
    ['items', [ 'item', ',', 'items']],
    ['item', ['exp']],

    // func要用这种方法定义吗，还是保持原来的
    // 感觉可以调用原来的，要有个注册机制，只要把 func 的 parser 注册为原来的就行
];