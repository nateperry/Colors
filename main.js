/*

Name : main.js
Description: Main file for controlling data loading and page display

*/


//global vars
var App,Loader, Graphics, $doc;

App = {
	init : function () {
		$doc = $(document); //document caching
		Loader.init();
	}
};

Loader = {
	$percentage : null,
	init: function () {
		this.$percentage = $doc.find('#percentage');
		this.sendRequest('data_colors.csv');
	},
	sendRequest : function (path) {
		$.ajax({
			type: 'GET',
			url : path,
			xhr : function () {
				//Creates new XHR to show load progress
				var xhr = new window.XMLHttpRequest();
				xhr.addEventListener('progress', Loader.updateLoadProgress, false);
				return xhr;
			},
			success : App.onRequestSuccess
		});
	},
	updateLoadProgress : function (e) {
		if (e.lengthComputable) {
			var percent = Math.floor((e.loaded / e.total) * 100);
			Loader.$percentage.text(percent);
		}
	},
	onRequestSuccess : function (data) {
		console.log(data);
	}
};

Graphics = {
	init : function () {

	}
};

window.onload = App.init;