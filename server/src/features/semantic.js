var TokenTypes = ["type", "class", "enum", "parameter", "variable", "property", "enumMember", "function", "method"];
var TokenModifiers = ["declaration", "readonly"];

var DeclarationModifier = 1 << TokenModifiers.indexOf("declaration");
var ReadonlyModifier = 1 << TokenModifiers.indexOf("readonly");

var TypeType = TokenTypes.indexOf("type");
var ClassType = TokenTypes.indexOf("class");
var ParameterType = TokenTypes.indexOf("parameter");
var VariableType = TokenTypes.indexOf("variable");
var PropertyType = TokenTypes.indexOf("property");
var EnumMemberType = TokenTypes.indexOf("enumMember");
var FunctionType = TokenTypes.indexOf("function");
var MethodType = TokenTypes.indexOf("method");

var KindToType = {
    function: FunctionType,
    method: MethodType,
    property: PropertyType,
    class: ClassType,
    constructor: MethodType,
    enum: EnumMemberType
};

var IdentifierStart = /[A-Za-z_]/;
var IdentifierBody = /[A-Za-z0-9_]/;
var MaxChainSegments = 3;

var DeclarationKeywords = { function: true, local: true, for: true, type: true };
var Keywords = {
    self: true, and: true, or: true, not: true, if: true, then: true, else: true, elseif: true,
    end: true, while: true, do: true, repeat: true, until: true, return: true, break: true,
    continue: true, in: true, true: true, false: true, nil: true, export: true,
    function: true, local: true, for: true, type: true
};

function SemanticLegend() {
    return { tokenTypes: TokenTypes.slice(), tokenModifiers: TokenModifiers.slice() };
}

function TokenScanner(Text, Index, Bindings) {
    this.Emissions = [];
    this.Declared = new Map();
    this.Cursor = 0;
    this.Text = Text;
    this.Index = Index;
    this.Bindings = Bindings;
}

TokenScanner.prototype.Emit = function (Start, Length, Type, Modifiers) {
    if (Length > 0) {
        this.Emissions.push({ Start: Start, Length: Length, Type: Type, Modifiers: Modifiers || 0 });
    }
};

TokenScanner.prototype.Tokens = function () {
    this.Run();

    return this.Emissions;
};

TokenScanner.prototype.SkipQuoted = function (Quote) {
    this.Cursor += 1;

    while (this.Cursor < this.Text.length) {
        var Character = this.Text.charAt(this.Cursor);

        if (Character === "\\") {
            this.Cursor += 2;
            continue;
        }

        this.Cursor += 1;

        if (Character === Quote) {
            return;
        }
    }
};

TokenScanner.prototype.SkipLongBracket = function () {
    var Opening = /^\[(=*)\[/.exec(this.Text.slice(this.Cursor, this.Cursor + 16));

    if (!Opening || Opening[0] === undefined) {
        this.Cursor += 1;
        return;
    }

    var Closer = "]" + Opening[1] + "]";
    var Closing = this.Text.indexOf(Closer, this.Cursor + Opening[0].length);

    this.Cursor = Closing === -1 ? this.Text.length : Closing + Closer.length;
};

TokenScanner.prototype.SkipComment = function () {
    var Opening = /^--\[(=*)\[/.exec(this.Text.slice(this.Cursor, this.Cursor + 18));

    if (Opening && Opening[0] !== undefined) {
        var Closer = "]" + Opening[1] + "]";
        var Closing = this.Text.indexOf(Closer, this.Cursor + Opening[0].length);

        this.Cursor = Closing === -1 ? this.Text.length : Closing + Closer.length;
        return;
    }

    var Newline = this.Text.indexOf("\n", this.Cursor);

    this.Cursor = Newline === -1 ? this.Text.length : Newline;
};

TokenScanner.prototype.SkipSpace = function () {
    while (this.Cursor < this.Text.length && /\s/.test(this.Text.charAt(this.Cursor))) {
        this.Cursor += 1;
    }
};

TokenScanner.prototype.ReadIdentifier = function () {
    var Start = this.Cursor;

    while (this.Cursor < this.Text.length && IdentifierBody.test(this.Text.charAt(this.Cursor))) {
        this.Cursor += 1;
    }

    if (this.Cursor === Start) {
        return null;
    }

    return { Name: this.Text.slice(Start, this.Cursor), Start: Start, End: this.Cursor };
};

TokenScanner.prototype.ReadQualifiedChain = function () {
    var Segments = [];
    var Separators = [];
    var Start = this.Cursor;

    var Head = this.ReadIdentifier();

    if (!Head) {
        return { Segments: Segments, Separators: Separators, Start: Start, End: this.Cursor };
    }

    Segments.push(Head.Name);

    while (Segments.length < MaxChainSegments) {
        var Restore = this.Cursor;

        this.SkipSpace();

        var Separator = this.Text.charAt(this.Cursor);

        if (Separator !== "." && Separator !== ":") {
            this.Cursor = Restore;
            break;
        }

        var Scan = this.Cursor + 1;

        while (Scan < this.Text.length && /\s/.test(this.Text.charAt(Scan))) {
            Scan += 1;
        }

        if (Scan >= this.Text.length || !IdentifierStart.test(this.Text.charAt(Scan))) {
            this.Cursor = Restore;
            break;
        }

        Separators.push(Separator);
        this.Cursor = Scan;

        var Segment = this.ReadIdentifier();

        if (!Segment) {
            this.Cursor = Restore;
            break;
        }

        Segments.push(Segment.Name);
    }

    return { Segments: Segments, Separators: Separators, Start: Start, End: this.Cursor };
};

TokenScanner.prototype.CaptureParameters = function () {
    this.SkipSpace();

    if (this.Text.charAt(this.Cursor) !== "(") {
        return;
    }

    this.Cursor += 1;

    var ExpectingType = false;

    while (this.Cursor < this.Text.length) {
        var Character = this.Text.charAt(this.Cursor);

        if (Character === ")") {
            this.Cursor += 1;
            return;
        }

        if (Character === ":") {
            this.Cursor += 1;
            ExpectingType = true;
            continue;
        }

        if (Character === ",") {
            this.Cursor += 1;
            ExpectingType = false;
            continue;
        }

        if (Character === "?" || Character === "<" || Character === ">" || /\s/.test(Character)) {
            this.Cursor += 1;
            continue;
        }

        if (IdentifierStart.test(Character)) {
            var Identifier = this.ReadIdentifier();

            if (Identifier) {
                if (ExpectingType) {
                    this.Emit(Identifier.Start, Identifier.End - Identifier.Start, TypeType);
                } else {
                    this.Emit(Identifier.Start, Identifier.End - Identifier.Start, ParameterType, DeclarationModifier);
                    this.Declared.set(Identifier.Name, ParameterType);
                }
            }

            continue;
        }

        ExpectingType = false;
        this.Cursor += 1;
    }
};

TokenScanner.prototype.CaptureLocalDeclaration = function () {
    this.SkipSpace();

    var Ahead = this.Text.slice(this.Cursor, this.Cursor + 9);

    if (Ahead.indexOf("function") === 0 && !IdentifierBody.test(Ahead.charAt(8) || "")) {
        return;
    }

    while (this.Cursor < this.Text.length) {
        this.SkipSpace();

        var Character = this.Text.charAt(this.Cursor);

        if (Character === "=" || Character === "\n" || Character === ";" || Character === ")") {
            return;
        }

        if (Character === ",") {
            this.Cursor += 1;
            continue;
        }

        if (Character === ":") {
            this.Cursor += 1;
            this.SkipSpace();

            var Annotation = this.ReadIdentifier();

            if (Annotation) {
                this.Emit(Annotation.Start, Annotation.End - Annotation.Start, TypeType);
            }

            continue;
        }

        if (IdentifierStart.test(Character)) {
            var Identifier = this.ReadIdentifier();

            if (Identifier) {
                this.Emit(Identifier.Start, Identifier.End - Identifier.Start, VariableType, DeclarationModifier);
                this.Declared.set(Identifier.Name, VariableType);
            }

            continue;
        }

        return;
    }
};

TokenScanner.prototype.CaptureForVariables = function () {
    this.SkipSpace();

    while (this.Cursor < this.Text.length) {
        var Character = this.Text.charAt(this.Cursor);

        if (Character === "=") {
            return;
        }

        if (/\s/.test(Character) && this.Text.indexOf("in", this.Cursor + 1) === this.Cursor + 1) {
            return;
        }

        if (IdentifierStart.test(Character)) {
            var Identifier = this.ReadIdentifier();

            if (Identifier) {
                this.Emit(Identifier.Start, Identifier.End - Identifier.Start, VariableType, DeclarationModifier);
                this.Declared.set(Identifier.Name, VariableType);
            }

            continue;
        }

        this.Cursor += 1;
    }
};

TokenScanner.prototype.CaptureTypeAlias = function () {
    this.SkipSpace();

    var Identifier = this.ReadIdentifier();

    if (Identifier) {
        this.Emit(Identifier.Start, Identifier.End - Identifier.Start, TypeType, DeclarationModifier);
        this.Declared.set(Identifier.Name, TypeType);
    }
};

TokenScanner.prototype.HandleDeclarationKeyword = function (Keyword) {
    if (Keyword === "function") {
        this.SkipSpace();

        var Chain = this.ReadQualifiedChain();
        var Last = Chain.Segments[Chain.Segments.length - 1];

        if (Last) {
            this.Emit(Chain.End - Last.length, Last.length, FunctionType, DeclarationModifier);
            this.Declared.set(Last, FunctionType);
        }

        this.CaptureParameters();
        return;
    }

    if (Keyword === "local") {
        this.CaptureLocalDeclaration();
        return;
    }

    if (Keyword === "for") {
        this.CaptureForVariables();
        return;
    }

    if (Keyword === "type") {
        this.CaptureTypeAlias();
    }
};

TokenScanner.prototype.EmitResolvedMember = function (Chain, Type, Readonly) {
    var Last = Chain.Segments[Chain.Segments.length - 1];

    if (Last) {
        this.Emit(Chain.End - Last.length, Last.length, Type, Readonly ? ReadonlyModifier : 0);
    }
};

TokenScanner.prototype.EmitChainHead = function (Chain, Head) {
    var HeadSymbol = this.Index.Resolve(Head);

    if (HeadSymbol && HeadSymbol.Kind === "class") {
        this.Emit(Chain.Start, Head.length, ClassType);
        return;
    }

    var DeclaredType = this.Declared.get(Head);

    if (DeclaredType !== undefined) {
        this.Emit(Chain.Start, Head.length, DeclaredType);
    } else if (this.Bindings.has(Head)) {
        this.Emit(Chain.Start, Head.length, VariableType);
    }
};

TokenScanner.prototype.BuildQualified = function (Segments, Separators) {
    var Qualified = Segments[0] || "";

    for (var Position = 1; Position < Segments.length; Position += 1) {
        Qualified += (Separators[Position - 1] || ".") + Segments[Position];
    }

    return Qualified;
};

TokenScanner.prototype.ClassifyChain = function (Chain) {
    var Segments = Chain.Segments;
    var Head = Segments[0];

    if (!Head) {
        return;
    }

    if (Segments.length > 1) {
        this.EmitChainHead(Chain, Head);

        var Qualified = this.BuildQualified(Segments, Chain.Separators);
        var Resolved = this.Index.Resolve(Qualified);

        if (Resolved) {
            this.EmitResolvedMember(Chain, KindToType[Resolved.Kind], Resolved.Kind === "property");
            return;
        }

        var Binding = this.Bindings.get(Head);

        if (Binding) {
            var Separator = Chain.Separators[Chain.Separators.length - 1] === ":" ? ":" : ".";
            var Last = Segments[Segments.length - 1];
            var Member = this.Index.Binding(Binding, Separator).find(function (Symbol) {
                return Symbol.Name === Last;
            });

            if (Member) {
                this.EmitResolvedMember(Chain, KindToType[Member.Kind], false);
            }

            return;
        }
    }

    if (Segments.length === 1) {
        var DeclaredType = this.Declared.get(Head);

        if (DeclaredType !== undefined) {
            this.Emit(Chain.Start, Head.length, DeclaredType);
        }
    }
};

TokenScanner.prototype.ClassifyCall = function (Identifier) {
    var Resolved = this.Index.Resolve(Identifier.Name);

    if (Resolved) {
        this.Emit(Identifier.Start, Identifier.End - Identifier.Start, KindToType[Resolved.Kind]);
        return;
    }

    var DeclaredType = this.Declared.get(Identifier.Name);

    if (DeclaredType !== undefined) {
        this.Emit(Identifier.Start, Identifier.End - Identifier.Start, DeclaredType);
    }
};

TokenScanner.prototype.Run = function () {
    while (this.Cursor < this.Text.length) {
        var Character = this.Text.charAt(this.Cursor);

        if (this.Text.indexOf("--", this.Cursor) === this.Cursor) {
            this.SkipComment();
            continue;
        }

        if (Character === "\"" || Character === "'" || Character === "`") {
            this.SkipQuoted(Character);
            continue;
        }

        if (this.Text.indexOf("[[", this.Cursor) === this.Cursor || this.Text.indexOf("[=", this.Cursor) === this.Cursor) {
            this.SkipLongBracket();
            continue;
        }

        if (this.Text.indexOf("::", this.Cursor) === this.Cursor) {
            this.Cursor += 2;
            this.SkipSpace();

            var Cast = this.ReadQualifiedChain();
            var CastHead = Cast.Segments[0];

            if (CastHead) {
                this.Emit(Cast.Start, CastHead.length, TypeType);
            }

            continue;
        }

        if (IdentifierStart.test(Character)) {
            var Identifier = this.ReadIdentifier();

            if (!Identifier) {
                continue;
            }

            if (Keywords[Identifier.Name]) {
                if (DeclarationKeywords[Identifier.Name]) {
                    this.HandleDeclarationKeyword(Identifier.Name);
                }

                continue;
            }

            var Next = this.Text.charAt(this.Cursor);

            if (Next === "." || Next === ":") {
                this.Cursor = Identifier.Start;
                this.ClassifyChain(this.ReadQualifiedChain());
                continue;
            }

            if (Next === "(") {
                this.ClassifyCall(Identifier);
                continue;
            }

            var Resolved = this.Index.Resolve(Identifier.Name);

            if (Resolved && Resolved.Kind === "class") {
                this.Emit(Identifier.Start, Identifier.End - Identifier.Start, ClassType);
                continue;
            }

            if (this.Bindings.has(Identifier.Name)) {
                this.Emit(Identifier.Start, Identifier.End - Identifier.Start, VariableType);
                continue;
            }

            var DeclaredType = this.Declared.get(Identifier.Name);

            if (DeclaredType !== undefined) {
                this.Emit(Identifier.Start, Identifier.End - Identifier.Start, DeclaredType);
                continue;
            }

            if (Resolved && Resolved.Kind !== "function") {
                this.Emit(Identifier.Start, Identifier.End - Identifier.Start, KindToType[Resolved.Kind]);
            }

            continue;
        }

        this.Cursor += 1;
    }
};

function SemanticTokensOf(Query) {
    var Scanner = new TokenScanner(Query.Document.getText(), Query.Index, Query.Bindings);

    return Scanner.Tokens();
}

function EncodeSemanticTokens(Document, Emissions) {
    var Data = [];
    var LastLine = 0;
    var LastCharacter = 0;

    for (var Index = 0; Index < Emissions.length; Index += 1) {
        var Emission = Emissions[Index];
        var Position = Document.positionAt(Emission.Start);
        var DeltaLine = Position.line - LastLine;
        var DeltaCharacter = DeltaLine === 0 ? Position.character - LastCharacter : Position.character;

        Data.push(DeltaLine, DeltaCharacter, Emission.Length, Emission.Type, Emission.Modifiers);

        LastLine = Position.line;
        LastCharacter = Position.character;
    }

    return Data;
}

exports.SemanticLegend = SemanticLegend;
exports.SemanticTokensOf = SemanticTokensOf;
exports.EncodeSemanticTokens = EncodeSemanticTokens;
