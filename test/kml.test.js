var expect = require('expect.js'),
    fs = require('fs'),
    tokml = require('../');

function file(f) {
    return JSON.parse(fs.readFileSync('test/data/' + f));
}

describe('tokml', function() {
    it('converts a single point to kml', function() {
        expect(tokml(file('featurecollection.geojson'))).to.eql(true);
    });
});
