import { readFileSync } from 'fs';
import path = require('path');
import { htmlLogger } from '../../IParser';
import { GenerateParserInputTable } from '../../ParserInputTable';
import { StringStream } from '../../StringStream';
import { log } from '../../util';
import { classs } from '../Class';

const tests: (() => void)[] = [];

export const registerTest = function(test: () => void) {
    tests.push(test);
};

const readCodeFrom = (path: string) => {
    return readFileSync(path, 'utf-8');
};

export const test = function() {
    var c = readCodeFrom(path.resolve(__dirname, 'CodeSample/class.fs'));
    var s = StringStream.New(c, 'class.fs');
    GenerateParserInputTable('parser-input.html', s.Copy());
    try {
        var o = classs.parse(s);
    } finally {
        htmlLogger.Close();
    }
};
// 可能要实现受损区域分割，比如一个函数的右大括号没写，但不能影响别的函数的补全
