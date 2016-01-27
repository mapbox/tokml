var strxml = require('strxml'),
    tag = strxml.tag,
    encode = strxml.encode;

module.exports = function tokml(geojson, options) {

    options = options || {
        documentName: undefined,
        documentDescription: undefined,
        name: 'name',
        description: 'description',
        simplestyle: false,
        timestamp: 'timestamp'
    };

    return '<?xml version="1.0" encoding="UTF-8"?>' +
        tag('kml',
            tag('Document',
                documentName(options) +
                documentDescription(options) +
                root(geojson, options)
               ), [['xmlns', 'http://www.opengis.net/kml/2.2']]);
};

function feature(options, styleHashesArray) {
    return function(_) {
        if (!_.properties || !geometry.valid(_.geometry)) return '';
        var geometryString = geometry.any(_.geometry);
        if (!geometryString) return '';
        
        var styleDefinition = '',
            styleReference = '';
        if (options.simplestyle) {
            var styleHash = hashStyle(_.properties);
            if (styleHash) {
                if (geometry.isPoint(_.geometry) && hasMarkerStyle(_.properties)) {
                    if (styleHashesArray.indexOf(styleHash) === -1) {
                        styleDefinition = markerStyle(_.properties, styleHash);
                        styleHashesArray.push(styleHash);
                    }
                    styleReference = tag('styleUrl', '#' + styleHash);
                } else if (geometry.isPolygon(_.geometry) && hasPolygonStyle(_.properties)) {
                    if (styleHashesArray.indexOf(styleHash) === -1) {
                        styleDefinition = polygonStyle(_.properties, styleHash);
                        styleHashesArray.push(styleHash);
                    }
                    styleReference = tag('styleUrl', '#' + styleHash);
                } else if (geometry.isLine(_.geometry) && hasLineStyle(_.properties)) {
                    if (styleHashesArray.indexOf(styleHash) === -1) {
                        styleDefinition = lineStyle(_.properties, styleHash);
                        styleHashesArray.push(styleHash);
                    }
                    styleReference = tag('styleUrl', '#' + styleHash);
                }
                // TODO: style for MultiGeometry is not supported!
            }
        }
        
        return styleDefinition + tag('Placemark',
            name(_.properties, options) +
            description(_.properties, options) +
            extendeddata(_.properties) +
            timestamp(_.properties, options) +
            geometryString +
            styleReference);
    };
}

function root(_, options) {
    if (!_.type) return '';
    var styleHashesArray = [];
            
    switch (_.type) {
        case 'FeatureCollection':
            if (!_.features) return '';
            return _.features.map(feature(options, styleHashesArray)).join('');
        case 'Feature':
            return feature(options, styleHashesArray)(_);
        default:
            return feature(options, styleHashesArray)({
                type: 'Feature',
                geometry: _,
                properties: {}
            });
    }
}

function documentName(options) {
    return (options.documentName !== undefined) ? tag('name', options.documentName) : '';
}

function documentDescription(options) {
    return (options.documentDescription !== undefined) ? tag('description', options.documentDescription) : '';
}

function name(_, options) {
    return _[options.name] ? tag('name', encode(_[options.name])) : '';
}

function description(_, options) {
    return _[options.description] ? tag('description', encode(_[options.description])) : '';
}

function timestamp(_, options) {
    return _[options.timestamp] ? tag('TimeStamp', tag('when', encode(_[options.timestamp]))) : '';
}

// ## Geometry Types
//
// https://developers.google.com/kml/documentation/kmlreference#geometry
var geometry = {
    Point: function(_) {
        return tag('Point', tag('coordinates', _.coordinates.join(',')));
    },
    LineString: function(_) {
        return tag('LineString', tag('coordinates', linearring(_.coordinates)));
    },
    Polygon: function(_) {
        if (!_.coordinates.length) return '';
        var outer = _.coordinates[0],
            inner = _.coordinates.slice(1),
            outerRing = tag('outerBoundaryIs',
                tag('LinearRing', tag('coordinates', linearring(outer)))),
            innerRings = inner.map(function(i) {
                return tag('innerBoundaryIs',
                    tag('LinearRing', tag('coordinates', linearring(i))));
            }).join('');
        return tag('Polygon', outerRing + innerRings);
    },
    MultiPoint: function(_) {
        if (!_.coordinates.length) return '';
        return tag('MultiGeometry', _.coordinates.map(function(c) {
            return geometry.Point({ coordinates: c });
        }).join(''));
    },
    MultiPolygon: function(_) {
        if (!_.coordinates.length) return '';
        return tag('MultiGeometry', _.coordinates.map(function(c) {
            return geometry.Polygon({ coordinates: c });
        }).join(''));
    },
    MultiLineString: function(_) {
        if (!_.coordinates.length) return '';
        return tag('MultiGeometry', _.coordinates.map(function(c) {
            return geometry.LineString({ coordinates: c });
        }).join(''));
    },
    GeometryCollection: function(_) {
        return tag('MultiGeometry',
            _.geometries.map(geometry.any).join(''));
    },
    valid: function(_) {
        return _ && _.type && (_.coordinates ||
            _.type === 'GeometryCollection' && _.geometries.every(geometry.valid));
    },
    any: function(_) {
        if (geometry[_.type]) {
            return geometry[_.type](_);
        } else {
            return '';
        }
    },
    isPoint: function(_) {
        return _.type === 'Point' ||
        _.type === 'MultiPoint';
    },
    isPolygon: function(_) {
        return _.type === 'Polygon' ||
        _.type === 'MultiPolygon';
    },
    isLine: function(_) {
        return _.type === 'LineString' ||
        _.type === 'MultiLineString';
    }
};

function linearring(_) {
    return _.map(function(cds) { return cds.join(','); }).join(' ');
}

// ## Data
function extendeddata(_) {
    return tag('ExtendedData', pairs(_).map(data).join(''));
}

function data(_) {
    return tag('Data', tag('value', encode(_[1])), [['name', encode(_[0])]]);
}

// ## Style
function markerStyle(_, styleHash) {
    return tag('Style',
        tag('IconStyle',
            tag('Icon',
                tag('href', iconUrl(_)))) +
        iconSize(_), [['id', styleHash]]);
}

function iconUrl(_) {
    var size = _['marker-size'] || 'medium',
        symbol = _['marker-symbol'] ? '-' + _['marker-symbol'] : '',
        color = (_['marker-color'] || '7e7e7e').replace('#', '');

    return 'https://api.tiles.mapbox.com/v3/marker/' + 'pin-' + size.charAt(0) +
        symbol + '+' + color + '.png';
}

function iconSize(_) {
    return tag('hotSpot', '', [
        ['xunits', 'fraction'],
        ['yunits', 'fraction'],
        ['x', 0.5],
        ['y', 0.5]
    ]);
}

function hasMarkerStyle(_) {
    return !!(_['marker-size'] || _['marker-symbol'] || _['marker-color']);
}

function hasPolygonStyle(_) {
    for (var key in _) {
        if ({
            "stroke": true,
            "stroke-opacity": true,
            "stroke-width": true,
            "fill": true,
            "fill-opacity": true
        }[key]) return true;
    }
}

function hasLineStyle(_) {
    for (var key in _) {
        if ({
            "stroke": true,
            "stroke-opacity": true,
            "stroke-width": true
        }[key]) return true;
    }
}

function hashStyle(_) {
    return (_['marker-symbol'] || '') +
        (_['marker-color'] || '').replace('#', '') +
        (_['marker-size'] || '') +
        (_['stroke'] || '').replace('#', '') +
        (_['stroke-width'] || '').replace('.', '') +
        (_['stroke-opacity'] || '').replace('.', '') +
        (_['fill'] || '').replace('#', '') +
        (_['fill-opacity'] || '').replace('.', '');
}

function polygonStyle(_, styleHash) {
    var lineStyle = tag('LineStyle', '', [
        ['color', _.stroke || '555555'],
        ['width', _['stroke-width'] === undefined ? 2 : _['stroke-width']]
    ]);
    var polyStyle = tag('PolyStyle', '', [
        ['color', _.fill || '555555']
    ]);
    return tag('Style', lineStyle + polyStyle, [['id', styleHash]]);
}

function lineStyle(_, styleHash) {
    var lineStyle = tag('LineStyle', '', [
        ['color', _.stroke || '555555'],
        ['width', _['stroke-width'] === undefined ? 2 : _['stroke-width']]
    ]);
    return tag('Style', lineStyle, [['id', styleHash]]);
}

// ## Helpers
function pairs(_) {
    var o = [];
    for (var i in _) o.push([i, _[i]]);
    return o;
}
