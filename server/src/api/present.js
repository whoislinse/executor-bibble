function DocumentationOf(Symbol) {
    return [
        "```luau",
        Symbol.Signature,
        "```",
        "",
        Symbol.Documentation,
        "",
        "Category `" + Symbol.Category + "` — [docs](" + Symbol.Url + ")"
    ].join("\n");
}

function ParameterLabel(Parameter) {
    var Optional = Parameter.Optional ? "?" : "";
    var Type = Parameter.Type ? ": " + Parameter.Type : "";

    return Parameter.Name + Optional + Type;
}

exports.DocumentationOf = DocumentationOf;
exports.ParameterLabel = ParameterLabel;
