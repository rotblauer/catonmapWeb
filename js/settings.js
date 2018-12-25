const latestiOSVersion = "V.verify";

// var trackHost = "https://bigger.space?reset=true&url=catonmap.info:3001";
// var trackHost = "https://bigger.space?reset=true&url=track.areteh.co:3001";

// LIVE:
var trackHost = "http://catonmap.info:3001";

// var tileHost =  "https://bigger.space?reset=true&url=catonmap.info:8080";
// var tileHost =  "https://icanhazbounce.com/http://catonmap.info:8080";
// var tileHost =  "https://icanhazbounce.com/" + encodeURIComponent("http://catonmap.info:8080");
// var tileHost =  "https://icanhazbounce.com/" + encodeURI("catonmap.info:8080");

// LIVE:
// var tileHost = "https://icanhazbounce.com?init=1&url=" + encodeURIComponent("http://catonmap.info:8080");

// var tileHost =  "http://catonmap.info:8080";
var tileHost =  "http://localhost:8081";
// var tileHost =  "http://localhost:8082"; // /tdata/ttiles

// var oef = function(feature, layer) {
//     layer.on({
//         // mouseover: highlightFeature,
//         // mouseout: resetHighlight,
//         click: function(a,b,c) {
//             cd(a,b,c);
//         },
//         // pointToLayer: pointToLayer
//     });
// };

// function onEachFeature(feature, layer) {
//     layer.bindPopup(JSON.stringify(feature));
//     cd(feature, layer);
//     // if (feature.properties) { //  feature.properties.popupContent) {
//     //     // layer.bindPopup(feature.properties.popupContent);
//     //     cd(feature, layer);
//     // }
// }

var baseTileLayerOpts = {
    rendererFactory: L.canvas.tile,
    // vectorTileLayerStyles: {},
    getFeatureId: function(f) {
        return f.properties.name + f.properties.Time;
    },
    interactive: true
    // , onEachFeature: oef
    // onclick: function(a, b, c) {
    //     cd("click pt", a, b, c);
    // }
    // onEachFeature: onEachFeature
    // onEachFeature: function(feature, layer) {
    //     if (feature.properties) {
    //         layer.bindPopup(" " +feature.properties.name + " "  + "<br>Affected Bridges : " + feature.properties.Br_Affected + " ");
    //     }
    // }
    // click: function(a,b,c) {
    //     cd("abc", a, b,c);
    // }
};

var bootstrapCSSLinks = {
    // "light": "https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css",
    // /vendor/bootstrap-4.0.0-alpha.6-dist/css/bootstrap.min.css
    "light": "/vendor/bootstrap-4.0.0-alpha.6-dist/css/bootstrap.min.css",
    "dark": "/css/bootstrap.min.css",
};


