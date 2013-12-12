/*

Name : main.js
Description: Main file for controlling data loading and page display

*/
'use strict'

//global vars
var App,Loader, Graphics, Data, $doc;

App = {
	init : function () {
		console.log('init');
		$doc = $(document); //document caching
		Loader.init();
	}
};

Loader = {
	$loading : null,
	$percentage : null,
	init: function () {
		this.$loading = $doc.find('#loading');
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
			success : Loader.onRequestSuccess,
			error : Loader.onRequestError
		});
	},
	updateLoadProgress : function (e) {
		if (e.lengthComputable) {
			var percent = Math.floor((e.loaded / e.total) * 100);
			Loader.$percentage.text(percent);
		}
	},
	onRequestSuccess : function (data) {
		console.log('success');
		Data.init(data);
		Loader.$loading.delay(800).animate({opacity: 0}, 800, function () {this.style.display = 'none'});
	},
	onRequestError : function () {
		console.log('failed to load');
	}
};

Data = {
	red : [],
	green : [],
	blue : [],
	allColors : [],
	colors : [],
	init : function (data) {
		this.allColors = this.splitData(data, "\n");

		//Populate arrays with color data
		this.allColors.forEach(function (item) {
			var info = Data.splitData(item, ",");
			var color = {
							r : info[0].replace(/"/, ""),
							g : info[1].replace(/"/, ""),
							b : info[2].replace(/"/, ""),
							name : info[20]
						};
			Data.colors.push( color );
		});
		/*
			index values
			0: ""r""
			1: ""g""
			2: ""b""
			3: ""RGB""
			4: ""Spanish""
			5: ""EN_ES""
			6: ""Russian""
			7: ""EN_RU""
			8: ""German""
			9: ""EN_DE""
			10: ""French""
			11: ""EN_FR""
			12: ""Chinese""
			13: ""EN_ZH""
			14: ""Italian""
			15: ""EN_IT""
			16: ""Korean""
			17: ""EN_KO""
			18: ""Japanese""
			19: ""EN_JA""
			20: ""name""
			21: ""short_name""
			22: ""med_name""
			23: ""cx""
			24: ""cy""
		*/
		
		this.colors.forEach(function (item) {
			if (item.r >= item.g && item.r >= item.b) {
				Data.red.push(item);
			}
			else if (item.r <= item.g && item.r >= item.b) {
				Data.blue.push(item);
			}
			else if (item.g >= item.b) {
				Data.green.push(item);
			}
			else {
				Data.blue.push(item);
			}
		});

/*
		this.red.sort(function (a, b) {
			return a.r - b.r;
		});
		this.green.sort(function (a, b) {
			return a.g - b.g;
		});
		this.blue.sort(function (a, b) {
			return a.b - b.b;
		}); */

		var $slider = $doc.find('#slider');
		$slider.append('<h1>Red</h1><hr />');
		this.red.forEach(function (item) {
			$slider.append( Data.createColorElement(item) );
		});
		$slider.append('<h1>Green</h1><hr />');
		this.green.forEach(function (item) {
			$slider.append( Data.createColorElement(item) );
		});
		$slider.append('<h1>Blue</h1><hr />');
		this.blue.forEach(function (item) {
			$slider.append( Data.createColorElement(item) );
		});
	},
	splitData : function (data, regex) {
		var result = data.split(regex);
		return result;
	},
	createColorElement : function (item) {
		return '<span class="colorblock" style="background:rgb(' + item.r + ',' + item.g + ',' + item.b + ')">&nbsp;</span>';
	},
};

Graphics = {
	init : function () {

	}
};

window.onload = App.init;