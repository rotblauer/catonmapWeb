const latestiOSVersion = "V.VersionV2";
var trackHost = "http://catonmap.info:3001";
var tileHost = "http://catonmap.info:8080";

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
    "light": "/vendor/bootstrap-4.0.0-alpha.6-dist/css/bootstrap.min.css",
    "dark": "/css/bootstrap.min.css",
};


