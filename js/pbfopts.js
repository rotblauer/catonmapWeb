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
controller.activityFn = function (props, z, layer) {

    const pointdefault = {
        type: "Point",
        stroke: true,
        weight: 1,
        color: "black",
        fill: true,
        fillColor: "black",
        fillOpacity: 1,
        radius: 1
    }

    // if (nnn === 0) {
    //     cd("props", props);
    //     nnn++;
    //     ps = props;
    // }
    // if (!props.Accuracy || props.Accuracy !== 5) {
    //     return {};
    // }
    // if (!controller.settingsFilter(props, z, layer)) {
    //     return {};
    // }
    // view.sps++;
    if (typeof props.Activity === "undefined") {
        return pointdefault;
    }
    var color = activityColorLegend[props["Activity"]];
    if (props.Speed > 80 || props.Elevation > 4000) {
        color = activityColorLegend["Fly"];
    }
    var pp = props.point_count ^ (1 / 2);
    if (color === pointdefault.fillColor || typeof color === "undefined") {
        return pointdefault;
        //     return {};
    }
    return {
        stroke: pointdefault.stroke,
        weight: pointdefault.weight,
        color: color || pointdefault.color,
        fill: pointdefault.fill,
        fillColor: color || pointdefault.fillColor,
        fillOpacity: 1, // color !== pointdefault.fillColor ? 0.9 : 0.8,
        radius: pointdefault.radius,
        // radius: pp > 1 ? pp : 1,
        type: pointdefault.type
    };
};

var now = new Date().getTime();
var oldest = new Date("2012-03-24T15:01:44Z").getTime();

var oneDay = 1000 * 60 * 60 * 24;

// var maxDateDiff = now - oneWeek; // diff in millis

var recencyScale = function (props, color) {
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
controller.recencyFn = function (properties, zoom, layer) {
    if (!controller.settingsFilter(properties, zoom, layer)) {
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

controller.speedFn = function (properties, zoom, layer) {
    if (!controller.settingsFilter(properties, zoom, layer)) {
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
var maxRadius = 2;

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

var minPC = 1, // 1000,
    maxPC = 100, // 5000, // 10000 // 59534, // 172, //351, // 172, //9,
    rangePC = maxPC - minPC;

var minTFD = 0,
    maxTFD = 0, // 62,
    rangeTFD = maxTFD - minTFD;

controller.densityFn = function (properties, zoom, layer) {

    const mapZoom = view.mapState.getMap().getZoom();
    maxPC = 100 * Math.sqrt(mapZoom)
    if (mapZoom >= 15) maxPC /= 4
    if (mapZoom >= 17) maxPC /= 3
    rangePC = maxPC - minPC

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

    if (!controller.settingsFilter(properties, zoom, layer)) {
        return {};
    }

    var fillColor = function (p) {
        return percentToRGB((p) * 100);
    };
    var fillOpacity = function (p) {
        var o = 1 - (1 / p.toFixed(2));
        return o > 0.2 ? o : 0.2;
    };
    var radius = function (p) {
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

let nnnn = 0;
controller.basicFn = function (properties, zoom, layer) {
    if (nnnn < 3) {
        cd("basic props", properties);
        nnnn++;
    }
    return {
        type: "Point",
        stroke: true,
        color: catColors()[properties.Name] || catColors()[properties.UUID] || "black", // "black",
        weight: 0.5,

        fill: true,
        fillColor: catColors()[properties.Name] || catColors()[properties.UUID] || "black", // "black",
        fillOpacity: 0.5,

        radius: 1,
    }
};

controller.basicFnForCat = function (color) {
    return function (properties, zoom, layer) {

        // hide the big outliers
        if (properties.Accuracy > 100) {
            return {};
        }
        return {
            type: "Point",
            stroke: true,
            color: color,
            weight: 0.3,

            fill: true,
            fillColor: color,
            fillOpacity: 0.2,

            radius: 1,
        };
    };
}


var vectorTileLayerStyles = {
    "speed": {
        'catTrack': controller.speedFn,
        'catTrackEdge': controller.speedFn
    },
    "recent": {
        'catTrack': controller.recencyFn,
        'catTrackEdge': controller.recencyFn
    },
    "activity": {
        'catTrack': controller.activityFn,
        'catTrackEdge': controller.activityFn,
        "pickme": controller.activityFn,

        "ia.level-23": controller.activityFn,
        "rye.level-23": controller.activityFn,

        "ia.level-23.json.gz-layer": controller.activityFn,
        "rye.level-23.json.gz-layer": controller.activityFn,

        // // 2017
        // "2017-01.json.gz-layer": controller.activityFn,
        // "2017-02.json.gz-layer": controller.activityFn,
        // "2017-03.json.gz-layer": controller.activityFn,
        // "2017-04.json.gz-layer": controller.activityFn,
        // "2017-05.json.gz-layer": controller.activityFn,
        // "2017-06.json.gz-layer": controller.activityFn,
        // "2017-07.json.gz-layer": controller.activityFn,
        // "2017-08.json.gz-layer": controller.activityFn,
        // "2017-09.json.gz-layer": controller.activityFn,
        // "2017-10.json.gz-layer": controller.activityFn,
        // "2017-11.json.gz-layer": controller.activityFn,
        // "2017-12.json.gz-layer": controller.activityFn,
        // // 2018
        // "2018-01.json.gz-layer": controller.activityFn,
        // "2018-02.json.gz-layer": controller.activityFn,
        // "2018-03.json.gz-layer": controller.activityFn,
        // "2018-04.json.gz-layer": controller.activityFn,
        // "2018-05.json.gz-layer": controller.activityFn,
        // "2018-06.json.gz-layer": controller.activityFn,
        // "2018-07.json.gz-layer": controller.activityFn,
        // "2018-08.json.gz-layer": controller.activityFn,
        // "2018-09.json.gz-layer": controller.activityFn,
        // "2018-10.json.gz-layer": controller.activityFn,
        // "2018-11.json.gz-layer": controller.activityFn,
        // "2018-12.json.gz-layer": controller.activityFn,
        // // 2019
        // "2019-01.json.gz-layer": controller.activityFn,
        // "2019-02.json.gz-layer": controller.activityFn,
        // "2019-03.json.gz-layer": controller.activityFn,
        // "2019-04.json.gz-layer": controller.activityFn,
        // "2019-05.json.gz-layer": controller.activityFn,
        // "2019-06.json.gz-layer": controller.activityFn,
        // "2019-07.json.gz-layer": controller.activityFn,
        // "2019-08.json.gz-layer": controller.activityFn,
        // "2019-09.json.gz-layer": controller.activityFn,
        // "2019-10.json.gz-layer": controller.activityFn,
        // "2019-11.json.gz-layer": controller.activityFn,
        // "2019-12.json.gz-layer": controller.activityFn,
        // // 2020
        // "2020-01.json.gz-layer": controller.activityFn,
        // "2020-02.json.gz-layer": controller.activityFn,
        // "2020-03.json.gz-layer": controller.activityFn,
        // "2020-04.json.gz-layer": controller.activityFn,
        // "2020-05.json.gz-layer": controller.activityFn,
        // "2020-06.json.gz-layer": controller.activityFn,
        // "2020-07.json.gz-layer": controller.activityFn,
        // "2020-08.json.gz-layer": controller.activityFn,
        // "2020-09.json.gz-layer": controller.activityFn,
        // "2020-10.json.gz-layer": controller.activityFn,
        // "2020-11.json.gz-layer": controller.activityFn,
        // "2020-12.json.gz-layer": controller.activityFn,
        // // 2021
        // "2021-01.json.gz-layer": controller.activityFn,
        // "2021-02.json.gz-layer": controller.activityFn,
        // "2021-03.json.gz-layer": controller.activityFn,
        // "2021-04.json.gz-layer": controller.activityFn,
        // "2021-05.json.gz-layer": controller.activityFn,
        // "2021-06.json.gz-layer": controller.activityFn,
        // "2021-07.json.gz-layer": controller.activityFn,
        // "2021-08.json.gz-layer": controller.activityFn,
        // "2021-09.json.gz-layer": controller.activityFn,
        // "2021-10.json.gz-layer": controller.activityFn,
        // "2021-11.json.gz-layer": controller.activityFn,
        // "2021-12.json.gz-layer": controller.activityFn,
    },
    "density": {
        'catTrack': controller.densityFn,
        'catTrackEdge': controller.densityFn,
        "ia.level-23": controller.densityFn,
        "rye.level-23": controller.densityFn,
        "ia.level-23.json.gz-layer": controller.densityFn,
        "rye.level-23.json.gz-layer": controller.densityFn,

    },
    // "basic": {
    //     "catTrack": controller.basicFn,
    //     "catTrackEdge": controller.basicFn,
    // },
    "basic": {
        "catTrack": controller.basicFn,
        "catTrackEdge": controller.basicFn,
        "pickme": controller.basicFn,
        "ia.level-23": controller.basicFnForCat("rgb(255, 0,0)"),
        "rye.level-23": controller.basicFnForCat("rgb(0, 0,255)"),
        "ia.level-23.json.gz-layer": controller.basicFnForCat("rgb(255, 0,0)"),
        "rye.level-23.json.gz-layer": controller.basicFnForCat("rgb(0, 0,255)"),


        // // 2017
        // "2017-01.json.gz-layer": controller.basicFn,
        // "2017-02.json.gz-layer": controller.basicFn,
        // "2017-03.json.gz-layer": controller.basicFn,
        // "2017-04.json.gz-layer": controller.basicFn,
        // "2017-05.json.gz-layer": controller.basicFn,
        // "2017-06.json.gz-layer": controller.basicFn,
        // "2017-07.json.gz-layer": controller.basicFn,
        // "2017-08.json.gz-layer": controller.basicFn,
        // "2017-09.json.gz-layer": controller.basicFn,
        // "2017-10.json.gz-layer": controller.basicFn,
        // "2017-11.json.gz-layer": controller.basicFn,
        // "2017-12.json.gz-layer": controller.basicFn,
        // // 2018
        // "2018-01.json.gz-layer": controller.basicFn,
        // "2018-02.json.gz-layer": controller.basicFn,
        // "2018-03.json.gz-layer": controller.basicFn,
        // "2018-04.json.gz-layer": controller.basicFn,
        // "2018-05.json.gz-layer": controller.basicFn,
        // "2018-06.json.gz-layer": controller.basicFn,
        // "2018-07.json.gz-layer": controller.basicFn,
        // "2018-08.json.gz-layer": controller.basicFn,
        // "2018-09.json.gz-layer": controller.basicFn,
        // "2018-10.json.gz-layer": controller.basicFn,
        // "2018-11.json.gz-layer": controller.basicFn,
        // "2018-12.json.gz-layer": controller.basicFn,
        // // 2019
        // "2019-01.json.gz-layer": controller.basicFn,
        // "2019-02.json.gz-layer": controller.basicFn,
        // "2019-03.json.gz-layer": controller.basicFn,
        // "2019-04.json.gz-layer": controller.basicFn,
        // "2019-05.json.gz-layer": controller.basicFn,
        // "2019-06.json.gz-layer": controller.basicFn,
        // "2019-07.json.gz-layer": controller.basicFn,
        // "2019-08.json.gz-layer": controller.basicFn,
        // "2019-09.json.gz-layer": controller.basicFn,
        // "2019-10.json.gz-layer": controller.basicFn,
        // "2019-11.json.gz-layer": controller.basicFn,
        // "2019-12.json.gz-layer": controller.basicFn,
        // // 2020
        // "2020-01.json.gz-layer": controller.basicFn,
        // "2020-02.json.gz-layer": controller.basicFn,
        // "2020-03.json.gz-layer": controller.basicFn,
        // "2020-04.json.gz-layer": controller.basicFn,
        // "2020-05.json.gz-layer": controller.basicFn,
        // "2020-06.json.gz-layer": controller.basicFn,
        // "2020-07.json.gz-layer": controller.basicFn,
        // "2020-08.json.gz-layer": controller.basicFn,
        // "2020-09.json.gz-layer": controller.basicFn,
        // "2020-10.json.gz-layer": controller.basicFn,
        // "2020-11.json.gz-layer": controller.basicFn,
        // "2020-12.json.gz-layer": controller.basicFn,
        // // 2021
        // "2021-01.json.gz-layer": controller.basicFn,
        // "2021-02.json.gz-layer": controller.basicFn,
        // "2021-03.json.gz-layer": controller.basicFn,
        // "2021-04.json.gz-layer": controller.basicFn,
        // "2021-05.json.gz-layer": controller.basicFn,
        // "2021-06.json.gz-layer": controller.basicFn,
        // "2021-07.json.gz-layer": controller.basicFn,
        // "2021-08.json.gz-layer": controller.basicFn,
        // "2021-09.json.gz-layer": controller.basicFn,
        // "2021-10.json.gz-layer": controller.basicFn,
        // "2021-11.json.gz-layer": controller.basicFn,
        // "2021-12.json.gz-layer": controller.basicFn,


        // "catTrackEdge": controller.basicFn,
    }
};

// name is [activity, speed, recency, density, basic]
controller.baseTilesLayerOptsF = function (name) {
    // var b = Object.create(baseTileLayerOpts);
    // b["vectorTileLayerStyles"] = vectorTileLayerStyles["pickme"];
    // return b;

    var b = Object.create(baseTileLayerOpts);
    if (typeof vectorTileLayerStyles[name] === "undefined") ce("no vectorTileLayerStyles for " + name);

    b["vectorTileLayerStyles"] = vectorTileLayerStyles[name];
    return b;
};
