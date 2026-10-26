var Protocol = require("vscode-languageserver/node");

var Source = "executor-bibble";

function EscapeRegExp(Value) {
    return Value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function MemberPattern(Owners) {
    return new RegExp("\\b(" + Owners.map(EscapeRegExp).join("|") + ")\\s*([.:])\\s*([A-Za-z_]\\w*)", "g");
}

function RangeForMember(Document, Match, Member) {
    var Start = Document.positionAt(Match.index + Match[0].lastIndexOf(Member));
    var End = Document.positionAt(Match.index + Match[0].length);

    return { start: Start, end: End };
}

function Warning(Message, Range) {
    return { severity: Protocol.DiagnosticSeverity.Warning, range: Range, message: Message, source: Source };
}

function UnknownNamespaceMember(Input) {
    var Owners = Input.Index.Namespaces();

    if (Owners.length === 0) {
        return [];
    }

    var Findings = [];
    var Pattern = MemberPattern(Owners);
    var Text = Input.Document.getText();

    var Match = Pattern.exec(Text);

    while (Match) {
        var Owner = Match[1];
        var Separator = Match[2];
        var Member = Match[3];

        if (Owner && Separator && Member) {
            var Known = Input.Index.Members(Owner, Separator === ":" ? ":" : ".").some(function (Symbol) {
                return Symbol.Name === Member;
            });

            if (!Known) {
                Findings.push(Warning(
                    Member + " is not a documented member of " + Owner + ".",
                    RangeForMember(Input.Document, Match, Member)
                ));
            }
        }

        Match = Pattern.exec(Text);
    }

    return Findings;
}

function UnknownBindingMember(Input) {
    if (Input.Bindings.size === 0) {
        return [];
    }

    var Findings = [];
    var Pattern = MemberPattern(Array.from(Input.Bindings.keys()));
    var Text = Input.Document.getText();

    var Match = Pattern.exec(Text);

    while (Match) {
        var Name = Match[1];
        var Separator = Match[2];
        var Member = Match[3];
        var Binding = Name ? Input.Bindings.get(Name) : undefined;

        if (Binding && Separator && Member) {
            var Known = Input.Index.Binding(Binding, Separator === ":" ? ":" : ".").some(function (Symbol) {
                return Symbol.Name === Member;
            });

            if (!Known) {
                Findings.push(Warning(
                    Member + " is not a documented " + (Separator === ":" ? "method" : "property") + " of " + Name + ".",
                    RangeForMember(Input.Document, Match, Member)
                ));
            }
        }

        Match = Pattern.exec(Text);
    }

    return Findings;
}

var DiagnosticRules = [UnknownNamespaceMember, UnknownBindingMember];

function Analyze(Input) {
    return DiagnosticRules.reduce(function (Findings, Rule) {
        return Findings.concat(Rule(Input));
    }, []);
}

exports.DiagnosticRules = DiagnosticRules;
exports.Analyze = Analyze;
