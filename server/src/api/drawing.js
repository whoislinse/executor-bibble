var DrawingTypes = {
    Line: ["From: Vector2", "To: Vector2", "Thickness: number"],
    Circle: ["Position: Vector2", "Radius: number", "NumSides: number", "Thickness: number", "Filled: boolean"],
    Square: ["Position: Vector2", "Size: Vector2", "Thickness: number", "Filled: boolean"],
    Triangle: ["PointA: Vector2", "PointB: Vector2", "PointC: Vector2", "Thickness: number", "Filled: boolean"],
    Quad: ["PointA: Vector2", "PointB: Vector2", "PointC: Vector2", "PointD: Vector2", "Thickness: number", "Filled: boolean"],
    Text: [
        "Text: string",
        "TextBounds: Vector2",
        "Font: number",
        "Size: number",
        "Position: Vector2",
        "Center: boolean",
        "Centered: boolean",
        "Outline: boolean",
        "Outlined: boolean",
        "OutlineColor: Color3",
        "OutlineOpacity: number"
    ],
    Image: ["Data: string", "Size: Vector2", "Position: Vector2", "Rounding: number", "Loaded: boolean"]
};

var DrawingSharedProperties = ["Visible: boolean", "ZIndex: number", "Transparency: number", "Color: Color3", "__OBJECT_EXISTS: boolean"];

var DrawingMethods = ["Remove()", "Destroy()"];

var DrawingFonts = {
    UI: 0,
    System: 1,
    Plex: 2,
    Monospace: 3
};

function DrawingPropertiesOf(Type) {
    var Own = DrawingTypes[Type] || [];

    return Own.concat(DrawingSharedProperties);
}

exports.DrawingTypes = DrawingTypes;
exports.DrawingSharedProperties = DrawingSharedProperties;
exports.DrawingMethods = DrawingMethods;
exports.DrawingFonts = DrawingFonts;
exports.DrawingPropertiesOf = DrawingPropertiesOf;
