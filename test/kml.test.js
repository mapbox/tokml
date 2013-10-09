var expect = require('expect.js'),
    fs = require('fs'),
    tokml = require('../');

describe('tokml', function() {
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

function file(f) {
    return JSON.parse(fs.readFileSync('test/data/' + f));
}

function output(f) {
    return fs.readFileSync('test/data/' + f, 'utf8');
}
