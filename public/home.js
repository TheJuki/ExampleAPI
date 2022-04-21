$(function() {
  $(".copy-button").popup({
    content: "Copy to clipboard",
    position: "right center"
  });

  var clipboard = new Clipboard(".copy-button");

  clipboard.on("success", function(e) {
    e.clearSelection();
    $(e.trigger).popup("change content", "Copied");
  });

  clipboard.on("error", function(e) {
    $(e.trigger).popup("change content", "Please copy manually");
  });
});
