var module = (function() {
    const parser = include("./parser.js");

    // class MarkdownModel
    function MarkdownModel(elements) {
        this.elements = elements;
    }

    return {
        parse: function(text, urls) {
            return new MarkdownModel(parser.parse(text, urls));
        },
    }
})();

__MODULE__ = module;
