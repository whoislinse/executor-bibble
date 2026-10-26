local executor = identifyexecutor()
print(executor.name, executor.version)

rconsoleshow()
rconsolename("Executor Bibble")
rconsoleprint("hwid: " .. gethwid() .. "\n")

local esp = Drawing.new("Text")
esp.Text = "ESP"
esp.Size = 13
esp.Outline = true
esp.Color = Color3.fromRGB(255, 255, 255)
esp.Visible = true

local mask = bit.band(0xF0, 0xCC)
local digest = crypt.hash("bibble", "sha512")

local response = request({
    Url = "https://httpbin.org/get",
    Method = "GET",
})
rconsoleinfo(response.Body)

local socket = WebSocket.connect("wss://echo.websocket.org")
socket.OnMessage:Connect(function(message)
    rconsoleprint("[ws] " .. message .. "\n")
end)
socket:Send("hello from bibble")

local ready = VoltSignal.new()
ready:Connect(function(value)
    rconsolewarn("signal fired: " .. tostring(value))
end)
ready:Fire(mask)

local oldNamecall
oldNamecall = hookmetamethod(game, "__namecall", newcclosure(function(self, ...)
    local method = getnamecallmethod()
    if method == "Kick" then
        return nil
    end
    return oldNamecall(self, ...)
end))
makefolder("bibble")
writefile("bibble/digest.txt", digest)
local stored = readfile("bibble/digest.txt")
rconsoleprint("stored " .. #stored .. " bytes\n")

task.delay(3, function()
    socket:Close()
    esp:Remove()
    rconsolehide()
end)
