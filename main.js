/*

Name : main.js
Description: Main file for controlling data loading and page display

*/
'use strict'

//global vars
var App,Loader, Events, Data, $doc;

App = {
	init : function () {
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
		Data.init(data);
		Loader.$loading.delay(800).animate({opacity: 0}, 800, function () {this.style.display = 'none'});
		$('#title').fadeOut(300).text('Choose a fucking color?').css('color', '#858384').fadeIn(1000);
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
							h : null,
							s : null,
							l : null,
							name : info[20].replace(/"/g, "")
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
		
		// Sort colors by HSL values
		this.colors.forEach(function (item) {
			var hsl = Data.getHSLValue(item.r, item.g, item.b);

			item.h = hsl[0];
			item.s = hsl[1];
			item.l = hsl[2];
		});

		this.colors.sort(function (a, b) {
			return a.h - b.h;
		});

		var $slider = $doc.find('#slider');
		this.colors.forEach(function (item) {
			$slider.append( Data.createColorElement(item) );
					
		});

		Events.init();
	},
	splitData : function (data, regex) {
		var result = data.split(regex);
		return result;
	},
	createColorElement : function (item) {
		var rgb =  "<span class='rgbval'>rgb ( "+item.r + ', ' + item.g + ', ' + item.b+' )</span>';
		var hsl =  "<span class='hslval'>hsl ( "+Math.floor(item.h) + ', ' + Math.floor(item.s*100) + '% , ' + Math.floor(item.l*100)+'% )</span>';
		return '<div class="colorblock" style=" background:rgb(' + item.r + ',' + item.g + ',' + item.b + ')"><a href="#CLOSE" class="closer">X</a>'+ "<h3 class='name'>"+ item.name+"</h3>"+ rgb + hsl+"</span></div>";
	},
	getHSLValue : function (r, g, b) {
		r /= 255, g /= 255, b /= 255;
		var max = Math.max(r, g, b), min = Math.min(r, g, b);
		var h, s, l = (max + min) / 2;

		if(max == min){
			h = s = 0; // achromatic
		}
		else {
			var d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
			switch(max){
				case r: h = (g - b) / d + (g < b ? 6 : 0); break;
				case g: h = (b - r) / d + 2; break;
				case b: h = (r - g) / d + 4; break;
			}
			h /= 6;
		}
		return [h, s, l];
	}
};

Events={
	init:function (){
		$doc.find('.colorblock').on('click', Events.openBlock);
		$doc.find('.closer').on('click', Events.closeBlock);
	},
	openBlock:function(e) {
		e.preventDefault();
		if ( ! $(e.target).hasClass('open') ) {
			$('.closing').removeClass('closing');
			$('.open').removeClass('open').addClass('closing');
			$(e.currentTarget).addClass('open').off();


			var timeout = window.setTimeout(function () {
				$('.closing').removeClass('closing');
				window.clearTimeout(timeout);
			}, 700);

		}
	},
	closeBlock : function (e) {
		e.preventDefault();
		$('.colorblock').removeClass('open').addClass('closing');
		var timeout = window.setTimeout(function () {
				$('.colorblock').on('click', Events.openBlock);
				$('.closing').removeClass('closing');
				window.clearTimeout(timeout);
				('.colorblock').on('click', Events.openBlock);
			}, 700);
	}
}

window.onload = App.init;