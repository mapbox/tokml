all: tokml.js site/site.js

tokml.js:
	browserify -s tokml index.js > tokml.js

site/site.js: site/index.js
	browserify site/index.js > site/site.js
