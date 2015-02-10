var test = require('tap').test,
    fs = require('fs'),
    glob = require('glob'),
    fuzzer = require('fuzzer'),
    tokml = require('../');

test('tokml', function(t) {

    function geq(t, name) {
        t.equal(tokml(file(name + '.geojson')), output(name + '.kml'), name);
    }

    test('geometry', function(t) {
        geq(t, 'polygon');
        geq(t, 'linestring');
        geq(t, 'multilinestring');
        geq(t, 'multipoint');
        geq(t, 'multipolygon');
        geq(t, 'geometrycollection');
        t.end();
    });

    test('quirks', function(t) {
        geq(t, 'cdata');
        geq(t, 'singlefeature');
        geq(t, 'singlegeometry');
        geq(t, 'unknown');
        geq(t, 'nulldata');
        geq(t, 'unknowngeom');
        geq(t, 'unknowntype');
        geq(t, 'notype');
        geq(t, 'number_property');
        geq(t, 'polygon_norings');
        geq(t, 'multipolygon_none');
        geq(t, 'multipoint_none');
        geq(t, 'multilinestring_none');
        t.end();
    });

    test('name & description', function(t) {
        t.equal(tokml(file('name_desc.geojson')), output('name_desc.kml'));
        t.equal(tokml(file('document_name_desc.geojson'), {
            documentName: 'Document Title',
            documentDescription: 'Document Description',
        }), output('document_name_desc.kml'));
        t.end();
    });

    test('timestamp', function(t) {
        t.equal(tokml(file('timestamp.geojson'), {
            name: 'name',
            description: 'description',
            timestamp: 'moment'
        }), output('timestamp.kml'));
       t.end();
    });

    test('simplestyle spec', function(t) {
        t.equal(tokml(file('simplestyle.geojson'), {
            simplestyle: true
        }), output('simplestyle.kml'));
        t.end();
    });
    t.end();

    test('fuzz', function(t) {
        fuzzer.seed(0);
        var inputs = glob.sync(__dirname + '/data/*.geojson').forEach(function(gj) {
            var generator = fuzzer.mutate.object(JSON.parse(fs.readFileSync(gj)));
            for (var i = 0; i < 100; i++) {
                var gen = generator();
                try {
                    tokml(gen);
                    t.pass();
                } catch(e) {
                    t.fail('failed ' + JSON.stringify(gen) + 'with ' + e + e.stack);
                }
            }
        });
        t.end();
    });
});

function file(f) {
    return JSON.parse(fs.readFileSync(__dirname + '/data/' + f));
}

function output(f) {
    return fs.readFileSync(__dirname + '/data/' + f, 'utf8');
}
