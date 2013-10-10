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

    });

    describe('quirks', function() {
        it('cdata', function() {
            expect(tokml(file('cdata.geojson'))).to.eql(output('cdata.kml'));
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
