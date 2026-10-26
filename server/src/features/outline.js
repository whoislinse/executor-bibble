var Protocol = require("vscode-languageserver/node");

var DeclarationPatterns = [
    { Expression: /^\s*local\s+function\s+([A-Za-z_][\w.:]*)\s*\(([^)]*)\)/gm, Group: 1, Detail: 2 },
    { Expression: /^\s*function\s+([A-Za-z_][\w.:]*)\s*\(([^)]*)\)/gm, Group: 1, Detail: 2 },
    { Expression: /^\s*local\s+([A-Za-z_]\w*)\s*=\s*function\s*\(([^)]*)\)/gm, Group: 1, Detail: 2 }
];

function OutlineOf(Document) {
    var Text = Document.getText();
    var Outline = [];

    for (var PatternIndex = 0; PatternIndex < DeclarationPatterns.length; PatternIndex += 1) {
        var Pattern = DeclarationPatterns[PatternIndex];

        Pattern.Expression.lastIndex = 0;

        var Match = Pattern.Expression.exec(Text);

        while (Match) {
            var Name = Match[Pattern.Group];
            var Detail = Match[Pattern.Detail];

            if (Name) {
                var Start = Document.positionAt(Match.index);
                var End = Document.positionAt(Match.index + Match[0].length);
                var NameStart = Document.positionAt(Match.index + Match[0].indexOf(Name));

                Outline.push({
                    name: Name,
                    detail: Detail === undefined || Detail.length === 0 ? undefined : "(" + Detail + ")",
                    kind: Protocol.SymbolKind.Function,
                    range: { start: Start, end: End },
                    selectionRange: {
                        start: NameStart,
                        end: { line: NameStart.line, character: NameStart.character + Name.length }
                    }
                });
            }

            Match = Pattern.Expression.exec(Text);
        }
    }

    return Outline.sort(function (Left, Right) {
        return Left.range.start.line - Right.range.start.line || Left.range.start.character - Right.range.start.character;
    });
}

exports.OutlineOf = OutlineOf;
