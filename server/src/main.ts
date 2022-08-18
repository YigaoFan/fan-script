import { Channel } from './Channel';
import { test, } from './LangSpec/Test/TestSuite';

const __main = async function() {
    // var c = new Channel<number>();
    // var p = c.GetValue();
    // c.PutValue(1);
    await test();
};

__main();