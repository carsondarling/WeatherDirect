var express = require('express');
var geocoder = require('geocoder');
var winston = require('winston');


var app = express();

// TODO: Add winston logging

// About page routing
app.get('/', function(req, res){
	// Send about page
	res.send('hello world');
});

// Favicon
app.get('/favicon.ico', function(req, res) {
	res.send('');
});

// Weather.com interface
app.get('/:loc', function(req, res) {
	// Grab query string
	var search = req.params.loc;
	if (!search) { return res.redirect('/'); }

	// Default to query to search string
	var query = search;

	// Use Google Developer API to grab zipcode
	geocoder.geocode(search, function(err, data) {
		
		// Try to use information returned from geocode, otherwise use search string
		if (!err) {

			var addr = {};
			if (data.results.length > 0) {
				var parts = data.results[0].address_components;

				// Sort through returned pieces
				for (var j=0; j<parts.length; j++) {
					if (parts[j].types.indexOf('postal_code') > -1) {
						addr.zip = parts[j].short_name;

					} else if (parts[j].types.indexOf('locality') > -1) {
						addr.city = parts[j].long_name;

					} else if (parts[j].types.indexOf('administrative_area_level_1') > -1) {
						addr.state = parts[j].short_name;
					}
				}

				// Try to build a smarter query
				if (addr.zip) {
					// Use zipcode if it was present
					query = addr.zip;
				} else if (addr.state && addr.city) {
					// Otherwise use city/state
					query = addr.city + ' ' + addr.state;
				}
			}
		}

		var redir = 'http://www.weather.com/search/enhancedlocalsearch?where=' + query;
		// res.send(redir);
		res.redirect(303, redir);
	});
});

app.listen(3000);