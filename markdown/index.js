const module = (() => {
    const parser = require("./parser");

    function MarkdownModel(elements) {
        this.elements = elements;
    }

    return {
        parse: (text, urls) => {
            return new MarkdownModel(parser.parse(text, urls));
        },
    }
})();

__MODULE__ = module;
