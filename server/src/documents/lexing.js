var QualifiedToken = /[\w.:]/;
var MemberAccessPattern = /([A-Za-z_][\w.]*)\s*([.:])\s*\w*$/;
var CalleePattern = /[A-Za-z_][\w.:]*$/;

var Openers = { "(": true, "[": true, "{": true };
var Closers = { ")": true, "]": true, "}": true };

function TokenAround(Text, Offset) {
    var Start = Offset;
    var End = Offset;

    while (Start > 0 && QualifiedToken.test(Text.charAt(Start - 1))) {
        Start -= 1;
    }

    while (End < Text.length && QualifiedToken.test(Text.charAt(End))) {
        End += 1;
    }

    var Token = Text.slice(Start, End);

    return /[\w]/.test(Token) ? { Token: Token, Start: Start, End: End } : null;
}

function MemberAccessBefore(Text, Offset) {
    var Match = Text.slice(0, Offset).match(MemberAccessPattern);

    if (!Match) {
        return null;
    }

    var Receiver = Match[1];
    var Separator = Match[2];

    if (Receiver === undefined || Separator === undefined) {
        return null;
    }

    return { Receiver: Receiver, Separator: Separator };
}

function SkipStringBackward(Text, Quote) {
    var Cursor = Quote - 1;

    while (Cursor >= 0) {
        if (Text.charAt(Cursor) === Text.charAt(Quote) && Text.charAt(Cursor - 1) !== "\\") {
            return Cursor - 1;
        }

        Cursor -= 1;
    }

    return -1;
}

function SkipStringForward(Text, Quote, Limit) {
    var Cursor = Quote + 1;

    while (Cursor < Limit) {
        if (Text.charAt(Cursor) === Text.charAt(Quote) && Text.charAt(Cursor - 1) !== "\\") {
            return Cursor + 1;
        }

        Cursor += 1;
    }

    return Cursor;
}

function CountTopLevelSeparators(Text, From, To) {
    var Depth = 0;
    var Separators = 0;
    var Cursor = From;

    while (Cursor < To) {
        var Character = Text.charAt(Cursor);

        if (Character === "\"" || Character === "'" || Character === "`") {
            Cursor = SkipStringForward(Text, Cursor, To);
            continue;
        }

        if (Openers[Character]) {
            Depth += 1;
        } else if (Closers[Character]) {
            Depth -= 1;
        } else if (Character === "," && Depth === 0) {
            Separators += 1;
        }

        Cursor += 1;
    }

    return Separators;
}

function EnclosingCall(Text, Offset) {
    var Depth = 0;
    var Cursor = Offset - 1;
    var OpenParen = -1;

    while (Cursor >= 0) {
        var Character = Text.charAt(Cursor);

        if (Character === ")" || Character === "]" || Character === "}") {
            Depth += 1;
        } else if (Character === "(" || Character === "[" || Character === "{") {
            if (Depth === 0 && Character === "(") {
                OpenParen = Cursor;
                break;
            }

            Depth -= 1;
        } else if (Character === "\"" || Character === "'" || Character === "`") {
            var Resume = SkipStringBackward(Text, Cursor);

            if (Resume < 0) {
                return null;
            }

            Cursor = Resume;
            continue;
        }

        Cursor -= 1;
    }

    if (OpenParen === -1) {
        return null;
    }

    var CalleeMatch = Text.slice(0, OpenParen).match(CalleePattern);

    if (!CalleeMatch) {
        return null;
    }

    return {
        Callee: CalleeMatch[0],
        ArgumentsStart: OpenParen + 1,
        ActiveParameter: CountTopLevelSeparators(Text, OpenParen + 1, Offset)
    };
}

exports.TokenAround = TokenAround;
exports.MemberAccessBefore = MemberAccessBefore;
exports.EnclosingCall = EnclosingCall;
exports.CountTopLevelSeparators = CountTopLevelSeparators;
