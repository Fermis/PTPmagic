// ==UserScript==
// @name                PTP Bonus Point Tool
// @namespace           passthepopcorn.me
// @description         ***Magic***
// @include             https://*.passthepopcorn.me/bprate.php*
// @include             https://passthepopcorn.me/bprate.php*
// @include             http://*.passthepopcorn.me/bprate.php*
// @include             http://passthepopcorn.me/bprate.php*
// @grant               GM_xmlhttpRequest
// @downloadURL         https://raw.githubusercontent.com/Fermis/PTPmagic/master/magic.js
// @version             2.0.0
// @author              Fermis
// ==/UserScript==


// Change log (mm/dd/yyyy)
// 
//	02/23/2017
//  rewrite to work via promises instead of callbacks, code clean up
//
// parts of this script were taken from coj's script (http://pastebin.com/xYFnCVJa)

var magic = (function(){
	var defaults = {
		order: 'asc',
		bpTableId: 'fermis-magic-table',
		calculatedColName: '(BP/Yr)/Size (GiB)',
		// Constants in the BP/hour formula
		BPHr: {
			a: 0.25,
			b: 0.6,
			c: 0.6,
			constGoldenMultiplier: 2.0,
			constYears: 3.0, // 3-year horizon (can be changed)
			constDaysPerYear: 365.2422
		}
	};
	defaults.BPHr.period = defaults.BPHr.constYears * defaults.BPHr.constDaysPerYear;

	var magic = function(options){
		var that = this;
		
		that.settings = that.mergeObjects(defaults, options || {});

		// should probably improve this as it's ugly
		that.importScript('https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js', function(){
			that.importStyle('//cdn.datatables.net/1.10.13/css/jquery.dataTables.min.css', function(){
				that.importScript('//cdn.datatables.net/1.10.13/js/jquery.dataTables.min.js', function(){
					that.importScript('//cdn.jsdelivr.net/bluebird/3.4.7/bluebird.min.js', function(){
						that.init();
					});				
				});
			});
		});	
	}

	magic.prototype.init = function(){
		var that = this;
		return new Promise(function(resolve, reject){
			// css loader from http://projects.lukehaas.me/css-loaders/
			var cssText = ".loader {font-size: 90px; text-indent: -9999em; overflow: hidden; width: 1em; height: 1em; border-radius: 50%; margin: 0.8em auto; position: relative; -webkit-transform: translateZ(0); -ms-transform: translateZ(0); transform: translateZ(0); -webkit-animation: load6 1.7s infinite ease; animation: load6 1.7s infinite ease; } @-webkit-keyframes load6 {0% {-webkit-transform: rotate(0deg); transform: rotate(0deg); box-shadow: 0 -0.83em 0 -0.4em #ffffff, 0 -0.83em 0 -0.42em #ffffff, 0 -0.83em 0 -0.44em #ffffff, 0 -0.83em 0 -0.46em #ffffff, 0 -0.83em 0 -0.477em #ffffff; } 5%, 95% {box-shadow: 0 -0.83em 0 -0.4em #ffffff, 0 -0.83em 0 -0.42em #ffffff, 0 -0.83em 0 -0.44em #ffffff, 0 -0.83em 0 -0.46em #ffffff, 0 -0.83em 0 -0.477em #ffffff; } 10%, 59% {box-shadow: 0 -0.83em 0 -0.4em #ffffff, -0.087em -0.825em 0 -0.42em #ffffff, -0.173em -0.812em 0 -0.44em #ffffff, -0.256em -0.789em 0 -0.46em #ffffff, -0.297em -0.775em 0 -0.477em #ffffff; } 20% {box-shadow: 0 -0.83em 0 -0.4em #ffffff, -0.338em -0.758em 0 -0.42em #ffffff, -0.555em -0.617em 0 -0.44em #ffffff, -0.671em -0.488em 0 -0.46em #ffffff, -0.749em -0.34em 0 -0.477em #ffffff; } 38% {box-shadow: 0 -0.83em 0 -0.4em #ffffff, -0.377em -0.74em 0 -0.42em #ffffff, -0.645em -0.522em 0 -0.44em #ffffff, -0.775em -0.297em 0 -0.46em #ffffff, -0.82em -0.09em 0 -0.477em #ffffff; } 100% {-webkit-transform: rotate(360deg); transform: rotate(360deg); box-shadow: 0 -0.83em 0 -0.4em #ffffff, 0 -0.83em 0 -0.42em #ffffff, 0 -0.83em 0 -0.44em #ffffff, 0 -0.83em 0 -0.46em #ffffff, 0 -0.83em 0 -0.477em #ffffff; } } @keyframes load6 {0% {-webkit-transform: rotate(0deg); transform: rotate(0deg); box-shadow: 0 -0.83em 0 -0.4em #ffffff, 0 -0.83em 0 -0.42em #ffffff, 0 -0.83em 0 -0.44em #ffffff, 0 -0.83em 0 -0.46em #ffffff, 0 -0.83em 0 -0.477em #ffffff; } 5%, 95% {box-shadow: 0 -0.83em 0 -0.4em #ffffff, 0 -0.83em 0 -0.42em #ffffff, 0 -0.83em 0 -0.44em #ffffff, 0 -0.83em 0 -0.46em #ffffff, 0 -0.83em 0 -0.477em #ffffff; } 10%, 59% {box-shadow: 0 -0.83em 0 -0.4em #ffffff, -0.087em -0.825em 0 -0.42em #ffffff, -0.173em -0.812em 0 -0.44em #ffffff, -0.256em -0.789em 0 -0.46em #ffffff, -0.297em -0.775em 0 -0.477em #ffffff; } 20% {box-shadow: 0 -0.83em 0 -0.4em #ffffff, -0.338em -0.758em 0 -0.42em #ffffff, -0.555em -0.617em 0 -0.44em #ffffff, -0.671em -0.488em 0 -0.46em #ffffff, -0.749em -0.34em 0 -0.477em #ffffff; } 38% {box-shadow: 0 -0.83em 0 -0.4em #ffffff, -0.377em -0.74em 0 -0.42em #ffffff, -0.645em -0.522em 0 -0.44em #ffffff, -0.775em -0.297em 0 -0.46em #ffffff, -0.82em -0.09em 0 -0.477em #ffffff; } 100% {-webkit-transform: rotate(360deg); transform: rotate(360deg); box-shadow: 0 -0.83em 0 -0.4em #ffffff, 0 -0.83em 0 -0.42em #ffffff, 0 -0.83em 0 -0.44em #ffffff, 0 -0.83em 0 -0.46em #ffffff, 0 -0.83em 0 -0.477em #ffffff; } }";

			var loadStyle = document.createElement("style");
			loadStyle.type = "text/css";
			loadStyle.appendChild(document.createTextNode(cssText));

			var head = document.head || document.getElementsByTagName('head')[0];
			head.insertBefore(loadStyle, head.lastChild);

			// remove current table and add in loading animation
			var old_body = document.getElementsByClassName('table')[1].children[1];

			var outerDiv = document.createElement("div");
			var att = document.createAttribute("style");
			att.value = "margin-left: 35em;";
			outerDiv.setAttributeNode(att);

			var div = document.createElement("div");
			var att = document.createAttribute("class");
			att.value = "loader";
			div.setAttributeNode(att);

			outerDiv.appendChild(div);
			old_body.parentNode.replaceChild(outerDiv, old_body);

			order = that.settings.order;
			
			var lastPage = that.getLastPage();
			console.log('lastPage: ' + lastPage);
			var pages = [];
			for(var i = 1; i < lastPage+1; i++){
				console.log(i);
				var baseUrl = window.location.origin + window.location.pathname;
        		var url = baseUrl + "?page=" + i + "&order_by=bp&order_way=asc";
				pages.push(that.loadPage(url));
			}
			
			return Promise.all(pages).then(function(p){
				data = [];
				for(i in p){
					for(j in p[i]){
						data.push(p[i][j]);
					}
				}
				that.addNewTable(data);

				$('#'+that.settings.bpTableId).DataTable();
				
				resolve();
			});
		}).catch(function(err){
			// need to add in more error handling
			console.log(err);
		});
	}

	magic.prototype.loadPage = function(url){
		var that = this;
		return new Promise(function(resolve, reject){
			var xmlhttp = new XMLHttpRequest();
			xmlhttp.open("GET", url, true);
			// xmlhttp.onreadystatechange = receiveResponse;
			xmlhttp.onreadystatechange = function(){
				if (this.readyState == 4){
					// xhr.readyState == 4, so we've received the complete server response
					if (this.status == 200){
						// xhr.status == 200, so the response is good
						var page = this.responseText;
						// toDomEl(response, callback);
						var e = document.createElement('div');
						e.innerHTML = page;
						resolve(that.buildRow(e));
					}else{
						reject(url+' not loaded properly');
					}
				}
			};
			xmlhttp.send();
		});
	}

	magic.prototype.getLastPage = function(){
		var that = this;
		var testEl = document.getElementsByClassName('pagination')[0];
		if (typeof testEl !== "undefined"){
			var linkBar = testEl.children;

			if (typeof linkBar !== "undefined"){
				if (linkBar.length > 0){
					var linkLength = linkBar.length;
					var lastPage = linkBar[linkLength-1].attributes.href.nodeValue;
					last = parseInt(that.gup("page", lastPage));
				}
			}else{
				last = 1;
			}
		}else{
			last = 1;
		}
		return last;
	}	

	magic.prototype.addNewTable = function(content){
		var that = this;

		// remove page numbers
		var nextPageBar = document.getElementsByClassName("pagination--bottom")[0];
		nextPageBar.parentNode.removeChild(nextPageBar);

		
		var head = document.getElementsByClassName('table')[1].children[0].children[0];
		
		// remove PTP sorting so datatables can do it's thing
		for (var i = 0; i < head.children.length; i++){
			var link = head.children[i].getElementsByTagName('a')[0];
			link.href = "javascript:void(0)";
		}

		// add new (BP/Yr)/Size (GiB) to the table head
		var th = document.createElement("th");
		var a = document.createElement("a");
		a.href = "javascript:void(0)";
		a.appendChild(document.createTextNode(that.settings.calculatedColName));
		th.appendChild(a);
		head.appendChild(th);
		th.appendChild(a);
		head.appendChild(th);

		// create the new table
		var table = document.getElementsByClassName('table')[1];
		table.setAttribute('id',that.settings.bpTableId)
		var old_body = document.getElementsByClassName('table')[1].children[1];
		var new_body = document.createElement('tbody');

		for(i in content){
			var tr = document.createElement('tr');
			var td = document.createElement('td');

			td.appendChild(content[i].nameRaw);
			tr.appendChild(td);

			var td = document.createElement('td');
			td.appendChild(content[i].gp);
			tr.appendChild(td);
			tr.appendChild(td);

			var td = document.createElement('td');
			td.appendChild(content[i].sizeRaw);
			tr.appendChild(td);

			var td = document.createElement('td');
			td.appendChild(content[i].ul);
			tr.appendChild(td);

			var td = document.createElement('td');
			td.appendChild(content[i].time);
			tr.appendChild(td);

			var td = document.createElement('td');
			td.appendChild(content[i].BPhr);
			tr.appendChild(td);

			var td = document.createElement('td');
			td.appendChild(content[i].BPday);
			tr.appendChild(td);

			var td = document.createElement('td');
			td.appendChild(content[i].BPweek);
			tr.appendChild(td);

			var td = document.createElement('td');
			td.appendChild(content[i].BPmonth);
			tr.appendChild(td);

			var td = document.createElement('td');
			td.appendChild(content[i].BPyear);
			tr.appendChild(td);

			var ratio = content[i].AvgBpPerYearPerGiB;
			var td = document.createElement("td");
			var text = document.createTextNode(ratio);
			td.style.color = content[i].color;
			td.appendChild(text);
			tr.appendChild(td);

			new_body.appendChild(tr);
		}

		// insert the new table with all the torernts
		old_body.parentNode.replaceChild(new_body, old_body);
		return true;
	}

	magic.prototype.buildRow = function(page){
		var that = this;
		data = [];
		el = page.getElementsByClassName('table')[1].children[1].children;
        length = el.length;
        for (var i = 0; i < el.length; i++){
            var name = el[i].children[0].children[0].innerText;
            var href = el[i].children[0].children[0].getAttribute("href");
            var nameRaw = el[i].children[0];
            var gp = el[i].children[1];
            var sizeRaw = el[i].children[2];
            var ul = el[i].children[3];
            var time = el[i].children[4];
            var BPhr = el[i].children[5];
            var BPday = el[i].children[6];
            var BPweek = el[i].children[7];
            var BPmonth = el[i].children[8];
            var BPyear = el[i].children[9];
            var size = el[i].children[2].innerHTML;
            var pointPerYr = el[i].children[9].innerHTML;
            var pointPerMonth = el[i].children[8].innerHTML;
            var pointPerWeek = el[i].children[7].innerHTML;
            var pointPerDay = el[i].children[6].innerHTML;
            var pointPerHr = el[i].children[5].innerHTML;

            // Apply factors by coj
            var splitSize = size.split(" ");
            splitSize[0] = splitSize[0].trim();
            splitSize[1] = splitSize[1].trim()
            if (splitSize[1] == "KiB") {
                size = parseFloat(splitSize[0]) / 1000000;
            } else if (splitSize[1] == "MiB") {
                size = parseFloat(splitSize[0]) / 1000;
            } else if (splitSize[1] == "GiB") {
                size = parseFloat(splitSize[0]);
            } else if (splitSize[1] == "TiB") {
                size = parseFloat(splitSize[0]) * 1000;
            } else if (splitSize[1] == "PiB") {
                size = parseFloat(splitSize[0]) * 1000000;
            } else {
                size = parseFloat(splitSize[0]);
            }

            // temp is the JSON object to store the data relating to each row
            var temp = {};

            if (gp.children[0]){
                temp["gpValue"] = 1;
                var goldenMultiplier = that.settings.BPHr.constGoldenMultiplier;
            }else{
                temp["gpValue"] = 0;
                var goldenMultiplier = 1.0;
            }

            pointPerYr = pointPerYr.replace(",","").trim();
            pointperYr = parseFloat(pointPerYr);

            pointPerMonth = pointPerMonth.replace(",","").trim();
            pointPerMonth = parseFloat(pointPerMonth);

            pointPerWeek = pointPerWeek.replace(",","").trim();
            pointPerWeek = parseFloat(pointPerWeek);

            pointPerDay = pointPerDay.replace(",","").trim();
            pointPerDay = parseFloat(pointPerDay);

            pointPerHr = pointPerHr.replace(",","").trim();
            pointPerHr = parseFloat(pointPerHr);

            var ratio =  pointPerYr / size;

            /* Calculate average BP using BH39's formula */
            var avgBpPerHour = pointperYr / 8765.81; // average hours per year
            // If avgBpPerHour is too close to pointPerHr, use avgBpPerHour instead to ensure precision
            if (avgBpPerHour / pointPerHr > (0.995 - 0.05/pointPerHr)) {
                pointPerHr = avgBpPerHour;
            }

            var fractionOfDaySeeding = Math.round((avgBpPerHour / pointPerHr) * 24) / 24.0;
            var effectivePeriod = fractionOfDaySeeding * that.settings.BPHr.period;
            var accurateBpPerHour = avgBpPerHour / fractionOfDaySeeding;
            console.log('goldenMultiplier: ',goldenMultiplier);

            // Seeds
            var rawSeeds = parseFloat(ul.innerHTML.trim().replace(',', ''));
            var seeds = Math.max(1.0, rawSeeds);
            var Q = that.settings.BPHr.b / Math.pow(seeds, that.settings.BPHr.c); // intermediate calculation
            console.log('Q: ', Q);
            // Seedtime in days
            var t = Math.exp( (accurateBpPerHour/(size*goldenMultiplier) - that.settings.BPHr.a) / Q ) - 1.0;
            console.log('t: ', t);
            console.log('(t).toFixed(1): ', (t).toFixed(1));
            var seedTimeInDays = that.numbers((t).toFixed(1));        

            // Calculate average BP/year divided by size (g)
            var AvgBpPerYearPerGiB = (24.0 * ( that.settings.BPHr.a*effectivePeriod + Q * ((t + 1.0 + effectivePeriod)*(Math.log(t + 1.0 + effectivePeriod)) - (t + 1.0)*(Math.log(t + 1.0)) - effectivePeriod) ) * goldenMultiplier) / that.settings.BPHr.constYears;
            var color = that.colourize(AvgBpPerYearPerGiB);
            console.log('(AvgBpPerYearPerGiB).toFixed(1): ', (AvgBpPerYearPerGiB).toFixed(1));
            AvgBpPerYearPerGiB = that.numbers((AvgBpPerYearPerGiB).toFixed(1)) + ((rawSeeds < 0.99) ? " <b>?</b>" : "");
            var AvgBpPerYearPerGiBNum = parseFloat(AvgBpPerYearPerGiB.replace(",", ""));
           
            temp["pointPerYr"] = parseFloat(pointPerYr);
            temp["pointPerMonth"] = pointPerMonth;
            temp["pointPerWeek"] = pointPerWeek;
            temp["pointPerDay"] = pointPerDay;
            temp["pointPerHr"] = pointPerHr;
            temp["seedTimeInDays"] = parseFloat(seedTimeInDays);
            temp["AvgBpPerYearPerGiB"] = AvgBpPerYearPerGiB;
            temp["AvgBpPerYearPerGiBNum"] = AvgBpPerYearPerGiBNum;
            temp["color"] = color;
            temp["nameRaw"] = nameRaw;
            temp["gp"] = gp;
            temp["seeds"] = seeds;
            temp["sizeRaw"] = sizeRaw;
            temp["size"] = size;
            temp["ul"] = ul;
            temp["time"] = time;
            temp["BPhr"] = BPhr;
            temp["BPday"] = BPday;
            temp["BPweek"] = BPweek;
            temp["BPmonth"] = BPmonth;
            temp["BPyear"] = BPyear;
            temp["ratio"] = ratio;
            temp["name"] = name;
            temp["href"] = href;

            data.push(temp);
        }
        return data;
	}

	magic.prototype.mergeObjects = function(base, newObj){
		var that = this;
		for(var attr in newObj){
			if(typeof(newObj[attr]) == 'object' && typeof(base[attr] !== 'undefined')){
				base[attr] = that.mergeObjects(base[attr], newObj[attr]);	
			}
			base[attr] = newObj[attr]; 
		}
		return base;
	}

	// written by coj
	magic.prototype.colourize = function(rate) {
		// Colorize: 0-10k is red/brown, 10-20k is yellow, 20-30k is green, beyond is blue-green/cyan.
		// Requires browser that supports CSS 3.
		rate = rate / 1000.0;
		var hue = Math.min(180, 4.0 * rate);
		var sat = Math.min(100, 50.0 + (4.0/3.0) * rate);
		var light = Math.min(50, 40.0 + 3.0 * rate);
		return 'hsl('+hue+', '+sat+'%, '+light+'%)';
	}

	// https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
	magic.prototype.numbers = function(x) {
		var numbers = x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		console.log('numbers: ',numbers);
		if(numbers == 'NaN'){
			console.log('x: ', x);
		}
		return numbers;
	}

	magic.prototype.gup = function(name, url){
		if(!url){ 
			url = location.href;
		}
		name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
		var regexS = "[\\?&]"+name+"=([^&#]*)";
		var regex = new RegExp( regexS );
		var results = regex.exec( url );
		return results == null ? null : results[1];
	}

	magic.prototype.importScript = (function (oHead) {
		var that = this;
		function loadError (oError) {
			throw new URIError("The script " + oError.target.src + " is not accessible.");
		}
		var importScript = function (url, callback){
			var oScript = document.createElement("script");
			oScript.type = "text/javascript";
			oScript.onerror = loadError;
			if (callback) { 
				oScript.onload = callback; 
			}
			oScript.src = url;
			oHead.appendChild(oScript);
		};
		return importScript;
	})(document.head || document.getElementsByTagName("head")[0]);

	magic.prototype.importStyle = (function (oHead) {
		var that = this;
		function loadError (oError) {
			throw new URIError("The script " + oError.target.src + " is not accessible.");
		}
		var importStyle = function (url, callback){
			var oStyle = document.createElement("link");
			oStyle.rel = "stylesheet";
			oStyle.onerror = loadError;
			if (callback) { 
				oStyle.onload = callback; 
			}
			oStyle.href = url;
			oHead.appendChild(oStyle);
		};
		return importStyle;
	})(document.head || document.getElementsByTagName("head")[0]);

	return magic;
})();

// kick off the script
new magic();
