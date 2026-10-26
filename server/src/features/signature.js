var Protocol = require("vscode-languageserver/node");
var Present = require("../api/present");
var Lexing = require("../documents/lexing");

function SignatureAt(Query) {
    var Site = Lexing.EnclosingCall(Query.Text, Query.Offset);

    if (!Site) {
        return null;
    }

    var Symbol = Query.Index.Resolve(Site.Callee);
    var Parameters = Symbol && Symbol.Parameters;

    if (!Symbol || !Parameters || Parameters.length === 0) {
        return null;
    }

    return {
        signatures: [
            {
                label: Symbol.Signature,
                parameters: Parameters.map(function (Parameter) {
                    return { label: Present.ParameterLabel(Parameter) };
                })
            }
        ],
        activeSignature: 0,
        activeParameter: Math.min(Site.ActiveParameter, Parameters.length - 1)
    };
}

exports.SignatureAt = SignatureAt;
