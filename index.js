module.exports = tokml;

var header = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<kml xmlns="http://www.opengis.net/kml/2.2">\n',
    footer = '</kml>';

function attr(_) {
    return ' ' + (_ ? (' ' + _.map(function(a) {
        return a[0] + '="' + a[1] + '"';
    }).join(' ')) : '');
}

function tag(el, contents, attributes) {
    return '<' + el + attr(attributes) + '>' + contents + '</' + el + '>\n';
}

function point(_) {
    return tag('Point', tag('coordinates', _.coordinates.join(',')));
}

function linestring(_) {
    return '';
}

function polygon(_) {
    return '';
}

function extendeddata(_) {
    return tag('ExtendedData', pairs(_).map(data));
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

function tokml(geojson) {
    return header +
        geojson.features.map(feature) +
        footer;
}

function pairs(_) {
    var o = [];
    for (var i in _) o.push([i, _[i]]);
    return o;
}
