const baseUrl = 'http://devnewsapi.azurewebsites.net/api/article/';

function makeCall(url, methodType, callback, data){
	headers = new Headers();
	headers.append('Content-Type', 'application/json');
	headers.append('Accept', 'application/json');
	headers.append('Access-Control-Request-Method', 'POST, DELETE');
	headers.append('Access-Control-Allow-Origin', '*');
	
	var init = { 
		method: methodType,
		headers: headers,
		cache: 'no-store',
		body: JSON.stringify(data)
	};

	var request = new Request(url, init);
	fetch(request).then(function(response) {
		if (response.ok){

			if (response.status == 200) {			
				return response.json();					
			}
			if(response.status == 204){
				return;
			}
		}
	}).then(function (data) {
		if (callback) {
			if (data){ callback(data);}
			else{
				callback();
			}
		}
	});	
}

function reloadArticles() {	
	makeCall(baseUrl, 'GET', renderArticles);
}

function renderArticles(articles) {
	var container  = document.getElementById('articlesContainer');
	var fragment = document.createDocumentFragment();
	
	var filterText = document.getElementById('filterInput').value;
	
	articles.forEach(function (article) {
		if (filterText === '' || article.Text.indexOf(filterText) !== -1) {
			var articleDiv = createArticleElement(article);
			fragment.appendChild(articleDiv);
		}
	});
	
	container.innerHTML = '';
	container.appendChild(fragment);
}

function createArticleElement(article) {
	var articleDiv = document.createElement('div');
		
		var authorDiv = document.createElement('div');
		authorDiv.classList.add('author');
		authorDiv.textContent = article.Author;
		articleDiv.appendChild(authorDiv);
		
		var textDiv = document.createElement('div');
		textDiv.classList.add('articleText');
		textDiv.textContent = article.Text;
		articleDiv.appendChild(textDiv);
		
		var buttonsDiv = document.createElement('div');
		buttonsDiv.classList.add('inline');
		
		var editImg = createImageElement('images/edit.png', editArticle);			
		buttonsDiv.appendChild(editImg);
		
		var deleteImg = createImageElement('images/delete.png', deleteArticle);	
		buttonsDiv.appendChild(deleteImg);
		
		articleDiv.appendChild(buttonsDiv);
		
		articleDiv.classList.add('article');
		articleDiv.dataset.item = JSON.stringify(article);
		
		return articleDiv;
}

function postArticle(e) {
	var authorNameItem = document.getElementById('newArticleAuthor');
	var authorName = authorNameItem.value;
	
	var articleTextItem = document.getElementById('newArticleText');
	var articleText = articleTextItem.value;	
	
	var newArticle = {
		Author: authorName,
		Text: articleText		
	};
	
	makeCall(baseUrl, 'POST', reloadArticles, newArticle);
	return false;
}

function getArticleContainer(elementItem){
	var imagesContainer = elementItem.target.parentElement;
	var articleContainer = imagesContainer.parentElement;
	return articleContainer;
}

function deleteArticle(elementItem){
	var articleContainer = getArticleContainer(elementItem);
	var dataAttribute = JSON.parse(articleContainer.dataset.item);
	
	if (confirm('Are you sure you want to delete item with text: ' + dataAttribute.Text)) {
		makeCall(baseUrl + dataAttribute.Id, 'DELETE', reloadArticles, null);
	} else {
		// Do nothing!
	}
}

function editArticle(elementItem){	
	var articleContainer = getArticleContainer(elementItem);
	var dataAttribute = JSON.parse(articleContainer.dataset.item);
	
	var editContainer = document.createElement('div');
	var editElement = document.createElement('textarea');
	editElement.classList.add('editor');
	editElement.value = dataAttribute.Text;

	var editOk = createImageElement('images/submit.png', function () {sendUpdateRequest(editElement, dataAttribute);});
	var editCancel = createImageElement('images/cancel.png', reloadArticles);
	editContainer.appendChild(editElement);
	editContainer.appendChild(editOk);
	editContainer.appendChild(editCancel);
	
	articleContainer.innerHTML = '';
	articleContainer.appendChild(editContainer);
}

function sendUpdateRequest(elementItem, value) {
	value.Text = elementItem.value;
	makeCall(baseUrl + value.Id, 'POST', reloadArticles, value);
}

function createImageElement(url, callback) {
	var imageElement = document.createElement('img');
		imageElement.classList.add('imageElement');
		imageElement.src = url;
		imageElement.onclick = callback;
		
		return imageElement;
}