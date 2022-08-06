import { writeFileSync } from "fs";

export class HtmlLogger {
    private mFilename: string;
    private mDetails: ([string, string?])[];

    public constructor(filename: string) {
        this.mFilename = filename;
        this.mDetails = [];
    }

    public Log(level: number, ...args: any[]) {
        const len = this.mDetails.length;
        const s = args.join(' ');
        if (level == len) {
            this.mDetails.push([s]);
            return;
        }

        this.mDetails[level][1] = s;
    }

    Close() {
        var details = this.mDetails.map(x => `<details><summary>${x[0]}</summary>${x[1]}</details>`);
        var body = details.reduce((total, current) => total.replace('</details>', `${current}</details>`));
        var s = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>parser log</title>
    <style>
        details {
            padding-left: 10px;
        }
    </style>
</head>
<body>
    <!-- 嵌套列表 -->
    ${body}
    <script>
    var genColorBit = function() {
        return parseInt(Math.random() * 128) + 100 // add 100 for more light
    }
    var es = document.getElementsByTagName('summary')
    console.log('len', es.length)
    for (var i = 0; i < es.length; i++) {
        console.log('set', i)
        var e = es[i]
        e.setAttribute("style", "background-color: rgb(" + genColorBit() + ',' + genColorBit() + ',' + genColorBit() + ');')
    }
    </script>
</body>
</html>`;
        writeFileSync(this.mFilename, s);
    }
}