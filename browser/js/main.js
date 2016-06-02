// Generated by CoffeeScript 1.10.0
(function() {
  $(function() {
    var codeMirror, resetWorker, w;
    codeMirror = CodeMirror((function(elt) {
      return $("#code").replaceWith(elt);
    }), {
      value: "#include <iostream>\nusing namespace std;\nint main() {\n\n}",
      theme: "material"
    });
    w = null;
    (resetWorker = function() {
      w = new Worker("js/run.js");
      return w.onmessage = function(e) {
        var ref, type, value;
        ref = e.data, type = ref.type, value = ref.value;
        if (type === "status") {
          return $("#exitstatus").text(value);
        } else {
          return $("#output").text(value);
        }
      };
    })();
    $("#compile").click(function() {
      return w.postMessage({
        command: "compile",
        code: codeMirror.getValue()
      });
    });
    $("#run").click(function() {
      return w.postMessage({
        command: "run",
        code: codeMirror.getValue(),
        input: $("#input").val()
      });
    });
    return $("#kill").click(function() {
      $("#exitstatus").text("Killed");
      w.terminate();
      return resetWorker();
    });
  });

}).call(this);