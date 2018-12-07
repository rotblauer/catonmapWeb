var ct = ct || {};
var view = view || {};
var model = model || {};

view.sps = 0;

model.lastKnownData = null;
model.visitsData = {};
model.visitsParams = {
    // defacto defaults
    data: {
        googleNearby: true,
        endI: 50,
        stats: true
    },
    set: function(key, val) {
        // use 'null' val to unset key (acts as delete)
        if (val === null) {
            delete this.data[key];
            return this;
        }
        // allow assigning entire object
        if ((typeof key).toLowerCase() === "object") {
            Object.assign(this.data, key);
            return this;
        }
        this.data[key] = val;
        return this;
    },
    get: function() {
        if (!model.visitsOn) {
            cd("visits off");
            return $.ajax();
        } // return empty ajax to keep promise returnable
        // var url = queryURL(trackHost, "/visits2?", this.data);
        // var url = queryURL(trackHost, "/visits2?", this.data);
        // hacky workaround cuz bouncer wants to fuck with the query params for ?url=...
        var url = queryURL(trackHost, "/visits2", this.data);

        cd("GET", url);
        return $.ajax(qJSON(url));
    }
};

URI.fragmentPrefix = "@";

model.state = {};
model.setState = function(k, v) {
    if (typeof k === "Object") {
        window.history.replaceState(k, "catmapN", URI(window.location.href).setFragment(k));
        window.localStorage.setItem("data", JSON.stringify(k));
        return model;
    }

    // window.history.replaceState({}, "catmapN", URI(window.url).setSearch());
    var o = window.history.state || {};
    o[k] = v;
    window.history.replaceState(o, "catmapN", URI(window.location.href).setFragment(k, v));
    window.localStorage.setItem("data", JSON.stringify(o));
    return model;
};

model.getState = function() {

    var uri = URI(window.location.href).fragment(true);

    var his = window.history;

    var ls = {};
    try {
        var d = window.localStorage.getItem("data");
        if (d !== "" && objExists(d)) {
            ls = JSON.parse(d);
        }
    } catch (err) {}

    var s = {};
    Object.assign(s, ls);
    Object.assign(s, his);
    Object.assign(s, uri);

    return {
        zoom: s["zoom"] || 12,
        lat: s["lat"] || 38.613651383524335, // 32,
        lng: s["lng"] || -90.25388717651369,
        baseLayer: s["baseLayer"] || "terrain",
        tileLayer: s["tileLayer"] || "activity",
        visits: (( uri["visits"] || his["visits"] || ls["visits"] || "false" ) === "false") ? false : true,
        follow: s["follow"] || "",
        windowStyle: s["window"] || "light"
    };

    // return {
    //     zoom: uri["zoom"] || his["zoom"] || ls["zoom"] || 12,
    //     lat: uri["lat"] || his["lat"] || ls["lat"] || 38.613651383524335, // 32,
    //     lng: uri["lng"] || his["lng"] || ls["lng"] || -90.25388717651369,
    //     baseLayer: uri["baseLayer"] || his["baseLayer"] || ls["baseLayer"] || "terrain",
    //     tileLayer: uri["tileLayer"] || his["tileLayer"] || ls["tileLayer"] || "activity",
    //     visits: (vs === "false") ? false : true,
    //     follow: uri["follow"] || his["follow"] || ls["follow"] || "",
    //     windowStyle: uri["window"] || uri["window"] || uri["window"] || "light"
    // };

};

model.getMetadata = function() {
    var url = queryURL(trackHost, "/metadata");
    cd("GET", url);
    return $.ajax(qJSON(url));
};

model.doneMetadata = function(data) {
    cd("got metadata", data);
    var m = moment();
    var content = `<small class="metadataservercontent">+${numberWithCommas( data.KeyN )} points in last ${moment(data.KeyNUpdated).fromNow(true).replace("a ", "").replace("an ","")}.<br>TileDB last updated: ${moment(data.TileDBLastUpdated).fromNow()}.<br>Status refreshed ${moment().format(" HH:mm:ss")}.</small>`;
    // cd("content", content);
    var zin = $(".leaflet-top").first();
    view.$metadataDisplay.children(".metadataservercontent").first().remove();
    view.$metadataDisplay.append($(content));
    view.$metadataDisplay.show();
    // view.$metadataDisplay.html(content);
};

model.errorMetadata = function(err) {
    ce("metadata err", err);
};

var ago3days = moment().add(-3, "days").unix();
ct.settings = {
    on: false,
    // on: true,
    filter: {
        // "t": function(p, z, l) {
        //     // if (!objExists(p.TimeUnix)) {
        //     //     cd("noexit", p);
        //     // }
        //     return p.UnixTime > ago3days;
        // }
    },
    follow: null
};
ct.settingsFilter = function(props, zoom, layer) {
    if (!ct.settings.hasOwnProperty("on") ||
        !ct.settings["on"] ||
        !ct.settings.hasOwnProperty("filter")) return true; // no filter settings applied, or disabled (on=false)

    for (var k in ct.settings.filter) {
        if (!ct.settings.filter.hasOwnProperty(k)) {
            continue;
        }
        var fn = ct.settings.filter[k];
        if (!fn(props, zoom, layer)) {
            return false;
        }
    }
    return true;
};

ct.setSettingsFilter = function(key, fn) {
    if (objExists(fn)) {
        ct.settings["on"] = true;
        ct.settings["filter"] = ct.settings["filter"] || {};
        ct.settings["filter"][key] = fn;
    } else {
        if (ct.settings.hasOwnProperty("filter")) {
            if (ct.settings.filter.hasOwnProperty(key)) {
                delete ct.settings.filter[key];
            }
            if (Object.keys(ct.settings.filter).length === 0) {
                ct.settings.on = false;
            }
        }
    }
    cd("ct.settings", ct.settings);
};

model.getLocalStore = function(key) {
    if (objExists(ct.browserSupportsLocal) && !ct.browserSupportsLocal) {
        return null;
    }
    var v = window.localStorage.getItem(key);
    if (v === "" || !objExists(v)) return null;
    return v;
};

model.setLocalStore = function(key, val) {
    if (ct.browserSupportsLocal) {
        window.localStorage.setItem(key, val);
    }
};

model.setLastKnown = function(data) {
    var cats = model.parseCatsFromData(data);
    model.lastKnownData = Object.create(dataLastKnown);

    for (var k in cats) {
        if (!cats.hasOwnProperty(k)) continue;
        model.lastKnownData.add(cats[k]);
    }

    cd("lastknown cats", model.lastKnownData);

    return model.lastKnownData;
};

model.parseCatsFromData = function(data) {
    var out = {};
    for (k in data) {
        if (!data.hasOwnProperty(k)) {
            continue;
        }
        var v = data[k];
        var bp = model.buildCat(v).init();
        out[bp.uid()] = bp;
    }
    return out;
};

model.buildCat = function(d) {
    var bp = Object.create(dataLastKnownEntry);
    Object.assign(bp, d);
    return bp;
};

model.getLastKnownCats = function() {
    var url = queryURL(trackHost, "/lastknown", null);
    cl("GET", url);
    return $.ajax(qJSON(url));
};

model.setVisits = function(data) {
    if (typeof data === "string") data = [];
    model.lastGotVisit = moment();
    model.visitsData = {};
    $.each(data.visits, function(i, val) {
        var v = Object.assign(Object.create(visitP), val).init();

        var isLastVisit = false;
        // assign to cat last known visit if after that cat's last known visit
        if (objExists(model.lastKnownData)) {
            var lookup = catColors()[v.uuid];
            var c = model.lastKnownData.get(lookup);
            if (objExists(c)) {
                if (c.lastVisit.exists()) {
                    if (c.lastVisit.reportedTime.isSameOrBefore(v.reportedTime)) {
                        c.lastVisit = v;
                        isLastVisit = true;
                    }
                } else {
                    isLastVisit = true;
                    c.lastVisit = v;
                }
                c.elInit();
            }
        }

        if (!v.isComplete() && !isLastVisit) {
            return;
        }
        model.visitsData[v.id()] = v;
    });
    ct.onVisits(model.visitsData, true);
};

model.appendVisits = function(data) {
    model.lastGotVisit = moment();
    var newVs = {};
    model.visitsData = {};
    $.each(data.visits, function(i, val) {
        var v = Object.assign(Object.create(visitP), val).init();
        if (model.visitsData.hasOwnProperty(v.iid())) {
            return;
        }
        if (!v.isComplete()) {
            return;
        }
        model.visitsData[v.iid()] = v;
        newVs[v.iid()] = v;
    });
    ct.onVisits(newVs, false);
};

model.errVisits = function(err) {
    ce(err);
};

model.doneLastKnownCats = function(data) {
    ct.onLastKnown(model.setLastKnown(data));
};

model.logAndMockInstead = function(err) {
    ce(err);
    ce("WARNING: mocking data instead");
    model.doneLastKnownCats(mockLastknown);
};

ct.dataLoop = function(n) {
    ct.settings.follow = model.getState().follow; // localOrDefault("fc", "");

    model.getMetadata()
        .done(model.doneMetadata)
        .catch(model.errorMetadata);

    model.getLastKnownCats()
        .done(model.doneLastKnownCats)
        .catch(model.logAndMockInstead)
        // visits assigning to cats depends on cats being there
        .then(function() {
            model.visitsParams
                .set("startReportedT", moment().add(-14, "days").format()) // TODO editable
                .set("startArrivalT", moment().add(-500, "years").format())
                // .set("startArrivalT", "")
                // .set("endDepartureT", moment().add(500, "years").format()) // TODO allow last arrival/cat
                .get()
                .done(model.setVisits)
                .catch(model.errVisits);
        });

    // setTimeout(view.mapState.goUpdateEdge, 60*1000);
    view.mapState.setPBFOpt("");
    setTimeout(ct.dataLoop, (n || 90) * 1000);
};

ct.init = (function() {
    setWindowTitle();
    ct.browserSupportsLocal = browserSupportsLocalStorage;
    model.visitsOn = model.getState().visits;
    // var von = model.getState().visits;
    // model.visitsOn = (von === true || von === "true") ? true : false; // localOrDefault("von", "yes");
    // (model.visitsOn) ? view.$visitsCheckbox.val("yes").attr("checked", true): view.$visitsCheckbox.val("no").attr("checked", false);


    view.$visitsCheckbox.attr("checked", model.visitsOn);

    view.mapState.init();

    ct.dataLoop();
});

ct.onLastKnown = function(data) {
    var catsort = data
        .where(function(k, cat) {
            return cat.hasOwnProperty("time") &&
                cat.time !== null &&
                typeof cat.time != "undefined" &&
                moment().add(-30, "days").isBefore(cat.time);
        })
        .arr()
        .sort(function(a, b) {
            if (a.time.isBefore(b.time)) {
                return 1;
            } else if (a.time.isAfter(b.time)) {
                return -1;
            }
            return 0;
        });

    for (var i = 0; i < catsort.length; i++) {
        var entry = catsort[i];
        var existEl = $(`#${entry.elid()}`);
        entry.elInit(view.$lastKnown);
    }

    view.$lastKnown.children(".lastKnown").sort(function(a, b) {
        return $(a).data('unix') < $(b).data('unix');
    }).appendTo(view.$lastKnown);

    var lg = model.lastKnownData.where(function(k, cat) {
        return objExists(cat) &&
            cat.hasOwnProperty("time") &&
            objExists(cat.time) &&
            moment().add(-3, "days").isBefore(cat.time);
    }).asLayerGroup();

    view.mapState.setLayer("lastKnown", lg);
};

ct.onVisits = function(visits, overwrite) {
    if (!model.visitsOn) {
        cd("removing visits layer");
        view.mapState.setLayer("visits", null);
        return;
    }

    if (visits.length === 0) {
        cd("no visits, returning");
        return;
    };

    ct.markerClusterGroup = ct.markerClusterGroup || L.markerClusterGroup();
    if (overwrite) ct.markerClusterGroup = L.markerClusterGroup().setZIndex(11);;

    // these should only be unique visits
    for (var k in visits) {
        if (!visits.hasOwnProperty(k)) {
            continue;
        }
        var v = visits[k];
        ct.markerClusterGroup.addLayer(v.marker(view.mapState.getMap()));
        // cd("new visit marker", v);
    }
    cd("marker cluster group", ct.markerClusterGroup);

    view.mapState.setLayer("visits", ct.markerClusterGroup);
};


view.init = function() {
    view.$shownPointsShower = $(".shownPointsShower");
    view.$lastKnown = $("#lastknown");
    view.$metadataDisplay = $("#metadata-display");
    view.$selectDrawOpts = $("#settings-select-drawopts");
    view.$settingsStyleView = $("#settings-style-view").on("change", function(e) {
        var ld = $(this).val();
        ct.setViewStyle(ld);
    });

    // view.$selectDrawOpts.val(localOrDefault("l", "activity"));
    var ms = model.getState();
    model.setState(ms);

    view.$selectDrawOpts.val(ms.tileLayer);

    view.$selectDrawOpts.on("change", function(e) { // FIXME on._ change, select, whatever
        view.mapState.setPBFOpt($(e.target).val());
    });
    view.$visitsCheckbox = $("#visits-checkbox")
        .attr("checked", ms.visits)
        .on("change", function(e) {
            model.visitsOn = $(this).is(":checked");
            // model.setLocalStore("von", model.visitsOn);
            model.setState("visits", model.visitsOn);
            if (!model.visitsOn) {
                $(".lastVisit").remove();
            }
            model.visitsParams.get()
                .done(model.setVisits)
                .catch(model.errVisits);
        });

    $("#latest-version-ios").text(latestiOSVersion);
};

ct.setViewStyle = function(lightOrDark) {
    cd("setting view  style", lightOrDark);
    // model.setLocalStore("vm", lightOrDark);
    model.setState("window", lightOrDark);
    var link = $("#bootstrap-css-link");
    link.attr("href", bootstrapCSSLinks[lightOrDark]);
    if (lightOrDark === "dark") {
        $(".lastknown-col").addClass("dark");
    } else {
        $(".lastknown-col").removeClass("dark");
    }
};

// http://gregfranko.com/jquery-best-practices/#/8
// IIFE - Immediately Invoked Function Expression
(function($, window, document) {

    // Listen for the jQuery ready event on the document
    $(function() {
        var b = $("body");
        view.$map = $("#map");
        view.mapState = (mapStateFn)();
        view.init();
        if (isSmallScreen()) {
            // $(".box").css("max-height", "60%");
            $("#main1").toggleClass("col-sm-8 col-md-9 col-12"); // .css("height", "60%");
            $("#main2").css("z-index", "1001").css("position", "fixed").css("top", "60%").css("height", "40%");
        } else if (b.width() < b.height()) {
            // or portrait mode
            // $(".box").css("max-height", "60%");
            $("#main1").toggleClass("col-sm-8 col-md-9 col-12"); //.css("height", "60%");
            $("#main2").css("z-index", "1001").css("position", "fixed").css("top", "60%").css("height", "40%").toggleClass("col col-md-6 offset-md-6");
            view.$lastKnown.closest(".col-sm-4").removeClass("col-sm-4").addClass("col-12");
            $("#main-display").children(".col-sm-8").first().removeClass("col-sm-8").addClass("col-12");
        }

        ct.init();
        var zin = $(".leaflet-top").first();
        view.$metadataDisplay
            .css("position", "fixed")
            .css("left", zin.position().left + zin.width() + 10)
            .css("top", zin.position().top)
            .css("margin-top", "10px")
            .css("z-index", 1000);

        view.$viewSettingsToggleContainer = $("<div>").addClass("leaflet-control");
        view.$viewSettingsToggle = $(`
                    <button>
                `)
            .addClass("btn")
            .addClass("leaflet-control-viewsettings-toggle")
            .attr("data-toggle", "modal")
            .attr("data-target", ".settings-modal");

        view.$viewSettingsToggleContainer.append(view.$viewSettingsToggle);
        $(".leaflet-top.leaflet-right").append(view.$viewSettingsToggleContainer);

        var ld = model.getState().windowStyle; // localOrDefault("vm", "light");
        view.$settingsStyleView.val(ld);
        ct.setViewStyle(ld);

        // $.datetimepicker.setDateFormatter({
        //     parseDate: function (date, format) {
        //         // var d = moment(date, format);
        //         // return d.isValid() ? d.toDate() : false;
        //         var d = moment(date);
        //         return d.isValid() ? d.toDate() : false;
        //     },
        //     formatDate: function (date, format) {
        //         return moment(date); // .format(format);
        //     },
        // });

        // $("#datetimepicker1").datetimepicker({
        //     // startDate:'+1971/05/01', //or 1986/12/08,
        //     format: "unixtime",
        //     onChangeDateTime: function(dp, $input) {
        //         // alert($input.val());
        //         cd("changedatetime", $input.val());
        //     }
        // });

        $("#datetimepicker1").daterangepicker({
            timePicker: true,
            startDate: moment().startOf("year"),
            endDate: moment().startOf("hour").add(32, "hour"),
            ranges: {
                'Today': [moment(), moment()],
                'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                "Last 6 Months": [moment().subtract(6, "months"), moment()],
                'This Month': [moment().startOf('month'), moment().endOf('month')],
                'This Year': [moment().startOf('year'), moment()]
                // 'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
            },
            locale: {
                format: "M/DD hh:mm A"
            }

        }, function(start, end, label) {
            cd(start, end, label);
        });

    });

}(window.jQuery, window, document));
// The global jQuery object is passed as a parameter
