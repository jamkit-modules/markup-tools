const module = (() => {
    const parser = include("./parser.js");

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
