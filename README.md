# Executor Bibble

Made by **[linse](https://github.com/whoislinse)**

Language server for the [Volt](https://docs.voltbz.net/docs) Roblox executor environment (sUNC). Provides completions, hover, signature help, diagnostics and outline for executor scripts written in Luau.

## Features

- Completion of every documented Volt global: closures, debug, reflection, metatable, environment, bit, scripts, oth, instances, cache, signals, VoltSignal, actors, LuaStateProxy, filesystem, input, console, crypt, encoding, miscellaneous, drawing, WebSocket and RakNet.
- Member completion after `.` and `:` for library tables and tracked locals such as `local esp = Drawing.new("Text")`, `WebSocket.connect`, `VoltSignal.new` and `LuaStateProxy.new`.
- Hover documentation with signature and docs link.
- Signature help with active parameter tracking.
- Unknown member diagnostics for documented namespaces and tracked bindings.
- Document outline for function declarations.
- Snippets for common executor patterns.
- Command: `Executor Bibble: Open API Reference`.

## Build

```bash
npm install
npm run compile
```

Run with F5 (Extension Development Host) or package for distribution:

```bash
npx vsce package
code --install-extension executor-bibble-1.0.0.vsix
```

## luau-lsp Integration

Executor Bibble generates `definitions/volt.d.lua` from its API catalog and registers the file in `luau-lsp.types.definitionFiles` on activation, so the Luau Language Server recognizes every Volt global (`hookmetamethod`, `getgenv`, `request`, ...), the `WebSocket`, `VoltSignal`, `LuaStateProxy`, `RakNetPacket` and `DrawingObject` classes, and the `bit`, `crypt`, `cache`, `oth` and `raknet` tables without unknown-global errors.

Regenerate definitions after editing the catalog:

```bash
npm run definitions
```

## Configuration

| Setting | Default | Description |
|---|---|---|
| `executorBibble.diagnostics.enable` | `true` | Validate unknown members of Volt libraries. |
