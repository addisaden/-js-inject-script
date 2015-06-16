(function() {
  var master = document.createElement("div");
  master.setAttribute("style",
    "position: fixed;" +
    "bottom: 0px;" + 
    "right: 0px;" +
    "padding: 0;" +
    "margin: 0;" +
    "width: 40em;" +
    "max-width: 100%;" +
    "background-color: none;" +
    "color: #0c0;" +
    "font-family: monospace;" +
    "font-size: 1.1em;");
  document.body.appendChild(master);

  var output = document.createElement("div");
  output.setAttribute("style",
    "background-color: #000;" +
    "margin: 1em;" +
    "padding: 1em;"
    );

  output.log = function(e) {
    if(typeof e == "object") {
      var result = []
      for(var i in e) {
        result.push(i + ": " + e[i].toString());
      }
      result = e.toString() + " { " + result.join(", ") + " }";
      this.appendChild(document.createTextNode(result));
    } else {
      this.appendChild(document.createTextNode(e));
    }
    var br = document.createElement("br");
    br.setAttribute("style", "margin-bottom: 0.5em;");
    this.appendChild(br);
  };

  output.clear = function() {
    [].slice.call(this.childNodes).map((function(e) {
      this.removeChild(e);
    }).bind(this));
  }

  master.appendChild(output);

  var input_div = document.createElement("div");
  input_div.setAttribute("style",
    "background-color: #000;" +
    "margin: 1em;" +
    "padding: 1em;"
    );
  master.appendChild(input_div);

  var input = document.createElement("input");
  input_div.appendChild(input);
  input.setAttribute("style",
    "background-color: #000;" +
    "color: #0c0;" +
    "font-family: monospace;" +
    "font-size: 1.1em;" +
    "border: 0px solid #000;" +
    "width: 100%"
  );

  input.history = [];

  input.onkeyup = function(e) {
    // up 38
    // down 40
    if(e.keyCode == 38) {
      var cur = this.history.indexOf(this.value);
      var sel = cur + 1;
      if(this.history.length > sel) {
        this.value = this.history[sel];
      }
    } else if(e.keyCode == 40) {
      var cur = this.history.indexOf(this.value);
      var sel = cur - 1;
      if(this.history.length > sel && sel > -1) {
        this.value = this.history[sel];
      } else if(sel == -1) {
        this.value = "";
      }
    } else if(e.keyCode == 13) {
      try {
        this.history.unshift(this.value);
        // make history unique
        var new_history = [];
        for(var i = 0; i < this.history.length; i++) {
          if(new_history.indexOf(this.history[i]) == -1) {
            new_history.push(this.history[i]);
          }
        }
        this.history = new_history;
        // ---
        if(this.value.match(/^\s*clear\s*$/)) {
          output.clear();
        } else if(this.value.match(/^\s*exit\s*$/)) {
          document.body.removeChild(master);
        } else if(this.value.match(/^\s*(.*)\.\s*$/)) {
          output.log("methods of " + this.value);
          var m = this.value.match(/^\s*(.*)\.\s*$/)[1];
          output.log(eval.call(this, "Object.getOwnPropertyNames(" + m + ")").join(", "));
        } else {
          output.log(">> " + this.value);
          output.log(eval.call(this, this.value));
        }
      }
      catch(e) {
        output.log(e);
      }
      this.value = "";
      this.focus();
    }
  };
})();