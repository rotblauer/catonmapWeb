const latestiOSVersion = "V.VersionV2";
var trackHost = "https://bigger.space?reset=true&url=catonmap.info:3001";
var tileHost =  "https://bigger.space?reset=true&url=catonmap.info:8080";
// var tileHost =  "http://localhost:8081";

var baseTileLayerOpts = {
    rendererFactory: L.canvas.tile,
    // vectorTileLayerStyles: {},
    getFeatureId: function(f) {
        return f.properties.name + f.properties.Time;
    }
    , interactive: true
};

var bootstrapCSSLinks = {
    // "light": "https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css",
    // /vendor/bootstrap-4.0.0-alpha.6-dist/css/bootstrap.min.css
    "light": "/vendor/bootstrap-4.0.0-alpha.6-dist/css/bootstrap.min.css",
    "dark": "/css/bootstrap.min.css",
};


