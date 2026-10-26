var DocsRoot = "https://docs.voltbz.net/docs";

function LastNameOf(Key) {
    var Dot = Key.lastIndexOf(".");
    var Colon = Key.lastIndexOf(":");
    var Boundary = Math.max(Dot, Colon);

    return Boundary === -1 ? Key : Key.slice(Boundary + 1);
}

function SymbolOf(Kind, Spec) {
    return {
        Key: Spec.Key,
        Name: LastNameOf(Spec.Key),
        Kind: Kind,
        Signature: Spec.Signature,
        Documentation: Spec.Documentation,
        Category: Spec.Category,
        Url: DocsRoot + "/" + Spec.Category,
        Parameters: Spec.Parameters,
        Returns: Spec.Returns
    };
}

function Callable(Spec) {
    return SymbolOf(Spec.Kind || "function", Spec);
}

function Method(Spec) {
    return SymbolOf("method", Spec);
}

function Property(Spec) {
    return SymbolOf("property", Spec);
}

function Enumerator(Spec) {
    return SymbolOf("enum", Spec);
}

function Classifier(Spec) {
    return SymbolOf("class", Spec);
}

function ParameterList(Names) {
    return Names.map(function (Name) {
        return { Name: Name };
    });
}

exports.Callable = Callable;
exports.Method = Method;
exports.Property = Property;
exports.Enumerator = Enumerator;
exports.Classifier = Classifier;
exports.ParameterList = ParameterList;
