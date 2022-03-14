import path = require('path');
import {
    LanguageClient,
    ServerOptions,
    TransportKind,
    LanguageClientOptions,
} from 'vscode-languageclient/node';
import { workspace } from 'vscode';

let client: LanguageClient;

function init(): void {
    let serverModule = path.join('server', 'out', 'server.js');
    // The debug options for the server
    // --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging
    let debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };

    let serverOptions: ServerOptions = {
        run: { module: serverModule, transport: TransportKind.ipc },
        debug: {
            module: serverModule,
            transport: TransportKind.ipc,
            options: debugOptions,
        }
    };

    let clientOptions: LanguageClientOptions = {
        // Register the server for plain text documents
        documentSelector: [{ scheme: 'file', language: 'plaintext' }],
        synchronize: {
            // Notify the server about file changes to '.clientrc files contained in the workspace
            fileEvents: workspace.createFileSystemWatcher('**/.clientrc')
        }
    };
    client = new LanguageClient(
        'fanscriptLanguageServer',
        'FanScript language server',
        serverOptions,
        clientOptions,
    );
    client.start();
}

function destroy(): void {
    if (client) {
        client.stop();
    }
}