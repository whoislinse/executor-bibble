var BindingRules = [
    {
        Expression: /\blocal\s+([A-Za-z_]\w*)\s*=\s*Drawing\.new\s*\(\s*["'](\w+)["']/g,
        Resolve: function (Match) {
            return { Kind: "drawing", DrawingType: Match[2] || "Line" };
        }
    },
    {
        Expression: /\blocal\s+([A-Za-z_]\w*)\s*=\s*WebSocket\.connect/g,
        Resolve: function () {
            return { Kind: "instance", ClassName: "WebSocket" };
        }
    },
    {
        Expression: /\blocal\s+([A-Za-z_]\w*)\s*=\s*(?:VoltSignal|Signal)\.new/g,
        Resolve: function () {
            return { Kind: "instance", ClassName: "VoltSignal" };
        }
    },
    {
        Expression: /\blocal\s+([A-Za-z_]\w*)\s*=\s*LuaStateProxy\.new/g,
        Resolve: function () {
            return { Kind: "instance", ClassName: "LuaStateProxy" };
        }
    }
];

function InferBindings(Text) {
    var Bindings = new Map();

    for (var RuleIndex = 0; RuleIndex < BindingRules.length; RuleIndex += 1) {
        var Rule = BindingRules[RuleIndex];

        Rule.Expression.lastIndex = 0;

        var Match = Rule.Expression.exec(Text);

        while (Match) {
            var Name = Match[1];

            if (Name) {
                Bindings.set(Name, Rule.Resolve(Match));
            }

            Match = Rule.Expression.exec(Text);
        }
    }

    return Bindings;
}

exports.InferBindings = InferBindings;
