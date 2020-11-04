
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

searchArtist("Back_in_Black");

//requestDbpedia("PREFIX dbo:<http://dbpedia.org/ontology/> SELECT DISTINCT * WHERE {{?song a dbo:Group.} UNION {?song a dbo:Band.} UNION {?song a dbo:MusicalArtist.} }LIMIT 50");
//requestDbpedia("select distinct ?Concept where {[] a ?Concept} LIMIT 100");
/*requestDbpedia('PREFIX dbo: <http://dbpedia.org/ontology/> \
PREFIX att: <http://dbpedia.org/property/> \
PREFIX : <http://dbpedia.org/resource/> \
\
SELECT ?album ?infos ?artist ?label \
WHERE{ \
    :The_Dark_Side_of_the_Moon dbo:abstract ?infos; \
                               att:thisAlbum ?album; \
                               dbo:artist ?artist; \
                               dbo:recordLabel ?label. \
    FILTER(lang(?infos)="en") \
}');
console.log("aaabb");*/