import { writeFileSync } from "fs";
import { Indent } from "./IParser";
import { log } from "./util";

class HtmlDetail {
    private mSummary: string;
    private mDescription?: string;
    private mSubDetails: HtmlDetail[];

    public constructor(summary: string) {
        this.mSummary = summary;
        this.mSubDetails = [];
    }

    public static New(summary: string) {
        return new HtmlDetail(summary);
    }

    public AddDescription(description: string) {
        if (this.mDescription) {
            this.mDescription += description;
            return;
        }
        this.mDescription = description;
    }

    public AddSubDetail(detail: HtmlDetail) {
        this.mSubDetails.push(detail);
    }

    public ToHtml(): string {
        return `<details><summary>${this.mSummary}</summary>${this.mDescription}${this.mSubDetails.map(x => x.ToHtml()).join('')}</details>`;
    }
}

export class HtmlLogger {
    private mFilename: string;
    private mDetailStack: HtmlDetail[];
    private mDetailRoot?: HtmlDetail;

    public constructor(filename: string) {
        this.mFilename = filename;
        this.mDetailStack = [];
    }

    public Log(indentSetting: Indent, ...args: any[]) {
        const s = args.join(' ');
        const len = this.mDetailStack.length;
        switch (indentSetting) {
            case Indent.NextLineAdd:
                var d = HtmlDetail.New(s);
                if (len == 0) {
                    this.mDetailRoot = d;
                } else {
                    this.mDetailStack[len - 1].AddSubDetail(d);
                }
                this.mDetailStack.push(d);
                break;
            case Indent.CurrentLineReduce:
                this.mDetailStack[this.mDetailStack.length - 1].AddDescription(s);
                this.mDetailStack.pop();
                break;
            case Indent.KeepSame:
                this.mDetailStack[len - 1].AddDescription(s);
                break;
        }
    }

    Close() {
        // var details = this.mDetailStack.map(x => `<details><summary>${x[0]}</summary>${x[1]}</details>`);
        var body = this.mDetailRoot?.ToHtml();
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