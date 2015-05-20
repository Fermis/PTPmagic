// ==UserScript==
// @name                PTP Bonus Point Tool
// @namespace           passthepopcorn.me
// @description         ***Magic***
// @include             https://*.passthepopcorn.me/bprate.php*
// @grant               GM_xmlhttpRequest
// @downloadURL         https://raw.githubusercontent.com/Fermis/PTPmagic/master/magic.js
// @version             1.3
// @author              Fermis
// ==/UserScript==
 
// Change log
//
// 2015 09/04/2015
// Bug fix. Script would crash if the user only had one BP page.
//
// 2015 11/05/2015
// re-worked the code to make it cleaner and so a future update will be easier to implement.
 
// parts of this script were taken from coj's script (http://pastebin.com/xYFnCVJa)
 
/******************* Config *******************/ 
var serverUrl = "";

/***************** End Config *****************/

var data = [];
var current = 1;
var last = 0;
var order = "asc";
var prop = "AvgBpPerYearPerGiBNum";


 
// Constants in the BP/hour formula
var a = 0.25;
var b = 0.6;
var c = 0.6;
var constGoldenMultiplier = 2.0;
var constYears = 3.0; // 3-year horizon (can be changed)
var constDaysPerYear = 365.2422;
var period = constYears * constDaysPerYear;
 
function fixSort(){
    var head = document.getElementsByClassName('table')[1].children[0].children[0];
    var headLength = head.children.length;
 
    // remove all the links so we can do our own sorting
    for (var i = 0; i < headLength; i++){
        var link = head.children[i].getElementsByTagName('a')[0];
        link.href = "javascript:void(0)";
    }
   
    // Torrent col
    var link = head.children[0].getElementsByTagName('a')[0];
    link.addEventListener("click", function(){ reSort('name', data); });
 
 
    // GP col
    var link = head.children[1].getElementsByTagName('a')[0];
    link.addEventListener("click", function(){ reSort('gpValue', data); });
 
    // size col
    var link = head.children[2].getElementsByTagName('a')[0];
    link.addEventListener("click", function(){ reSort('size', data); });
 
 
    // Seeder col
    var link = head.children[3].getElementsByTagName('a')[0];
    link.addEventListener("click", function(){ reSort('seeds', data); });
 
 
    // seed time col
    var link = head.children[4].getElementsByTagName('a')[0];
    link.addEventListener("click", function(){ reSort('seedTimeInDays', data); });
 
    // BP/hr col
    var link = head.children[5].getElementsByTagName('a')[0];
    link.addEventListener("click", function(){ reSort('pointPerHr', data); });
 
 
    // BP/day col
    var link = head.children[6].getElementsByTagName('a')[0];
    link.addEventListener("click", function(){ reSort('pointPerDay', data); });
 
 
    // BP/week col
    var link = head.children[7].getElementsByTagName('a')[0];
    link.addEventListener("click", function(){ reSort('pointPerWeek', data); });
 
 
    // BP/month col
    var link = head.children[8].getElementsByTagName('a')[0];
    link.addEventListener("click", function(){ reSort('pointPerMonth', data); });
 
 
    // BP/year col
    var link = head.children[9].getElementsByTagName('a')[0];
    link.addEventListener("click", function(){ reSort('pointPerYr', data); });
 
}
 
function reSort(nprop, data){
    if (nprop == prop){
        if (order == "asc"){
            order = "desc";
            norder = false;
        }else{
            order = "asc";
            norder = true;
        }
    }else{
        prop = nprop;
        order = "asc";
        norder = true;
    }
    sortResults(nprop, norder, data);
    editPage();
}
 
function editHead(){
    var head = document.getElementsByClassName('table')[1].children[0].children[0];
    var th = document.createElement("th");
    var a = document.createElement("a");
    a.href = "javascript:void(0)";
    a.appendChild(document.createTextNode("(BP/Yr)/Size (GiB)"));
    a.addEventListener("click", function(){ reSort('AvgBpPerYearPerGiBNum', data); });
    th.appendChild(a);
    head.appendChild(th);


    var th = document.createElement("th");
    var a = document.createElement("a");
    a.href = "javascript:void(0)";
    a.appendChild(document.createTextNode("Delete"));

    th.appendChild(a);
    head.appendChild(th);
}
 
function editFooter(){
    var nextPageBar = document.getElementsByClassName("pagination--bottom")[0];
    nextPageBar.parentNode.removeChild(nextPageBar);
}
 
function editPage(){
 
    var content = data;
 
    var el = document.getElementsByClassName('table')[1].children[1].children;
    var old_body = document.getElementsByClassName('table')[1].children[1];
 
    var new_body = document.createElement('tbody');
    var contentLength = getLength(content);
   
    var i = 0;
    var theEnd = contentLength;
 
    for (; i<theEnd; i++){
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


        var td = document.createElement('td');
        var a = document.createElement('a');
        a.href = 'javascript:void(0)';
        a.id = 'deleteTorrent';
        a.setAttribute("data-url", "https://tls.passthepopcorn.me/" + content[i].href);
        a.addEventListener("click", function(){ nameClick(this) });
        var text = document.createTextNode("Delete");
        a.appendChild(text);
        td.appendChild(a);
        tr.appendChild(td);

        new_body.appendChild(tr);
    }
    old_body.parentNode.replaceChild(new_body, old_body);
}

function nameClick(el){
    console.log("click");
    var torUrl = el.getAttribute("data-url");
    getDlLink(torUrl);
    return false;
}

function getDlLink(url){
    var type = "dlLink";
    loadPage(url, type);
}


function getDlLinkCallback(page, tid){
    console.log(page);
    console.log(tid);
    var id = "#group_torrent_header_" + tid;
    var dlLink = "https://tls.passthepopcorn.me/" + $($(page).find(id + " .basic-movie-list__torrent__action a")[0]).attr('href');
    deleteTorrent(dlLink);
}

function deleteTorrent(tUrl){
    jQuery.ajax({
        type: 'POST',
        url: serverUrl,
        crossDomain: true,
        async : true,
        headers : { "Authorization" : "BasicCustom" },
        contentType: "application/text; charset=utf-8",
        data: '{"tUrl":"' + tUrl + '"}',
        dataType: 'jsonp',
        jsonp: false,
        jsonpCallback: function(){return 'serverCallback';},
    });
}

function serverCallback(data){
    if (!data){
        // error
        alert("There was an error communicating with the server, please try again.");
    }else{
        console.log('test');
        console.log(data);
        return true;
    }
}

function addJquery(callback){
    var script = document.createElement('script');
    script.src = 'https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js';
    script.type = 'text/javascript';
    document.getElementsByTagName('head')[0].appendChild(script);
    callback;
}

// get url parameter
function gup( name, url ) {
  if (!url) url = location.href
  name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
  var regexS = "[\\?&]"+name+"=([^&#]*)";
  var regex = new RegExp( regexS );
  var results = regex.exec( url );
  return results == null ? null : results[1];
}

function loadPages(){
    if (current < last){
        current++;
        var url = "https://tls.passthepopcorn.me/bprate.php?page=" + current + "&order_by=bp&order_way=asc";
        var type = "rowBuilder";
        var page = loadPage(url, type);
    }
    else{
        if (order == "asc"){
            data = sortResults("AvgBpPerYearPerGiBNum", true, data);
        }else{
            data = sortResults("AvgBpPerYearPerGiBNum", false, data);
        }
        // final callback
        editHead();
        var testEl = document.getElementsByClassName('pagination');
        if (testEl.length > 0){
            editFooter();
        }
        editPage();
        fixSort();
    }
}

function loadPage(href, type, extra){
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", href, true);
    // xmlhttp.onreadystatechange = receiveResponse;
    xmlhttp.onreadystatechange = function(){
        if (this.readyState == 4){
            // xhr.readyState == 4, so we've received the complete server response
            if (this.status == 200){
                // xhr.status == 200, so the response is good
                var page = this.responseText;
                // toDomEl(response, callback);
                switch(type) {
                    case "rowBuilder":
                        toDomEl(page, buildRow, {});
                        break;
                    case "dlLink":
                        var torrentId = gup('torrentid', href);
                        toDomEl(page, getDlLinkCallback, torrentId);
                        break;
                    default:
                        break;
                }
            }
        }
    };
    xmlhttp.send();
}

function getLength(json){
        var ct = 0;
        for (key in json){
                ct++;
        }
        return ct;
}
 
function toDomEl(html, callback, extra){
        var e = document.createElement('div');
        e.innerHTML = html;
        callback(e, extra);
        return true;
}
 
function sortResults(prop, asc, toSort) {
    toSort = toSort.sort(function(a, b) {
        if (asc) return (a[prop] > b[prop]) ? 1 : ((a[prop] < b[prop]) ? -1 : 0);
        else return (b[prop] > a[prop]) ? 1 : ((b[prop] < a[prop]) ? -1 : 0);
    });
    return toSort;
}
 
// https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
function numbers(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
 
// written by coj
function colourize(rate) {
    // Colorize: 0-10k is red/brown, 10-20k is yellow, 20-30k is green, beyond is blue-green/cyan.
    // Requires browser that supports CSS 3.
    rate = rate / 1000.0;
    var hue = Math.min(180, 4.0 * rate);
    var sat = Math.min(100, 50.0 + (4.0/3.0) * rate);
    var light = Math.min(50, 40.0 + 3.0 * rate);
    return 'hsl('+hue+', '+sat+'%, '+light+'%)';
}
 
var buildRow = function(page, extra){
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
                    var goldenMultiplier = constGoldenMultiplier;
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
                var effectivePeriod = fractionOfDaySeeding * period;
                var accurateBpPerHour = avgBpPerHour / fractionOfDaySeeding;
 
                // Seeds
                var rawSeeds = parseFloat(ul.innerHTML.trim().replace(',', ''));
                var seeds = Math.max(1.0, rawSeeds);
                var Q = b / Math.pow(seeds, c); // intermediate calculation
                // Seedtime in days
                var t = Math.exp( (accurateBpPerHour/(size*goldenMultiplier) - a) / Q ) - 1.0;
                var seedTimeInDays = numbers((t).toFixed(1));        
 
                // Calculate average BP/year divided by size (g)
                var AvgBpPerYearPerGiB = (24.0 * ( a*effectivePeriod + Q * ((t + 1.0 + effectivePeriod)*(Math.log(t + 1.0 + effectivePeriod)) - (t + 1.0)*(Math.log(t + 1.0)) - effectivePeriod) ) * goldenMultiplier) / constYears;
                var color = colourize(AvgBpPerYearPerGiB);
                AvgBpPerYearPerGiB = numbers((AvgBpPerYearPerGiB).toFixed(1)) + ((rawSeeds < 0.99) ? " <b>?</b>" : "");
                var AvgBpPerYearPerGiBNum = parseFloat(AvgBpPerYearPerGiB.replace(",", ""));
               
                var lastPlace = getLength(data);
               
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
 
                data[lastPlace+1] = temp;
        }
        loadPages();
}
 
function getAll(odr){
 
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
 
    order = odr;
    var testEl = document.getElementsByClassName('pagination')[0];
    var linkBar = testEl.children;
 
    if (typeof linkBar !== "undefined"){
        if (linkBar.length > 0){
            var linkLength = linkBar.length;
            var lastPage = linkBar[linkLength-1].attributes.href.nodeValue;
            lastPage = gup("page", lastPage);
            last = lastPage;
        }
    }else{
        last = 1;
    }

    loadPages();
}
 
function displayAsc(property){
    data = sortResults(property, true, data);
    editPage();
}
 
function displayDesc(property){
    data = sortResults(property, true, data);
    editPage();
}

addJquery(getAll("asc"));
