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

async function infoSong() {
	const urlParams = new URLSearchParams(window.location.search);
	const name = urlParams.get('song');
	let query = 'PREFIX dbo: <http://dbpedia.org/ontology/> \
	PREFIX dbp:	<http://dbpedia.org/property/> \
	PREFIX dbr:	<http://dbpedia.org/resource/> \
	PREFIX foaf: <http://xmlns.com/foaf/0.1/> \
	SELECT ?thumbnail ?song ?album ?year ?infos ?artist ?artistName ?label ?genre ?genreName  \
	WHERE{ \
	<' + name + '> dbo:abstract ?infos; \
	dbp:thisSingle ?song; \
	dbo:musicalArtist ?artist; \
	dbo:recordLabel ?label; \
	dbo:genre ?genre. \
	?artist foaf:name ?artistName. \
	?genre foaf:name ?genreName. \
	OPTIONAL {<' + name + '> dbo:thumbnail ?thumbnail} \
	OPTIONAL {<' + name + '> dbp:released ?year} \
	OPTIONAL {<' + name + '> dbo:releaseDate ?year} \
	FILTER(lang(?infos)="en") \
	}';
	results = await requestDbpedia(query);
	console.log(results);
	res = results[0];
	$('#song-name').html(res.song.value);
	$('#song-about').html(res.infos.value);
	$('#song-artist').html('<a href=artist.html?artist=' + res.artist.value + '> ' + res.artistName.value + '</a>');
	$('#song-year').html(res.year.value);
	$('#song-genre').html(res.genreName.value);
	if (typeof res.thumbnail !== 'undefined')
		$('#album-image').html('<img src="' + res.thumbnail.value + '" class=img-fluid>');
}

async function infoAlbum() {
	const urlParams = new URLSearchParams(window.location.search);
	const name = urlParams.get('album');
	let query = 'PREFIX dbo: <http://dbpedia.org/ontology/> \
	PREFIX dbp:	<http://dbpedia.org/property/> \
	PREFIX dbr:	<http://dbpedia.org/resource/> \
	PREFIX foaf: <http://xmlns.com/foaf/0.1/> \
	SELECT DISTINCT ?thumbnail ?song ?album ?year ?infos ?artist ?artistName ?genre ?songName  \
	WHERE{ \
	<' + name + '> dbo:abstract ?infos; \
	dbo:releaseDate ?year; \
	dbp:thisAlbum ?album; \
	dbo:artist ?artist; \
	dbo:genre ?genre. \
	?artist foaf:name ?artistName. \
	?song dbo:album <' + name + '>; \
	dbp:thisSingle ?songName. \
	OPTIONAL {<' + name + '> dbo:thumbnail ?thumbnail} \
	FILTER(lang(?infos)="en") \
	}';
	results = await requestDbpedia(query);
	console.log(results);
	var tableau = "";
	var titles = [];
	for (var i in results) {
		if(!titles.includes(results[i].song.value)) {
			tableau += '<tr> \
			<th scope="row">' + (+i + 1) + '</th> \
			<td><a href="song.html?song=' + results[i].song.value + '">' + results[i].songName.value + '</a></td> \
	    	</tr>';
	    	titles.push(results[i].song.value);
		}
	}
	$('#album-songs').html(tableau);
	res = results[0];
	$('#album-name').html(res.album.value);
	$('#album-about').html(res.infos.value);
	$('#album-artist').html('<a href=artist.html?artist=' + res.artist.value + '> ' + res.artistName.value + '</a>');
	$('#album-year').html(res.year.value.substring(0,4));
	if (typeof res.thumbnail !== 'undefined')
		$('#album-image').html('<img src="' + res.thumbnail.value + '" class=img-fluid>');
}

async function infoArtist() {
	const urlParams = new URLSearchParams(window.location.search);
	const name = urlParams.get('artist');
	console.log(name);
	let query = 'PREFIX dbo: <http://dbpedia.org/ontology/> \
	PREFIX dbp: <http://dbpedia.org/property/> \
	PREFIX dbr: <http://dbpedia.org/resource/> \
	PREFIX foaf: <http://xmlns.com/foaf/0.1/> \
	SELECT ?album ?info ?thumbnail ?name ?begin ?end ?countryname ?dateAlbum ?albumName  COUNT(*) AS ?nbSong ?genre ?genreName \
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
	OPTIONAL { <' + name + '> dbo:genre ?genre. \
	?genre foaf:name ?genreName.} \
	FILTER(lang(?countryname)="en") \
	FILTER(lang(?info)="en") \
	} \
	GROUP BY ?album ?info ?albumName ?end ?countryname ?begin ?thumbnail ?dateAlbum ?name ?genre ?genreName \
	ORDER BY DESC(?dateAlbum)';
	results = await requestDbpedia(query);
	var tableau = "";
	for (var i in results) {
		tableau += '<tr> \
		<th scope="row">' + (+i + 1) + '</th> \
		<td><a href="album.html?album=' + results[i].album.value + '">' + results[i].albumName.value + '</a></td> \
		<td>' + results[i].dateAlbum.value.substr(0, 4) + '</td> \
		<td>' + results[i].nbSong.value + '</td> \
	  </tr>'
	}
	$('#artist-albums').html(tableau);
	res = results[0];
	$('#artist-name').html(res.name.value);
	$('#artist')
	$('#artist-image').html('<img src="' + res.thumbnail.value + '" class=img-fluid>');
	$('#artist-country').html(res.countryname.value);
	$('#artist-year-start').html(res.begin.value);
	$('#artist-about').html(res.info.value);
	$('#artist-genre').html(res.genreName.value);
	if (typeof res.end !== 'undefined')
		$('#artist-year-end').html(res.end.value);
}

async function searchArtist(value) {
	let query = 'PREFIX dbo: <http://dbpedia.org/ontology/> \
	PREFIX dbp: <http://dbpedia.org/property/> \
	PREFIX dbr: <http://dbpedia.org/resource/> \
	PREFIX foaf: <http://xmlns.com/foaf/0.1/> \
	SELECT ?artist ?artistName \
	WHERE{ \
	?artist foaf:name ?artistName. \
	FILTER (regex(?artistName, "' + value + '", "i")) \
	?album dbo:artist ?artist. \
	} GROUP BY ?artist ?artistName LIMIT 5';
	results = await requestDbpedia(query);
	var tableau = "";
	for (var i in results) {
		tableau += '<tr> \
		<td><a href="artist.html?artist=' + results[i].artist.value + '">' + results[i].artistName.value + '</a></td> \
	  </tr>'
	}
	$('#search-artist').html(tableau);
}

async function searchAlbum(value) {
	query = 'PREFIX dbo: <http://dbpedia.org/ontology/> \
	PREFIX dbp: <http://dbpedia.org/property/> \
	PREFIX dbr: <http://dbpedia.org/resource/> \
	PREFIX foaf: <http://xmlns.com/foaf/0.1/> \
	SELECT ?artist ?artistName ?album ?albumName \
	WHERE{ \
	?album  dbp:thisAlbum ?albumName. \
	FILTER (regex(?albumName, "' + value + '", "i")) \
	?album dbo:artist ?artist. \
	?artist foaf:name ?artistName. \
	} GROUP BY ?artist ?artistName ?album ?albumName LIMIT 5';
	results = await requestDbpedia(query);
	var tableau = "";
	for (var i in results) {
		tableau += '<tr> \
		<td><a href="album.html?album=' + results[i].album.value + '">' + results[i].albumName.value + '</a></td> \
		<td><a href="artist.html?artist=' + results[i].artist.value + '">' + results[i].artistName.value + '</a></td> \
	  </tr>'
	}
	$('#search-album').html(tableau);
}

async function searchSong(value) {
	query = 'PREFIX dbo: <http://dbpedia.org/ontology/> \
	PREFIX dbp: <http://dbpedia.org/property/> \
	PREFIX dbr: <http://dbpedia.org/resource/> \
	PREFIX foaf: <http://xmlns.com/foaf/0.1/> \
	SELECT ?song ?songName ?artist ?artistName ?album ?albumName \
	WHERE{ \
	?song  dbp:thisSingle ?songName. \
	FILTER (regex(?songName, "' + value + '", "i")) \
	OPTIONAL { \
				?song dbo:musicalArtist ?artist. \
				?artist foaf:name ?artistName. \
			} \
	OPTIONAL {?song dbo:album ?album. \
	?album dbp:thisAlbum ?albumName} \
	} GROUP BY ?song ?songName LIMIT 5';
	results = await requestDbpedia(query);
	var tableau = "";
	for (var i in results) {
		tableau += '<tr> \
		<td><a href="song.html?song=' + results[i].song.value + '">' + results[i].songName.value + '</a></td> \
		<td><a href="album.html?album=' + results[i].album.value + '">' + results[i].albumName.value + '</a></td> \
		<td><a href="artist.html?artist=' + results[i].artist.value + '">' + results[i].artistName.value + '</a></td> \
	  </tr>'
	}
	$('#search-song').html(tableau);
}

async function searchQuery() {
	v = $("#search").val(); 
	await Promise.all([searchArtist(v), searchAlbum(v), searchSong(v)]);
}
