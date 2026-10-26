var Builder = require("./builder");

var Callable = Builder.Callable;
var Classifier = Builder.Classifier;
var Method = Builder.Method;
var Property = Builder.Property;
var ParameterList = Builder.ParameterList;

var RobloxApi = [
    Classifier({ Key: "game", Signature: "game: DataModel", Documentation: "Root of the live game tree.", Category: "roblox" }),
    Classifier({ Key: "workspace", Signature: "workspace: Workspace", Documentation: "Shortcut to game.Workspace.", Category: "roblox" }),
    Classifier({ Key: "script", Signature: "script: LuaSourceContainer", Documentation: "Instance running the current script.", Category: "roblox" }),
    Property({ Key: "shared", Signature: "shared: table", Documentation: "Table visible to every executor script.", Category: "roblox" }),
    Callable({ Key: "Instance.new", Signature: "Instance.new(className: string, parent?: Instance): Instance", Documentation: "Constructs a Roblox instance.", Category: "roblox", Kind: "constructor", Parameters: [{ Name: "className" }, { Name: "parent", Optional: true }] }),
    Callable({ Key: "task.spawn", Signature: "task.spawn(fn: function, ...: any)", Documentation: "Runs fn on a fresh thread at once.", Category: "roblox", Parameters: [{ Name: "fn" }, { Name: "..." }] }),
    Callable({ Key: "task.defer", Signature: "task.defer(fn: function, ...: any)", Documentation: "Schedules fn for the next resumption point.", Category: "roblox", Parameters: [{ Name: "fn" }, { Name: "..." }] }),
    Callable({ Key: "task.delay", Signature: "task.delay(delay: number, fn: function, ...: any)", Documentation: "Runs fn after delay seconds.", Category: "roblox", Parameters: [{ Name: "delay" }, { Name: "fn" }, { Name: "..." }] }),
    Callable({ Key: "task.wait", Signature: "task.wait(seconds?: number): number", Documentation: "Suspends the thread and answers elapsed time.", Category: "roblox", Parameters: [{ Name: "seconds", Optional: true }] }),
    Callable({ Key: "task.cancel", Signature: "task.cancel(thread: thread)", Documentation: "Terminates a thread.", Category: "roblox", Parameters: ParameterList(["thread"]) }),
    Callable({ Key: "task.synchronize", Signature: "task.synchronize()", Documentation: "Rejoins serial execution from parallel context.", Category: "roblox" }),
    Method({ Key: "game:GetService", Signature: "game:GetService(service: string): Instance", Documentation: "Resolves a service by class name.", Category: "roblox", Parameters: ParameterList(["service"]) })
];

exports.RobloxApi = RobloxApi;
