module.exports = tokml;

var header = '<?xml version="1.0" encoding="UTF-8"?>' +
    '<kml xmlns="http://www.opengis.net/kml/2.2">',
    footer = '</kml>';


// ## Geometry Types
//
// https://developers.google.com/kml/documentation/kmlreference#geometry
function point(_) {
    return tag('Point', tag('coordinates', _.coordinates.join(',')));
}

function linestring(_) {
    return tag('LineString', tag('coordinates', linearring(_.coordinates)));
}

function linearring(_) {
    return _.map(function(cds) { return cds.join(','); }).join(' ');
}

function polygon(_) {
    return tag('Polygon',
        tag('outerBoundaryIs',
            tag('LinearRing',
                tag('coordinates', linearring(_.coordinates[0])))));
}

// ## Data
function extendeddata(_) {
    return tag('ExtendedData', pairs(_).map(data).join(''));
}

function data(_) {
    return tag('Data', _[1], [['name', _[0]]]);
}

var geometry = {
    Point: point,
    LineString: linestring,
    Polygon: polygon
};

function feature(_) {
    return tag('Placemark',
        geometry[_.geometry.type](_.geometry) +
        extendeddata(_.properties));
}

// # tokml
function tokml(geojson) {
    return header +
        geojson.features.map(feature).join('') +
        footer;
}

// ## Helpers
function pairs(_) {
    var o = [];
    for (var i in _) o.push([i, _[i]]);
    return o;
}

function attr(_) {
    return _ ? (' ' + _.map(function(a) {
        return a[0] + '="' + a[1] + '"';
    }).join(' ')) : '';
}

function tag(el, contents, attributes) {
    return '<' + el + attr(attributes) + '>' + contents + '</' + el + '>';
}
