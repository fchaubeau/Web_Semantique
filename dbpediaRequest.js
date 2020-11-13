async function requestDbpedia(query) {
	let url = "http://dbpedia.org/sparql";
	let queryURL = encodeURI(url + "?query=" + query + "&format=json");
	console.log(query);
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
	$('#song-year').html(res.year.value.substring(0,4));
	$('#song-genre').html('<a href=genre.html?genre=' + res.genre.value + '>' + res.genreName.value + '</a>');
	if (typeof res.thumbnail !== 'undefined')
		$('#album-image').html('<img src="' + res.thumbnail.value + '" class=img-fluid>');
}

async function infoAlbum() {
	const urlParams = new URLSearchParams(window.location.search);
	const name = urlParams.get('album');
	console.log(name);
	let query = 'PREFIX dbo: <http://dbpedia.org/ontology/> \
	PREFIX dbp:	<http://dbpedia.org/property/> \
	PREFIX dbr:	<http://dbpedia.org/resource/> \
	PREFIX foaf: <http://xmlns.com/foaf/0.1/> \
	SELECT DISTINCT ?thumbnail ?song ?songName ?album ?year ?infos ?artist ?artistName ?genre ?genreName  \
	WHERE{ \
	<' + name + '> dbo:abstract ?infos; \
	dbo:releaseDate ?year; \
	dbp:thisAlbum ?album; \
	dbo:artist ?artist; \
	dbo:genre ?genre. \
	?genre foaf:name ?genreName. \
	OPTIONAL { ?artist foaf:name ?artistName. } \
	OPTIONAL { {<' + name + '> dbp:title ?song. ?song dbp:thisSingle ?songName } UNION {<' + name + '> dbp:title ?song.} } \
	OPTIONAL { <' + name + '> dbo:thumbnail ?thumbnail. }.\
	FILTER(lang(?infos)="en"). \
	}';
	results = await requestDbpedia(query);
	console.log(results);
	var tableau = "";
	var titles = [];
	var genres = [];
	var htmlGenres = "";
	for (var i in results) {
		if(results[i].hasOwnProperty('genreName'))
		{
			if(!genres.includes(results[i].genreName.value)){
				htmlGenres += '<a href=genre.html?genre=' + results[i].genre.value + '>' + results[i].genreName.value + '</a>';
				htmlGenres += ", ";
				genres.push(results[i].genreName.value);
			}
		}
		if(results[i].song && !titles.includes(results[i].song.value)) {
			tableau += '<tr> \
			<th scope="row">' + (+i + 1) + '</th>';

			if(results[i].songName){
				tableau += '<td><a href="song.html?song=' + results[i].song.value + '">' + results[i].songName.value + '</a></td>';
			}else{
				tableau += '<td>'+ results[i].song.value + '</td>';
			}
			
	    	
	    	tableau += '</tr>';
	    	titles.push(results[i].song.value);
		}
	}
	$('#album-songs').html(tableau);
	$('#album-genre').html(htmlGenres.substring(0,htmlGenres.length-2));
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
	OPTIONAL {<' + name + '> dbo:thumbnail ?thumbnail.}. \
	OPTIONAL {<' + name + '> dbo:abstract ?info. \
	FILTER(lang(?info)="en") }. \
	OPTIONAL {<' + name + '> foaf:name ?name.}. \
	OPTIONAL {<' + name + '> dbo:activeYearsStartYear ?begin.}. \
	OPTIONAL {<' + name + '> dbo:hometown ?town. \
	?town dbo:country ?country. \
	?country rdfs:label ?countryname. \
	FILTER(lang(?countryname)="en")}. \
	OPTIONAL {?album dbo:artist <' + name + '>; \
	dbp:thisAlbum ?albumName; \
	dbo:releaseDate ?dateAlbum. \
	?x dbo:album ?album. }.\
	OPTIONAL { <' + name + '> dbo:activeYearsEndYear  ?end}. \
	OPTIONAL { <' + name + '> dbo:genre ?genre. \
	?genre foaf:name ?genreName.} \
	} \
	GROUP BY ?album ?info ?albumName ?end ?countryname ?begin ?thumbnail ?dateAlbum ?name ?genre ?genreName \
	ORDER BY DESC(?dateAlbum)';
	results = await requestDbpedia(query);
	console.log(results);
	var tableau = "";
	var titles = [];
	var dateAlbum="";
	var nbsong ="";
	var index = 1;
	var genres = [];
	var htmlGenres = "";
	for (var i in results) {
		if( results[i].hasOwnProperty('dateAlbum'))
		{
			dateAlbum = results[i].dateAlbum.value.substr(0, 4);
		}
		if(results[i].hasOwnProperty('nbSong'))
		{
			nbsong = results[i].nbSong.value;
		}
		if(results[i].hasOwnProperty('genreName'))
		{
			if(!genres.includes(results[i].genreName.value)){
				htmlGenres += '<a href=genre.html?genre=' + results[i].genre.value + '>' + results[i].genreName.value + '</a>';
				htmlGenres += ", ";
				genres.push(results[i].genreName.value);
			}
		}
		if(results[i].hasOwnProperty('album') && results[i].hasOwnProperty('albumName') ){
			if(!titles.includes(results[i].album.value)){
				tableau += '<tr> \
				<th scope="row">' + index + '</th> \
				<td><a href="album.html?album=' + results[i].album.value + '">' + results[i].albumName.value + '</a></td> \
				<td>' +  dateAlbum+ '</td> \
				<td>' +  nbsong+ '</td> \
				</tr>';
				titles.push(results[i].album.value);
				index++;
			}
		}
	}
	$('#artist-albums').html(tableau);
	$('#artist-genre').html(htmlGenres.substring(0,htmlGenres.length-2));
	res = results[0];
	if( res.hasOwnProperty('name') )
		$('#artist-name').html(res.name.value);
	if( res.hasOwnProperty('thumbnail') )
		$('#artist-image').html('<img src="' + res.thumbnail.value + '" class=img-fluid>');
	if( res.hasOwnProperty('countryname') )
		$('#artist-country').html(res.countryname.value);
	if( res.hasOwnProperty('begin') )
		$('#artist-year-start').html(res.begin.value);
	if( res.hasOwnProperty('info') )
		$('#artist-about').html(res.info.value);
	if( res.hasOwnProperty('end') )
		$('#artist-year-end').html(res.end.value);
	if (res.name === undefined) {
		$('#content').html("<img id=error src=https://media4.giphy.com/media/JQMlfqZfEIaQDopMBQ/giphy.gifhttps://media4.giphy.com/media/JQMlfqZfEIaQDopMBQ/giphy.gif />");
	}
}

async function infoGenre(){
	const urlParams = new URLSearchParams(window.location.search);
	const name = urlParams.get('genre');
	console.log(name);
	let query = 'PREFIX dbo: <http://dbpedia.org/ontology/> \
	PREFIX dbp: <http://dbpedia.org/property/> \
	PREFIX dbr: <http://dbpedia.org/resource/> \
	PREFIX foaf: <http://xmlns.com/foaf/0.1/> \
	SELECT ?info ?thumbnail ?name \
	WHERE{ \
	OPTIONAL { <' + name + '> dbo:thumbnail ?thumbnail.}. \
	OPTIONAL { <' + name + '> dbo:abstract ?info. \
	FILTER(lang(?info)="en") }. \
	OPTIONAL { <' + name + '> foaf:name ?name.}. \
	}';
	results = await requestDbpedia(query);
	console.log(results);
	res = results[0];

	if( res.hasOwnProperty('name') )
		$('#genre-name').html(res.name.value);
	if( res.hasOwnProperty('info') )
		$('#genre-about').html(res.info.value);
	if( res.hasOwnProperty('thumbnail') )
		$('#genre-image').html('<img src="' + res.thumbnail.value + '" class=img-fluid>');
}


async function searchArtist(value) {
	let query = 'PREFIX dbo: <http://dbpedia.org/ontology/> \
	PREFIX dbp: <http://dbpedia.org/property/> \
	PREFIX dbr: <http://dbpedia.org/resource/> \
	PREFIX foaf: <http://xmlns.com/foaf/0.1/> \
	SELECT ?artist ?artistName \
	WHERE{ \
	?artist foaf:name ?artistName. \
	FILTER strStarts(lcase(?artistName), lcase("' + value + '")). \
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
	FILTER strStarts(lcase(str(?albumName)), lcase("' + value + '")). \
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
	?song  dbp:thisSingle ?Sn. \
    BIND(REPLACE(?Sn, "\\"", "") AS ?songName) \
	FILTER strStarts(lcase(str(?songName)), lcase("' + value + '")). \
	 \
				?song dbo:musicalArtist ?artist. \
				?artist foaf:name ?artistName. \
			 \
	?song dbo:album ?album. \
	?album dbp:thisAlbum ?albumName. \
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
	if (v.length > 2) {
		$('#queryIndication').html("<img src=https://mir-s3-cdn-cf.behance.net/project_modules/disp/04de2e31234507.564a1d23645bf.gif />");
		await Promise.all([searchArtist(v), searchAlbum(v), searchSong(v)]);
		if ($('#result-artist').css("display") == "none" && $('#result-album').css("display") == "none" && $('#result-song').css("display") == "none") {
			$('#queryIndication').html("Aucun résultat pour '" + v + "'.");
		}
		else {
			$('#queryIndication').html("Résultat pour '" + v + "' :");
		}
	}
	else {
		$('.table-result').each(function() {
			$(this).css("display", "none");
		});
		$('#queryIndication').html("Tapez au moins 3 caractères pour lancer une recherche");
	}
}

$('body').on('DOMSubtreeModified', '.search', function(){
	source = "#" + $(this).attr('id');
	target = "#result-" + source.split("-")[1];
	console.log(source, target, $(source).html().length);
	if ($(source).html().length == 0) {
		$(target).css("display", "none");
	}
	else {
		$(target).css("display", "flex");
	}
  });