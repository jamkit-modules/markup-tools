Markdown = (function() {
    return {}
})();

Markdown.parser = include("./parser.js");

// class MarkdownModel

function MarkdownModel(elements) {
    this.elements = elements;
}

// instance factory

Markdown.parse = function(text, urls) {
    return new MarkdownModel(this.parser.parse(text, urls));
}

__MODULE__ = Markdown;
