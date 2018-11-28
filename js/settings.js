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


