var test = require('tap').test,
    fs = require('fs'),
    glob = require('glob'),
    fuzzer = require('fuzzer'),
    path = require('path'),
    tokml = require('../');

test('tokml', function(t) {

    function geq(t, name, options) {
        var expected = tokml(file(name + '.geojson'), options);
        if (process.env.UPDATE) {
            fs.writeFileSync(path.join(__dirname, '/data/', name + '.kml'), expected);
        }
        t.equal(expected, output(name + '.kml'), name);
    }

    t.test('geometry', function(tt) {
        geq(tt, 'polygon');
        geq(tt, 'linestring');
        geq(tt, 'multilinestring');
        geq(tt, 'multipoint');
        geq(tt, 'multipolygon');
        geq(tt, 'geometrycollection');
        tt.end();
    });

    t.test('quirks', function(tt) {
        geq(tt, 'cdata');
        geq(tt, 'singlefeature');
        geq(tt, 'singlegeometry');
        geq(tt, 'unknown');
        geq(tt, 'nulldata');
        geq(tt, 'unknowngeom');
        geq(tt, 'unknowntype');
        geq(tt, 'notype');
        geq(tt, 'number_property');
        geq(tt, 'polygon_norings');
        geq(tt, 'multipolygon_none');
        geq(tt, 'multipoint_none');
        geq(tt, 'multilinestring_none');
        tt.end();
    });

    test('name & description', function(tt) {
        geq(tt, 'name_desc');
        geq(tt, 'document_name_desc', {
            documentName: 'Document Title',
            documentDescription: 'Document Description'
        });
        tt.end();
    });

    test('timestamp', function(tt) {
        geq(tt, 'timestamp', {
            name: 'name',
            description: 'description',
            timestamp: 'moment'
        });
        tt.end();
    });

    test('simplestyle spec', function(tt) {
        geq(tt, 'simplestyle', {
            simplestyle: true
        });
        tt.end();
    });

    test('fuzz', function(tt) {
        fuzzer.seed(0);
        glob.sync(__dirname + '/data/*.geojson').forEach(function(gj) {
            var generator = fuzzer.mutate.object(JSON.parse(fs.readFileSync(gj)));
            for (var i = 0; i < 10; i++) {
                var gen = generator();
                try {
                    tokml(gen);
                } catch(e) {
                    tt.fail('failed ' + JSON.stringify(gen) + 'with ' + e + e.stack);
                }
            }
        });
        tt.end();
    });
});

function file(f) {
    return JSON.parse(fs.readFileSync(__dirname + '/data/' + f));
}

function output(f) {
    return fs.readFileSync(__dirname + '/data/' + f, 'utf8');
}
