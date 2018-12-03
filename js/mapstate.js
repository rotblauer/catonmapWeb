var mapStateFn = function() {
    var _map = null;
    var _currentTileLayer = null;
    var _mapboxToken = "pk.eyJ1Ijoicm90YmxhdWVyIiwiYSI6ImNpeTdidjZxajAwMzEycW1waGdrNmh3NmsifQ.OpXHPqEHK2sTbQ4-pmhAMQ";
    var _mbtilesURL = function(id) {
        return "https://api.mapbox.com/styles/v1/rotblauer/" + id + "/tiles/256/{z}/{x}/{y}?access_token=" + _mapboxToken;
    };
    var _mapboxLayers = {
        "none": L.tileLayer("", LtileLayerDefaults),
        "outdoors": L.tileLayer(_mbtilesURL("cjgejdj91001c2snpjtgmt7gj"), LtileLayerDefaults),
        "light": L.tileLayer(_mbtilesURL("ciy7ijqu3001a2rocq88pi8s4"), LtileLayerDefaults),
        "dark": L.tileLayer(_mbtilesURL("cjnlrb8hq0jgh2rozuxxzopgx"), LtileLayerDefaults),
        "satellite": L.tileLayer(_mbtilesURL("cjgel0gt300072rmc2s34f2ky"), LtileLayerDefaults),
        "terrain": L.tileLayer(_mbtilesURL("cjok2q3ao6gfx2rlmioipy394"), LtileLayerDefaults)
    };

    // TODO
    var _overlayLayers = {};

    // add a layer, update a layer, or use layer=null to delete a layer
    // FOR OVERLAY LAYERS
    var setLayer = function(name, layer) {
        if (_map === null) {
            return;
        }

        cd("_overlayLayers", _overlayLayers);
        if (layer === null) {
            if (_overlayLayers[name]) {
                var l = _overlayLayers[name];
                _map.removeLayer(l);
                l.remove();
            }
            delete _overlayLayers[name];
            return;
        }
        if (objExists(_overlayLayers[name])) {
            cd("removing layer", name, layer);
            _map.removeLayer(_overlayLayers[name]);
        }
        cd("adding layer", name, layer);
        _overlayLayers[name] = layer;
        _map.addLayer(layer);
    };

    var _currentPBFLayer = null;
    var _currentPBFLayerOpt = null; // activity, recency
    var _pbfURL = function(id) {
        return tileHost + "/" + id + "/{z}/{x}/{y}";
    };
    var _pbfLayerOpts = {
        "activity": ct.baseTilesLayerOptsF("activity"),
        "recent": ct.baseTilesLayerOptsF("recent"),
        "speed": ct.baseTilesLayerOptsF("speed"),
        "density": ct.baseTilesLayerOptsF("density")
    };
    var _pbfOpts = function(optName) {
        if (_pbfLayerOpts.hasOwnProperty(optName)) {
            return _pbfLayerOpts[optName];
        }
        return {};
    };

    var lays = [];
    var _pbfLayers = function(n) {
        if (Object.keys(_pbfOpts(n)).length === 0) {
            ce("invalid pbf opt", n, _pbfLayerOpts);
            n = "activity";
        }
        return {
            "edge": L.vectorGrid.protobuf(_pbfURL("edge"), _pbfOpts(n)),
            "devop": L.vectorGrid.protobuf(_pbfURL("devop"), _pbfOpts(n)),
            "master": L.vectorGrid.protobuf(_pbfURL("master"), _pbfOpts(n))

            // "edge": L.vectorGrid.protobuf(_pbfURL("edge"), _pbfOpts(n))
            // , "devop": L.vectorGrid.protobuf(_pbfURL("devop"), _pbfOpts(n))

            // .on("click", function(e) {
            //     console.log("event", e);
            // })
        };
    };

    var setPBFOpt = function(name) {
        if (name === "") {
            lays[0].redraw(); // redraw edge layer... will it work?
            return;
        }
        for (var i = 0; i < lays.length; i++) {
            if (_map.hasLayer(lays[i])) {
                // _map.removeLayer(lays[i]);
                lays[i].remove();
                lays[i].vectorTileLayerStyles = vectorTileLayerStyles[name];
                lays[i].redraw();
            }
        }

        _currentPBFLayerOpt = name;
        model.setLocalStore("l", name);

        var ls = _pbfLayers(_currentPBFLayerOpt);
        var keys = Object.keys(ls); // master, devop, edge

        for (var j = 0; j < keys.length; j++) {
            var l = ls[keys[j]].bringToFront().setZIndex(10);
            l.pane = "overlayPane";
            _map.addLayer(l);
            lays.push(l);
        };
        setLinkValue();
    };

    var getStateURIObj = function() {
        var b = _map.getCenter();
        return {
            z: _map.getZoom(),
            y: b.lat,
            x: b.lng,
            l: localOrDefault("l", ""),
            t: localOrDefault("t", ""),
            von: localOrDefault("von", "")
        };
    };

    var setLinkValue = function() {
        var o = getStateURIObj();
        var u = queryURL(window.location.origin, "", o);
        $("#url-location").attr("href", u);
    };

    var _mapOnMoveEnd = function() {
        var b = _map.getCenter();
        model.setLocalStore("y", b.lat);
        model.setLocalStore("x", b.lng);
        model.setLocalStore("z", _map.getZoom());
        setLinkValue();
        view.$map.focus();

        // TODO get moar visits and append them
    };
    var _mapOnZoomEnd = function() {
        model.setLocalStore("z", _map.getZoom());
        setLinkValue();
    };
    var _mapOnBaselayerChange = function(ev) {
        model.setLocalStore("t", ev.name);
        ev.layer.bringToBack();
        setLinkValue();
        view.$map.focus();
    };
    var _mapOnLoad = function() {
        model.setLocalStore("y", b.lat);
        model.setLocalStore("x", b.lng);
        model.setLocalStore("z", _map.getZoom());
        setLinkValue();
        view.$map.focus();
    };
    var _mapOnClick = function() {};

    var initMap = function() {
        _map = L.map('map', {
                keyboard: true,
                keyboardPanDelta: 120,
                minZoom: 3,
                maxZoom: 18,
                center: [+localOrDefault("y", "32"), +localOrDefault("x", "-90")], // [32, -80],
                zoom: +localOrDefault("z", "5"),
                noWrap: true,
                layers: [_mapboxLayers[localOrDefault("t", "outdoors")]]
                // preferCanvas: true
            })
            .on("moveend", _mapOnMoveEnd)
            .on("zoomend", _mapOnZoomEnd)
            .on("baselayerchange", _mapOnBaselayerChange)
            .on("load", _mapOnLoad)
            .on("click", _mapOnClick);

        L.control.layers(_mapboxLayers).addTo(_map);

        _currentPBFLayerOpt = localOrDefault("l", "activity");
        setPBFOpt(_currentPBFLayerOpt);
        view.$map.focus();
    };

    var getMap = function() {
        return _map;
    };

    var goUpdateEdge = function() {
        setPBFOpt("");
        setTimeout(goUpdateEdge, 60 * 1000);
    };

    return {
        init: initMap,
        getMap: getMap,
        setLayer: setLayer,
        setPBFOpt: setPBFOpt,
        goUpdateEdge: goUpdateEdge
    };
}
