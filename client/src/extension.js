var Fs = require("fs");
var Path = require("path");
var Vscode = require("vscode");
var ClientModule = require("vscode-languageclient/node");

var LanguageClient = ClientModule.LanguageClient;
var TransportKind = ClientModule.TransportKind;

var DocsBase = "https://docs.voltbz.net/docs";

var ReferencePages = [
    ["Closures", "closures"],
    ["Debug", "debug"],
    ["Reflection", "reflection"],
    ["Metatable", "metatable"],
    ["Environment", "environment"],
    ["Bit", "bit"],
    ["Scripts", "scripts"],
    ["oth", "oth"],
    ["Instances", "instances"],
    ["Cache", "cache"],
    ["Signals", "signals"],
    ["VoltSignal", "voltsignal"],
    ["Actors", "actors"],
    ["LuaStateProxy", "luastateproxy"],
    ["Filesystem", "filesystem"],
    ["Input", "input"],
    ["Console", "console"],
    ["Crypt", "crypt"],
    ["Encoding", "encoding"],
    ["Miscellaneous", "miscellaneous"],
    ["Drawing", "drawing"],
    ["WebSocket", "websocket"],
    ["RakNet", "raknet"]
];

var Client = undefined;

function ServerOptions(ModulePath) {
    return {
        run: { module: ModulePath, transport: TransportKind.ipc },
        debug: { module: ModulePath, transport: TransportKind.ipc, options: { execArgv: ["--nolazy", "--inspect=6009"] } }
    };
}

function OpenReference() {
    var Picks = ReferencePages.map(function (Page) {
        return { Label: Page[0], Description: DocsBase + "/" + Page[1], Page: Page[1] };
    });

    return Vscode.window.showQuickPick(Picks, { placeHolder: "Volt API reference" }).then(function (Pick) {
        if (Pick) {
            return Vscode.env.openExternal(Vscode.Uri.parse(DocsBase + "/" + Pick.Page));
        }

        return undefined;
    });
}

function SourceDefinitionsPath(Context) {
    return Context.asAbsolutePath(Path.join("definitions", "volt.d.lua"));
}

function StableDefinitionsPath(Context) {
    return Path.join(Context.globalStorageUri.fsPath, "volt.d.lua");
}

function SyncDefinitions(Context) {
    Fs.mkdirSync(Context.globalStorageUri.fsPath, { recursive: true });
    Fs.copyFileSync(SourceDefinitionsPath(Context), StableDefinitionsPath(Context));

    return StableDefinitionsPath(Context);
}

function EnsureLuauDefinitions(FilePath) {
    var Configuration = Vscode.workspace.getConfiguration("luau-lsp");
    var Current = Configuration.get("types.definitionFiles");
    var Entries = Array.isArray(Current) ? Current.slice() : [];

    if (Entries.indexOf(FilePath) !== -1) {
        return Promise.resolve({ Added: false, Entries: Entries });
    }

    Entries.push(FilePath);

    return Configuration.update("types.definitionFiles", Entries, Vscode.ConfigurationTarget.Global).then(function () {
        return { Added: true, Entries: Entries };
    });
}

function ReloadLuauServer() {
    return Vscode.commands.executeCommand("luau-lsp.reload").then(undefined, function () {
        return undefined;
    });
}

function RegisterDefinitions(Context) {
    var FilePath = SyncDefinitions(Context);

    return EnsureLuauDefinitions(FilePath).then(function (Result) {
        if (Result.Added) {
            return ReloadLuauServer().then(function () {
                return Result;
            });
        }

        return Result;
    });
}

function ReportDefinitions(Result) {
    var Message = Result.Added
        ? "Executor Bibble registered Volt definitions for luau-lsp."
        : "Volt definitions already registered for luau-lsp.";

    Vscode.window.showInformationMessage(Message + " · made by linse");
}

function Activate(Context) {
    var ModulePath = Context.asAbsolutePath(Path.join("out", "server", "src", "server.js"));

    Client = new LanguageClient(
        "executorBibble",
        "Executor Bibble",
        ServerOptions(ModulePath),
        { documentSelector: [{ scheme: "file", language: "bibble" }] }
    );

    Context.subscriptions.push(
        Vscode.commands.registerCommand("executorBibble.apiReference", function () {
            OpenReference();
        }),
        Vscode.commands.registerCommand("executorBibble.registerLuauDefinitions", function () {
            RegisterDefinitions(Context).then(ReportDefinitions);
        }),
        { dispose: function () {
            if (Client) {
                Client.stop();
            }
        } }
    );

    RegisterDefinitions(Context);

    Client.start();
}

function Deactivate() {
    return Client ? Client.stop() : undefined;
}

exports.activate = Activate;
exports.deactivate = Deactivate;
