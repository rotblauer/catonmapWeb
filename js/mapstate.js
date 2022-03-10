var mapStateFn = function() {
    var _map = null;
    var geoLayer;
    var lapMaps = [];
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
        // tileHost = "/home/ia/tdata/ttiles";
        // return tileHost + "/services/db/tiles/{z}/{x}/{y}.pbf" ;// .pbf";

        // return tileHost + "/" + id + "/{z}/{x}/{y}"; // <- the real one!

        // return tileHost +  "/{z}/{x}/{y}" + ".geojson";

        // id = "edge";
        // id = "master-test";
        return tileHost + "/services/" + id + "/tiles/{z}/{x}/{y}.pbf";
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

            // "master": L.vectorGrid.protobuf(_pbfURL("finalfinal"), _pbfOpts(n))

            // "edge": L.vectorGrid.protobuf(_pbfURL("edge"), _pbfOpts(n))
            // , "devop": L.vectorGrid.protobuf(_pbfURL("devop"), _pbfOpts(n))

            // .on("click", function(e) {
            //     console.log("event", e);
            // })
        };
    };

    var setPBFOpt = function(name) {
        view.sps = 0;
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
        model.setState("tileLayer", name);
        // model.setLocalStore("l", name);

        var ls = _pbfLayers(_currentPBFLayerOpt);
        var keys = Object.keys(ls); // master, devop, edge

        for (var j = 0; j < keys.length; j++) {
            var l = ls[keys[j]].bringToFront().setZIndex(10).on("viewreset", function(e) { view.sps = 0; }).on("load", function(e) {
                view.$shownPointsShower.text("" + numberWithCommas(view.sps));
            });
            l.pane = "overlayPane";
            _map.addLayer(l);
            lays.push(l);
        };
        // setLinkValue();
    };

    var _mapOnMoveEnd = function() {
        var b = _map.getCenter();
        model.setState("lat", b.lat.toFixed(5)).setState("lng", b.lng.toFixed(5));
        // model.setLocalStore("y", b.lat);
        // model.setLocalStore("x", b.lng);
        // model.setLocalStore("z", _map.getZoom());
        // fetchLinestrings()

        // setLinkValue();
        // TODO get moar visits and append them
    };
    var _mapOnZoomEnd = function() {
        // model.setLocalStore("z", _map.getZoom());
        cd("zoom", _map.getZoom());
        model.setState("zoom", _map.getZoom());
        // setLinkValue();
    };
    var _mapOnBaselayerChange = function(ev) {
        // model.setLocalStore("t", ev.name);
        ev.layer.bringToBack();
        model.setState("baseLayer", ev.name);
        // setLinkValue();
    };
    var _mapOnLoad = function() {
        // model.setLocalStore("y", b.lat);
        // model.setLocalStore("x", b.lng);
        // model.setLocalStore("z", _map.getZoom());
        // setLinkValue();
        view.$map.focus();
    };
    var _mapOnClick = function() {};

    var refreshLapMaps = function() {
      for (let i = 0; i < lapMaps.length; i++) {
          const lm = lapMaps[i];
          console.log('invalidating map size', lm);
          lm.map.invalidateSize();
          // lm.map.layers.forEach((layer) => {
          //     layer.remove();
          // })
          lm.map.fitBounds(lm.bounds);
          L.geoJSON(lm.data, {
              style: {
                  'color': activityColorLegend[lm.data.properties.Activity],
                  'weight': 2,
              },
          }).addTo(lm.map);
      }
    };

    var addMiniLeaflet = function(feature) {
        var swLat;
        var swLng;
        var neLat;
        var neLng;

        for (let x = 0; x < feature.geometry.coordinates.length; x++) {
            const coord = feature.geometry.coordinates[x];
            if (typeof swLat === 'undefined' || coord[1] < swLat) swLat = coord[1];
            if (typeof swLng === 'undefined' || coord[0] < swLng) swLng = coord[0];

            if (typeof neLat === 'undefined' || coord[1] > neLat) neLat = coord[1];
            if (typeof neLng === 'undefined' || coord[0] > neLng) neLng = coord[0];
        }

        const bounds = L.latLngBounds(L.latLng(swLat, swLng), L.latLng(neLat, neLng));

        console.log(feature);
        try {
            var _mymap = L.map(`lap-map-container-${feature.properties.Name}-${feature.properties.Start}`, {
                dragging: false,
                boxZoom: false,
                doubleClickZoom: false,
                zoomControl: false,
                scrollWheelZoom: false,
                attributionControl: false,
            });
            _mymap.setView({lat: feature.geometry.coordinates[0][1], lng: feature.geometry.coordinates[0][0]}, 13);
            console.log('mini leaflet', _mymap);

            // L.control.zoom({position: "topright"}).addTo(_mymap);
            // _mymap.addLayer(_mapboxLayers["light"]);


            _mymap.on('click', function (data) {
                _map.fitBounds(bounds)
                // geoLayer.setStyle({'color': 'black'});

                // on small (mobile) screens
                if ($("#laps-column").width() > window.innerWidth * 3 / 4) {
                    $("#lapsRenderButton").toggleClass('btn-dark btn-light')
                    $("#laps-column").toggle();
                }
            })

            lapMaps.push({map: _mymap, data: feature, bounds: bounds});

        } catch (err) {
            console.error(err)
        }


        // __map.setView(feature.geometry.coordinates[1])

        // __map.eachLayer(function (layer) {
        //     layer.redraw();
        // })
    }

    var handleGeoJSONLaps = function(featureCollection) {
        const $lapsContainer = $('#laps-display')
        $lapsContainer.html("")
        const features = featureCollection.features;
        for (let i = 0; i < features.length; i++) {
            const feature = features[i];

            /*
            {
  "type": "Feature",
  "geometry": {
    "type": "LineString",
    "coordinates": [
      [
        -93.25862884521484,
        44.98798370361328
      ],
      [
        -93.25841522216797,
        44.98836898803711
      ]
    ]
  },
  "properties": {
    "Activity": "Unknown",
    "Down": 0,
    "Duration": 80,
    "KmpH": 2.740037500572758,
    "MeasuredSimplifiedTraversedKilometers": 0.06089048335647811,
    "MeasuredTraversedElevationDelta": 0,
    "Name": "Rye8",
    "Start": 1646065226,
    "UUID": "6C28C3AE-B723-4A25-9548-EA5C274038A1",
    "Up": 0
  }
}
             */

            // mogrifications
            feature.properties.StartDate = moment(feature.properties.Start * 1000).toLocaleString()

            // ui
            let $card = $(`
<div class="card mb-3" style="border-bottom: 2px dashed black; min-height: 200px;">
<div class="card-body" style="">
<!--    <h5 class="card-title"></h5>-->
<!--    <p class="card-text">-->
<!--    </p>-->
        
            <div class="card-text">
                <div class="d-flex w-100 justify-content-between">
                
                <span>
                    <span style='color: ${catColors()[feature.properties.UUID]}'>${feature.properties.Name}</span>
                </span>
                <span class="badge" style='color: white; background-color: ${activityColorLegend[feature.properties.Activity]};'>${feature.properties.Activity}</span>
                </div>
                <div class="d-flex w-100 justify-content-between text-small text-muted">
                    <div class="small">
                       <span class='text-muted '>${moment(feature.properties.Start).format('llll')} </span>
                    </div>
                    <div class="small">
                       <span class='text-muted'>${minimalTimeDisplay(moment(feature.properties.StartDate))} ago</span>
                    </div>
                </div>
                
                             
                <div class="d-flex w-100 justify-content-between">
                    <span>
                    <small style="color: darkgreen;" class=""><span style="">+${feature.properties.Up}m</span>&nbsp;<span style="">${feature.properties.Down}m</span></small>
                    <small style="color: darkgreen;" class="">(${feature.properties.KmpH.toFixed(1)} km/h)</small>
</span>
                    
                    
                    <span class="text-right">
                    <small style="color: darkgreen;" class="">${feature.properties.MeasuredSimplifiedTraversedKilometers.toFixed(1)} km</small>
                    <small style="color: darkgreen;" class="">${hmsFromSeconds(feature.properties.Duration)}</small>
                    </span>
                </div>
            </div>
            
            <div id="lap-map-container-${feature.properties.Name}-${feature.properties.Start}" class="flex-fill lap-leaflet-map"></div>
</div>
</div>        
`);

//             const $tableRow = $(`<tr>
//         <td><span style='color: ${catColors()[feature.properties.UUID]}'>${feature.properties.Name}</span></td>
//         <td><span class='text-muted'>${minimalTimeDisplay(moment(feature.properties.Start))} ago</span></td>
// </tr>`);
//             $lapsTable.append($tableRow)

            $lapsContainer.append($card);
            addMiniLeaflet(feature);
        }
    }

    /**
     * @param {number} tstart is start time in seconds
     * @param {number} tend is end time in seconds
     */
    var fetchLinestrings = function() {

        let tstart = model.getState().linestringStart
        let tend = model.getState().linestringEnd

        // HACK: Override

        tend = moment().unix();
        tstart = moment().subtract(3, 'day').startOf('day').unix();

        console.log(tstart, tend);

        // getJSON(`/linestring?cats=${encodeURIComponent(new URLSearchParams(location.search).get("cats"))}` + "&viewport=" + encodeURIComponent(`${sw.lat()},${sw.lng()}|${ne.lat()},${ne.lng()}`) + '&zoom=' + encodeURIComponent(`${zm}`),

        const _map = getMap()
        const sw = _map.getBounds().getSouthWest()
        const ne = _map.getBounds().getNorthEast()
        /*
        https://cattracks.cc/linestring?cats=yes&viewport=44.85%2C-93.35%7C45.09%2C-93.15&zoom=13
         */
        let geoJSONURL = `https://cattracks.cc/linestring?cats=yes` +
            // '&viewport=' + encodeURIComponent(`${sw.lat.toPrecision(4)+'00'},${sw.lng.toPrecision(4)+'00'}|${ne.lat.toPrecision(4)+'00'},${ne.lng.toPrecision(4)+'00'}`) +
            `&zoom=${_map.getZoom()}`;

        if (!!tstart) geoJSONURL += `&tstart=${tstart}`;
        if (!!tend) geoJSONURL += `&tend=${tend}`;
        // const geoJSONURL = `https://cattracks.cc/linestring?cats=yes`;

        fetch(geoJSONURL)
            .then(res => {
                res.json()
                    .then((jsonData) => {
                        console.log('geojson fetch ok', jsonData)
                        jsonData.features = jsonData.features.filter(feature => {
                            return feature.properties.MeasuredSimplifiedTraversedKilometers >= 0.4 &&
                                feature.properties.Duration > 120;
                        })
                        jsonData.features.sort(function (a, b) {
                            return a.properties.Start < b.properties.Start ? 1 : -1;
                        })

                        // Reset the geoJSON layer to remove any existing data.
                        if (!!geoLayer) {
                            geoLayer.removeFrom(_map);
                        }
                        // Assign the geoLayer anew.
                        geoLayer = L.geoJSON(null, {
                            style: {
                                'color': 'darkgreen',
                                'weight': 2,
                                'dashArray': '8 12', // https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray
                                'opacity': 1.00,

                            },
                            onEachFeature: function(feature, layer) {
                                feature.properties.id = feature.properties.Name + feature.properties.Start;
                            }
                        }).addTo(_map);

                        geoLayer.addData(jsonData)
                        handleGeoJSONLaps(jsonData)
                    })
                    .catch(err => {
                        console.error('geojson failed to become json', err)
                    })
            })
            .catch(err => {
                console.error(err)
            })
    }

    var initMap = function() {
        var s = model.getState();
        _map = L.map('map', {
                keyboard: true,
                keyboardPanDelta: 140,
                minZoom: 3,
                maxZoom: 20,
                center: [+s.lat, +s.lng], // [32, -80],
                zoom: +s.zoom,
                noWrap: true,
                layers: [_mapboxLayers[s.baseLayer]]
                    // preferCanvas: true
            })
            .on("moveend", _mapOnMoveEnd)
            .on("zoomend", _mapOnZoomEnd)
            .on("baselayerchange", _mapOnBaselayerChange)
            .on("load", _mapOnLoad)
            .on("click", _mapOnClick);

        // base, over, opts
        L.control.layers(_mapboxLayers, null, { position: "topleft" }).addTo(_map);

        fetchLinestrings(/*default*/)

        _currentPBFLayerOpt = s.tileLayer;
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
        fetchLinestrings: fetchLinestrings,
        setLayer: setLayer,
        setPBFOpt: setPBFOpt,
        goUpdateEdge: goUpdateEdge,
        refreshLapMaps: refreshLapMaps,
    };
}
