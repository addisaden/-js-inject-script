(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw 
f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof 
require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
exports.json = function(data) {
  return JSON.stringify(data);
};

exports.csv = function(data) {
  var results = [];
  results.push([]);
  
  // make header
  for(var i in data) {
    for(var j in data[i]) {
      if(results[0].indexOf(j) === -1) {
        results[0].push(j);
      }
    }
  }

  for(var i in data) {
    var linedata = new Array(results[0].length);
    for(var j in data[i]) {
      var id = results[0].indexOf(j);
      linedata[id] = "\"" + data[i][j].replace(/"/g, "\\\"") + "\"";
    }
    results.push(linedata);
  }

  results[0] = results[0].map(function(e) {
    return "\"" + e.replace(/"/g, "\\\"") + "\"";
  });
  
  results = results.map(function(e) { return e.join(";"); }).join("\r\n");

  return results;
};

},{}],2:[function(require,module,exports){
var VirtualBrowser = require("./virtualbrowser.js");

var scanner = VirtualBrowser.window(function(url, current, app, scanarray, resultarray) {
  var xxx = ([].slice.call(this.document.getElementsByClassName("is24-ex-details")[0].getElementsByClassName("print-two-columns")).map(function(i) {
    return [].slice.call(i.getElementsByTagName("dl"));
  }))
 
  var xy = [];
 
  for(var i in xxx) {
    for(var j in xxx[i]) {
      xy.push(xxx[i][j]);
    }
  }
 
 xy.map(function(i) {
   current[i.children[0].textContent.trim()] = i.children[1].textContent.trim();
 });
 
 resultarray.push(current);
 var next = scanarray.pop();
 
 if(next) {
   scanner(next.url, next, app, scanarray, resultarray);
 } else {
   app._immoscan = false;
   app.scanned();
 }
});

exports.scanall = function(app, scanarray, resultarray) {
  if(scanarray.length > 0) {
    app._immoscan = true;
    var next = scanarray.pop()
    scanner(next.url, next, app, scanarray, resultarray);
  }
};

},{"./virtualbrowser.js":4}],3:[function(require,module,exports){
var VirtualBrowser = require("./virtualbrowser.js");

var scanDocument = function(doc) {
  var el = doc.getElementsByClassName("resultlist_entry_data");

  var results = [].slice.call(el).map(function(e) {
    return e.childNodes[1].childNodes[1].childNodes[1].href;
  });

  return results;
};



var search_iframe = VirtualBrowser.iframe(function(link, suchobject, tab, callback) {
  var results = scanDocument(this.document);

  for(var i in results) {
    suchobject.push(results[i]);
  }

  try {
    var nextPage = this.document.getElementById("pager_next").getElementsByTagName("a")[0].href;
  }
  catch(e) {
    var nextPage = undefined;
  }

  if(nextPage) {
    search_iframe(nextPage, suchobject, tab, callback);
  } else {
    callback();
    tab.close();
  }
});



var search_window = VirtualBrowser.master(function(link, suchobject, callback) {
  var formular = this.document.body.getElementsByClassName("parbase sectionheader section")[0];
  [].slice.call(this.document.body.childNodes).map((function(e) { this.document.body.removeChild(e); }).bind(this));
  this.document.body.appendChild(formular);

  // add a watcher. alerts when change the site
  var watcher = {};
  watcher.url = this.window.location.href;

  var intervalId = setInterval((function(href) {
    if(watcher.url != this.window.location.href) {

      // test if site is a searchsite
      var results = scanDocument(this.window.document);
      if(results.length > 0) {
        if(this.window.confirm("Möchten Sie diese Seite verwenden?")) {
          clearInterval(intervalId);
          for(var i in results) {
            suchobject.push(results[i]);
          }

          try {
            var nextPage = this.window.document.getElementById("pager_next").getElementsByTagName("a")[0].href;
          }
          catch(e) {
            var nextPage = undefined;
          }

          if(nextPage) {
            this.window.alert("Bitte haben Sie ein wenig geduld, bis die Suchergebnisse gesamelt wurden.");
            search_iframe(nextPage, suchobject, this.tab, callback);
          } else {
            callback();
            this.tab.close();
          }
        }
      }
    }
  }).bind(this, watcher), 50);
});

exports.start = function(suchobject, callback) {
  search_window("http://www.immobilienscout24.de/", suchobject, callback);
}

},{"./virtualbrowser.js":4}],4:[function(require,module,exports){
exports.iframe = function(callback) {
  return function(link) {
    var savedArguments = arguments;
    var bs = document.createElement("iframe");
    bs.setAttribute("src", link);
    bs.setAttribute("style", "display: none;");
    bs.onload = (function() {
      var clonedNodes = {
        document: bs.contentDocument.cloneNode(true)
      };
      document.body.removeChild(bs)
      callback.apply(clonedNodes, savedArguments);
    }).bind(this);
    document.body.appendChild(bs);
  }
}



exports.window = function(callback) {
  return function(link) {
    var savedArguments = arguments;
    var bs = window.open(link);
    bs.window.onload = (function() {
      var clonedNodes = {
        document: bs.document.cloneNode(true)
      };
      bs.close();
      callback.apply(clonedNodes, savedArguments);
    }).bind(this);
  };
};



exports.browser = function(callback) {
  return function(link) {
    var savedArguments = arguments;
    var bs = window.open(link);
    bs.window.onload = (function() {
      var clonedNodes = {
        document: bs.document,
        window: bs.window
      };
      callback.apply(clonedNodes, savedArguments);
      bs.close();
    }).bind(this);
  };
};



exports.master = function(callback) {
  return function(link) {
    var savedArguments = arguments;
    var bs = window.open(link);
    bs.window.onload = (function() {
      var clonedNodes = {
        document: bs.document,
        window: bs.window,
        tab: bs
      };
      callback.apply(clonedNodes, savedArguments);
    }).bind(this);
  };
};

},{}],5:[function(require,module,exports){
var ImmoScan = require("./immoscan.js");
var ImmoSearch = require("./immosearch.js");
var DataExport = require("./dataexport.js");

module.exports = function(w) {
  this.window = w;
  this.searchresults = {};

  // clean body
  [].slice.call(this.window.document.body.childNodes).map((function(e) {
    this.window.document.body.removeChild(e);
  }).bind(this));

  // create header
  var header = this.window.document.createElement("h1");
  header.appendChild(this.window.document.createTextNode("Immobilien Scout24 Grabber"));
  this.window.document.body.appendChild(header);

  // searchbutton
  var createSearch = this.window.document.createElement("h3");
  createSearch.setAttribute("style", "cursor: pointer");
  createSearch.appendChild(this.window.document.createTextNode("Starte neue Suche"));
  createSearch.onclick = (function() {
    var searchtitle = this.window.prompt("Wie möchten Sie die Suche nennen?");
    this.searchresults.search = this.searchresults.search || {};
    var suche = this.searchresults.search[searchtitle] = [];

    ImmoSearch.start(suche, this.newMatches.bind(this));
  }).bind(this);
  this.window.document.body.appendChild(createSearch);

  // scanbutton
  var scanMatches = this.window.document.createElement("h3");
  scanMatches.setAttribute("style", "cursor: pointer");
  this._scanButtonText = this.window.document.createTextNode("Scanne 0 Immobilien");
  scanMatches.appendChild(this._scanButtonText);
  scanMatches.onclick = this.scanall.bind(this);
  this.window.document.body.appendChild(scanMatches);

  // Timediff
  this._start = new Date;
  var zeitfenster = this.window.document.createElement("p");
  this._timeString = this.window.document.createTextNode("");
  zeitfenster.appendChild(this._timeString);
  zeitfenster.setAttribute("style", "font-size: 1.3em; color: #f93;");
  this.window.document.body.appendChild(zeitfenster);
  this.timeElapsed();
  setInterval(this.timeElapsed.bind(this), 1000);

  // Export Buttons
  var exporter = this.window.document.createElement("p");
  this.exportDate = this.window.document.createTextNode("Noch keine Daten vorhanden.");
  this.exportCsv = this.window.document.createElement("a");
  this.exportCsv.setAttribute("href", "#");
  this.exportCsv.appendChild(this.window.document.createTextNode("CSV-Datei"));
  this.exportJson = this.window.document.createElement("a");
  this.exportJson.setAttribute("href", "#");
  this.exportJson.appendChild(this.window.document.createTextNode("JSON-Datei"));

  this.window.document.body.appendChild(exporter);
  exporter.appendChild(this.exportDate);
  exporter.appendChild(this.window.document.createElement("br"));
  exporter.appendChild(this.exportCsv);
  exporter.appendChild(this.window.document.createElement("br"));
  exporter.appendChild(this.exportJson);
};

module.exports.prototype.newMatches = function() {
  var lengthOfScan = 0;
  for(var s in this.searchresults.search) {
    for(var i in this.searchresults.search[s]) {
      lengthOfScan += 1;
    }
  }
  this._scanButtonText.textContent = "Scanne "+ lengthOfScan + " Immobilien";
};

module.exports.prototype.timeElapsed = function() {
  this._timeString.textContent = (((new Date) - this._start) / (1000 * 60)).toFixed(2).replace(".", ",") + " Minuten";
};

module.exports.prototype.scanall = function() {
  this._toScan = this._toScan || [];
  this.data = this.data || [];
  for(var s in this.searchresults.search) {
    for(var i in this.searchresults.search[s]) {
      this._toScan.push({
        search: s,
        url: this.searchresults.search[s][i],
        date: String(new Date)
      });
    }
    delete this.searchresults.search[s];
  }
  this._immoscan = false;
  if (this._immoscan == false) {
    ImmoScan.scanall(this, this._toScan, this.data);
  }
};

module.exports.prototype.scanned = function() {
  this.newMatches();
  this.exportJson.setAttribute(
      "href",
      "data:application/json;charset=utf-8," + encodeURIComponent(DataExport.json(this.data))
      );
  this.exportCsv.setAttribute(
      "href",
      "data:text/csv;charset=utf-8," + encodeURIComponent(DataExport.csv(this.data))
      );
  var names = [];
  for(var i in this.data) {
    if(names.indexOf(this.data[i].search) === -1) {
      names.push(this.data[i].search);
    }
  }
  this.exportDate.textContent = this.data.length + " Ergebnisse für " + names.join(", ") + " (" + new Date + ")";
}

},{"./dataexport.js":1,"./immoscan.js":2,"./immosearch.js":3}],6:[function(require,module,exports){
if(window.location.host != "www.immobilienscout24.de") {
  if(confirm("You're not on \"www.immobilienscout24.de\". " +
        "Would you like to redirect? " +
        "You should run this script again")) {
    window.location = "http://www.immobilienscout24.de/";
  }
} else {
  var WebApp = require("./lib/webapp.js");
  window.WebApp = new WebApp(window);
}

},{"./lib/webapp.js":5}]},{},[6]);
undefined;
