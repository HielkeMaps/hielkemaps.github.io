$(function () {
	var url = $('#javaScript').data('url');

		var xhr = new XMLHttpRequest();
		xhr.open("HEAD", url, true);
		xhr.onreadystatechange = function() {
			if (this.readyState == this.DONE) {
				console.log(parseInt(xhr.getResponseHeader("Content-Length")));
			}
		};
		xhr.send();
})