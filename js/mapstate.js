var mapStateFn = function () {
    var _map = null;
    var _layerControl = null;
    var lapMaps = [];
    var _currentTileLayer = null;
    var _mapboxToken = "pk.eyJ1Ijoicm90YmxhdWVyIiwiYSI6ImNpeTdidjZxajAwMzEycW1waGdrNmh3NmsifQ.OpXHPqEHK2sTbQ4-pmhAMQ";
    var _mbtilesURL = function (id) {
        return "https://api.mapbox.com/styles/v1/rotblauer/" + id + "/tiles/256/{z}/{x}/{y}?access_token=" + _mapboxToken;
    };
    var _mapboxLayers = {
        "none": L.tileLayer("", LtileLayerDefaults),
        // "outdoors": L.tileLayer(_mbtilesURL("cjgejdj91001c2snpjtgmt7gj"), LtileLayerDefaults),
        "outdoors": L.tileLayer(_mbtilesURL("cl1l095yk000014mwjm3npd15"), LtileLayerDefaults),
        // "offroad": L.tileLayer(_mbtilesURL("cl6z7x8il000b15o8d1ytgp4u"), LtileLayerDefaults),
        "offroad": L.tileLayer(_mbtilesURL("cl7hx66zg000014o5dxx2zi6j"), LtileLayerDefaults), // <-- white road ways, light green ped ways
        "bubble": L.tileLayer(_mbtilesURL("cl7i1brhp001l15pk7hint1gj"), LtileLayerDefaults), // <-- good color scheme for elevation/contours
        "terrain": L.tileLayer(_mbtilesURL("cjok2q3ao6gfx2rlmioipy394"), LtileLayerDefaults),
        "satellite": L.tileLayer(_mbtilesURL("cjgel0gt300072rmc2s34f2ky"), LtileLayerDefaults),
        "light": L.tileLayer(_mbtilesURL("ciy7ijqu3001a2rocq88pi8s4"), LtileLayerDefaults),
        "dark": L.tileLayer(_mbtilesURL("cjnlrb8hq0jgh2rozuxxzopgx"), LtileLayerDefaults),
        // "OSM": L.tileLayer("https://a.tile.openstreetmap.org/{z}/{x}/{y}.png")
    };

    // TODO
    var _overlayLayers = {};

    var _editableLayers = new L.FeatureGroup();

    // add a layer, update a layer, or use layer=null to delete a layer
    // FOR OVERLAY LAYERS
    var setLayer = function (name, layer) {
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
    var _pbfURL = function (id) {
        // tileHost = "/home/ia/tdata/ttiles";
        // return tileHost + "/services/db/tiles/{z}/{x}/{y}.pbf" ;// .pbf";

        // return tileHost + "/" + id + "/{z}/{x}/{y}"; // <- the real one!

        // return tileHost +  "/{z}/{x}/{y}" + ".geojson";

        // id = "edge";
        // id = "master-test";
        return tileHost + "/services/" + id + "/tiles/{z}/{x}/{y}.pbf";
    };
    var _pbfLayerOpts = {
        "activity": controller.baseTilesLayerOptsF("activity"),
        "recent": controller.baseTilesLayerOptsF("recent"),
        "speed": controller.baseTilesLayerOptsF("speed"),
        "density": controller.baseTilesLayerOptsF("density"),
        "basic": controller.baseTilesLayerOptsF("basic"),
    };

    var _pbfOpts = function (optName) {
        if (_pbfLayerOpts.hasOwnProperty(optName)) {
            return _pbfLayerOpts[optName];
        }
        return {};
    };

    // https://leaflet.github.io/Leaflet.VectorGrid/vectorgrid-api-docs.html
    var _overlays = {
        "basic": L.layerGroup([
            L.vectorGrid.protobuf(_pbfURL("ia.level-23"), _pbfOpts("basic")),
            L.vectorGrid.protobuf(_pbfURL("rye.level-23"), _pbfOpts("basic")),
            // L.vectorGrid.protobuf(_pbfURL("genpop.level-23", _pbfOpts("basic-genpop"))), // TODO

            // L.vectorGrid.protobuf(_pbfURL("master"), _pbfOpts("basic")),
            L.vectorGrid.protobuf(_pbfURL("devop"), _pbfOpts("basic")),
            L.vectorGrid.protobuf(_pbfURL("edge"), _pbfOpts("basic")),
        ]),
        "activity": L.layerGroup([
            L.vectorGrid.protobuf(_pbfURL("ia.level-23"), _pbfOpts("activity")),
            L.vectorGrid.protobuf(_pbfURL("rye.level-23"), _pbfOpts("activity")),
            // L.vectorGrid.protobuf(_pbfURL("genpop.level-23", _pbfOpts("activity"))),

            // L.vectorGrid.protobuf(_pbfURL("master"), _pbfOpts("activity")),
            L.vectorGrid.protobuf(_pbfURL("devop"), _pbfOpts("activity")),
            L.vectorGrid.protobuf(_pbfURL("edge"), _pbfOpts("activity")),
        ]),
        "density": L.layerGroup([
            L.vectorGrid.protobuf(_pbfURL("ia.level-23"), _pbfOpts("density")),
            L.vectorGrid.protobuf(_pbfURL("rye.level-23"), _pbfOpts("density")),
            // L.vectorGrid.protobuf(_pbfURL("genpop.level-23", _pbfOpts("density"))),

            // L.vectorGrid.protobuf(_pbfURL("master"), _pbfOpts("density")),
            L.vectorGrid.protobuf(_pbfURL("devop"), _pbfOpts("density")),
            L.vectorGrid.protobuf(_pbfURL("edge"), _pbfOpts("density")),
        ]),
        "cats": L.layerGroup(),
        "snaps": controller.snapsClusterGroup,
        "laps": L.geoJSON(null, {
            style: {
                'color': '#b40021',

                'dashArray': '0', // https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray
                'weight': 4,
                'opacity': 0.62,

                // 'dashArray': '4 4', // https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray
                // 'weight': 2,
                // 'opacity': 1.00,
            },
            onEachFeature: function (feature, layer) {
                layer.myTag = 'geojsonTag';
                feature.properties.id = feature.properties.Name + feature.properties.Start;
            }
        }),

        /*
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              -118.37485447525978,
              48.03406758485708
            ],
            [
              -118.37483972311018,
              48.03331787021701
            ],
            [
              -118.37416246533394,
              48.033289172789175
            ],
            [
              -118.37412759661674,
              48.03402005542502
            ],
            [
              -118.37485447525978,
              48.03406758485708
            ]
          ]
        ]
      }
    }
  ]
}
         */
        "plats": new L.FeatureGroup()
    };

    var setPBFOpt = function (name) {
        view.sps = 0;

        const layer = _overlays[name];

        // Short circuit if the name is a hacky empty value.
        if (name === "") {
            _map.eachLayer((layer) => layer.redraw);
            // layer.redraw(); // redraw edge layer... will it work?
            return;
        }

        const mapHasLayer = _map.hasLayer(layer);
        if (!mapHasLayer) {
            _map.addLayer(layer);
        } else {
            _map.removeLayer(layer);
        }

        // for (var i = 0; i < lays.length; i++) {
        //     if (_map.hasLayer(lays[i])) {
        //         // _map.removeLayer(lays[i]);
        //         lays[i].remove();
        //         lays[i].vectorTileLayerStyles = vectorTileLayerStyles[name];
        //         lays[i].redraw();
        //     }
        // }

        _currentPBFLayerOpt = name;
        model.setState("tileLayer", name);
        // model.setLocalStore("l", name);

        // var ls = _pbfLayers(_currentPBFLayerOpt);
        // var keys = Object.keys(ls); // master, devop, edge

        // for (var j = 0; j < keys.length; j++) {
        //     var l = ls[keys[j]].bringToFront().setZIndex(10).on("viewreset", function(e) { view.sps = 0; }).on("load", function(e) {
        //         view.$shownPointsShower.text("" + numberWithCommas(view.sps));
        //     });
        //     l.pane = "overlayPane";
        //     _map.addLayer(l);
        //     lays.push(l);
        // };

        // if (name === "activity") {
        //     $('#activity-legend').show();
        // }  else {
        //     $('#activity-legend').hide();
        // }
        // setLinkValue();
    };

    var _mapOnMoveEnd = function () {
        var b = _map.getCenter();
        model.setState("lat", b.lat.toFixed(5)).setState("lng", b.lng.toFixed(5));
        // model.setLocalStore("y", b.lat);
        // model.setLocalStore("x", b.lng);
        // model.setLocalStore("z", _map.getZoom());
        // fetchLinestrings()

        // setLinkValue();
        // TODO get moar visits and append them

        let lapMaps = getLapMaps();
        const mapBounds = getMap().getBounds();
        for (let lm of lapMaps) {
            const $lapCard = $(`.lap-card#lap-card-${lm.data.properties.UUID}-${lm.data.properties.Start}`);
            if (!view.$lapsColFilterToMapArea.is(':checked')) {
                // Show everything if the box is not checked.
                $lapCard.show();
                // console.log('show card');
                continue
            }
            // Show only on-map laps.
            if (!mapBounds.intersects(lm.bounds)) $lapCard.hide();
            else $lapCard.show();
        }
        refreshLapMaps();
    }

    var _zoomCSS = function () {
        const z = _map.getZoom();
        const container = _map.getContainer();

        for (let i = 0; i <= 20; i++) {
            container.classList.remove(`z${String(i)}`);
        }
        if (z) {
            container.classList.add(`z${String(z)}`);
        }
    }

    var _mapOnZoomEnd = function () {
        // model.setLocalStore("z", _map.getZoom());

        const z = _map.getZoom();
        cd("zoom", z);
        model.setState("zoom", z);

        _zoomCSS();

        $('#zoom-display').html(`<span>Z${z}</span>`);

        // setLinkValue();
    };
    var _mapOnBaselayerChange = function (ev) {
        // model.setLocalStore("t", ev.name);
        ev.layer.bringToBack();
        model.setState("baseLayer", ev.name);
        // setLinkValue();
    };

    var _mapOnOverlayAdd = function (ev) {
        console.log('map onOverlayAdd', ev);
        model.setState(`overlay_${ev.name}`, true);
        if (ev.name === "activity") {
            $('#activity-legend').show();
        }
    };

    var _mapOnOverlayRemove = function (ev) {
        console.log('map onOverlayRemove', ev);
        model.setState(`overlay_${ev.name}`, false);
        if (ev.name === "activity") {
            $('#activity-legend').hide();
        }
    };

    var _mapOnLoad = function () {
        // model.setLocalStore("y", b.lat);
        // model.setLocalStore("x", b.lng);
        // model.setLocalStore("z", _map.getZoom());
        // setLinkValue();
        console.log('map loaded');

        view.$map.focus();
        // _zoomCSS();
    };
    var _mapOnClick = function () {
    };

    var refreshLapMaps = function () {
        for (let i = 0; i < lapMaps.length; i++) {
            const lm = lapMaps[i];
            // console.log('invalidating map size', lm);

            // L.geoJSON(lm.data, {
            //     style: {
            //         'color': activityColorLegend[lm.data.properties.Activity],
            //         'weight': 2,
            //     },
            // }).addTo(lm.map);

            // lm.map.fitBounds(lm.bounds);

            const myLayer = lm.layer || L.geoJSON(lm.data, {
                style: {
                    'color': activityColorLegend[lm.data.properties.Activity],
                    'weight': 2,
                },
            });

            if (!lm.map.hasLayer(myLayer)) {
                lapMaps[i].layer = myLayer;
                lapMaps[i].layer.addTo(lm.map);
            }


            lm.map.invalidateSize();
            lm.map.fitBounds(lm.bounds);
            // if (!lm.map.hasLayer(myLayer)) {


            // }

            // const $mapContainer = $(lm.map.getContainer());
            // if ($mapContainer.intersectsViewport()) lm.map.invalidateSize();
            // else lm.map.invalidateSize();
            // else setTimeout(() => {
            //     lm.map.invalidateSize();
            // }, 500);

            // lm.map.layers.forEach((layer) => {
            //     layer.remove();
            // })
        }
    };

    var geoCoords2LatLng = function (coordsArray) {
        return L.latLng({lat: coordsArray[1], lng: coordsArray[0]});
    }

    var addMiniLeaflet = function (feature) {
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

        // console.log(feature);
        try {
            var _mymap = L.map(`lap-map-container-${feature.properties.Name}-${feature.properties.Start}`, {
                dragging: false,
                boxZoom: false,
                doubleClickZoom: false,
                zoomControl: false,
                scrollWheelZoom: false,
                attributionControl: false,
            });

            // $(_mymap.getContainer()).on('resize', function () {
            //     _mymap.invalidateSize();
            //     _mymap.fitBounds(lm.bounds);
            // });

            _mymap.setView(geoCoords2LatLng(feature.geometry.coordinates[0]), 13);
            // console.log('mini leaflet', _mymap);

            const markStart = L.circleMarker(geoCoords2LatLng(feature.geometry.coordinates[0]), {
                radius: 8,
                fillColor: "#3eb23b",
                color: "#3eb23b",
                weight: 1,
                opacity: 0.5,
                fillOpacity: 0.5
            });
            markStart.addTo(_mymap);

            const markStop = L.circleMarker(geoCoords2LatLng(feature.geometry.coordinates[feature.geometry.coordinates.length - 1]), {
                radius: 8,
                fillColor: "#fa3903",
                color: "#fa3903",
                weight: 1,
                opacity: 0.5,
                fillOpacity: 0.5
            });
            markStop.addTo(_mymap);

            // L.control.zoom({position: "topright"}).addTo(_mymap);
            _mymap.addLayer(L.tileLayer(_mbtilesURL("ciy7ijqu3001a2rocq88pi8s4"), LtileLayerDefaults));

            // force is a bool.
            // if truthy, the main map will be forcibly adjusted to
            // center on the linestring.
            // if falsey, the main map will only be adjusted to center on the linestring
            // if the linestring intersects with the current view.
            const onMiniMapClick = function () {

                const $myLapCard = $(`.lap-card#lap-card-${feature.properties.UUID}-${feature.properties.Start}`);
                const $myLapCardAlreadyFocused = $myLapCard.hasClass('focused');


                // on small (mobile) screens
                if (!$myLapCardAlreadyFocused && $("#laps-column").width() > window.innerWidth * 3 / 4) {
                    // $("#lapsRenderButton").toggleClass('btn-dark btn-light')
                    $("#laps-column").addClass('collapse').removeClass('show');
                    // setTimeout(() => {

                    // $('#map').focus();
                    //
                    // }, 50);
                } else {

                }
                _map.invalidateSize();

                // if (!$myLapCardAlreadyFocused) _map.fitBounds(bounds)
                // ->           lm.map.setView(lm.bounds.getCenter());

                if (!$myLapCardAlreadyFocused && !_map.getBounds().contains(bounds)) {
                    _map.fitBounds(bounds);
                }
                //
                // if (force) {
                //
                // } else {
                //     const isIntersecting = _map.getBounds().intersects(bounds);
                //     if (!$myLapCardAlreadyFocused && isIntersecting) _map.setView(bounds.getCenter());
                // }

                $('.lap-card').removeClass('focused');

                // Set the style of the corresponding object on the big map.
                _map.eachLayer((layer) => {

                    // Initial experiment:
                    // if (layer.myTag && layer.myTag === 'geojsonTag') console.log('myTag layer:', layer);
                    // else console.log('tag miss', layer);

                    // GeoJSON via linestring/ endpoint assigns ids to the geojson features.
                    // feature.properties.id = feature.properties.Name + feature.properties.Start;
                    let _linestringId = feature.properties.Name + feature.properties.Start;
                    if (!$myLapCardAlreadyFocused && layer.myTag && layer.myTag === 'geojsonTag' && layer.feature.properties.id === _linestringId) {
                        console.log('myTag layer:', layer);

                        // This is the corresponding linestring from the laps view, but already on the big map.
                        const f = layer.feature;
                        layer.setStyle({
                            color: activityColorLegend[f.properties.Activity],
                            dashArray: null,
                            weight: 4,
                        });
                        layer.bringToFront();

                        $myLapCard.addClass('focused');


                    } else if (layer.myTag && layer.myTag === 'geojsonTag') {
                        // Reset the original geojson style.
                        layer.setStyle({
                            'color': 'darkgreen',
                            'weight': 2,
                            'dashArray': '8 12', // https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray
                            'opacity': 1.00,
                        })
                    }
                });

            };

            _mymap.on('click', onMiniMapClick);
            // if (!isSmallScreen()) _mymap.on('mouseover', onMapFocus(false));

            lapMaps.push({map: _mymap, data: feature, bounds: bounds});

        } catch (err) {
            console.error(err)
        }


        // __map.setView(feature.geometry.coordinates[1])

        // __map.eachLayer(function (layer) {
        //     layer.redraw();
        // })
    }

    var handleGeoJSONLaps = function (featureCollection) {
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
<div id="lap-card-${feature.properties.UUID}-${feature.properties.Start}" class="card mb-3 lap-card" style="min-height: 200px;">
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
                       <span class='text-muted '>${moment(feature.properties.Start * 1000).format('llll')} </span>
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
                    <small style="color: darkgreen;" class=""><strong>${feature.properties.MeasuredSimplifiedTraversedKilometers.toFixed(1)}km</strong></small>
                    <small style="color: darkgreen;" class="">${hmsFromSeconds(feature.properties.Duration)}</small>
                    </span>
                </div>
            </div>
            
</div>
            <div id="lap-map-container-${feature.properties.Name}-${feature.properties.Start}" class="flex-fill lap-leaflet-map"></div>
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

        _mapOnMoveEnd()
    }

    /**
     * @param {number} tstart is start time in seconds
     * @param {number} tend is end time in seconds
     */
    var fetchLinestrings = function () {

        let tstart = model.getState().linestringStart
        let tend = model.getState().linestringEnd

        // HACK: Override

        tend = moment().unix();
        tstart = moment().subtract(5, 'day').startOf('day').unix();

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

                        _overlays["laps"].removeFrom(_map);
                        _overlays["laps"].addData(jsonData);

                        // Assign the _overlays["cat glaps"] anew.
                        const s = model.getState();
                        const pbfOverlayLayerLaps = _overlays["laps"];
                        if (s.overlay_laps === "true" || s.overlay_laps === true) {
                            _overlays["laps"].addTo(_map);
                        } else {
                            if (_map.hasLayer(pbfOverlayLayerLaps)) _map.removeLayer(pbfOverlayLayerLaps);
                        }

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

    var initMap = function () {
        var s = model.getState();

        cd('map init state', s);

        _map = L.map('map', {
            keyboard: true,
            keyboardPanDelta: 140,
            minZoom: 3,
            maxZoom: 18,
            center: [+s.lat, +s.lng], // [32, -80],
            zoom: +s.zoom,
            noWrap: true,
            layers: [_mapboxLayers[s.baseLayer]],
            // preferCanvas: true
            pmIgnore: false,
        });

        _map
            .on("moveend", _mapOnMoveEnd)
            .on("zoomend", _mapOnZoomEnd)
            .on("baselayerchange", _mapOnBaselayerChange)
            .on("overlayadd", _mapOnOverlayAdd)
            .on("overlayremove", _mapOnOverlayRemove)
            .on("load", _mapOnLoad)
            .on("click", _mapOnClick);

        // leaflet.draw

        // var MyCustomMarker = L.Icon.extend({
        //     options: {
        //         shadowUrl: null,
        //         iconAnchor: new L.Point(12, 12),
        //         iconSize: new L.Point(24, 24),
        //         iconUrl: 'link/to/image.png'
        //     }
        // });
        // var drawOptions = {
        //     position: 'bottomright',
        //     draw: {
        //         polyline: {
        //             showLength: true,
        //             shapeOptions: {
        //                 color: '#f357a1',
        //                 weight: 10
        //             }
        //         },
        //         polygon: {
        //             showArea: true,
        //             allowIntersection: false, // Restricts shapes to simple polygons
        //             drawError: {
        //                 color: '#e1e100', // Color the shape will turn when intersects
        //                 message: '<strong>Oh snap!<strong> you can\'t draw that!' // Message that will show when intersect
        //             },
        //             shapeOptions: {
        //                 color: '#bada55'
        //             }
        //         },
        //         circle: false, // Turns off this drawing tool
        //         rectangle: {
        //             shapeOptions: {
        //                 clickable: false
        //             }
        //         },
        //         marker: {
        //             icon: new MyCustomMarker()
        //         }
        //     },
        //     edit: {
        //         featureGroup: _overlays["plats"], //REQUIRED!!
        //         remove: true
        //     }
        // };
        //
        // var drawControl = new L.Control.Draw(drawOptions);
        // _map.addControl(drawControl);
        //
        // _map.addLayer(_overlays["plats"]);
        //
        // _map.on(L.Draw.Event.CREATED, function (e) {
        //     console.log('created', e.layer.toGeoJSON());
        //     // var type = e.layerType,
        //     //     layer = e.layer;
        //     //
        //     // console.log('event created', e);
        //     //
        //     // if (type === 'marker') {
        //     //     layer.bindPopup('A popup!');
        //     // }
        //
        //     _overlays["plats"].addLayer(e.layer);
        // });
        //
        // _map.on(L.Draw.Event.EDITED, (e) => {
        //     console.log('edited', e);
        // });
        // _map.on(L.Draw.Event.DELETED, (e) => {
        //     console.log('deleted', e);
        // });

        // EO leaflet.draw


        // // LEAFLET-GEOMAN
        // // add Leaflet-Geoman controls with some options to the map
        //
        // _map.pm.addControls({
        //     position: 'bottomright',
        //     drawCircle: false,
        // });
        //
        // _map.on('pm:drawend', (e) => {
        //     console.log('drawend', e);
        // });
        // _map.on('pm:create', (e) => {
        //     console.log('create', e);
        //     e.layer.setStyle({ pmIgnore: false });
        //     L.PM.reInitLayer(e.layer);
        // });
        // _map.on('pm:edit', (e) => {
        //     console.log('edit', e);
        // });

        // // END LEAFLET GEOMAN

        _zoomCSS();
        _mapOnZoomEnd();

        // $('#map').resize(() => {
        //     console.log('map resize event');
        //     _map.invalidateSize();
        // });

        // _map.zoomControl.setOptions({position: "bottomleft"});

        // base, over, opts

        // L.control.layers(_mapboxLayers, null, { position: "topleft", collapsed: isSmallScreen() }).addTo(_map);

        _layerControl = L.control
            .layers(_mapboxLayers, _overlays,
                {
                    position: "topleft",
                    collapsed: isSmallScreen(),
                })
            .addTo(_map);

        // L.control.zoom({position: "bottomleft"}).addTo(_map);

        fetchLinestrings()

        // add or remove overlay / cat tile layers from the map per the retrieved model state
        const pbfOverlayLayerActivity = _overlays["activity"];
        if (s.overlay_activity === "true" || s.overlay_activity === true) {
            if (!_map.hasLayer(pbfOverlayLayerActivity)) _map.addLayer(pbfOverlayLayerActivity);
            // _map.addLayer(pbfOverlayLayerActivity);
            $('#activity-legend').show();
        } else {
            if (_map.hasLayer(pbfOverlayLayerActivity)) _map.removeLayer(pbfOverlayLayerActivity);
            $('#activity-legend').hide();
        }

        const pbfOverlayLayerDensity = _overlays["density"];
        if (s.overlay_density === "true" || s.overlay_density === true) {
            if (!_map.hasLayer(pbfOverlayLayerDensity)) _map.addLayer(pbfOverlayLayerDensity);
        } else {
            if (_map.hasLayer(pbfOverlayLayerDensity)) _map.removeLayer(pbfOverlayLayerDensity);
        }

        const pbfOverlayLayerBasic = _overlays["basic"];
        if (s.overlay_basic === "true" || s.overlay_basic === true) {
            if (!_map.hasLayer(pbfOverlayLayerBasic)) _map.addLayer(pbfOverlayLayerBasic);
        } else {
            if (_map.hasLayer(pbfOverlayLayerBasic)) _map.removeLayer(pbfOverlayLayerBasic);
        }


        const pbfOverlayLayerSnaps = _overlays["snaps"];
        if (s.overlay_snaps === "true" || s.overlay_snaps === true) {
            if (!_map.hasLayer(pbfOverlayLayerSnaps)) _map.addLayer(pbfOverlayLayerSnaps);
        } else {
            if (_map.hasLayer(pbfOverlayLayerSnaps)) _map.removeLayer(pbfOverlayLayerSnaps);
        }

        // fetch(`https://raw.githubusercontent.com/whilei/riverway-gis/main/orchard-bounds.geo.json`)
        fetch(s.platsEndpoint)
            .then((res) => {
                res.json()
                    .then((data) => {
                        console.log('plats got data', data);
                        if (!Array.isArray(data)) data = [data];

                        const defaultProperties = {
                            'layerOptions': {
                                'color': '#00f',
                                'weight': 2,
                                'opacity': 0.5,
                            }
                        };

                        for (let featureCollection of data) {
                            let featureCollectionLayerOptions = defaultProperties;
                            if (!!featureCollection.properties?.layerOptions) {
                                featureCollectionLayerOptions = featureCollection.properties.layerOptions;
                            }
                            // _overlays["plats"].addData(data);
                            const newFeatureCollectionLayer = L.geoJSON(null, {
                                style: featureCollectionLayerOptions,
                                onEachFeature: (feature, layer) => {
                                    console.log('plat onEachFeature feature', feature, layer)

                                    // Assign the provided data properties to override the layer options directly.
                                    Object.assign(layer.options, feature.properties?.layerOptions || {});

                                    // https://leafletjs.com/SlavaUkraini/examples/geojson/
                                    // does this feature have a property named popupContent?
                                    if (feature.properties && feature.properties.popupContent) {
                                        const l = layer.bindPopup(feature.properties.popupContent) // .openPopup()
                                        console.log('binding popup', l);
                                    }
                                },
                                pointToLayer: function (feature, latlng) {
                                    if (feature.geometry.type !== "Point") return;

                                    if (feature.properties?.marker) {
                                        // https://leafletjs.com/SlavaUkraini/reference.html#icon
                                        let marker = L.marker(latlng, feature.properties.marker);

                                        if (feature.properties.marker.icon) marker.setIcon(L.icon(feature.properties.marker.icon));
                                        else if (feature.properties.marker.divIcon) marker.setIcon(L.divIcon(feature.properties.marker.divIcon));

                                        console.log('marker', marker);
                                        return marker;
                                    }

                                    // marker.setOptions()
                                    // Default
                                    return L.circleMarker(latlng, {
                                        radius: 8,
                                        color: "#00f",
                                        opacity: 0,
                                        fillColor: "#00f",
                                        fillOpacity: 0.5,
                                    })
                                }
                            });
                            _overlays["plats"].addLayer(newFeatureCollectionLayer);
                            // newFeatureCollectionLayer.addTo(_map);
                            newFeatureCollectionLayer.addData(featureCollection);
                        }
                        if (s.overlay_plats === "true" || s.overlay_plats === true) _overlays["plats"].addTo(_map);
                    })

            })
            .catch((err) => {
                console.error('fetch plats errored', err);
            })

        const pbfOverlayLayerPlats = _overlays["plats"];
        if (s.overlay_plats === "true" || s.overlay_plats === true) {
            if (!_map.hasLayer(pbfOverlayLayerPlats)) _map.addLayer(pbfOverlayLayerPlats);
        } else {
            if (_map.hasLayer(pbfOverlayLayerPlats)) _map.removeLayer(pbfOverlayLayerPlats);
        }

        // _currentPBFLayerOpt = s.tileLayer;
        // setPBFOpt(_currentPBFLayerOpt);
        view.$map.focus();

    };

    var getLayerControl = function () {
        return _layerControl;
    }

    var getMap = function () {
        return _map;
    };

    var goUpdateEdge = function () {
        setPBFOpt("");
        setTimeout(goUpdateEdge, 60 * 1000);
    };

    var getLapMaps = function () {
        return lapMaps;
    }

    var getOverlays = function () {
        return _overlays;
    }

    return {
        init: initMap,
        getMap: getMap,
        getLayerControl: getLayerControl,
        fetchLinestrings: fetchLinestrings,
        setLayer: setLayer,
        getOverlays: getOverlays,
        setPBFOpt: setPBFOpt,
        goUpdateEdge: goUpdateEdge,
        refreshLapMaps: refreshLapMaps,
        getLapMaps: getLapMaps,
    };
}
