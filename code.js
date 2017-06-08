const baseUrl = 'http://devnewsapi.azurewebsites.net/api/article/';

function makeCall(url, methodType, callback, data){
	var xmlhttp = new XMLHttpRequest();	
	
	xmlhttp.onreadystatechange = function() {
		if (this.readyState == 4) {
			if (this.status == 200){
				var result = JSON.parse(this.responseText);
				callback(result);
			}
			if (this.status == 204)
			{
				callback();
			}
		}
	};
	xmlhttp.open(methodType, url, true);
	xmlhttp.setRequestHeader('Content-Type', 'application/json');
	xmlhttp.setRequestHeader('Accept', 'application/json');
	
	xmlhttp.send(JSON.stringify(data));
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
		articleDiv.setAttribute('data-item', JSON.stringify(article));
		
		return articleDiv;
}

function postArticle() {
	var authorNameItem = document.getElementById('newArticleAuthor');
	var authorName = authorNameItem.value;
	
	var articleTextItem = document.getElementById('newArticleText');
	var articleText = articleTextItem.value;	
	
	var newArticle = {
		Author: authorName,
		Text: articleText		
	};
	
	makeCall(baseUrl, 'POST', reloadArticles, newArticle);
}

function getArticleContainer(elementItem){
	var imagesContainer = elementItem.target.parentElement;
	var articleContainer = imagesContainer.parentElement;
	return articleContainer;
}

function deleteArticle(elementItem){
	var articleContainer = getArticleContainer(elementItem);
	var dataAttribute = JSON.parse(articleContainer.getAttribute('data-item'));
	
	if (confirm('Are you sure you want to delete item with text: ' + dataAttribute.Text)) {
		makeCall(baseUrl + dataAttribute.Id, 'DELETE', reloadArticles, null);
	} else {
		// Do nothing!
	}
}

function editArticle(elementItem){	
	var articleContainer = getArticleContainer(elementItem);
	var dataAttribute = JSON.parse(articleContainer.getAttribute('data-item'));
	
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