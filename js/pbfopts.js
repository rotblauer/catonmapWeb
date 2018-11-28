var activityColorLegend = {
    "": "lightgray",
    "Unknown": "lightgray",
    "Stationary": "blueviolet",
    "Walking": "dodgerblue",
    "Running": "lightgreen",
    "Bike": "gold",
    "Automotive": "orangered",
    "Fly": "mediumspringgreen"
};

var nnn = 0;
ct.activityFn = function(props, z, layer) {
    if (nnn === 0) {
        // cd("props", props);
        // nnn++;
    }
    if (!ct.settingsFilter(props, z, layer)) {
        return {};
    }
    var c = activityColorLegend[props["Activity"]];
    if ( props.Speed > 80 || props.Elevation > 4000 ) {
        c = activityColorLegend["Fly"];
    }
    if (c === "lightgray") {
        return {};
    }
    return {
        stroke: false,
        fill: true,
        fillColor: c || "lightgray",
        fillOpacity: c !== "lightgray" ? 0.9 : 0.1,
        radius: 2,
        type: "Point"
    };
};

var now = new Date().getTime();
var oldest = new Date("2012-03-24T15:01:44Z").getTime();

var oneDay = 1000 * 60 * 60 * 24;

// var maxDateDiff = now - oneWeek; // diff in millis

var recencyScale = function(props, color) {
    var dateString = props.Time;
    var density = props.tippecanoe_feature_density;
    if (density === 0) {
        density = 1;
    }
    var then = new Date(dateString).getTime();
    var diff = now - then;
    //Fit[{1,3,7,14,30,150,2000},{0.99,0.8,0.6,0.3,0.15,0.09,0},x]

    // opacity
    // day, 3 days, week, fortnight, month, sixmonth, year
    // 1,   0.8     0.6   0.4        0.2    0.1       0.05
    // radius
    // day, 3 days, week, fortnight, month, sixmonth, year
    // 2    3       4      5         6      7         9
    var opacity = 0.05;
    const radius = 2;
    var shade = 0.8;

    if (diff <= oneDay) {
        opacity = 0.9;
        shade = -0.5;
    } else if (diff <= oneDay * 3) {
        opacity = 0.8;
        shade = -0.2;
    } else if (diff <= oneDay * 7) {
        opacity = 0.6;
        shade = -0.1;
    } else if (diff <= oneDay * 14) {
        opacity = 0.3;
        shade = 0.2;
    } else if (diff <= oneDay * 30) {
        opacity = 0.15;
        shade = 0.5;
    } else if (diff <= oneDay * 150) {
        opacity = 0.09;
        shade = 0.7;
    }

    return {
        opacity: opacity, //opacity / 3,
        radius: radius,
        color: shadeRGBColor(color, shade)
    };
};

function invert(rgb) {
    rgb = Array.prototype.join.call(arguments).match(/(-?[0-9\.]+)/g);
    for (var i = 0; i < rgb.length; i++) {
        rgb[i] = (i === 3 ? 1 : 255) - rgb[i];
    }
    return rgb;
}

var n = 0;
ct.recencyFn = function(properties, zoom, layer) {
    if (!ct.settingsFilter(properties, zoom, layer)) {
        return {};
    }
    var color2 = catColors()[properties.Name] || "rgb(241,66,244)";
    var time = new Date(properties.Time).getTime();

    var out = {
        stroke: false,
        fill: true,
        fillColor: recencyScale(properties, color2).color,
        fillOpacity: recencyScale(properties, color2).opacity,
        radius: recencyScale(properties, color2).radius,
        type: "Point"
    };
    return out;
};

ct.speedFn = function(properties, zoom, layer) {
    if (!ct.settingsFilter(properties, zoom, layer)) {
        return {};
    }
    var color2 = catColors()[properties.Name] || "rgb(241,66,244)";

    var maxNormalPossibleSpeed = 15; // m/s, no rockets allowed
    return {
        stroke: false,
        fill: true,
        fillColor: shadeRGBColor(color2, ((properties.Speed / maxNormalPossibleSpeed) % 1.0) / 2),
        fillOpacity: 0.1,
        radius: radiusFromSpeed(properties.Speed, zoom),
        type: "Point"
    };
};

// Elevation: -0.00240357150323689
// Name: "Bigger Papa"
// Speed: 0.6299999952316284
// Time: "2018-02-09T13:37:54.947Z"
// clustered: true
// point_count: 3
// sqrt_point_count: 1.73
// tippecanoe_feature_density: 8
//
function densityColor(density) {
    var r = Math.floor(density * 2),
        g = Math.floor(255 - density),
        b = 0;
    return "rgb(" + r + "," + g + "," + b + ")";
}

// https://stackoverflow.com/questions/340209/generate-colors-between-red-and-green-for-a-power-meter/340214#340214
function percentToRGB(percent) {
    if (percent >= 100) {
        percent = 99
    }
    var r, g, b;
    if (percent < 50) {
        // green to yellow
        r = Math.floor(255 * (percent / 50));
        g = 255;

    } else {
        // yellow to red
        r = 255;
        g = Math.floor(255 * ((50 - percent % 50) / 50));
    }
    b = 0;
    return "rgb(" + r + "," + g + "," + b + ")";
}

// -ag or --calculate-feature-density: Add a new attribute, tippecanoe_feature_density, to each feature, to record how densely features are spaced in that area of the tile. You can use this attribute in the style to produce a glowing effect where points are densely packed. It can range from 0 in the sparsest areas to 255 in the densest.
var maxDensity = 255;
var maxRadius = 10;

var zRangeMin = 3;
var zRangeMax = 18;
var zRangeDiff = zRangeMax - zRangeMin;
// At lower (farther out) zooms, we should "desensitize" scaling since most points will be "clustered" in higher numbers,
// whereas at higher (closer) zooms, we should adjust tolerance to be more centered around lower feature_density values.
function getRelDensity(zoom, n) {
    var stepSize = maxDensity / zRangeDiff; // 255 / 17 = 15
    // var zAdjust = zoom-1-zRangeMin; // zoom = 14-1-3 = 10, 20-1-3 = 16, 3-1-3 = -1
    // var bound = maxDensity - stepSize*zoom;
    // // if zoom == 3  --> 255-15*2 as lower bound, find ratio of feature_density between 221 <-> 255; eg. 238 = 50%
    // max(255)-stepN(34) = lower(221)
    // max(255)-lower(221) = mldiff(34)
    // eg(238)-lower(221)= rel(17)
    // rel(17)/mldiff(34) == .50
    //
    // //                   255 - (stepSize * zoom-1)
    // // if zoom == 19 --> 255-(19-3-1);
    // if (zoom === 3) {
    //     return n -
    // }

    var stepN = zoom - 1;
    // if (zoom === 3) {
    //     stepN = stepN + 1; // 2 * stepSize = 30, 255 - 30 = 225,
    // } else if (zoom === 4) {
    //     stepN = stepN + 2;
    // } else if (zoom === 5) {
    //     stepN = stepN + 3; // 4 * 15 = 60, 255 - 60 = 195,
    // }
    var lower = maxDensity - (stepN * stepSize);
    if (n < lower) {
        n = lower;
    }
    var mldiff = maxDensity - lower;
    var rel = n - lower;
    var relDensity = rel / mldiff;
    return relDensity;
}

ct.densityFn = function(properties, zoom, layer) {
    if (!ct.settingsFilter(properties, zoom, layer)) {
        return {};
    }

    // anything above about zoom 14-15 will not be clustered!...
    if (!properties.clustered) {
        return {
            stroke: false,
            fill: true,
            fillColor: "#FF10DE", // colors[properties.Name], // "#00A2EB", "#EB2900"
            weight: 0,
            radius: 1,
            opacity: 0.05
        };
    }

    // var relAbsoluteDensity = (properties.tippecanoe_feature_density/maxDensity); // maxDensity is max
    var relAbsoluteDensity = (properties.tippecanoe_feature_density / (maxDensity * (zRangeMin / zoom))); // scale max density by zoom linearly
    var relAbsoluteDensityPercent = Math.floor(relAbsoluteDensity * 100);

    // var relD = getRelDensity(zoom, properties.tippecanoe_feature_density);
    // var relDPercent = Math.floor(relD*100);

    var out = {
        stroke: false,
        fill: true,
        fillColor: function() {
            var factor = properties.sqrt_point_count;
            factor = factor * (zoom / zRangeMax) * 2;
            if (zoom <= 8 && zoom > 5) {
                factor = factor * (zoom / zRangeDiff);
            }
            if (zoom <= 5) {
                factor = properties.point_count * (zoom / zRangeDiff); // / (zoom/(zoom+1-zRangeMin));
            }
            var n = percentToRGB(relAbsoluteDensityPercent * factor); // densityColor(properties.tippecanoe_feature_density),
            return n;
        }(),
        // fillColor: percentToRGB(relDPercent), // densityColor(properties.tippecanoe_feature_density),
        // fillOpacity: 0.05, // (properties.points_count*0.55)/100, // 0.1, //relAbsoluteDensity//0.10 ,
        fillOpacity: 0.05 * (zoom / zRangeDiff), // (properties.points_count*0.55)/100, // 0.1, //relAbsoluteDensity//0.10 ,
        radius: function() {
            var n = 0;
            if (zoom > 14) {
                n = Math.floor(relAbsoluteDensity * (properties.point_count) * maxRadius);
            } else {
                n = Math.floor(relAbsoluteDensity * (properties.point_count) * maxRadius);
            }


            if (n > maxRadius) {
                n = maxRadius;
                if (zoom < 5) {
                    n = zRangeMin / 4 * n;
                }
            } else if (n < 1) {
                n = Math.floor(relAbsoluteDensity * (properties.point_count + (zoom / zRangeDiff)) * maxRadius);
            }
            return n;
        }(), // ~max 100 from maxDensity actual max // +1 ??
        // radius: Math.floor(relDPercent*maxRadius), // ~max 100 from maxDensity actual max // +1 ??
        type: "Point"
    };

    return out;
};

var vectorTileLayerStyles = {
    "speed": {
        'catTrack': ct.speedFn,
        'catTrackEdge': ct.speedFn
    },
    "recent": {
        'catTrack': ct.recencyFn,
        'catTrackEdge': ct.recencyFn
    },
    "activity": {
        'catTrack': ct.activityFn,
        'catTrackEdge': ct.activityFn
    },
    "density": {
        'catTrack': ct.densityFn,
        'catTrackEdge': ct.densityFn
    }
};

ct.baseTilesLayerOptsF = function(name) {
    var b = Object.create(baseTileLayerOpts);
    b["vectorTileLayerStyles"] = vectorTileLayerStyles[name];
    return b;
};

