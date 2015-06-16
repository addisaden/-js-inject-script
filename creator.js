(function() {
  var master = this.createElement("div");
  this.body.appendChild(master);
  master.setAttribute("style",
    "position: fixed;" +
    "top: 1em;" +
    "left: 1em;" +
    "width: 640px;" +
    "max-width: 90%;" +
    "border: 1px solid #777;" +
    "padding: 1em;" +
    "background-color: #fff;"
  );

  var close = this.createElement("p");
  master.appendChild(close);
  close.appendChild(this.createTextNode("[x] close"));
  close.setAttribute("style", "cursor: pointer;");
  close.onclick = function() { this.parentNode.parentNode.removeChild(this.parentNode);
  };

  var app_div = this.createElement("div");
  master.appendChild(app_div);
  app_div.setAttribute("style", "width: 100%;");
  var app = this.createElement("a");
  app_div.appendChild(app);
  app.appendChild(this.createTextNode("Js::App"));
  app.setAttribute("style", "color: #3399ff; cursor: pointer;");

  var app_loader = this.createElement("span");
  app_div.appendChild(this.createTextNode(" "));
  app_div.appendChild(app_loader);
  app_loader.setAttribute("style", "cursor: pointer; color: #f93;");
  app_loader.appendChild(this.createTextNode("Load App"));
  
  var text = this.createElement("textarea");
  master.appendChild(text);
  text.setAttribute("spellcheck", "false");
  text.setAttribute("style", "width: 100%; height: 20em; max-height: 100%; font-family: monospace; font-size: 1em;");

  app_loader.onclick = function() {
    var newcode = prompt("Please copy your bookmark-code here:");
    newcode = decodeURIComponent(newcode);
    newcode = newcode.replace(/^javascript:/, "").replace(/;undefined;$/, "");
    text.value = newcode;
  }

  text.onkeyup = function() {
    var code = encodeURIComponent( text.value + ";undefined;" );
    app.setAttribute("href", "javascript:" + code);
  };

}).call(document);
