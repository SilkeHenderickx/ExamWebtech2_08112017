function(doc){
	if(doc.type == 'actor'){
		emit(doc.name, doc.movies);
	}
}