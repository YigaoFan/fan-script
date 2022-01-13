import * as vscode from 'vscode';
import { log } from './util';
import * as data from './completionData.json';

const langId = 'fan';
// 可以在 completionData 加个继承功能
interface ICompletionNode {
    name: string;
}

interface IAction extends ICompletionNode {
    args: string[];
    description?: string;
}
interface IClassNode extends ICompletionNode {
    members: IClassNode[];
    actions: IAction[];
}

const completionRoot: IClassNode[] = data;

class FanCompletionItemProvider implements vscode.CompletionItemProvider {
    // 可以做得更绝一点，一开始刚敲键盘就有补全（Browser 之类的可以选）
    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
        var items: vscode.CompletionItem[] = [];
        switch (context.triggerCharacter) {
            case '.':
                const webRoot = completionRoot[1]; // use 1 to select web node
                const ts = this.leftTypesTo(position, document);
                let n = this.goDeepToClassNodeByFollow(ts, webRoot);
                if (n) {
                    items = [
                        ...n.members.map(x => x.name).map(y => new vscode.CompletionItem(y)),
                        ...n.actions.map(y => {
                            let i = new vscode.CompletionItem(y.name);
                            i.documentation = y.description;
                            i.detail = `${y.name}(${y.args.join(',')})`;
                            return i;
                        })
                    ];
                }
                break;
            case '"':
                const t = this.leftLastTypeFrom(position, document);
                items = this.readObjectNamesOf(t, []).map(x => new vscode.CompletionItem(x));
                break;
            case ' ':
                // TODO
        }

        if (items.length === 1) {
            const editor = vscode.window.activeTextEditor;
            if (!editor || editor?.document !== document) {
                return [];
            }
            editor.edit(builder => {                
                builder.insert(position, items[0].label.toString());
            });
            return [];
        }
        return items;
    }

    // 假定 position 前面有 ( 的存在
    private leftLastTypeFrom(position: vscode.Position, document: vscode.TextDocument): string {
        // getWordRangeAtPosition 的情况下获取的是当前行的内容，不管你当前处于文字的中间还是右边，就没有处理
        const r = document.getWordRangeAtPosition(position); // 不知道这里面会不会处理两边的空格，我这里先不处理，然后看有没有问题
        let t = document.getText(r);
        // log('get text', t);
        const end = t.lastIndexOf('(');
        t = t.substring(0, end);
        if (t.includes('.')) {
            t = t.substring(t.lastIndexOf('.') + 1);
        }

        return t;
    }

    // 假定至少有一个 . 的存在
    private leftTypesTo(position: vscode.Position, document: vscode.TextDocument): string[] {
        const ts: string[] = [];
        const r = document.getWordRangeAtPosition(position);
        let parseScope = document.getText(r);
        for (let end = parseScope.indexOf('('); end !== -1; end = parseScope.indexOf('(')) {
            let type = parseScope.substring(0, end);
            ts.push(type);
            parseScope = parseScope.substring(parseScope.indexOf('.') + 1);
        }
        return ts;
    }

    private readObjectNamesOf(type: string, from: []): string[] {
        // 不能有 . 在其中，会影响解析
        switch (type) {
            case 'Browser':
                return [
                    '百度',
                    '谷歌',
                    '必应',
                    '搜狗',
                ];
            case 'Page':
                return [
                    'baidu',
                    'google',
                    'bing',
                    'sougou',
                ];
            default:
                const name = type.toLocaleLowerCase();
                return [
                    name + '1',
                    name + '2',
                    name + '3',
                    name + '4',
                ];
        }
    }

    private goDeepToClassNodeByFollow(ts: string[], root: IClassNode) {
        let current = root;
        for (let i = 0; i < ts.length; i++) {
            const t = ts[i];
            const m = current.members.find(x => x.name === t);
            if (m === undefined) {
                return null;
            }
            current = m;
        }
        return current;
    }
}

export function activate(context: vscode.ExtensionContext) {
	log('Congratulations, your extension "fan-script" is now active!'); // 这行话出现了，说明是 cmd 没注册的问题
    let provider1 = vscode.languages.registerCompletionItemProvider(langId, new FanCompletionItemProvider(), '.', '"', ' ');
	const cmd = 'startComplete';
    const openLogWebview = () => {
		log('cmd set done');
	};
	let disp = vscode.commands.registerCommand(cmd, openLogWebview); // activate 后要注册 command
    context.subscriptions.push(provider1);
    context.subscriptions.push(disp);
}

export function deactivate() { 

}