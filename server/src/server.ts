import {
    createConnection,
    ProposedFeatures,
    TextDocuments,
    InitializeParams,
    InitializeResult,
    TextDocumentSyncKind,
    DidChangeWorkspaceFoldersNotification,
    TextDocumentPositionParams,
    CompletionItem,
} from "vscode-languageserver/node";

import {
    TextDocument,
 } from 'vscode-languageserver-textdocument';

const connection = createConnection(ProposedFeatures.all);
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let hasDiagnosticRelatedInformationCapability = false;

connection.onInitialize((params: InitializeParams): InitializeResult => {
    const caps = params.capabilities;
    hasConfigurationCapability = !!(caps.workspace && !!caps.workspace.configuration);
    hasWorkspaceFolderCapability = !!(caps.workspace && !!caps.workspace.workspaceFolders);
    hasDiagnosticRelatedInformationCapability = !!(
        caps.textDocument
        && caps.textDocument.publishDiagnostics
        && caps.textDocument.publishDiagnostics.relatedInformation
    );

    const result: InitializeResult = {
        capabilities: {
            textDocumentSync: TextDocumentSyncKind.Incremental,
            completionProvider: {
                resolveProvider: true,
            }
        }
    };
    if (hasWorkspaceFolderCapability) {
        result.capabilities.workspace = {
            workspaceFolders: {
                supported: true,
            }
        };
    }
    return result;
});

connection.onInitialized(() => {
    if (hasConfigurationCapability) {
        connection.client.register(DidChangeWorkspaceFoldersNotification.type, undefined);
    }
    if (hasWorkspaceFolderCapability) {
        connection.workspace.onDidChangeWorkspaceFolders(_ => {
            connection.console.log('Workspace folder change event received.');
        });
    }
});

// ... jump some code

// connection.onCompletion((textPosition: TextDocumentPositionParams): CompletionItem[] => {
//     // todo
//     const doc = documents.get(textPosition.textDocument.uri)?.getText();

// });

// connection.onCompletionResolve((item: CompletionItem): CompletionItem => {

// });

documents.listen(connection);
connection.listen();
