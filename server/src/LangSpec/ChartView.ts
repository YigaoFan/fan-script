import { writeFileSync } from "fs";
import { ParserInput } from "../IParser";
import { TerminatedStates } from "./ChartParser";
import { NonTerminatedParserState } from "./ParserState";
import { split40PerArray } from '../ParserInputTable';
import { log } from "../util";

export class ChartView {
    private mInput: ParserInput;
    private mTerminatedShots: string[][];
    private mNonTerminatedShots: string[][][];

    public constructor(input: ParserInput) {
        this.mInput = input;
        this.mTerminatedShots = [];
        this.mNonTerminatedShots = [];
    }

    public Snapshot(terminateds: TerminatedStates, nonTerminateds: NonTerminatedParserState[][]) {
        const t = terminateds.map(x => x.toString());
        const n = nonTerminateds.map(x => x.map(y => y.toString()));
        this.mTerminatedShots.push(t);
        this.mNonTerminatedShots.push(n);
    }

    public Close() {
        const filename = 'parser-chart.html';
        const items: string[] = [];
        for (; ;) {
            var c = this.mInput.NextChar;
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
    <title>parser chart</title>
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
    <p></p>
    ${this.mTerminatedShots.map((_, i) => { return `
    <table border="black">
        <tr>
            <th>${i}(${i == 0 ? '' : items[i - 1]})</th>
        </tr>
            <td style="white-space:pre-wrap; word-wrap:break-word; min-width:10px;">${this.mTerminatedShots[i].join('\n')}</td>
        <tr>
            <td style="white-space:pre-wrap; word-wrap:break-word; min-width:10px;">${this.mNonTerminatedShots[i][i].map(y => y + '\n').join('')}</td>
        </tr>
    </table>
    <p></p>`; }).join('')}
</body>
</html>`;
        writeFileSync(filename, html);
    }
}