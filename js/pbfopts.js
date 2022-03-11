var activityColorLegend = {
    "": "lightgray",
    "Unknown": "#d3d3d3", // "lightgray"
    "Stationary": "#ee82ee", // "blueviolet",
    "Walking": "#1e90ff", // "dodgerblue",
    // "Running": "#90ee90", // "lightgreen",
    "Running": "#4dd74d", // "lightgreen",
    "Bike": "#ffd700", // "gold",
    "Automotive": "#ff4500", // "orangered",
    "Fly": "#00fa9a", // "mediumspringgreen",
};

// ct.getActivityLegendElementFn = function() {
//     const keys = Object.keys(activityColorLegend)
//     const el = $('<ul>')
//     for (let i = 0; i < keys.length; i++) {
//         const key = keys[i]
//         el.append($('<li>').)
//     }
// }

var nnn = 0;
var ps = null;
ct.activityFn = function(props, z, layer) {
    if (nnn === 0) {
        cd("props", props);
        nnn++;
        ps = props;
    }
    // if (!props.Accuracy || props.Accuracy !== 5) {
    //     return {};
    // }
    if (!ct.settingsFilter(props, z, layer)) {
        return {};
    }
    view.sps++;
    var c = activityColorLegend[props["Activity"]];
    if (props.Speed > 80 || props.Elevation > 4000) {
        c = activityColorLegend["Fly"];
    }
    var pp = props.point_count ^ (1 / 2);
    if (c === "lightgray" || typeof c === "undefined") {
        return {
            stroke: false,
            fill: true,
            fillColor: "black",
            // radius: pp > 1 ? pp : 1,
            radius: 1.5,
            type: "Point"
        };
        //     return {};
    }
    return {
        stroke: false,
        fill: true,
        fillColor: c || "lightgray",
        fillOpacity: c !== "lightgray" ? 0.9 : 0.1,
        radius: 1.5,
        // radius: pp > 1 ? pp : 1,
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
    var opacity = 0.15;
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
        opacity = 0.45;
        shade = 0.2;
    } else if (diff <= oneDay * 30) {
        opacity = 0.33;
        shade = 0.5;
    } else if (diff <= oneDay * 150) {
        opacity = 0.25;
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
    view.sps++;
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
    view.sps++;
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
    // b = 0;

    b = g;
    g = 0;

    return "rgb(" + r + "," + g + "," + b + ")";
}

// -ag or --calculate-feature-density: Add a new attribute, tippecanoe_feature_density, to each feature, to record how densely features are spaced in that area of the tile. You can use this attribute in the style to produce a glowing effect where points are densely packed. It can range from 0 in the sparsest areas to 255 in the densest.
var maxDensity = 62; //255;
var maxRadius = 8;

var zRangeMin = 3;
var zRangeMax = 19;
var zRangeDiff = zRangeMax - zRangeMin;

// At lower (farther out) zooms, we should "desensitize" scaling since most points will be "clustered" in higher numbers,
// whereas at higher (closer) zooms, we should adjust tolerance to be more centered around lower feature_density values.
function getRelDensity(zoom, n) {
    var stepSize = maxDensity / zRangeDiff; // 255 / 17 = 15
    var stepN = zoom - 1;
    var lower = maxDensity - (stepN * stepSize);
    if (n < lower) {
        n = lower;
    }
    var mldiff = maxDensity - lower;
    var rel = n - lower;
    var relDensity = rel / mldiff;
    return relDensity;
}

var
    tippeFeatureDensitySamples = [],
    tfdSum = 0,
    tfdMax = 0,
    tfdMin = 0,
    tfdAvg = 0,

    tippePointCountSamples = [],
    pcSum = 0,
    pcMax = 0,
    pcMin = 0,
    pcAvg = 0,

    ns = [],
    nSum = 0,
    nMax = 0,
    nMin = 0,
    nAvg = 0,

    noClus = 0;

var minPC = 1000,
    maxPC = 5000, // 10000 // 59534, // 172, //351, // 172, //9,
    rangePC = maxPC - minPC;

var minTFD = 0,
    maxTFD = 0, // 62,
    rangeTFD = maxTFD - minTFD;

ct.densityFn = function(properties, zoom, layer) {

    // Set a defaulty value for point_count if the annotation is falsey.
    properties.point_count = properties.point_count || minPC;

    // Set up a generic 'n' value as a composite of point count feature density.
    //
    var n = properties.point_count > properties.tippecanoe_feature_density
        ? ((properties.point_count - minPC) / rangePC) // represent the point count as a ratio of the overall point-count-range
        : ((properties.tippecanoe_feature_density - minTFD) / rangeTFD); // or do the same for feature density

    if (nnn % 1000 === 0) {
        if (properties.clustered) {
            tippePointCountSamples.push(properties.point_count);
            pcSum += properties.point_count;
            pcAvg = pcSum / tippePointCountSamples.length;
            pcMax = Math.max.apply(Math, tippePointCountSamples);
            pcMin = Math.min.apply(Math, tippePointCountSamples);
            pcMin = Math.min.apply(Math, tippePointCountSamples);
        } else {
            noClus++;
        }

        ns.push(n);
        nSum += n;
        nAvg = nSum / ns.length;
        nMax = Math.max.apply(Math, ns);
        nMin = Math.min.apply(Math, ns);
        nMin = Math.min.apply(Math, ns);

        tippeFeatureDensitySamples.push(properties.tippecanoe_feature_density);
        tfdSum += properties.tippecanoe_feature_density;
        tfdAvg = tfdSum / tippeFeatureDensitySamples.length;
        tfdMax = Math.max.apply(Math, tippeFeatureDensitySamples);
        tfdMin = Math.min.apply(Math, tippeFeatureDensitySamples);
        tfdMin = Math.min.apply(Math, tippeFeatureDensitySamples);

        // cd("1/1000", nnn, "n=", n, properties);
        //
        // cd(
        //     "n.len=", ns.length,
        //     "n.avg=", nAvg,
        //     "n.min=", nMin,
        //     "n.max=", nMax,
        // );
        //
        // cd(
        //     "tfd.len=", tippeFeatureDensitySamples.length,
        //     "tfd.avg=", tfdAvg,
        //     "tfd.min=", tfdMin,
        //     "tfd.max=", tfdMax,
        // );
        //
        // cd(
        //     "noclus(==nopc).ln=", noClus,
        //     "pc.len=", tippePointCountSamples.length,
        //     "pc.avg=", pcAvg,
        //     "pc.min=", pcMin,
        //     "pc.max=", pcMax,
        // );
        // cd("z", view.mapState.getMap().getZoom());

    }

    if (properties.Visit && properties.Visit !== "") {
        cd("visit", properties.Visit);
    }
    nnn++;

    if (!ct.settingsFilter(properties, zoom, layer)) {
        return {};
    }

    var fillColor = function(p) {
        return percentToRGB((p) * 100);
    };
    var fillOpacity = function(p) {
        var o = 1- (1/p.toFixed(2));
        return o > 0.2 ? o : 0.2;
    };
    var radius = function(p) {
        p = (p > 1 ? 1 : p);
        var r = (maxRadius * p);
        return r > 1 ? r : 1;
    };

    view.sps++;

    // oldskool
    var out = {
        type: "Point",
        stroke: false,
        fill: true,
        fillColor: fillColor(n),
        fillOpacity: fillOpacity(n),
        radius: radius(n)
    };

    // if (!properties.clustered) {
    //     return {
    //         stroke: false,
    //         fill: true,
    //         fillColor: "black", // "#FF10DE", // colors[properties.Name], // "#00A2EB", "#EB2900"
    //         weight: 0,
    //         radius: 1,
    //         opacity: 0.05
    //     };
    // }

    // // var relAbsoluteDensity = (properties.tippecanoe_feature_density/maxDensity); // maxDensity is max
    // var relAbsoluteDensity = (properties.tippecanoe_feature_density / (maxDensity * (zRangeMin / zoom))); // scale max density by zoom linearly
    // var relAbsoluteDensityPercent = Math.floor(relAbsoluteDensity * 100);

    // var out = {
    //     stroke: false,
    //     fill: true,

    //     fillColor: function() {
    //         var factor = properties.sqrt_point_count;
    //         factor = factor * (zoom / zRangeMax) * 5;
    //         if (zoom <= 8 && zoom > 5) {
    //             factor = factor * (zoom / zRangeDiff);
    //         }
    //         if (zoom <= 5) {
    //             factor = properties.point_count * (zoom / zRangeDiff); // / (zoom/(zoom+1-zRangeMin));
    //         }
    //         var n = percentToRGB(relAbsoluteDensityPercent * factor); // densityColor(properties.tippecanoe_feature_density),
    //         return n;
    //     }(),

    //     fillOpacity: 0.05 * (zoom / zRangeDiff), // (properties.points_count*0.55)/100, // 0.1, //relAbsoluteDensity//0.10 ,
    //     radius: function() {
    //         var n = 0;
    //         if (zoom > 14) {
    //             n = Math.floor(relAbsoluteDensity * (properties.point_count) * maxRadius);
    //         } else {
    //             n = Math.floor(relAbsoluteDensity * (properties.point_count) * maxRadius);
    //         }


    //         if (n > maxRadius) {
    //             n = maxRadius;
    //             if (zoom < 5) {
    //                 n = zRangeMin / 4 * n;
    //             }
    //         } else if (n < 1) {
    //             n = Math.floor(relAbsoluteDensity * (properties.point_count + (zoom / zRangeDiff)) * maxRadius);
    //         }
    //         return n;
    //     }(), // ~max 100 from maxDensity actual max // +1 ??
    //     // radius: Math.floor(relDPercent*maxRadius), // ~max 100 from maxDensity actual max // +1 ??
    //     type: "Point"
    // };

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
