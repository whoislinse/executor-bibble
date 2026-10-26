var Fs = require("fs");
var Path = require("path");
var Library = require("../out/server/src/library");

var Index = Library.CreateApiIndex(Library.VoltApi.concat(Library.RobloxApi));
var DrawingTypes = Library.DrawingTypes;
var DrawingPropertiesOf = Library.DrawingPropertiesOf;

var Root = Path.join(__dirname, "..");
var OutputPath = Path.join(Root, "definitions", "volt.d.lua");
var Indent = "\t";

var ClassOwners = {};
var NamespaceTables = {};
var BareFunctions = [];
var BareValues = [];

var ReservedNames = { type: "TypeName", thread: "Thread", function: "Function" };

function SanitizeType(TypeText) {
    return TypeText.split("function?").join("((...any) -> any)?").split("function").join("(...any) -> any");
}

function RenderParameter(Parameter, Style) {
    if (Parameter.Name === "...") {
        return Style === "declare" ? "...: any" : "...any";
    }

    var Name = ReservedNames[Parameter.Name] || Parameter.Name;
    var Type = SanitizeType(Parameter.Type || "any") + (Parameter.Optional ? "?" : "");

    return Name + ": " + Type;
}

function RenderParameters(Symbol, Style) {
    var Parameters = Symbol.Parameters || [];

    if (Parameters.length === 0) {
        return "";
    }

    return Parameters.map(function (Parameter) {
        return RenderParameter(Parameter, Style);
    }).join(", ");
}

function RenderTypeReturn(Symbol) {
    var Returns = SanitizeType(Symbol.Returns || "any");

    if (Returns.indexOf(",") !== -1) {
        Returns = "(" + Returns + ")";
    }

    return " -> " + Returns;
}

function RenderValueReturn(Symbol) {
    var Returns = SanitizeType(Symbol.Returns || "any");

    if (Returns.indexOf(",") !== -1) {
        Returns = "(" + Returns + ")";
    }

    return ": " + Returns;
}

function PropertyTypeOf(Symbol) {
    var Separator = Symbol.Signature.lastIndexOf(": ");

    return Separator === -1 ? "any" : Symbol.Signature.slice(Separator + 2);
}

function CollectEntries() {
    var All = Library.VoltApi;

    for (var Position = 0; Position < All.length; Position += 1) {
        var Symbol = All[Position];

        if (Symbol.Key.indexOf(":") !== -1) {
            var ColonOwner = Symbol.Key.slice(0, Symbol.Key.indexOf(":"));

            ClassOwners[ColonOwner] = true;
            continue;
        }

        var DotBoundary = Symbol.Key.indexOf(".");

        if (DotBoundary !== -1) {
            var Owner = Symbol.Key.slice(0, DotBoundary);

            if (!NamespaceTables[Owner]) {
                NamespaceTables[Owner] = [];
            }

            NamespaceTables[Owner].push(Symbol);
            continue;
        }

        if (Symbol.Kind === "class") {
            continue;
        }

        if (Symbol.Kind === "function" || Symbol.Kind === "constructor") {
            BareFunctions.push(Symbol);
        } else if (Symbol.Key !== "Signal" && Symbol.Key !== "websocket") {
            BareValues.push(Symbol);
        }
    }
}

function RenderMethodField(Owner, Symbol) {
    var Parameters = RenderParameters(Symbol, "type");

    if (Parameters.length > 0) {
        Parameters = ", " + Parameters;
    }

    return Indent + Symbol.Name + ": (self: " + Owner + Parameters + ")" + RenderTypeReturn(Symbol);
}

function RenderTypeAlias(Owner, Lines) {
    Lines.push("export type " + Owner + " = {");

    var Methods = Index.Members(Owner, ":");
    var Properties = Index.Members(Owner, ".").filter(function (Symbol) {
        return Symbol.Kind !== "constructor";
    });

    for (var MethodIndex = 0; MethodIndex < Methods.length; MethodIndex += 1) {
        Lines.push(RenderMethodField(Owner, Methods[MethodIndex]) + ",");
    }

    for (var PropIndex = 0; PropIndex < Properties.length; PropIndex += 1) {
        var Property = Properties[PropIndex];

        Lines.push(Indent + Property.Name + ": " + PropertyTypeOf(Property) + ",");
    }

    Lines.push("}");
    Lines.push("");
}

function RenderDrawingObject(Lines) {
    Lines.push("export type DrawingObject = {");

    var TypeNames = Object.keys(DrawingTypes);
    var Seen = {};

    for (var TypeIndex = 0; TypeIndex < TypeNames.length; TypeIndex += 1) {
        var Descriptors = DrawingPropertiesOf(TypeNames[TypeIndex]);

        for (var Position = 0; Position < Descriptors.length; Position += 1) {
            var Descriptor = Descriptors[Position];
            var Boundary = Descriptor.indexOf(":");
            var Name = Descriptor.slice(0, Boundary);
            var TypeText = Descriptor.slice(Boundary + 2);

            if (TypeText.charAt(TypeText.length - 1) !== "?") {
                TypeText = TypeText + "?";
            }

            if (!Seen[Name]) {
                Seen[Name] = true;
                Lines.push(Indent + Name + ": " + TypeText + ",");
            }
        }
    }

    Lines.push(Indent + "Remove: (self: DrawingObject) -> (),");
    Lines.push(Indent + "Destroy: (self: DrawingObject) -> ()");
    Lines.push("}");
    Lines.push("");
}

function RenderProtoProxy(Lines) {
    Lines.push("export type ProtoProxy = {}");
    Lines.push("");
}

function RenderDeclareTable(Name, Symbols, Lines) {
    Lines.push("declare " + Name + ": {");

    for (var Position = 0; Position < Symbols.length; Position += 1) {
        var Symbol = Symbols[Position];
        var Comma = Position === Symbols.length - 1 ? "" : ",";

        Lines.push(Indent + Symbol.Name + ": (" + RenderParameters(Symbol, "type") + ")" + RenderTypeReturn(Symbol) + Comma);
    }

    Lines.push("}");
    Lines.push("");
}

function RenderStaticSection(Lines) {
    Lines.push("declare Drawing: {");
    Lines.push(Indent + "new: (TypeName: string) -> DrawingObject,");
    Lines.push(Indent + "Fonts: {");
    Lines.push(Indent + Indent + "UI: number,");
    Lines.push(Indent + Indent + "System: number,");
    Lines.push(Indent + Indent + "Plex: number,");
    Lines.push(Indent + Indent + "Monospace: number");
    Lines.push(Indent + "}");
    Lines.push("}");
    Lines.push("");

    Lines.push("declare DrawFont: {");
    Lines.push(Indent + "Register: (...any) -> any");
    Lines.push("}");
    Lines.push("");

    RenderDeclareTable("VoltSignal", Index.Members("VoltSignal", "."), Lines);

    Lines.push("declare Signal: {");
    Lines.push(Indent + "new: () -> VoltSignal");
    Lines.push("}");
    Lines.push("");

    RenderDeclareTable("WebSocket", Index.Members("WebSocket", "."), Lines);

    Lines.push("declare websocket: {");
    Lines.push(Indent + "connect: (url: any) -> WebSocket");
    Lines.push("}");
    Lines.push("");

    RenderDeclareTable("LuaStateProxy", Index.Members("LuaStateProxy", "."), Lines);
}

function RenderNamespaceSection(Lines) {
    var Owners = Object.keys(NamespaceTables);

    for (var OwnerIndex = 0; OwnerIndex < Owners.length; OwnerIndex += 1) {
        var Owner = Owners[OwnerIndex];
        var IsStaticOwner = Owner === "Drawing" || Owner === "DrawFont" || Owner === "debug";
        var IsClassOwner = ClassOwners[Owner] || Owner === "VoltSignal" || Owner === "WebSocket" || Owner === "LuaStateProxy";

        if (IsStaticOwner || IsClassOwner) {
            continue;
        }

        RenderDeclareTable(Owner, NamespaceTables[Owner], Lines);
    }
}

function RenderBareSection(Lines) {
    for (var FunctionIndex = 0; FunctionIndex < BareFunctions.length; FunctionIndex += 1) {
        var FunctionSymbol = BareFunctions[FunctionIndex];

        Lines.push("declare function " + FunctionSymbol.Name + "(" + RenderParameters(FunctionSymbol, "declare") + ")" + RenderValueReturn(FunctionSymbol));
    }

    Lines.push("");

    for (var ValueIndex = 0; ValueIndex < BareValues.length; ValueIndex += 1) {
        var ValueSymbol = BareValues[ValueIndex];

        if (ValueSymbol.Key === "on_actor_state_created") {
            Lines.push("declare on_actor_state_created: VoltSignal");
            continue;
        }

        Lines.push("declare " + ValueSymbol.Key + ": any");
    }
}

function Render() {
    var Lines = [];

    CollectEntries();

    var ClassNames = Object.keys(ClassOwners);

    for (var ClassIndex = 0; ClassIndex < ClassNames.length; ClassIndex += 1) {
        RenderTypeAlias(ClassNames[ClassIndex], Lines);
    }

    RenderDrawingObject(Lines);
    RenderProtoProxy(Lines);
    RenderStaticSection(Lines);
    RenderNamespaceSection(Lines);
    RenderBareSection(Lines);

    return Lines.join("\n") + "\n";
}

Fs.mkdirSync(Path.dirname(OutputPath), { recursive: true });
Fs.writeFileSync(OutputPath, Render(), "utf8");

console.log("definitions written: " + OutputPath);
