import * as vscode from 'vscode';
import { log } from './util';
import * as data from './completionData.json'

const langId = 'fan';
// 可以在 completionData 加个继承功能
interface ICompletionNode {
    name: string;
}

interface IAction extends ICompletionNode {
    args: string[];
}
interface IClassNode extends ICompletionNode {
    members: IClassNode[];
    actions: IAction[];
}

const completionRoot: IClassNode[] = data;

class FanCompletionItemProvider implements vscode.CompletionItemProvider {
    // 可以做得更绝一点，一开始刚敲键盘就有补全（Browser 之类的可以选）
    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
        switch (context.triggerCharacter) {
            case '.':
                let current = completionRoot[1]; // use 1 to select web node
                const ts = this.leftTypesTo(position, document);
                for (let i = 0; i < ts.length; i++) {
                    const t = ts[i];
                    const m = current.members.find(x => x.name == t);
                    if (m == undefined) {
                        return [
                            'about',
                            'but'
                        ].map(x => new vscode.CompletionItem(x));
                    }
                    current = m;
                }
                return [...current.members.map(x => x.name), ...current.actions.map(x => x.name)].map(y => new vscode.CompletionItem(y));
            case '"':
                const t = this.leftLastTypeFrom(position, document);
                return [
                    'about',
                    'but'
                ].map(x => new vscode.CompletionItem(x));
                return this.readObjectNamesOf(t, []).map(x => new vscode.CompletionItem(x));
            default:
                return [];
        }
    }

    
    private leftLastTypeFrom(position: vscode.Position, document: vscode.TextDocument): string {
        // TODO getWordRangeAtPosition
        // 获取的是当前行的内容，没加参数，就没有处理
        const r = document.getWordRangeAtPosition(position);
        const t = document.getText(r);
        log('get text', t);
        const type = t.substring(0, t.indexOf('('));
        return type;
    }

    private leftTypesTo(position: vscode.Position, document: vscode.TextDocument): string[] {
        // TODO
        const ts: string[] = [];

        return ts;
    }

    private readObjectNamesOf(type: string, from: []): string[] {
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
                    'baidu.com',
                    'google.com',
                    'bing.com',
                    'sougou.com',
                ]
            default:
                const name = type.toLocaleLowerCase;
                return [
                    name + '1',
                    name + '2',
                    name + '3',
                    name + '4',
                ];
        }
    }
}

export function activate(context: vscode.ExtensionContext) {
	log('Congratulations, your extension "fan-script" is now active!'); // 这行话出现了，说明是 cmd 没注册的问题
    let provider1 = vscode.languages.registerCompletionItemProvider(langId, new FanCompletionItemProvider(), '.', '"');
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