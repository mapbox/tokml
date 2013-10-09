var tokml = require('../'),
    fs = require('fs'),
    glob = require('glob');

glob.sync('test/data/*.geojson').forEach(function(g) {
    fs.writeFileSync(g.replace('.geojson', '.kml'), tokml(JSON.parse(fs.readFileSync(g))));
});
