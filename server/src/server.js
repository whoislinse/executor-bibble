var Protocol = require("vscode-languageserver/node");
var TextDocumentModule = require("vscode-languageserver-textdocument");
var Library = require("./library");

var CreateConnection = Protocol.createConnection;
var TextDocuments = Protocol.TextDocuments;
var TextDocumentSyncKind = Protocol.TextDocumentSyncKind;
var TextDocument = TextDocumentModule.TextDocument;

var Connection = CreateConnection(Protocol.ProposedFeatures.all);
var Documents = new TextDocuments(TextDocument);
var Index = Library.CreateApiIndex(Library.VoltApi.concat(Library.RobloxApi));
var BindingsByUri = new Map();
var EmptyBindings = new Map();

var DiagnosticsEnabled = true;

function BindingsOf(Document) {
    var Bindings = Library.InferBindings(Document.getText());

    BindingsByUri.set(Document.uri, Bindings);

    return Bindings;
}

function Publish(Document) {
    if (!DiagnosticsEnabled) {
        Connection.sendDiagnostics({ uri: Document.uri, diagnostics: [] });
        return;
    }

    var Bindings = BindingsOf(Document);

    Connection.sendDiagnostics({
        uri: Document.uri,
        diagnostics: Library.Analyze({ Document: Document, Index: Index, Bindings: Bindings })
    });
}

Connection.onInitialize(function () {
    var Legend = Library.SemanticLegend();

    return {
        capabilities: {
            textDocumentSync: TextDocumentSyncKind.Full,
            completionProvider: { triggerCharacters: [".", ":", "("] },
            hoverProvider: true,
            signatureHelpProvider: { triggerCharacters: ["(", ","] },
            documentSymbolProvider: true,
            semanticTokensProvider: {
                legend: { tokenTypes: Legend.tokenTypes.slice(), tokenModifiers: Legend.tokenModifiers.slice() },
                full: true
            }
        }
    };
});

Connection.onCompletion(function (Params) {
    var Document = Documents.get(Params.textDocument.uri);

    if (!Document) {
        return [];
    }

    return Library.CompletionsAt({
        Text: Document.getText(),
        Offset: Document.offsetAt(Params.position),
        Index: Index,
        Bindings: BindingsByUri.get(Params.textDocument.uri) || EmptyBindings
    });
});

Connection.onHover(function (Params) {
    var Document = Documents.get(Params.textDocument.uri);

    if (!Document) {
        return null;
    }

    return Library.HoverAt({
        Text: Document.getText(),
        Offset: Document.offsetAt(Params.position),
        Index: Index,
        Bindings: BindingsByUri.get(Params.textDocument.uri) || EmptyBindings
    });
});

Connection.onSignatureHelp(function (Params) {
    var Document = Documents.get(Params.textDocument.uri);

    if (!Document) {
        return null;
    }

    return Library.SignatureAt({
        Text: Document.getText(),
        Offset: Document.offsetAt(Params.position),
        Index: Index
    });
});

Connection.onDocumentSymbol(function (Params) {
    var Document = Documents.get(Params.textDocument.uri);

    return Document ? Library.OutlineOf(Document) : [];
});

Connection.languages.semanticTokens.on(function (Params) {
    var Document = Documents.get(Params.textDocument.uri);

    if (!Document) {
        return { data: [] };
    }

    var Bindings = BindingsByUri.get(Params.textDocument.uri) || EmptyBindings;
    var Emissions = Library.SemanticTokensOf({ Document: Document, Index: Index, Bindings: Bindings });

    return { data: Library.EncodeSemanticTokens(Document, Emissions) };
});

Connection.onDidChangeConfiguration(function (Change) {
    var Settings = Change.settings && Change.settings.executorBibble;
    var Diagnostics = Settings && Settings.diagnostics;

    DiagnosticsEnabled = Diagnostics ? Diagnostics.enable !== false : true;

    Documents.all().forEach(Publish);
});

Documents.onDidOpen(function (Event) {
    Publish(Event.document);
});

Documents.onDidChangeContent(function (Event) {
    Publish(Event.document);
});

Documents.onDidClose(function (Event) {
    BindingsByUri.delete(Event.document.uri);
    Connection.sendDiagnostics({ uri: Event.document.uri, diagnostics: [] });
});

Documents.listen(Connection);
Connection.listen();
