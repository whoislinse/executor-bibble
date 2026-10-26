var Protocol = require("vscode-languageserver/node");
var Present = require("../api/present");
var Lexing = require("../documents/lexing");

var DocsBase = "https://docs.voltbz.net/docs";

function DrawingDocumentation(Name, Binding) {
    return [
        "```luau",
        Name + ': DrawingObject("' + Binding.DrawingType + '")',
        "```",
        "",
        "Overlay object of type " + Binding.DrawingType + ".",
        "",
        "[docs](" + DocsBase + "/drawing)"
    ].join("\n");
}

function InstanceDocumentation(Name, Binding) {
    return [
        "```luau",
        Name + ": " + Binding.ClassName,
        "```",
        "",
        "Tracked instance of " + Binding.ClassName + ".",
        "",
        "[docs](" + DocsBase + "/" + Binding.ClassName.toLowerCase() + ")"
    ].join("\n");
}

function HoverAt(Query) {
    var Span = Lexing.TokenAround(Query.Text, Query.Offset);

    if (!Span) {
        return null;
    }

    var Symbol = Query.Index.Resolve(Span.Token);

    if (Symbol) {
        return { contents: { kind: Protocol.MarkupKind.Markdown, value: Present.DocumentationOf(Symbol) } };
    }

    var Binding = Query.Bindings.get(Span.Token);

    if (!Binding) {
        return null;
    }

    var Value = Binding.Kind === "drawing"
        ? DrawingDocumentation(Span.Token, Binding)
        : InstanceDocumentation(Span.Token, Binding);

    return { contents: { kind: Protocol.MarkupKind.Markdown, value: Value } };
}

exports.HoverAt = HoverAt;
