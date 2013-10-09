[![Build Status](https://travis-ci.org/tmcw/tokml.png)](https://travis-ci.org/tmcw/tokml)

# tokml

Convert [GeoJSON](http://geojson.org/) to [KML](https://developers.google.com/kml/documentation/).

## Usage

with node/browserify

    npm install --save tokml

otherwise:

    wget https://raw.github.com/mapbox/tokml/master/tokml.js

as a binary:

    npm install -g tokml
    tokml file.geojson > file.kml
    tokml < file.geojson > file.kml

## Example

```js
var kml = tokml(geojsonObject);
```

## API

### `tokml(geojsonObject)`

Given [GeoJSON](http://geojson.org/) data as an object, return KML data as a
string of XML.

## Development

Requires [node.js](http://nodejs.org/) and [browserify](https://github.com/substack/node-browserify):

To build `tokml.js`:

    make

To run tests:

    npm install
    npm test
