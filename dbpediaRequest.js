// Inutile, sert juste à titre d'exemple
function requestDbpedia(query){
	let url = "http://dbpedia.org/sparql";
	let queryURL = encodeURI( url + "?query=" + query + "&format=json" );
	console.log(queryURL);
	$.ajax({
           	dataType: "jsonp",  
           	url: queryURL,
           	success: function( _data ) {
               	var results = _data.results.bindings;
               	for ( var i in results ) {
                   	var res = results[i];
                  	console.log(res);
               	}
           	}
       });
}
// Fin inutile 

// Retourne toutes les infos sur un artiste/un groupe
function searchArtist(name){
	let url = "http://dbpedia.org/sparql";
	let query = 'PREFIX dbo: <http://dbpedia.org/ontology/> \
PREFIX att: <http://dbpedia.org/property/> \
PREFIX : <http://dbpedia.org/resource/> \
\
SELECT ?thumbnail ?album ?date ?infos ?artist ?label ?genre \
WHERE{ \
:'+ name + ' dbo:abstract ?infos; \
att:thisAlbum ?album; \
dbo:artist ?artist; \
dbo:recordLabel ?label; \
dbo:genre ?genre; \
dbo:releaseDate ?date; \
dbo:thumbnail ?thumbnail. \
FILTER(lang(?infos)="en") \
}';
	let queryURL = encodeURI( url + "?query=" + query + "&format=json" );
	console.log(queryURL);
	$.ajax({
           	dataType: "jsonp",  
           	url: queryURL,
           	success: function( _data ) {
               	var results = _data.results.bindings;
               	for ( var i in results ) {
                   	var res = results[i];
                  	console.log(res);
                  	$('#td1').html(res.album.value);
                  	$('#td2').html(res.artist.value);
                  	$('#td3').html(res.infos.value);
                  	$('#td4').html(res.label.value);
                  	//$('#td5').html('<img src="'res.thumbnail.value'">');
                  	$('#td5').html('<img src="' + res.thumbnail.value +'">' );
               	}
           	}
       });
}

//Retourne toutes les infos sur back_in black
searchArtist("Back_in_Black");
