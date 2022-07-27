import { registerTest } from "./TestSuite";
import { string, } from '../String';
import { StringStream } from "../../StringStream";

const testStringLiteral = function() {
    var s = '"Hello World"';
    var ss = StringStream.New(s, 'code.fs');
    var r = string.parse(ss);
    // TODO escape char test
};

// 这个会在 __main 之前运行吗？
registerTest(testStringLiteral);