var Protocol = require("vscode-languageserver/node");
var Present = require("../api/present");
var Lexing = require("../documents/lexing");

var Kinds = {
    function: Protocol.CompletionItemKind.Function,
    method: Protocol.CompletionItemKind.Method,
    property: Protocol.CompletionItemKind.Property,
    class: Protocol.CompletionItemKind.Class,
    constructor: Protocol.CompletionItemKind.Constructor,
    enum: Protocol.CompletionItemKind.Enum
};

var CallableKinds = { function: true, method: true, constructor: true };

function InsertionFor(Symbol) {
    if (!CallableKinds[Symbol.Kind]) {
        return Symbol.Name;
    }

    var Parameters = Symbol.Parameters || [];

    if (Parameters.length === 0) {
        return Symbol.Name + "()";
    }

    var Placeholders = Parameters.map(function (Parameter) {
        return Parameter.Optional ? Parameter.Name + "?" : Parameter.Name;
    }).join(", ");

    return Symbol.Name + "(${1:" + Placeholders + "})";
}

function CompletionOf(Symbol, Rank) {
    return {
        label: Symbol.Name,
        kind: Kinds[Symbol.Kind],
        detail: Symbol.Signature,
        documentation: { kind: Protocol.MarkupKind.Markdown, value: Present.DocumentationOf(Symbol) },
        insertText: InsertionFor(Symbol),
        insertTextFormat: Protocol.InsertTextFormat.Snippet,
        sortText: Rank + Symbol.Name
    };
}

function NamespaceOf(Index, Name) {
    var Reach = Index.Members(Name, ".").length + Index.Members(Name, ":").length;

    return {
        label: Name,
        kind: Protocol.CompletionItemKind.Module,
        detail: Name + " — " + Reach + " symbols",
        insertText: Name,
        sortText: "0" + Name
    };
}

function GlobalScope(Index) {
    var Modules = Index.Namespaces().map(function (Name) {
        return NamespaceOf(Index, Name);
    });

    var Symbols = Index.Globals().map(function (Symbol) {
        return CompletionOf(Symbol, "1");
    });

    return Modules.concat(Symbols);
}

function CompletionsAt(Query) {
    var Access = Lexing.MemberAccessBefore(Query.Text, Query.Offset);

    if (!Access) {
        return GlobalScope(Query.Index);
    }

    var Binding = Query.Bindings.get(Access.Receiver);
    var Symbols = Binding
        ? Query.Index.Binding(Binding, Access.Separator)
        : Query.Index.Members(Access.Receiver, Access.Separator);

    return Symbols.map(function (Symbol) {
        return CompletionOf(Symbol, "1");
    });
}

exports.CompletionsAt = CompletionsAt;
