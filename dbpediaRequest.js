
async function requestDbpedia(query) {
	let url = "http://dbpedia.org/sparql";
	let queryURL = encodeURI(url + "?query=" + query + "&format=json");
	try {
		result = await $.ajax({
			dataType: "jsonp",
			url: queryURL
		});
		return result.results.bindings;
	}
	catch (error) {
		console.error();
	}
}

async function infoAlbum() {
	const urlParams = new URLSearchParams(window.location.search);
	const name = urlParams.get('album');
	let query = 'PREFIX dbo: <http://dbpedia.org/ontology/> \
	PREFIX dbp:	<http://dbpedia.org/property/> \
	PREFIX dbr:	<http://dbpedia.org/resource/> \
	PREFIX foaf: <http://xmlns.com/foaf/0.1/> \
	\
	SELECT ?thumbnail ?album ?date ?year ?infos ?artist ?artistName ?label ?genre \
	WHERE{ \
	<' + name + '> dbo:abstract ?infos; \
	dbp:relyear ?year; \
	dbp:thisAlbum ?album; \
	dbo:artist ?artist; \
	dbo:recordLabel ?label; \
	dbo:genre ?genre; \
	dbo:releaseDate ?date. \
	?artist foaf:name ?artistName.\
	OPTIONAL {<' + name + '> dbo:thumbnail ?thumbnail} \
	FILTER(lang(?infos)="en") \
	}';
	results = await requestDbpedia(query);
	console.log(results)
	for (var i in results) {
		res = results[i];
		console.log(res);
		$('#album-name').html(res.album.value);
		$('#album-artist').html('<a href=artist.html?artist=' + res.artist.value + '> ' + res.artistName.value + '</a>');
		$('#album-year').html(res.year.value);
		if (typeof res.thumbnail !== 'undefined')
			$('#album-image').html('<img src="' + res.thumbnail.value + '" class=img-fluid>');
	}
}

async function infoArtist() {
	const urlParams = new URLSearchParams(window.location.search);
	const name = urlParams.get('artist');
	let query = 'PREFIX dbo: <http://dbpedia.org/ontology/> \
	PREFIX dbp: <http://dbpedia.org/property/> \
	PREFIX dbr: <http://dbpedia.org/resource/> \
	PREFIX foaf: <http://xmlns.com/foaf/0.1/> \
	SELECT ?album ?info ?thumbnail ?name ?begin ?end ?countryname ?dateAlbum ?albumName  COUNT(*) AS ?nbSong \
	WHERE{ \
	<' + name + '> dbo:thumbnail ?thumbnail; \
	dbo:abstract ?info; \
	foaf:name ?name; \
	dbo:activeYearsStartYear ?begin; \
	dbo:hometown ?town. \
	?town dbo:country ?country. \
	?country rdfs:label ?countryname. \
	?album dbo:artist <' + name + '>; \
	dbp:thisAlbum ?albumName; \
	dbo:releaseDate ?dateAlbum. \
	?x dbo:album ?album. \
	OPTIONAL { <' + name + '> dbo:activeYearsEndYear  ?end} \
	FILTER(lang(?countryname)="en") \
	FILTER(lang(?info)="en") \
	} \
	GROUP BY ?album ?info ?albumName ?end ?countryname ?begin ?thumbnail ?dateAlbum ?name \
	ORDER BY DESC(?dateAlbum)';
	results = await requestDbpedia(query);
	var tableau = "";
	console.log(results);
	for (var i in results) {
		tableau +=  '<tr> \
		<th scope="row">' + (+i + 1) + '</th> \
		<td><a href="album.html?album=' + results[i].album.value + '">' + results[i].albumName.value + '</a></td> \
		<td>' + results[i].dateAlbum.value.substr(0,4) + '</td> \
		<td>' + results[i].nbSong.value + '</td> \
	  </tr>'
	}
	$('#album-songs').html(tableau);
	res = results[0];
	$('#artist-name').html(res.name.value);
	$('#artist')
	$('#artist-image').html('<img src="' + res.thumbnail.value + '" class=img-fluid>');
	$('#artist-country').html(res.countryname.value);
	$('#artist-year-start').html(res.begin.value);
	$('#artist-about').html(res.info.value);
	if (typeof res.end !== 'undefined')
		$('#artist-year-end').html(res.end.value);
}