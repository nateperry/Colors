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
		Loader.$percentage.text('100');
		Data.init(data);
		Loader.$loading.delay(200).animate({opacity: 0}, 800, function () {this.style.display = 'none'});
		$('#title').animate({opacity: 0}, 800, function () {
			$(this).text('Colors.').animate({opacity: 1}, 1000);
		});
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
							name : info[20].replace(/"/g, ""),
							othernames : []
						};
			for(var i  =4; i <= 18; i += 2){
				color.othernames.push(info[i].replace(/"/g, ""));
			}
			Data.colors.push( color );
		});
		
		
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
		var element;

		var style = (Math.floor(item.l * 100) > 50) ? " light" : ""; //condition if hue > 50, then font color brightens
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
		element =  	'<div class="colorblock" style=" background:rgb(' + item.r + ',' + item.g + ',' + item.b + ')">';
		element += 		'<div class="color-info'+  style +'">';
		element += 			'<a href="#CLOSE" class="closer">X</a>';
		element +=			'<h3 class="name">'+ item.name+'</h3>';
		element += 			'<span class="rgbval">rgb( ' + item.r + ', ' + item.g + ', ' + item.b +' )</span>';
		element += 			'<span class="hslval">hsl( ' + Math.floor(item.h) + ', ' + Math.floor(item.s*100) + '% , ' + Math.floor(item.l*100) + '% )</span>';
		element += 			'<div class="languages">';
		element +=				'<span class="language" lang="es">Spanish - ' + item.othernames[0] +'</span>';
		element +=				'<span class="language" lang="ru">Russian - ' + item.othernames[1] +'</span>';
		element +=				'<span class="language" lang="de">German - ' + item.othernames[2] +'</span>';
		element +=				'<span class="language" lang="fr">French - ' + item.othernames[3] +'</span>';
		element +=				'<span class="language" lang="zh">Chinese - ' + item.othernames[4] +'</span>';
		element +=				'<span class="language" lang="it">Italian - ' + item.othernames[5] +'</span>';
		element +=				'<span class="language" lang="ko">Korean - ' + item.othernames[6] +'</span>';
		element +=				'<span class="language" lang="ja">Japanese - ' + item.othernames[7] +'</span>';
		element +=			'</div>';
		element +=		'</div>';
		element +=	'</div>';
		return element;
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

Events = {
	currentBlock : null,
	currentInfo : null,
	oldBlock : null,
	oldInfo : null,
	init:function (){
		$doc.find('.colorblock').on('click', Events.openBlock);
		$doc.find('.closer').on('click', Events.closerClick);
	},
	openBlock:function(e) {
		e.preventDefault();
		e.stopPropagation();

		if (Events.currentBlock != null) {
			// closes current block
			Events.oldBlock = Events.currentBlock;
			Events.oldInfo = Events.currentInfo;

			Events.currentInfo.stop().animate({opacity: 0}, 300, function () {
				Events.oldBlock.removeClass('open');
				Events.oldInfo.removeClass('show');
				//turn on event listener
				Events.oldBlock.on('click', Events.openBlock);
			});
		}

		//sets new block
		Events.currentBlock = $(e.target);
		Events.currentInfo = Events.currentBlock.find('.color-info');

		if ( ! Events.currentBlock.hasClass('open') ) {
			Events.currentBlock.addClass('open');
			Events.currentInfo.addClass('show').delay(500).animate({opacity: 1}, 300, function () {
				// turn off event listener
				Events.currentBlock.off('click');
			});
		}
	},
	closerClick : function (e) {
		e.preventDefault();
		Events.currentInfo.stop().animate({opacity: 0}, 300, function () {
			Events.currentInfo.removeClass('show');
			Events.currentBlock.removeClass('open');
			//turn on event listener
			Events.currentBlock.on('click', Events.openBlock);
		});
	}
}

window.onload = App.init;