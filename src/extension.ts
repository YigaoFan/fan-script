import * as vscode from 'vscode';
import { log } from './util';

const langId = 'fan';

// 为什么 log 没输出到 vscode host 那边？
class FanCompletionItemProvider implements vscode.CompletionItemProvider {
    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
        log('complete at', context.triggerCharacter);
        return [];
    }
}

export function activate(context: vscode.ExtensionContext) {
	log('Congratulations, your extension "fan-script" is now active!'); // 这行话出现了，说明是 cmd 没注册的问题
    let provider1 = vscode.languages.registerCompletionItemProvider(langId, new FanCompletionItemProvider());
	const cmd = 'startComplete';
    const openLogWebview = () => {
		log('cmd set done');
	};
	let disp = vscode.commands.registerCommand(cmd, openLogWebview);
    context.subscriptions.push(provider1);
    context.subscriptions.push(disp);
}

export function deactivate() { }