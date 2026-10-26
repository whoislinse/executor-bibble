export type VoltSignal = {
	Connect: (self: VoltSignal, handler: any) -> any,
	Once: (self: VoltSignal, handler: any) -> any,
	Wait: (self: VoltSignal) -> any,
	Fire: (self: VoltSignal, ...any) -> any,
}

export type VoltConnection = {
	Disconnect: (self: VoltConnection) -> any,
	Connected: boolean,
}

export type LuaStateProxy = {
	GetActors: (self: LuaStateProxy) -> any,
	Execute: (self: LuaStateProxy, code: any) -> any,
	Id: number,
	IsActorState: boolean,
	Event: VoltSignal,
}

export type WebSocket = {
	Send: (self: WebSocket, message: any) -> any,
	Close: (self: WebSocket) -> any,
	OnMessage: VoltSignal,
	OnClose: VoltSignal,
	IsClosed: boolean,
}

export type RakNetPacket = {
	SetData: (self: RakNetPacket, data: any) -> any,
	Block: (self: RakNetPacket) -> any,
	AsBuffer: buffer,
	AsString: string,
	AsArray: {number},
	PacketId: number,
	Priority: number,
	Reliability: number,
	OrderingChannel: number,
	Size: number,
}

export type DrawingObject = {
	From: Vector2?,
	To: Vector2?,
	Thickness: number?,
	Visible: boolean?,
	ZIndex: number?,
	Transparency: number?,
	Color: Color3?,
	__OBJECT_EXISTS: boolean?,
	Position: Vector2?,
	Radius: number?,
	NumSides: number?,
	Filled: boolean?,
	Size: Vector2?,
	PointA: Vector2?,
	PointB: Vector2?,
	PointC: Vector2?,
	PointD: Vector2?,
	Text: string?,
	TextBounds: Vector2?,
	Font: number?,
	Center: boolean?,
	Centered: boolean?,
	Outline: boolean?,
	Outlined: boolean?,
	OutlineColor: Color3?,
	OutlineOpacity: number?,
	Data: string?,
	Rounding: number?,
	Loaded: boolean?,
	Remove: (self: DrawingObject) -> (),
	Destroy: (self: DrawingObject) -> ()
}

export type ProtoProxy = {}

declare Drawing: {
	new: (TypeName: string) -> DrawingObject,
	Fonts: {
		UI: number,
		System: number,
		Plex: number,
		Monospace: number
	}
}

declare DrawFont: {
	Register: (...any) -> any
}

declare VoltSignal: {
	new: () -> any
}

declare Signal: {
	new: () -> VoltSignal
}

declare WebSocket: {
	connect: (url: any) -> any,
	OnMessage: () -> any,
	OnClose: () -> any,
	IsClosed: () -> any
}

declare websocket: {
	connect: (url: any) -> WebSocket
}

declare LuaStateProxy: {
	new: () -> any,
	Id: () -> any,
	IsActorState: () -> any,
	Event: () -> any
}

declare bit: {
	badd: (...any) -> any,
	bsub: (...any) -> any,
	bmul: (...any) -> any,
	bdiv: (...any) -> any,
	band: (...any) -> any,
	bor: (...any) -> any,
	bxor: (...any) -> any,
	bnot: (value: any) -> any,
	bswap: (value: any) -> any,
	rol: (value: any, count: any) -> any,
	ror: (value: any, count: any) -> any,
	lshift: (value: any, count: any) -> any,
	rshift: (value: any, count: any) -> any,
	arshift: (value: any, count: any) -> any,
	tohex: (value: any) -> any,
	tobit: (value: any) -> any
}

declare oth: {
	hook: (target: any, hook: any) -> any,
	unhook: (target: any) -> any,
	get_root_callback: (target: any) -> any,
	is_hook_thread: () -> any,
	get_original_thread: () -> any
}

declare cache: {
	replace: (object: any, copy: any) -> any,
	invalidate: (object: any) -> any,
	iscached: (object: any) -> any
}

declare crypt: {
	encrypt: (data: any, key: any, mode: any?, iv: any?) -> any,
	decrypt: (data: any, key: any, mode: any?, iv: any?) -> any,
	hash: (data: any, algorithm: any?) -> any,
	hmac: (data: any, key: any, algorithm: any?) -> any,
	random: (bytes: any, seed: any?) -> any,
	generatekey: (bytes: any?) -> any,
	generatebytes: (bytes: any, seed: any?) -> any,
	base64encode: (data: any) -> any,
	base64decode: (data: any) -> any,
	lz4compress: (data: any) -> any,
	lz4decompress: (data: any) -> any
}

declare raknet: {
	send: (data: any, priority: any?, reliability: any?, orderingChannel: any?) -> any,
	add_send_hook: (hook: any) -> any,
	remove_send_hook: (hook: any) -> any,
	is_enabled: () -> any
}

declare function checkcaller(): any
declare function iscclosure(f: any): any
declare function isexecutorclosure(f: any): any
declare function isfunctionhooked(f: any): any
declare function islclosure(f: any): any
declare function isnewcclosure(f: any): any
declare function isprotohooked(proto: any): any
declare function getfunctionhash(f: any): any
declare function clonefunction(f: any): any
declare function hookfunction(original: any, hook: any): any
declare function hookmetamethod(object: any, metamethod: any, hook: any): any
declare function hookproto(proto: any, hook: any): any
declare function restorefunction(f: any): any
declare function restoreproto(proto: any): any
declare function newcclosure(f: any): any
declare function newlclosure(f: any): any
declare function setstackhidden(f: any, hidden: any): any
declare function trampoline_call(f: any): any
declare function gethiddenproperty(instance: any, property: any): any
declare function gethiddenproperties(instance: any): any
declare function getproperties(instance: any): any
declare function sethiddenproperty(instance: any, property: any, value: any): any
declare function getthreadidentity(): any
declare function setthreadidentity(identity: any): any
declare function isnetworkowner(part: any): any
declare function isscriptable(instance: any, property: any): any
declare function setscriptable(instance: any, property: any, scriptable: any): any
declare function setsimulationradius(): any
declare function getrawmetatable(object: any): any
declare function setrawmetatable(object: any, metatable: any): any
declare function getnamecallmethod(): any
declare function setnamecallmethod(name: any): any
declare function isreadonly(t: any): any
declare function iswritable(t: any): any
declare function makereadonly(t: any): any
declare function makewritable(t: any): any
declare function setreadonly(t: any, readonly: any): any
declare function getgenv(): any
declare function getrenv(): any
declare function gettenv(Thread: any): any
declare function getreg(): any
declare function getgc(includeTables: any?): any
declare function filtergc(filter: any?): any
declare function getallthreads(): any
declare function loadstring(source: any, chunkname: any?): (((...any) -> any)?, string?)
declare function decompile(target: any): any
declare function getcallingscript(): any
declare function getfunctionbytecode(f: any): any
declare function getloadedmodules(): any
declare function getmodules(): any
declare function getrunningscripts(): any
declare function getscriptbytecode(script: any): any
declare function getscriptclosure(script: any): any
declare function getscriptfromthread(Thread: any): any
declare function getscriptthread(script: any): any
declare function getscripthash(script: any): any
declare function getscripts(): any
declare function getsenv(script: any): any
declare function isexecutorthread(Thread: any?): any
declare function cloneref(instance: any): any
declare function compareinstances(a: any, b: any): any
declare function fireclickdetector(detector: any, distance: any?): any
declare function fireproximityprompt(prompt: any): any
declare function firetouchinterest(part: any, target: any, state: any): any
declare function getcallbackmember(instance: any, property: any): any
declare function getcallbackvalue(instance: any, property: any): any
declare function gethui(): any
declare function getinstancecache(): any
declare function getinstances(): any
declare function getnilinstances(): any
declare function getrendersteppedlist(): any
declare function cansignalreplicate(signal: any): any
declare function firesignal(signal: any, ...: any): any
declare function getconnections(signal: any): any
declare function getsignalarguments(signal: any, index: any): any
declare function getsignalargumentsinfo(signal: any): any
declare function getsignalwhitelist(): any
declare function replicatesignal(signal: any, ...: any): any
declare function readfile(path: any): any
declare function writefile(path: any, data: any): any
declare function appendfile(path: any, data: any): any
declare function isfile(path: any): any
declare function isfolder(path: any): any
declare function listfiles(path: any): any
declare function makefolder(path: any): any
declare function delfile(path: any): any
declare function delfolder(path: any): any
declare function loadfile(path: any): (((...any) -> any)?, string?)
declare function dofile(path: any): any
declare function getcustomasset(path: any): any
declare function iswindowactive(): any
declare function keypress(key: any): any
declare function keyrelease(key: any): any
declare function keyclick(key: any): any
declare function mouse1press(): any
declare function mouse1release(): any
declare function mouse1click(): any
declare function mouse2press(): any
declare function mouse2release(): any
declare function mouse2click(): any
declare function mousescroll(amount: any): any
declare function mousemoverel(dx: any, dy: any): any
declare function mousemoveabs(x: any, y: any): any
declare function rconsoleshow(): any
declare function rconsolehide(): any
declare function rconsoletoggle(): any
declare function rconsolehidden(): any
declare function rconsoletop(): any
declare function rconsoleprint(text: any): any
declare function rconsoleinfo(text: any): any
declare function rconsolewarn(text: any): any
declare function rconsoleerr(text: any): any
declare function rconsoleclear(): any
declare function rconsolename(title: any): any
declare function rconsoleinput(prompt: any?): any
declare function base64encode(data: any): any
declare function base64decode(data: any): any
declare function lz4compress(data: any): any
declare function lz4decompress(data: any): any
declare function identifyexecutor(): any
declare function gethwid(): any
declare function get_process_identifier(): any
declare function request(options: any): any
declare function messagebox(text: any, title: any?, style: any?): any
declare function setclipboard(text: any): any
declare function setrbxclipboard(text: any): any
declare function getfpscap(): any
declare function setfpscap(cap: any): any
declare function getfflag(name: any): any
declare function setfflag(name: any, value: any): any
declare function queueonteleport(source: any): any
declare function clearqueueonteleport(): any
declare function saveinstance(options: any?): any
declare function saveplace(options: any?): any
declare function create_comm_channel(name: any): any
declare function get_comm_channel(name: any): any
declare function get_current_actor(): any
declare function getactors(): any
declare function getactorstates(): any
declare function getluastate(target: any): any
declare function getgamestate(): any
declare function isparallel(): any
declare function run_on_actor(actor: any, code: any): any
declare function cleardrawcache(): any
declare function isrenderobj(value: any): any
declare function getrenderproperty(object: any, property: any): any
declare function setrenderproperty(object: any, property: any, value: any): any
declare function DrawingImmediate(callback: any): any

declare on_actor_state_created: VoltSignal
