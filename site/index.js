var convert = document.getElementById('convert'),
    convertRaw = document.getElementById('convert-raw'),
    mapGeoJSON = document.getElementById('map-geojson'),
    mapid = document.getElementById('map-id'),
    xhr = require('corslite'),
    saveAs = require('filesaver.js'),
    tokml = require('../');

convert.onclick = function() {
    xhr('http://api.tiles.mapbox.com/v3/' + mapid.value + '/markers.geojson', onload, true);
    function onload(err, resp) {
        if (err) return alert(err);
        else return run(JSON.parse(resp.response));
    }
};

convertRaw.onclick = function() {
    run(JSON.parse(mapGeoJSON.value));
};

function run(gj) {
    saveAs(new Blob([tokml(gj)], {
        type: 'application/vnd.google-earth.kml+xml'
    }), 'map.kml');
}
