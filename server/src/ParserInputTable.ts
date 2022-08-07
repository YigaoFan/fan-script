import { writeFileSync } from "fs";
import { IInputStream } from "./IParser";

const split40PerArray = <T>(ts: T[]) : T[][] => {
    const splited: T[][] = [];
    if (ts.length < 40) {
        splited.push(ts);
        return splited;
    }

    splited.push(ts.slice(0, 40));
    var remain = split40PerArray(ts.slice(40));
    return splited.concat(remain);
};

export const GenerateParserInputTable = (filename: string, input: IInputStream) => {
    const items: string[] = [];
    for (;;) {
        var c = input.NextChar;
        if (c.Empty) {
            break;
        }
        items.push(c.Value);
    }
    var splited = split40PerArray(items);

    var html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>parser input</title>
    <style>
    </style>
</head>
<body>
    ${splited.map((x, j) => `<table border="black" class="holder">
        <tr>
            ${x.map(y => `<th>${y}</th>`).join('')}
        </tr>
        <tr>
            ${x.map((_, i) => `<td>${i + j * 40}</td>`).join('')}
        </tr>
    </table><p>`).join('')}
</body>
</html>`;
    writeFileSync(filename, html);
};