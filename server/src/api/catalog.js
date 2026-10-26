var Builder = require("./builder");
var Drawing = require("./drawing");

var Method = Builder.Method;
var Property = Builder.Property;
var Enumerator = Builder.Enumerator;

var NamespaceAliases = {
    Signal: "VoltSignal",
    websocket: "WebSocket"
};

var InternalOwners = { DrawingObject: true };

var DebugPrefix = "debug.";

function Append(Table, Owner, Symbol) {
    var Bucket = Table.get(Owner);

    if (Bucket) {
        Bucket.push(Symbol);
    } else {
        Table.set(Owner, [Symbol]);
    }
}

function OwnerSegment(Key, Separator) {
    var Boundary = Key.indexOf(Separator);

    return Boundary === -1 ? undefined : Key.slice(0, Boundary);
}

function FindByName(Symbols, Name) {
    if (!Symbols) {
        return undefined;
    }

    return Symbols.find(function (Symbol) {
        return Symbol.Name === Name;
    });
}

function DrawingMethodSymbols() {
    return Drawing.DrawingMethods.map(function (Declaration) {
        var Name = Declaration.slice(0, Declaration.indexOf("("));

        return Method({
            Key: "DrawingObject:" + Name,
            Signature: "DrawingObject:" + Declaration,
            Documentation: "Stops the rendering of the drawing object.",
            Category: "drawing"
        });
    });
}

function DrawingPropertySymbol(Type, Descriptor, Position) {
    var Separator = Descriptor.indexOf(":");
    var Name = Descriptor.slice(0, Separator);
    var TypeText = Descriptor.slice(Separator + 2);

    return Property({
        Key: "DrawingObject." + Position + "." + Name,
        Signature: Name + ": " + TypeText,
        Documentation: Name + " property of a " + Type + " drawing object.",
        Category: "drawing"
    });
}

function CanonicalOf(Owner) {
    return NamespaceAliases[Owner] || Owner;
}

function AliasedKeyOf(Token) {
    var Boundary = Token.search(/[.:]/);

    if (Boundary === -1) {
        return Token;
    }

    return CanonicalOf(Token.slice(0, Boundary)) + Token.slice(Boundary);
}

function CreateApiIndex(Entries) {
    var ByKey = new Map();
    var DotMembers = new Map();
    var ColonMembers = new Map();
    var DrawingByType = new Map();
    var DrawingMethods = DrawingMethodSymbols();

    for (var EntryIndex = 0; EntryIndex < Entries.length; EntryIndex += 1) {
        var Symbol = Entries[EntryIndex];

        ByKey.set(Symbol.Key, Symbol);

        var ColonOwner = OwnerSegment(Symbol.Key, ":");

        if (ColonOwner) {
            Append(ColonMembers, ColonOwner, Symbol);
        } else {
            var DotOwner = OwnerSegment(Symbol.Key, ".");

            if (DotOwner) {
                Append(DotMembers, DotOwner, Symbol);
            }
        }
    }

    var FontNames = Object.keys(Drawing.DrawingFonts);

    for (var FontIndex = 0; FontIndex < FontNames.length; FontIndex += 1) {
        var FontName = FontNames[FontIndex];
        var Font = Enumerator({
            Key: "Drawing.Fonts." + FontName,
            Signature: "Drawing.Fonts." + FontName + ": number",
            Documentation: "Legacy font id " + Drawing.DrawingFonts[FontName] + ".",
            Category: "drawing"
        });

        ByKey.set(Font.Key, Font);
        Append(DotMembers, "Drawing.Fonts", Font);
    }

    var TypeNames = Object.keys(Drawing.DrawingTypes);

    for (var TypeIndex = 0; TypeIndex < TypeNames.length; TypeIndex += 1) {
        var TypeName = TypeNames[TypeIndex];
        var Descriptors = Drawing.DrawingPropertiesOf(TypeName);
        var Properties = Descriptors.map(function (Descriptor, Position) {
            return DrawingPropertySymbol(TypeName, Descriptor, Position);
        });

        DrawingByType.set(TypeName, Properties);
    }

    var Mirrored = Array.from(ByKey.entries());

    for (var MirrorIndex = 0; MirrorIndex < Mirrored.length; MirrorIndex += 1) {
        var Pair = Mirrored[MirrorIndex];

        if (!Pair[0].startsWith(DebugPrefix)) {
            continue;
        }

        var BareName = Pair[0].slice(DebugPrefix.length);

        if (BareName.indexOf(".") !== -1 || ByKey.has(BareName)) {
            continue;
        }

        var Clone = Object.assign({}, Pair[1], { Key: BareName, Name: BareName });

        ByKey.set(BareName, Clone);
    }

    var Globals = Array.from(ByKey.values()).filter(function (Symbol) {
        return Symbol.Key.indexOf(".") === -1 && Symbol.Key.indexOf(":") === -1;
    });

    var Namespaces = Array.from(new Set(
        Array.from(DotMembers.keys()).concat(Array.from(ColonMembers.keys()), Object.keys(NamespaceAliases))
    )).filter(function (Owner) {
        return !InternalOwners[Owner];
    });

    return {
        Resolve: function (Token) {
            var Direct = ByKey.get(Token) || ByKey.get(AliasedKeyOf(Token));

            if (Direct) {
                return Direct;
            }

            var Aliased = AliasedKeyOf(Token);
            var ColonBoundary = Aliased.indexOf(":");

            if (ColonBoundary !== -1) {
                return FindByName(ColonMembers.get(Aliased.slice(0, ColonBoundary)), Aliased.slice(ColonBoundary + 1));
            }

            var DotBoundary = Aliased.indexOf(".");

            if (DotBoundary !== -1) {
                return FindByName(DotMembers.get(Aliased.slice(0, DotBoundary)), Aliased.slice(DotBoundary + 1));
            }

            return undefined;
        },
        Globals: function () {
            return Globals;
        },
        Namespaces: function () {
            return Namespaces;
        },
        Members: function (Owner, Separator) {
            var Table = Separator === ":" ? ColonMembers : DotMembers;

            return Table.get(CanonicalOf(Owner)) || [];
        },
        Binding: function (Binding, Separator) {
            if (Binding.Kind === "drawing") {
                return Separator === ":" ? DrawingMethods : DrawingByType.get(Binding.DrawingType) || [];
            }

            return this.Members(Binding.ClassName, Separator);
        }
    };
}

exports.CreateApiIndex = CreateApiIndex;
