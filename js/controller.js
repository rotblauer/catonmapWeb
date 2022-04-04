var controller = controller || {
    snapsClusterGroup: L.markerClusterGroup(),
};
var view = view || {};
var model = model || {};

view.sps = 0;

model.lastKnownData = null;
model.cats = null;
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

URI.fragmentPrefix = encodeURI("@");
// URI.fragmentPrefix = "@";

model.state = {};
model.setState = function(k, v) {
    if (typeof k === "object") {
        cd('model set state object', k);
        window.history.replaceState(k, "---", URI(window.location.href).setFragment(k));
        window.localStorage.setItem("data", JSON.stringify(k));
        return model;
    }

    // window.history.replaceState({}, "---", URI(window.url).setSearch());
    var o = window.history.state || {};
    o[k] = v;
    window.history.replaceState(o, "---", URI(window.location.href).setFragment(k, v));
    window.localStorage.setItem("data", JSON.stringify(o));

    model.state[k] = v;
    cd('model setState', model);

    return model;
};

model.getState = function() {

    // http://localhost:8080/
    // #@zoom=14&lat=44.98307&lng=-93.24882
    // &baseLayer=light
    // &tileLayer=density
    // &visits=false
    // &snaps=true
    // &follow=
    // &windowStyle=light
    // &tfstart
    // &tfend
    // &linestringStart
    // &linestringEnd
    // &window=light
    var uriParam = URI(window.location.href).fragment(true);
    var windowHistory = window.history;
    var localStore = {};

    try {
        var d = window.localStorage.getItem("data");
        if (d !== "" && objExists(d)) {
            localStore = JSON.parse(d);
        }
    } catch (err) {}

    var s = {};
    Object.assign(s, localStore);
    Object.assign(s, windowHistory);
    Object.assign(s, uriParam);

    return {
        zoom: s["zoom"] || 12,
        lat: s["lat"] || 44.987854003, // 38.613651383524335, // 32,
        lng: s["lng"] || -93.25876617, // -90.25388717651369,
        baseLayer: s["baseLayer"] || "light",
        overlay_activity: s["overlay_activity"] || false,
        overlay_density: s["overlay_density"] || true,
        overlay_laps: s["overlay_laps"] || true,
        overlay_snaps: s["overlay_snaps"] || false,
        overlay_plats: s["overlay_plats"] || false,
        current_view: s["current_view"] || 'none',
        settings_opt: s["settings_opt"] || 'none',
        tileLayer: s["tileLayer"] || "activity",
        // visits: ((uriParam["visits"] || windowHistory["visits"] || localStore["visits"] || "false") === "false") ? false : true,
        // snaps: ((uriParam["snaps"] || windowHistory["snaps"] || localStore["snaps"] || "true") === "false") ? false : true,
        // follow: s["follow"] || "",
        windowStyle: s["window"] || "light",
        tfstart: s["tfstart"],
        tfend: s["tfend"],
        linestringStart: s["linestringStart"],
        linestringEnd: s["linestringEnd"],
        platsEndpoint: s["plats_at"] || 'https://raw.githubusercontent.com/rotblauer/plats/main/catonmap.net.geo.json',
    };

    // return {
    //     zoom: uriParam["zoom"] || windowHistory["zoom"] || localStore["zoom"] || 12,
    //     lat: uriParam["lat"] || windowHistory["lat"] || localStore["lat"] || 38.613651383524335, // 32,
    //     lng: uriParam["lng"] || windowHistory["lng"] || localStore["lng"] || -90.25388717651369,
    //     baseLayer: uriParam["baseLayer"] || windowHistory["baseLayer"] || localStore["baseLayer"] || "terrain",
    //     tileLayer: uriParam["tileLayer"] || windowHistory["tileLayer"] || localStore["tileLayer"] || "activity",
    //     visits: (vs === "false") ? false : true,
    //     follow: uriParam["follow"] || windowHistory["follow"] || localStore["follow"] || "",
    //     windowStyle: uriParam["window"] || uriParam["window"] || uriParam["window"] || "light"
    // };

};

model.getMetadata = function() {
    var url = queryURL(trackHost, "/metadata");
    cd("GET", url);
    return $.ajax(qJSON(url));
};

model.doneMetadata = function(data) {
    cd("got metadata", data);
//     var m = moment();
//     var content = `<small class="metadataservercontent">Cats added ${numberWithCommas( data.KeyN )} points in last ${moment(data.KeyNUpdated).fromNow(true).replace("a ", "").replace("an ","")}.<br>
// TileDB was last updated ${moment(data.TileDBLastUpdated).fromNow()}.
// </small>`;
//
//     // cd("content", content);
//     var zin = $(".leaflet-top").first();
//     view.$metadataDisplay.children(".metadataservercontent").first().remove();
//     view.$metadataDisplay.append($(content));
//
//     if (!renderCatsView) {
//         view.$metadataDisplay.show();
//     }
    // view.$metadataDisplay.html(content);
};

model.errorMetadata = function(err) {
    ce("metadata err", err);
};

var ago3days = moment().add(-3, "days").unix();

controller.settings = {
    on: false,
    // on: true,
    filter: {
        // "big papa only": function(p,z,l) {
        //     if (p.Name == "Big Papa") {
        //         return true;
        //     }
        //     return false;
        // }
        // "t": function(p, z, l) {
        //     // if (!objExists(p.TimeUnix)) {
        //     //     cd("noexit", p);
        //     // }
        //     return p.UnixTime > ago3days;
        // }
    },
    follow: null
};

controller.settingsFilter = function(props, zoom, layer) {
    if (!controller.settings.hasOwnProperty("on") ||
        !controller.settings["on"] ||
        !controller.settings.hasOwnProperty("filter")) return true; // no filter settings applied, or disabled (on=false)

    for (var k in controller.settings.filter) {
        if (!controller.settings.filter.hasOwnProperty(k)) {
            continue;
        }
        var fn = controller.settings.filter[k];
        if (!fn(props, zoom, layer)) {
            return false;
        }
    }
    return true;
};

controller.setSettingsFilter = function(key, fn) {
    if (objExists(fn)) {
        controller.settings["on"] = true;
        controller.settings["filter"] = controller.settings["filter"] || {};
        controller.settings["filter"][key] = fn;
    } else {
        if (controller.settings.hasOwnProperty("filter")) {
            if (controller.settings.filter.hasOwnProperty(key)) {
                delete controller.settings.filter[key];
            }
            if (Object.keys(controller.settings.filter).length === 0) {
                controller.settings.on = false;
            }
        }
    }
    cd("ct.settings", controller.settings);
};

model.getLocalStore = function(key) {
    if (objExists(controller.browserSupportsLocal) && !controller.browserSupportsLocal) {
        return null;
    }
    var v = window.localStorage.getItem(key);
    if (v === "" || !objExists(v)) return null;
    return v;
};

model.setLocalStore = function(key, val) {
    if (controller.browserSupportsLocal) {
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

    // cd("lastknown cats", model.lastKnownData);

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
    controller.onVisits(model.visitsData, true);
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
    controller.onVisits(newVs, false);
};

model.errVisits = function(err) {
    ce(err);
};

model.doneLastKnownCats = function(data) {
    controller.onLastKnown(model.setLastKnown(data));
};

model.logAndMockInstead = function(err) {
    ce(err);
    ce("WARNING: mocking data instead");
    model.doneLastKnownCats(mockLastknown);
};

// model.loadCats = function() {
//     const endpoint = queryURL(trackHost, "/lastknown", null); // `https://cattracks.cc/catstatus?cats=yes`
//     fetch(endpoint)
//         .then((res) => {
//             console.log('catstatus OK', res);
//             res.json()
//                 .then((body) => {
//                     console.log('catstatus.json OK', body);
//                 })
//                 .catch((err) => {
//                     alert(err);
//                 })
//         })
//         .catch((err) => {
//             console.error('fetch catstatus failed', err);
//         })
// }

controller.fetchData = function(n) {
    // controller.settings.follow = model.getState().follow; // localOrDefault("fc", "");

    // model.getMetadata()
    //     .done(model.doneMetadata)
    //     .catch(model.errorMetadata);

    model.getLastKnownCats()
        .done(model.doneLastKnownCats)
        .catch((err) => {
            console.error('get lastknown errored', err);
        })
        // .catch(model.logAndMockInstead)

        // visits assigning to cats depends on cats being there
        // .then(function() {
        //     model.visitsParams
        //         .set("startReportedT", moment().add(-14, "days").format()) // TODO editable
        //         .set("startArrivalT", moment().add(-500, "years").format())
        //         // .set("startArrivalT", "")
        //         // .set("endDepartureT", moment().add(500, "years").format()) // TODO allow last arrival/cat
        //         .get()
        //         .done(model.setVisits)
        //         .catch(model.errVisits);
        // });
        //
    // model.loadCats();

    model.loadSnaps();

    // if (model.getState().snaps) {
    //     $("#snapsRenderedSwitcher").show();
    // } else {
    //     $("#snapsRenderedSwitcher").hide();
    // }

    // setTimeout(view.mapState.goUpdateEdge, 60*1000);
    // view.mapState.setPBFOpt("");
    // setTimeout(ct.dataLoop, (n || 55) * 1000);
};

controller.init = (function() {
    setWindowTitle();
    controller.browserSupportsLocal = browserSupportsLocalStorage;
    model.visitsOn = model.getState().visits;
    model.snapsOn = model.getState().snaps;

    // var von = model.getState().visits;
    // model.visitsOn = (von === true || von === "true") ? true : false; // localOrDefault("von", "yes");
    // (model.visitsOn) ? view.$visitsCheckbox.val("yes").attr("checked", true): view.$visitsCheckbox.val("no").attr("checked", false);


    // view.$visitsCheckbox.attr("checked", model.visitsOn);
    // view.$snapsCheckbox.attr("checked", model.snapsOn);

    var tfstart = model.getState().tfstart;
    var tfend = model.getState().tfend;
    if (objExists(tfstart) || objExists(tfend)) {
        controller.setSettingsFilter("time_filter", function(p, z, l) {
            if (objExists(p["UnixTime"])) {
                if (moment(tfstart).unix() < p.UnixTime && moment(tfend).unix() > p.UnixTime) {
                    return true;
                }
                return false;
            } else {
                var punix = p.id / 1e9;
                if (moment(tfstart).unix() < punix && moment(tfend).unix() > punix) {
                    return true;
                }
                cd("nogo snapo", moment(tfstart).unix(), tfend, punix);
                return false;
            }
        });
    }

    view.mapState.init();

    controller.fetchData();
});

controller.onLastKnown = function(data) {
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

    // cd("catsort", catsort);

    view.$lastKnown.children(".lastKnown").sort(function(a, b) {
        return $(a).data('unix') < $(b).data('unix');
    }).appendTo(view.$lastKnown);

    // put cats on maps
    var lg = model.lastKnownData.where(function(k, cat) {
        return objExists(cat) &&
            cat.hasOwnProperty("time") &&
            objExists(cat.time) &&
            moment().add(-3, "days").isBefore(cat.time);
    }).asLayerGroup();

    lg.eachLayer((layer) => {
        view.mapState.getOverlays()["cats"].addLayer(layer);
    });

    view.mapState.getMap().addLayer(view.mapState.getOverlays()["cats"]);

    // view.mapState.setLayer("lastKnown", lg);
};

model.loadSnaps = function(snaps) {
    let snapsStart = Math.floor(Date.now() / 1000) - 60*60*24*30; // start time in unix seconds of T-1month
    var url = queryURL(trackHost, "/catsnaps?tstart=" + snapsStart);
    cd("GET", url);
    $.ajax(qJSON(url))
        .done(function(data) {
            var snaps = data.reverse();
            cd("GOT SNAPS", snaps);
            // view.mapState.setLayer("snaps", null);
            var num = 0;
            snaps.forEach(function(snap) {
                if (!controller.settingsFilter(snap, 3, "snaps")) {
                    cd("snap return", snap);
                    return;
                }
                num++;
                // if (num > 50) {
                // return;
                // }
                var n = JSON.parse(snap.notes);
                // cd("snap notes", n);
                if (!objExists(n["imgS3"]) || !n.hasOwnProperty("imgS3") || n["imgS3"] === "") {
                    return;
                }

                var snapMapPopup = function(e) {
                    cd(e);
                    var url = s3url; // close
                    var content = `<a target="_" href="${url}"><img src='${url}' style='width:${isSmallScreen()?150:300}px;' /></a>
                        <div class="d-flex w-100 justify-content-between p-1" 
                            style="background-color: rgba(255, 255, 255, 0.62); border-bottom-left-radius: 5px; border-bottom-right-radius: 5px;">
                            <strong style='color: ${catColors()[snap.uuid]}'>${snap.name}</strong>
                            <span class='text-muted'>${minimalTimeDisplay(moment(snap.time))}</span>
                        </div>
                        `;
                    L.popup()
                        .setContent(content)
                        .setLatLng([snap.lat, snap.long])
                        .openOn(view.mapState.getMap());
                    L.DomEvent.stop(e);
                };

                var s3url = "https://s3.us-east-2.amazonaws.com/" + n["imgS3"];
                var $img = $("<img>")
                    .attr("src", s3url)
                    // .addClass('catsnap-img')
                    .addClass('card-img-top')
                    .css({
                    // "max-width": "100%",
                    //     'max-height': '60vh',
                }).on("click", function(e) {
                    view.mapState.getMap().setView([snap.lat, snap.long]);
                    snapMapPopup(e);

                    const $snaps = $('#snaps-display');
                    if ($snaps.width() > window.innerWidth * 3 / 4) {
                        onSnapsButtonClick()
                    }
                });

                if (num === 1) {
                    const snapClone = new Object(snap)
                    snapClone.notes = n;
                    console.log('snap model', snapClone);
                }
                /*
{
  "uuid": "3582fb4e0c347601",
  "pushToken": "",
  "version": "gcps/v0.0.0+1",
  "id": 1646606264000000000,
  "name": "sofia-moto-fdb7",
  "lat": 48.0374413,
  "long": -118.3679075,
  "accuracy": 3.8,
  "vAccuracy": 2.9,
  "elevation": 388,
  "speed": 0,
  "tilt": 0,
  "heading": 180,
  "heartrate": 0,
  "time": "2022-03-06T22:37:44Z",
  "floor": 0,
  "notes": {
    "activity": "Stationary",
    "numberOfSteps": 2397,
    "averageActivePace": 0,
    "currentPace": 0,
    "currentCadence": 0,
    "distance": 0,
    "customNote": "",
    "floorsAscended": 0,
    "floorsDescended": 0,
    "currentTripStart": "0001-01-01T00:00:00Z",
    "pressure": 0,
    "visit": "",
    "heartRateS": "",
    "heartRateRawS": "",
    "batteryStatus": "{\"level\":0.83,\"status\":\"unplugged\"}",
    "networkInfo": "",
    "imgb64": "",
    "imgS3": "rotblauercatsnaps/lMdouqoofKvqMreiCsQvBKVQOLAgIuTL"
  },
  "COVerified": true,
  "remoteaddr": ""
}
                 */

                var $card = $(`<div class="col-12 p-0"><div class="card mb-3">
  <div class="card-body">
<!--    <h5 class="card-title"></h5>-->
<!--    <p class="card-text">-->
        <div class="d-flex w-100 justify-content-between">
            <strong style='color: ${catColors()[snap.uuid]}'>${snap.name}</strong>
            <span class='small text-right text-muted'>${minimalTimeDisplay(moment(snap.time))} ago</span>
        </div>
        <div class="d-flex w-100 text-muted small justify-content-between">
            <span>${snap.lat.toFixed(3)}, ${snap.long.toFixed(3)}</span>
            <span class="text-right">${moment(snap.time).format('llll')}</span>
        </div>
<!--    </p>-->
  </div>
</div></div>`);

                // Run the "snaps button click" logic.
                $card.on('click', function() {
                    console.log('card click');
                })

                $card.prepend($img)

                if (num < 50) {
                    $("#snaps-display").append($card);
                }

                // add markers
                var marker = L.marker([snap.lat, snap.long], {
                    // icon: iconSnap
                    icon: L.icon({
                        iconUrl: s3url,
                        iconSize: [32,32],
                        iconAnchor: [16,16],
                        popupAnchor: [0,16],
                        className: 'icon-round'
                    })
                }).on("click", snapMapPopup);
                controller.snapsClusterGroup.addLayer(marker);
                // ct.markerClusterGroup.addLayer(marker);
            });

            // view.mapState.setLayer("snaps", controller.snapsClusterGroup);
            // view.mapState.setLayer("snaps", ct.markerClusterGroup);

        })
        .catch(function(err) {
            ce(err);
        });
};

controller.onVisits = function(visits, overwrite) {
    if (!model.visitsOn) {
        cd("removing visits layer");
        view.mapState.setLayer("visits", null);
        return;
    }

    if (visits.length === 0) {
        cd("no visits, returning");
        return;
    };

    controller.markerClusterGroup = controller.markerClusterGroup || L.markerClusterGroup();
    if (overwrite) controller.markerClusterGroup = L.markerClusterGroup().setZIndex(11);;

    // these should only be unique visits
    for (var k in visits) {
        if (!visits.hasOwnProperty(k)) {
            continue;
        }
        var v = visits[k];
        controller.markerClusterGroup.addLayer(v.marker(view.mapState.getMap()));
        // cd("new visit marker", v);
    }
    cd("marker cluster group", controller.markerClusterGroup);

    view.mapState.setLayer("visits", controller.markerClusterGroup);
};

controller.setViewStyle = function(lightOrDark) {
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

var catsViewOn = true;

function renderCatsView() {
    if (catsViewOn) {
        $('#my-cats-container').show();
        // $("#main2").show();
        // $("#brand").hide();
        if (isSmallScreen()) {
            // $(".leaflet-control-container").hide();
            // $("#snapsRenderedSwitcher").hide();
        }
    } else {
        $('#my-cats-container').hide();
        // $("#main2").hide();
        // $("#brand").show();
        if (isSmallScreen()) {
            // $(".leaflet-control-container").show();
            // $("#snapsRenderedSwitcher").show();
        }
    }
}

function toggleCatsView() {
    catsViewOn = !catsViewOn;
    renderCatsView();
}

function onSnapsButtonClick(e, el) {
    console.log("fn: onSnapsButtonClick")
    // $("#snaps-display").toggle();

    const $snaps = $('#snaps-display-container')

    $snaps.addClass('collapse').removeClass('show');
    // const $snapsRenderedSwitcher = $("#snapsRenderedSwitcher");
    //
    //
    // $snaps.toggle()
    // const snapsShowing = $snaps.is(':visible');
    //
    // // if (snapsShowing) $("#metadata-display").hide();
    // // else $("#metadata-display").show();
    //
    // // $('#main1').toggleClass('col-12 col-md-10');
    //
    // $snapsRenderedSwitcher.toggleClass('btn-dark btn-light');

    view.mapState.getMap().invalidateSize();
    view.$map.focus();

    // if (isSmallScreen()) view.$lapsViewButton.toggle();


    // if (model.getState().tileLayer === "activity" && isSmallScreen() && $snaps.is(':visible')) $('#activity-legend').hide();
    // else if (model.getState().tileLayer === "activity" && isSmallScreen()) $('#activity-legend').show();


    // if ($snapsRenderedSwitcher.html().indexOf("naps") >= 0) {
    //     $snapsRenderedSwitcher.html("Maps");
    // } else {
    //     $snapsRenderedSwitcher.html("Snaps");
    // }
}

view.init = function() {

    // last cats:
    view.$lastKnown = $("#lastknown");

    // "metadata" / about this site / debugging:
    view.$metadataDisplay = $("#metadata-display");
    view.$metadataRecoverDisplay = $("#metadata-display-recover");

    view.$shownPointsShower = $(".shownPointsShower");
    function toggleMetadata (el) {
        view.$metadataDisplay.toggle();
        $('#metadata-display-recover').toggle();
    }
    view.$metadataDisplay.on('click', toggleMetadata);
    view.$metadataRecoverDisplay.on('click', toggleMetadata);

    // cat laps:
    view.$lapsColFilterToMapArea = $("input:checkbox#laps-filter-to-map-area");
    view.$lapsColFilterToMapArea.on('click', function () {
        console.log('click');
        // lapMaps.push({map: _mymap, data: feature, bounds: bounds});
        let lapMaps = view.mapState.getLapMaps();
        const mapBounds = view.mapState.getMap().getBounds();
        for (let lm of lapMaps) {
            const $lapCard = $(`.lap-card#lap-card-${lm.data.properties.UUID}-${lm.data.properties.Start}`);
            if (!view.$lapsColFilterToMapArea.is(':checked')) {
                // Show everything if the box is not checked.
                $lapCard.show();
                console.log('show card');
                continue
            }
            // Show only on-map laps.
            if (!mapBounds.intersects(lm.bounds)) $lapCard.hide();
            else $lapCard.show();
        }
        view.mapState.refreshLapMaps();
    });

    // site settings:
    // handles dark mode/light mode?
    // view.$settingsStyleView = $("#settings-style-view").on("change", function(e) {
    //     var ld = $(this).val();
    //     controller.setViewStyle(ld);
    // });

    // view.$selectDrawOpts.val(localOrDefault("l", "activity"));
    var ms = model.getState();
    model.setState(ms);

    // if (!ms.snaps) {
    //     $("#snapsRenderedSwitcher").hide();
    // }

    // view.$selectDrawOpts = $("#settings-select-drawopts");
    // view.$selectDrawOpts.val(ms.tileLayer);
    //
    // view.$selectDrawOpts.on("change", function(e) { // FIXME on._ change, select, whatever
    //     view.mapState.setPBFOpt($(e.target).val());
    // });
    //
    // view.$visitsCheckbox = $("#visits-checkbox")
    //     .attr("checked", ms.visits)
    //     .on("change", function(e) {
    //         model.visitsOn = $(this).is(":checked");
    //         // model.setLocalStore("von", model.visitsOn);
    //         model.setState("visits", model.visitsOn);
    //         if (!model.visitsOn) {
    //             $(".lastVisit").remove();
    //         }
    //         model.visitsParams.get()
    //             .done(model.setVisits)
    //             .catch(model.errVisits);
    //     });
    //
    // view.$snapsCheckbox = $("#snaps-checkbox")
    //     .attr("checked", ms.snaps)
    //     .on("change", function(e) {
    //         model.snapsOn = $(this).is(":checked");
    //         // model.setLocalStore("von", model.visitsOn);
    //         model.setState("snaps", model.snapsOn);
    //         if (!model.snapsOn) {
    //             view.mapState.setLayer("snaps", null);
    //             $("#snaps-display").html("");
    //             $("#snapsRenderedSwitcher").hide();
    //         } else {
    //             model.loadSnaps();
    //         }
    //     });
    // $("#latest-version-ios").text(latestiOSVersion);
};

// http://gregfranko.com/jquery-best-practices/#/8
// IIFE - Immediately Invoked Function Expression
(function($, window, document) {

    // Listen for the jQuery ready event on the document
    $(function() {
        // if (!isSmallScreen()) $('[data-toggle="tooltip"]').tooltip()

        var b = $("body");
        view.$map = $("#map");
        view.mapState = (mapStateFn)();


        view.init();

        // catsViewOn = false // !isSmallScreen();
        renderCatsView();
        if (catsViewOn) {
            // $("#catsRenderedSwitcher").hide();
        }

        controller.init();

        // var zin = $(".leaflet-top").first();
        // view.$metadataDisplay
        //     .css("position", "fixed")
        //
        //     .css("left", zin.position().left + zin.width() + 10)
        //     .css("top", zin.position().top)
        //     .css("margin-top", "10px")
        //
        //     .css("z-index", 1000);

        // data-toggle="tooltip" data-placement="right" title="Tap to hide"
        // view.$viewSettingsToggleContainer = $("<div>")
        //     .addClass("leaflet-control")
        //     .attr('data-toggle', 'tooltip')
        //     .attr('data-placement', 'right')
        //     .attr('title', 'Settings'); // .tooltip();
        //
        // view.$viewSettingsToggle = $(`
        //             <button>
        //         `)
        //     .addClass("btn")
        //     .addClass("leaflet-control-viewsettings-toggle")
        //     .attr("data-toggle", "modal")
        //     .attr("data-target", ".settings-modal");
        //
        // view.$viewSettingsToggleContainer.append(view.$viewSettingsToggle);
        // $(".leaflet-top.leaflet-left").append(view.$viewSettingsToggleContainer);

        // view.$snapsCheckbox2Container.insertAfter(view.$viewSettingsToggleContainer);

        // var ld = model.getState().windowStyle; // localOrDefault("vm", "light");
        // view.$settingsStyleView.val(ld);
        // controller.setViewStyle(ld);

        // view.$catsViewButton = $("#catsRenderedSwitcher")
        // view.$catsViewButton.on("click", function() {
        //     toggleCatsView();
        //     renderCatsView();
        //     // $('#brand').toggle();
        //     // $('#mymetadata').toggle();
        //     $(this).toggleClass("btn-dark btn-light");
        // });
        //
        // view.$snapsViewButton = $("#snapsRenderedSwitcher");
        // view.$snapsViewButton.on("click", onSnapsButtonClick);
        //
        // view.$lapsViewButton = $("#lapsRenderButton");
        // view.$lapsViewButton.on('click', function (ev, el) {
        //     const $lapsCol = $("#laps-column");
        //     $lapsCol.toggle();
        //     if ($lapsCol.is(':visible')) $("#lapsRenderButton").removeClass('btn-light').addClass('btn-dark');
        //     else $("#lapsRenderButton").removeClass('btn-dark').addClass('btn-light')
        //     view.mapState.refreshLapMaps();
        //     setTimeout(view.mapState.getMap().invalidateSize, 300);
        //
        //     if (isSmallScreen()) $("#snapsRenderedSwitcher").toggle();
        //
        //     // if (model.getState().tileLayer === "activity" && isSmallScreen() && $lapsCol.is(':visible')) $('#activity-legend').hide();
        //     // else if (model.getState().tileLayer === "activity" && isSmallScreen()) $('#activity-legend').show();
        // });


        // $("#datetimepicker1").daterangepicker({
        //     timePicker: true,
        //     startDate: moment().startOf("week"),
        //     endDate: moment().startOf("hour").add(2, "hour"),
        //     ranges: {
        //         'Today': [moment().startOf('day'), moment()],
        //         'Yesterday': [moment().subtract(1, 'day').startOf("day"), moment().subtract(1, "day").endOf("day")],
        //         'Last 7 Days': [moment().subtract(7, 'days').startOf('day'), moment()],
        //         'Last 30 Days': [moment().subtract(30, 'days').startOf('day'), moment()],
        //         "Last 6 Months": [moment().subtract(6, "months").startOf('day'), moment()],
        //         'This Month': [moment().startOf('month'), moment()],
        //         'This Year': [moment().startOf('year'), moment()]
        //             // 'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        //     },
        //     locale: {
        //         format: "M/DD hh:mm A"
        //     }
        //
        // }, function(start, end, label) {
        //     controller.setSettingsFilter("time_filter", function(p, z, l) {
        //         if (objExists(p["UnixTime"])) {
        //             if (start.unix() < p.UnixTime && end.unix() > p.UnixTime) {
        //                 return true;
        //             }
        //             return false;
        //         } else {
        //             var punix = p.id / 1e9;
        //             if (start.unix() < punix && end.unix() > punix) {
        //                 return true;
        //             }
        //             cd("nogo snapo", tfstart, tfend, punix);
        //             return false;
        //         }
        //     });
        //     cd(start, end, label);
        //
        //     model.setState("tfstart", start.format());
        //     model.setState("tfend", end.format());
        //
        //     view.mapState.setPBFOpt(view.$selectDrawOpts.val());
        // });
        //
        // $("#btn-remove-date-filter").on("click", function(e) {
        //     controller.setSettingsFilter("time_filter", null);
        //
        //     model.setState("tfstart", null);
        //     model.setState("tfend", null);
        //
        //     view.mapState.setPBFOpt(view.$selectDrawOpts.val());
        // });


        // $('#my-view-togglers').appendTo($('.leaflet-bottom.leaflet-left').first());
        // $('#my-top-right').appendTo($('.leaflet-top.leaflet-right').first());

        // $('.leaflet-bottom.leaflet-right').first().prepend($('#cat-tracker-links').remove());



        // $('#my-view-togglers-form input').on('change', function (){
        //
        //     // Can I use this.:checked ?
        //     // console.log('this.val', $(this).val());
        //     // const myVal = $('input[name=radio-show-list]:checked', '#my-view-togglers-form').val();
        //     const myVal = $(this).val();
        //     console.log('view changed myval', myVal);
        //
        //     model.setState('current_view', myVal);
        //
        //     // turn everything off
        //     catsViewOn = false;
        //     renderCatsView();
        //     $("#laps-column").hide();
        //     $("#snaps-display-container").hide();
        //
        //     switch (myVal) {
        //         case 'none':
        //             // on
        //
        //             break;
        //         // case 'cats':
        //         //     // on
        //         //     catsViewOn = true;
        //         //     renderCatsView();
        //         //
        //         //     break
        //         case 'snaps':
        //             // on
        //             $("#snaps-display-container").show();
        //
        //             break
        //         case 'laps':
        //             // on
        //             $("#laps-column").show();
        //             view.mapState.refreshLapMaps();
        //
        //             break
        //     }
        //
        //     // if (isSmallScreen() && myVal !== 'none') {
        //     //     $('#brand').hide();
        //     // } else {
        //     //     $('#brand').show();
        //     // }
        //
        //     view.mapState.getMap().invalidateSize();
        //
        //     // setTimeout(view.mapState.getMap().invalidateSize, 300);
        // });
        //
        // $('#my-settings-form input').on('change', function (){
        //     const myVal = $('input[name=radio-settings-list]:checked', '#my-settings-form').val();
        //     console.log('settings changed val', myVal);
        //     model.setState(`settings_opt`, myVal);
        //     switch (myVal) {
        //         case 'none':
        //             catsViewOn = false;
        //         case 'cats':
        //             catsViewOn = true;
        //             break
        //     }
        //     renderCatsView();
        //     if (isSmallScreen() && myVal !== 'none') {
        //         $('#brand').hide();
        //     } else {
        //         $('#brand').show();
        //     }
        // });

        $('#laps-column-closer').on('click', function () {
            // $(`input[name=radio-settings-list]`).val('none').change();
            // $("#laps-column").hide();
            console.log('laps collapse');
            $('#laps-column').addClass('collapse').removeClass('show');
            view.mapState.getMap().invalidateSize();
            view.$map.focus();
        });

        $('#plats-column-closer').on('click', function () {
            // $(`input[name=radio-settings-list]`).val('none').change();
            // $("#laps-column").hide();
            console.log('plats collapse');
            $('#plats-column').addClass('collapse').removeClass('show');
            view.mapState.getMap().invalidateSize();
            view.$map.focus();
        });

        $('#snaps-column-closer').on('click', function () {
            console.log('snaps collapse');
            $('#snaps-display-container').addClass('collapse').removeClass('show');
            view.mapState.getMap().invalidateSize();
            view.$map.focus();

            // $(`input[name=radio-settings-list]`).val(['none']).change();
            // $(`#my-view-togglers-form input[value='none']`).prop('checked', true);
            // $('#my-view-togglers-form').val('none');
            // $("#snaps-display-container").hide();
        });

        $('#laps-clicker').on('click', function () {
            setTimeout(() => {
                view.mapState.refreshLapMaps();
            }, 10);
        });


        // $(`input[name=radio-show-list]`).val([model.getState().current_view || 'none']).change();
        // $(`input[name=radio-settings-list]`).val([model.getState().settings_opt || 'none']).change();

        // This is/was for the linestrings (aka laps) query.

        // $("#datetimepicker2").daterangepicker({
        //     timePicker: true,
        //     startDate: moment().startOf("week"),
        //     endDate: moment().startOf("hour").add(12, "hour"),
        //     ranges: {
        //         'Today': [moment().startOf('day'), moment()],
        //         'Yesterday': [moment().subtract(1, 'day').startOf("day"), moment().subtract(1, "day").endOf("day")],
        //         'Last 7 Days': [moment().subtract(7, 'days').startOf('day'), moment()],
        //         'Last 30 Days': [moment().subtract(30, 'days').startOf('day'), moment()],
        //         "Last 6 Months": [moment().subtract(6, "months").startOf('day'), moment()],
        //         'This Month': [moment().startOf('month'), moment()],
        //         'This Year': [moment().startOf('year'), moment()]
        //         // 'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        //     },
        //     locale: {
        //         format: "M/DD hh:mm A"
        //     }
        //
        // }, function(start, end, label) {
        //     // ct.setSettingsFilter("time_filter", function(p, z, l) {
        //     //     if (objExists(p["UnixTime"])) {
        //     //         if (start.unix() < p.UnixTime && end.unix() > p.UnixTime) {
        //     //             return true;
        //     //         }
        //     //         return false;
        //     //     } else {
        //     //         var punix = p.id / 1e9;
        //     //         if (start.unix() < punix && end.unix() > punix) {
        //     //             return true;
        //     //         }
        //     //         cd("nogo linestring", tfstart, tfend, punix);
        //     //         return false;
        //     //     }
        //     // });
        //
        //     cd(start, end, label);
        //
        //     model.setState("linestringStart", start.unix());
        //     model.setState("linestringEnd", end.unix());
        //
        //     view.mapState.fetchLinestrings();
        //
        //     // view.mapState.setPBFOpt(view.$selectDrawOpts.val());
        // });
        //
        // $("#btn-remove-date-filter2").on("click", function(e) {
        //
        //     const start = moment().startOf('day')
        //     const end = moment()
        //
        //     model.setState("linestringStart", start.unix());
        //     model.setState("linestringEnd", end.unix());
        //
        //     view.mapState.fetchLinestrings();
        //
        //     // ct.setSettingsFilter("time_filter", null);
        //     //
        //     // model.setState("tfstart", null);
        //     // model.setState("tfend", null);
        //     //
        //     // view.mapState.setPBFOpt(view.$selectDrawOpts.val());
        // });
    });

}(window.jQuery, window, document));
// The global jQuery object is passed as a parameter
