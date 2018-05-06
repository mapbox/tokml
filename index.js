var esc = require('xml-escape');
var strxml = require('strxml'),
    tag = strxml.tag;

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
        tag('kml', {'xmlns': 'http://www.opengis.net/kml/2.2'},
            tag('Document',
                documentName(options) +
                documentDescription(options) +
                root(geojson, options)
               ));
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
                } else if ((geometry.isPolygon(_.geometry) || geometry.isLine(_.geometry)) && 
                    hasPolygonAndLineStyle(_.properties)) {
                    if (styleHashesArray.indexOf(styleHash) === -1) {
                        styleDefinition = polygonAndLineStyle(_.properties, styleHash);
                        styleHashesArray.push(styleHash);
                    }
                    styleReference = tag('styleUrl', '#' + styleHash);
                }
                // Note that style of GeometryCollection / MultiGeometry is not supported
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
    return _[options.name] ? tag('name', esc(_[options.name])) : '';
}

function description(_, options) {
    return _[options.description] ? tag('description', esc(_[options.description])) : '';
}

function timestamp(_, options) {
    return _[options.timestamp] ? tag('TimeStamp', tag('when', esc(_[options.timestamp]))) : '';
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
            _.type === 'GeometryCollection' && _.geometries && _.geometries.every(geometry.valid));
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
    return tag('ExtendedData', {}, pairs(_).map(data).join(''));
}

function data(_) {
    return tag('Data', {'name': _[0]}, tag('value', {}, esc(_[1] ? _[1].toString() : '')));
}

// ## Marker style
function hasMarkerStyle(_) {
    return !!(_['marker-size'] || _['marker-symbol'] || _['marker-color']);
}

function markerStyle(_, styleHash) {
    return tag('Style', {'id': styleHash},
            tag('IconStyle',
                tag('Icon',
                    tag('href', iconUrl(_)))
                ) + iconSize(_)
            );
}

function iconUrl(_) {
    var size = _['marker-size'] || 'medium',
        symbol = _['marker-symbol'] ? '-' + _['marker-symbol'] : '',
        color = (_['marker-color'] || '7e7e7e').replace('#', '');

    return 'https://api.tiles.mapbox.com/v3/marker/' + 'pin-' + size.charAt(0) +
        symbol + '+' + color + '.png';
}

function iconSize(_) {
    return tag('hotSpot', {
        'xunits': 'fraction',
        'yunits': 'fraction',
        'x': '0.5',
        'y': '0.5'
    }, '');
}

// ## Polygon and Line style
function hasPolygonAndLineStyle(_) {
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

function polygonAndLineStyle(_, styleHash) {
    var lineStyle = tag('LineStyle', tag('color', hexToKmlColor(_['stroke'], _['stroke-opacity']) || 'ff555555') +
        tag('width', {}, _['stroke-width'] === undefined ? 2 : _['stroke-width'])
    );
    
    var polyStyle = '';
    
    if (_['fill'] || _['fill-opacity']) {
        polyStyle = tag('PolyStyle', 
            tag('color', {}, hexToKmlColor(_['fill'], _['fill-opacity']) || '88555555')
        );
    }
    
    return tag('Style', {'id': styleHash}, lineStyle + polyStyle);
}

// ## Style helpers
function hashStyle(_) {
    var hash = '';
    
    if (_['marker-symbol']) hash = hash + 'ms' + _['marker-symbol'];
    if (_['marker-color']) hash = hash + 'mc' + _['marker-color'].replace('#', '');
    if (_['marker-size']) hash = hash + 'ms' + _['marker-size'];
    if (_['stroke']) hash = hash + 's' + _['stroke'].replace('#', '');
    if (_['stroke-width']) hash = hash + 'sw' + _['stroke-width'].toString().replace('.', '');
    if (_['stroke-opacity']) hash = hash + 'mo' + _['stroke-opacity'].toString().replace('.', '');
    if (_['fill']) hash = hash + 'f' + _['fill'].replace('#', '');
    if (_['fill-opacity']) hash = hash + 'fo' + _['fill-opacity'].toString().replace('.', '');
    
    return hash;
}

function hexToKmlColor(hexColor, opacity) {
    if (typeof hexColor !== 'string') return '';
    
    hexColor = hexColor.replace('#', '').toLowerCase();
    
    if (hexColor.length === 3) {
        hexColor = hexColor[0] + hexColor[0] + 
        hexColor[1] + hexColor[1] + 
        hexColor[2] + hexColor[2];
    } else if (hexColor.length !== 6) {
        return '';
    }
    
    var r = hexColor[0] + hexColor[1];
    var g = hexColor[2] + hexColor[3];
    var b = hexColor[4] + hexColor[5];
    
    var o = 'ff';
    if (typeof opacity === 'number' && opacity >= 0.0 && opacity <= 1.0) {
        o = (opacity * 255).toString(16);
        if (o.indexOf('.') > -1) o = o.substr(0, o.indexOf('.'));
        if (o.length < 2) o = '0' + o;
    }
    
    return o + b + g + r;
}

// ## General helpers
function pairs(_) {
    var o = [];
    for (var i in _){
        if(_[i]){
            o.push([i, _[i]]);
        }else{
            o.push([i, '']);
        }
    }
    return o;
}