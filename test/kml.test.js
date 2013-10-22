var expect = require('expect.js'),
    fs = require('fs'),
    tokml = require('../');

describe('tokml', function() {
    describe('geometry', function() {

        it('point', function() {
            expect(tokml(file('point.geojson'))).to.eql(output('point.kml'));
        });
        it('polygon', function() {
            expect(tokml(file('polygon.geojson'))).to.eql(output('polygon.kml'));
        });
        it('linestring', function() {
            expect(tokml(file('linestring.geojson'))).to.eql(output('linestring.kml'));
        });
        it('multilinestring', function() {
            expect(tokml(file('multilinestring.geojson'))).to.eql(output('multilinestring.kml'));
        });
        it('multipoint', function() {
            expect(tokml(file('multipoint.geojson'))).to.eql(output('multipoint.kml'));
        });
        it('multipolygon', function() {
            expect(tokml(file('multipolygon.geojson'))).to.eql(output('multipolygon.kml'));
        });
        it('geometrycollection', function() {
            expect(tokml(file('geometrycollection.geojson'))).to.eql(output('geometrycollection.kml'));
        });

    });

    describe('quirks', function() {
        it('cdata', function() {
            expect(tokml(file('cdata.geojson'))).to.eql(output('cdata.kml'));
        });

        it('single feature', function() {
            expect(tokml(file('singlefeature.geojson'))).to.eql(output('singlefeature.kml'));
        });

        it('single geometry', function() {
            expect(tokml(file('singlegeometry.geojson'))).to.eql(output('singlegeometry.kml'));
        });

        it('unknown type', function() {

            expect(tokml(file('unknown.geojson'))).to.eql(output('unknown.kml'));
        });

        it('null data', function() {
            expect(tokml(file('nulldata.geojson'))).to.eql(output('nulldata.kml'));
        });

        it('unknown geometry', function() {
            expect(tokml(file('unknowngeom.geojson'))).to.eql(output('unknowngeom.kml'));
        });

        it('no type', function() {
            expect(tokml(file('notype.geojson'))).to.eql(output('notype.kml'));
        });
    });

    describe('name & description', function() {
        it('name and description', function() {
            expect(tokml(file('name_desc.geojson'))).to.eql(output('name_desc.kml'));
        });
    });
});

function file(f) {
    return JSON.parse(fs.readFileSync('test/data/' + f));
}

function output(f) {
    return fs.readFileSync('test/data/' + f, 'utf8');
}
