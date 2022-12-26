import { Channel } from './Channel';
import { test, } from './LangSpec/Test/TestSuite';
import { or, translate } from './LangSpec/Translator';
import { log } from './util';

const __main = function() {
    // var c = new Channel<number>();
    // var p = c.GetValue();
    // c.PutValue(1);
    test();
    // {
    //     const r = translate(['a', [or('b', 'c'), 'd']]);
    //     log('translate result', r);
    // }
    // {
    //     const r = translate(['a', { main: [or('left', 'right')], left: [or('b', 'c'), 'd']}]);
    //     log('translate result', r);
    // }
};

__main();