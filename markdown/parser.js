const module = (function() {
/* 
    LINE_AND_THEMATIC_BREAK: ((?:^|\n+) {0,3}(?:(?:- *)+|(?:_ *)+|(?:\* *)+)(?:\n+|$))
    CODE_BLOCK:              (?:(?:^|\n) {0,3}(`{3,}|~{3,})(.*)(?:\n|$))
    BLOCK_QUOTE:             ((?:(?:^|\n) *>(?: *[^ \n].*(?:\n *[^ \n].*)*|.*))+)
    LIST:                    ((?:(?:^|\n) *\* +.*(?:\n *`{0,2}[^` \n].+)*(?: *\n *)?)+|(?:(?:^|\n) *\+ +.*(?:\n *`{0,2}[^` \n].+)*(?: *\n *)?)+|(?:(?:^|\n) *\- +.*(?:\n *`{0,2}[^` \n].+)*(?: *\n *)?)+|(?:(?:^|\n) *\d+\. +.*(?:\n *`{0,2}[^` \n].+)*(?: *\n *)?)+)
    TABLE:                   ((?:^|\n+) *\|?(?:[^\n|]*\|)+(?:[^\n|]*)?\n *\|?(?:(?: *:?-+:? *)\|)+(?: *:?-+:? *)? *(?:\n|$)(?: *\|?(?:[^\n|]*\|)+(?:[^\n|]*)?(?:\n|$))*)
    IMAGE:                   !\[(.*?)\]\(((?:\([^)]*?\)|[^)])*)\)
    BEGIN_OF_LINK:           (\[)
    END_OF_LINK:             (\]\(((?:\([^)]*?\)|[^)])*)\))
    END_OF_NOT_LINK:         (\])
    HEADING_EMPTY:           (?:(?:^|\n) *(#{1,6}) *(?:\n+|$))
    HEADING_TEXT:            (?:(?:^|\n) *(#{1,6}) +(.+)(?:\n+|$))
    URL:                     ((?:https?:\/\/)((?:[a-z0-9\-]+\.?)+(?::[0-9]+)?)((?:\/(?:\([\w\d.\-_~$&'+,;=:@%\u00C0-\uFFFF]*\)|[\w\d.\-_~$&'+,;=:@%\u00C0-\uFFFF])+)|\/)*(?:[?#][\w\d.\-_~$&'+,;=:@%/\u00C0-\uFFFF]+)*)
    INLINE_CODE:             (`+(?:\n[^\n]|[^`\n])*`+)
    HTML_ANCHOR:             (?:<a(?: +[^\n>]*)href=(\".+?\"|\'.+?\'|[^ >]+?)(?: +[^\n>]*)?>)(.+?)<\/a(?: +[^\n>]*)?>
    HTML_IMAGE:              (?:<img(?: +[^\n>]*)src=(\".+?\"|\'.+?\'|[^ >]+)(?: +[^\n>]*)?\/?>(?:<\/img(?: +[^\n>]*)?>)?)
    HTML_IFRAME:             (?:<iframe(?: +(?:\"[^\"]*\"|[^\n>])*)?src=(\".+?\"|\'.+?\'|[^ >]+)(?: +(?:\"[^\"]*\"|[^\n>])*)?>(?:<\/iframe(?: +[^\n>]*)?>)?)
    HTML_STRONG_BEGIN:       (?:<(strong|strike|b|i|code|sub|sup)(?: +[^\n>]*)?>)
    HTML_STRONG_END:         (?:<\/(strong|strike|b|i|code|sub|sup)(?: +[^\n>]*)?>)
    HTML_H_BEGIN:            (<h[1-6](?: +[^\n>]*)?>)
    HTML_H_END:              (<\/h[1-6](?: +[^\n>]*)?>)
    HTML_DIV_BEGIN:          (<div(?: +[^\n>]*)?>)
    HTML_DIV_END:            (<\/div(?: +[^\n>]*)?>)
    HTML_P_BEGIN:            (<p(?: +[^\n>]*|\/)?>)
    HTML_P_END:              (<\/p(?: +[^\n>]*)?>)
    HTML_BLOCKQUOTE_BEGIN:   (<blockquote(?: +[^\n>]*)?>)
    HTML_BLOCKQUOTE_END:     (<\/blockquote(?: +[^\n>]*)?>)
    HTML_CENTER_BEGIN:       (<center(?: +[^\n>]*)?>)
    HTML_CENTER_END:         (<\/center(?: +[^\n>]*)?>)
    HTML_PRE_BEGIN:          (<pre(?: +[^\n>]*)?>)
    HTML_PRE_END:            (<\/pre(?: +[^\n>]*)?>)
    HTML_TABLE_BEGIN:        (?:<(table|tr|th|td)(?: +[^\n>]*)?>)
    HTML_TABLE_END:          (?:<\/(table|tr|th|td)(?: +[^\n>]*)?>)
    HTML_BR:                 (\n*<br(?: +[^\n>]*)?\/?>)
    HTML_HR:                 (\n*<hr(?: +[^\n>]*)?\/?>)
    HTML_OTHER:              (<\/?[a-z]+(?: +[^\n>]*|\/)?>)
    TEXT_FORMATTING:         ((?: *\n){2,}|([ \n]?)(?:(_{1,3})|(\*{1,3})|(~{2})))
*/

    const TokenType = {
        LINE_AND_THEMATIC_BREAK: 1,
        CODE_BLOCK: 2,
        BLOCK_QUOTE: 4,
        LIST: 5,
        TABLE: 6,
        IMAGE: 8,
        BEGIN_OF_LINK: 9,
        END_OF_LINK: 10,
        END_OF_NOT_LINK: 12,
        HEADING_EMPTY: 13,
        HEADING_TEXT: 14,
        URL: 16,
        INLINE_CODE: 19,
        HTML_ANCHOR: 20,
        HTML_IMAGE: 22,
        HTML_IFRAME: 23,
        HTML_STRONG_BEGIN: 24,
        HTML_STRONG_END: 25,
        HTML_H_BEGIN: 26,
        HTML_H_END: 27,
        HTML_DIV_BEGIN: 28,
        HTML_DIV_END: 29,
        HTML_P_BEGIN: 30,
        HTML_P_END: 31,
        HTML_BLOCKQUOTE_BEGIN: 32,
        HTML_BLOCKQUOTE_END: 33,
        HTML_CENTER_BEGIN: 34,
        HTML_CENTER_END: 35,
        HTML_PRE_BEGIN: 36,
        HTML_PRE_END: 37,
        HTML_TABLE_BEGIN: 38,
        HTML_TABLE_END: 39,
        HTML_BR: 40,
        HTML_HR: 41,
        HTML_OTHER: 42,
        TEXT_FORMATTING: 43
    };

    const _token_patterns = [
        /* LINE_AND_THEMATIC_BREAK */ "((?:^|\\n+) {0,3}(?:(?:- *)+|(?:_ *)+|(?:\\* *)+)(?:\\n+|$))",
        /* CODE_BLOCK              */ "(?:(?:^|\\n) {0,3}(`{3,}|~{3,})(.*)(?:\\n|$))",
        /* BLOCK_QUOTE             */ "((?:(?:^|\\n) *>(?: *[^ \\n].*(?:\\n *[^ \\n].*)*|.*))+)",
        /* LIST                    */ "((?:(?:^|\\n) *\\* +.*(?:\\n *`{0,2}[^` \\n].+)*(?: *\\n *)?)+|(?:(?:^|\\n) *\\+ +.*(?:\\n *`{0,2}[^` \\n].+)*(?: *\\n *)?)+|(?:(?:^|\\n) *\\- +.*(?:\\n *`{0,2}[^` \\n].+)*(?: *\\n *)?)+|(?:(?:^|\\n) *\\d+\\. +.*(?:\\n *`{0,2}[^` \\n].+)*(?: *\\n *)?)+)",
        /* TABLE                   */ "((?:^|\\n+) *\\|?(?:[^\\n|]*\\|)+(?:[^\\n|]*)?\\n *\\|?(?:(?: *:?-+:? *)\\|)+(?: *:?-+:? *)? *(?:\\n|$)(?: *\\|?(?:[^\\n|]*\\|)+(?:[^\\n|]*)?(?:\\n|$))*)",
        /* IMAGE                   */ "!\\[(.*?)\\]\\(((?:\\([^)]*?\\)|[^)])*)\\)",
        /* BEGIN_OF_LINK           */ "(\\[)",
        /* END_OF_LINK             */ "(\\]\\(((?:\\([^)]*?\\)|[^)])*)\\))",
        /* END_OF_NOT_LINK         */ "(\\])",
        /* HEADING_EMPTY           */ "(?:(?:^|\\n) *(#{1,6}) *(?:\\n+|$))",
        /* HEADING_TEXT            */ "(?:(?:^|\\n) *(#{1,6}) +(.+)(?:\\n+|$))",
        /* URL                     */ "((?:https?:\\/\\/)((?:[a-z0-9\\-]+\\.?)+(?::[0-9]+)?)((?:\\/(?:\\([\\w\\d.\\-_~$&'+,,=:@%\\u00C0-\\uFFFF]*\\)|[\\w\\d.\\-_~$&'+,,=:@%\\u00C0-\\uFFFF])+)|\\/)*(?:[?#][\\w\\d.\\-_~$&'+,,=:@%/\\u00C0-\\uFFFF]+)*)",
        /* INLINE_CODE             */ "(`+(?:\\n[^\\n]|[^`\\n])*`+)",
        /* HTML_ANCHOR             */ `(?:<a(?: +[^\\n>]*)href=(\\".+?\\"|\\'.+?\\'|[^ >]+?)(?: +[^\\n>]*)?>)(.+?)<\\/a(?: +[^\\n>]*)?>`,
        /* HTML_IMAGE              */ `(?:<img(?: +[^\\n>]*)src=(\\".+?\\"|\\'.+?\\'|[^ >]+)(?: +[^\\n>]*)?\\/?>(?:<\\/img(?: +[^\\n>]*)?>)?)`,
        /* HTML_IFRAME             */ `(?:<iframe(?: +(?:\\"[^\\"]*\\"|[^\\n>])*)?src=(\\".+?\\"|\\'.+?\\'|[^ >]+)(?: +(?:\\"[^\\"]*\\"|[^\\n>])*)?>(?:<\\/iframe(?: +[^\\n>]*)?>)?)`,
        /* HTML_STRONG_BEGIN       */ "(?:<(strong|strike|b|i|code|sub|sup)(?: +[^\\n>]*)?>)",
        /* HTML_STRONG_END         */ "(?:<\\/(strong|strike|b|i|code|sub|sup)(?: +[^\\n>]*)?>)",
        /* HTML_H_BEGIN            */ "(<h[1-6](?: +[^\\n>]*)?>)",
        /* HTML_H_END              */ "(<\\/h[1-6](?: +[^\\n>]*)?>)",
        /* HTML_DIV_BEGIN          */ "(<div(?: +[^\\n>]*)?>)",
        /* HTML_DIV_END            */ "(<\\/div(?: +[^\\n>]*)?>)",
        /* HTML_P_BEGIN            */ "(<p(?: +[^\\n>]*|\\/)?>)",
        /* HTML_P_END              */ "(<\\/p(?: +[^\\n>]*)?>)",
        /* HTML_BLOCKQUOTE_BEGIN   */ "(<blockquote(?: +[^\\n>]*)?>)",
        /* HTML_BLOCKQUOTE_END     */ "(<\\/blockquote(?: +[^\\n>]*)?>)",
        /* HTML_CENTER_BEGIN       */ "(<center(?: +[^\\n>]*)?>)",
        /* HTML_CENTER_END         */ "(<\\/center(?: +[^\\n>]*)?>)",
        /* HTML_PRE_BEGIN          */ "(<pre(?: +[^\\n>]*)?>)",
        /* HTML_PRE_END            */ "(<\\/pre(?: +[^\\n>]*)?>)",
        /* HTML_TABLE_BEGIN        */ "(?:<(table|tr|th|td)(?: +[^\\n>]*)?>)",
        /* HTML_TABLE_END          */ "(?:<\\/(table|tr|th|td)(?: +[^\\n>]*)?>)",
        /* HTML_BR                 */ "(\\n*<br(?: +[^\\n>]*)?\\/?>)",
        /* HTML_HR                 */ "(\\n*<hr(?: +[^\\n>]*)?\\/?>)",
        /* HTML_OTHER              */ "(<\\/?[a-z]+(?: +[^\\n>]*|\\/)?>)",
        /* TEXT_FORMATTING         */ "((?: *\\n){2,}|([ \\n]?)(?:(_{1,3})|(\\*{1,3})|(~{2})))",
    ];

    function _parse_to_markdown(text, inline) {
        const tokenizer = new RegExp(_token_patterns.join("|"), "igm");
        const elements = [], begin_tags = [], formatters = [];
        var token, text_chunk, element;
        var last_index = 0;
    
        while ((token = tokenizer.exec(text))) {
            text_chunk = text.substring(last_index, token.index);
    
            if (token[TokenType.LINE_AND_THEMATIC_BREAK]) {
                element = {
                    type: "line",
                    data: {
                        inline: inline,
                        break: true
                    }
                }
            } else if (token[TokenType.CODE_BLOCK]) {
                const pattern = new RegExp("(?:^|\\n) {0,3}" + token[TokenType.CODE_BLOCK][0] + "{3,}(?:\n|$)");
                const subtexts = _split_text_for_delemeter(text, tokenizer.lastIndex, pattern);
    
                if (text_chunk) {
                    elements.push({
                        type: "text",
                        data: {
                            text: text_chunk,
                            inline: inline
                        }
                    });
                }
    
                elements.push({
                    type: "code-begin",
                    data: {
                        alt: token[3] || "",
                        inline: inline,
                        break: true
                    }
                });
                
                elements.push({
                    type: "text",
                    data: {
                        text: subtexts[0].replace(/ /g, "\xA0"), /* space to nbsp */
                        inline: inline
                    }
                });
    
                elements.push({
                    type: "code-end",
                    data: {
                        inline: inline,
                        break: true
                    }
                });
    
                text = text.substring(0, tokenizer.lastIndex) + subtexts[1];
               
                element    = null;
                text_chunk = null;
            } else if (token[TokenType.BLOCK_QUOTE]) {
                const lines = token[4].replace(/^\n+|\n+$/, "").split(/(?:\n|^) *>/g).slice(1);
                
                lines.forEach((line) => {
                    const children = _parse_to_markdown(line.trim() + "\n", false);
                    var break_met = false, first_child = true;
    
                    if (!element) {
                        element = {
                            type: "quote",
                            data: {
                                elements: [], 
                                inline: inline,
                                break: true
                            }
                        }
                    }
    
                    children.forEach((child) => {
                        if (!break_met && !first_child && child.data["break"]) {
                            if (text_chunk) {
                                elements.push({
                                    type: "text",
                                    data: {
                                        text: text_chunk,
                                        inline: inline,
                                        break: true
                                    }
                                });
                            }
    
                            elements.push(element);
                            elements.push(child);
    
                            element    = null;
                            text_chunk = null;
                            break_met  = true;
                        } else {
                            if (break_met) {
                                elements.push(child);
                            } else {
                                element.data["elements"].push(child);
                            }
                        }
    
                        first_child = false;
                    });
                });
            } else if (token[TokenType.LIST]) {
                const lines = token[TokenType.LIST].replace(/^\n+|\n+$/, "").split("\n");
                const mark = token[TokenType.LIST].match(/(?:^|\n) *([*+-])|(\d+)\. +/)[1];
                var indents = [], numbers = [];
                var level = 0, number = "", subtext = "";
    
                lines.forEach((line) => {
                    const match = line.match(/^( *)(?:([*+-])|(\d+)\.) +(.*)/);
                    const indent = match ? match[1].length : 0;
    
                    if (!element) {
                        element = {
                            type: "list",
                            data: {
                                items: [], 
                                inline: inline,
                                break: true
                            }
                        }
                    }
    
                    if (match && (match[2] === mark) && (level == 0 || indent < indents[level - 1] + 6)) {
                        if (subtext) {
                            const children = _parse_to_markdown(subtext, false);
                            const symbol = numbers[level - 1] ? (inline ? number : numbers[level - 1]) + "." : "";
                            const items = [];
                            var break_met = false, first_child = true;
    
                            children.forEach((child) => {
                                if (!break_met && child.data["break"]) {
                                    if (text_chunk) {
                                        elements.push({
                                            type: "text",
                                            data: {
                                                text: text_chunk,
                                                inline: inline,
                                                break: true
                                            }
                                        });
                                    }
    
                                    element.data["items"].push([ symbol, level, items ]);
                                    elements.push(element);
    
                                    if (first_child) {
                                        items.push(child);
                                    } else {
                                        elements.push(child);
                                    }
                            
                                    element    = null;
                                    text_chunk = null;
                                    break_met  = true;
                                } else {
                                    if (break_met) {
                                        elements.push(child);
                                    } else {
                                       items.push(child);
                                    }
                                }
    
                                first_child = false;
                            });
    
                            if (!break_met) {
                                element.data["items"].push([ symbol, level, items ]);
                            }
                        }
    
                        subtext = match[4];
                        number  = match[3];
    
                        if (level == 0 || indent > indents[level - 1] + 1) {
                            indents.push(indent);
                            numbers.push(match[3] ? 1 : 0);
    
                            level = level + 1;
                        } else {
                            level = _find_level_for_indent(indents, indent);
    
                            indents = indents.slice(0, level);
                            numbers = numbers.slice(0, level);
    
                            indents[level - 1] = indent;
                            numbers[level - 1] = match[3] ? numbers[level - 1] + 1 : 0;
                        }
                    } else {
                        subtext = subtext + "\n" + line;
                    }
                });
    
                if (subtext) {
                    const children = _parse_to_markdown(subtext, false);
                    const symbol = numbers[level - 1] ? (inline ? number : numbers[level - 1]) + "." : "";
                    const items = [];
                    var break_met = false, first_child = true;
    
                    if (!element) {
                        element = {
                            type: "list",
                            data: {
                                items: [], 
                                inline: inline,
                                break: true
                            }
                        }
                    }
    
                    children.forEach((child) => {
                        if (!break_met && child.data["break"]) {
                            if (text_chunk) {
                                elements.push({
                                    type: "text",
                                    data: {
                                        text: text_chunk,
                                        inline: inline,
                                        break: true
                                    }
                                });
                            }
    
                            element.data["items"].push([ symbol, level, items ]);
                            elements.push(element);
    
                            if (first_child) {
                                items.push(child);
                            } else {
                                elements.push(child);
                            }
                    
                            element    = null;
                            text_chunk = null;
                            break_met  = true;
                        } else {
                            if (break_met) {
                                elements.push(child);
                            } else {
                                items.push(child);
                            }
                        }
    
                        first_child = false;
                    });
    
                    if (!break_met) {
                        element.data["items"].push([ symbol, level, items ]);
                    }
                }
            } else if (token[TokenType.TABLE]) {
                const lines = token[6].trim().split("\n");
                const headers = [], columns = [], rows = [];
    
                lines[0].replace(/^ *\||\| *$/g, "").trim().split("|").forEach((text) => {
                    headers.push(_parse_to_markdown(text.trim(), true));
                });
    
                lines[1].replace(/^ *\||\| *$/g, "").trim().split("|").forEach((text) => {
                    columns.push(_align_for_table_column(text.trim()));
                });
    
                lines.slice(2).forEach((line) => {
                    const row = [];
                    line.replace(/^ *\||\| *$/g, "").trim().split("|").forEach((text) => {
                        row.push(_parse_to_markdown(text.trim(), true));
                    });
    
                    rows.push(row);
                });
    
                element = {
                    type: "table",
                    data: {
                        headers: headers,
                        columns: columns,
                        rows: rows
                    }
                }
            } else if (token[TokenType.IMAGE]) {
                element = {
                    type: "image",
                    data: {
                        url: token[TokenType.IMAGE].trim(),
                        alt: token[7],
                        inline: true
                    }
                }
            } else if (token[TokenType.BEGIN_OF_LINK]) {
                element = {
                    type: "link-begin-or-text",
                    data: {
                        text: token[TokenType.BEGIN_OF_LINK], // "[" of "!["
                        inline: inline
                    }
                }
    
                formatters.push([]);
            } else if (token[TokenType.END_OF_LINK]) { // "](...)"
                const link_begin_or_text = _last_link_begin_or_text(elements);
    
                if (token[11] && link_begin_or_text) { // link
                    link_begin_or_text["type"] = "link-begin";
                    link_begin_or_text.data["text"] = "";
                    link_begin_or_text.data["url"] = token[11].replace(/ +\".*?\" *$/g, "").trim();
    
                    element = {
                        type: "link-end",
                        data: {
                            url: token[11].trim()
                        }
                    }
    
                    _clear_unhandled_begins(formatters.pop());
                } else {
                    if (link_begin_or_text) {
                        link_begin_or_text["type"] = "text";
                    }
    
                    element = {
                        type: "text",
                        data: {
                            text: token[TokenType.END_OF_LINK], // "](...)"
                            inline: inline
                        }
                    }
                }
            } else if (token[TokenType.END_OF_NOT_LINK]) { // "]"
                const link_begin_or_text = _last_link_begin_or_text(elements);
    
                if (link_begin_or_text) {
                    link_begin_or_text["type"] = "text";
                }
    
                element = {
                    type: "text",
                    data: {
                        text: token[TokenType.END_OF_NOT_LINK], // "]"
                        inline: inline
                    }
                }
            } else if (token[TokenType.HEADING_EMPTY] || token[TokenType.HEADING_TEXT]) {
                element = {
                    type: "heading",
                    data: {
                        elements: _parse_to_markdown(token[TokenType.HEADING_TEXT] ? token[15].replace(/\s+#+$/, "") : " ", true),
                        level: (token[TokenType.HEADING_EMPTY] || token[TokenType.HEADING_TEXT]).length,
                        leadings: (token.index > 0) ? "\n" : "",
                        inline: inline,
                        break: true
                    }
                }
            } else if (token[TokenType.URL]) {
                element = {
                    type: "url",
                    data: {
                        url: token[TokenType.URL].trim(),
                        host: token[17],
                        path: token[18],
                        inline: true
                    }
                }
            } else if (token[TokenType.INLINE_CODE]) { // ``code``
                const code = token[TokenType.INLINE_CODE].match(/(`+)([^`]*)(`+)/);
    
                if (code[1].length == code[3].length) {
                    element = {
                        type: "code",
                        data: {
                            text :code[2],
                            inline: true
                        }
                    }                
                } else {
                    element = {
                        type: "text",
                        data: {
                            text: token[TokenType.INLINE_CODE],
                            inline: inline
                        }
                    }
                }
            } else if (token[TokenType.HTML_ANCHOR]) {
                element = {
                    type: "anchor-tag",
                    data: {
                        url: token[TokenType.HTML_ANCHOR].replace(/^["']|["']/g, "").trim(),
                        elements: _parse_to_markdown(token[21], true),
                        inline: inline
                    }
                }
            } else if (token[TokenType.HTML_IMAGE]) {
                element = {
                    type: "image-tag",
                    data: {
                        url: token[TokenType.HTML_IMAGE].replace(/^["']|["']/g, "").trim(),
                        inline: true
                    }
                }
            } else if (token[TokenType.HTML_IFRAME]) {
                element = {
                    type: "iframe-tag",
                    data: {
                        url: token[TokenType.HTML_IFRAME].replace(/^["']|["']/g, "").trim(),
                        inline: true
                    }
                }
            } else if (token[TokenType.HTML_STRONG_BEGIN] || token[TokenType.HTML_STRONG_END]) { // strong, strike, bold, italic, code, sub, and sup tag
                element = {
                    type: (token[TokenType.HTML_STRONG_BEGIN] || token[TokenType.HTML_STRONG_END]) + "-tag" + (token[TokenType.HTML_STRONG_BEGIN] ? "-begin" : "-end"),
                    data: {
                        inline: inline
                    }
                }
            } else if (token[TokenType.HTML_H_BEGIN] || token[TokenType.HTML_H_END]) { // h1~h6 tag
                const level = (token[TokenType.HTML_H_BEGIN] || token[TokenType.HTML_H_END]).match(/<\/?h([1-6])/i);
    
                element = {
                    type: "h-tag" + (token[TokenType.HTML_H_BEGIN] ? "-begin" : "-end"),
                    data: {
                        level: parseInt(level[1]),
                        inline: inline
                    }
                }
            } else if (token[TokenType.HTML_DIV_BEGIN]) {
                const klass = token[28].match(/class=(?:\"([^"]+)\"|([^ ,>]+))/i);
    
                element = {
                    type: "div-tag-begin",
                    data: {
                        class: klass ? (klass[1] || klass[2]) : "",
                        inline: inline
                    }
                }
            } else if (token[TokenType.HTML_DIV_END]) {
                element = {
                    type: "div-tag-end",
                    data: {
                        inline: inline
                    }
                }
            } else if (token[TokenType.HTML_P_BEGIN] || token[TokenType.HTML_P_END]) {
                const klass = (token[TokenType.HTML_P_BEGIN] || "").match(/class=(?:\"([^"]+)\"|([^ ,>]+))/i);
    
                element = {
                    type: "paragraph-tag" + (token[TokenType.HTML_P_BEGIN] ? "-begin" : "-end"),
                    data: {
                        class: klass ? (klass[1] || klass[2]) : "",
                        inline: inline,
                        break: true
                    }
                }
            } else if (token[TokenType.HTML_BLOCKQUOTE_BEGIN] || token[TokenType.HTML_BLOCKQUOTE_END]) {
                element = {
                    type: "blockquote-tag" + (token[TokenType.HTML_BLOCKQUOTE_BEGIN] ? "-begin" : "-end"),
                    data: {
                        inline: inline
                    }
                }
            } else if (token[TokenType.HTML_CENTER_BEGIN] || token[TokenType.HTML_CENTER_END]) {
                element = {
                    type: "center-tag" + (token[TokenType.HTML_CENTER_BEGIN] ? "-begin" : "-end"),
                    data: {
                        inline: inline
                    }
                }
            } else if (token[TokenType.HTML_PRE_BEGIN]) {
                const subtexts = _split_text_for_delemeter(text, tokenizer.lastIndex, /<\/pre>/);
    
                if (text_chunk) {
                    elements.push({
                        type: "text",
                        data: {
                            text: text_chunk,
                            inline: inline
                        }
                    });
                }
    
                elements.push({
                    type: "pre-tag-begin",
                    data: {
                        inline: inline,
                        break: true
                    }
                });
                
                elements.push({
                    type: "text",
                    data: {
                        text: subtexts[0].replace(/ /g, "\xA0"), /* space to nbsp */
                        inline: inline
                    }
                });
    
                elements.push({
                    type: "pre-tag-end",
                    data: {
                        inline: inline,
                        break: true
                    }
                });
    
                text = text.substring(0, tokenizer.lastIndex) + subtexts[1];
               
                element    = null;
                text_chunk = null;
            } else if (token[TokenType.HTML_TABLE_BEGIN] || token[TokenType.HTML_TABLE_END]) { // table, tr, th, td tag
                element = {
                    type: (token[TokenType.HTML_TABLE_BEGIN] || token[TokenType.HTML_TABLE_END]) + "-tag" + (token[TokenType.HTML_TABLE_BEGIN] ? "-begin" : "-end"),
                    data: {
                        inline: inline,
                        break: true
                    }
                }
            } else if (token[TokenType.HTML_BR]) {
                element = {
                    type: "br-tag",
                    data: {
                        inline: inline
                    }
                }
            } else if (token[TokenType.HTML_HR]) {
                element = {
                    type: "hr-tag",
                    data: {
                        inline: inline,
                        break: true
                    }
                }
            } else if (token[TokenType.HTML_OTHER]) {
                element = {
                    type: "tag",
                    data: {
                        inline: inline
                    }
                }
            } else if (token[TokenType.TEXT_FORMATTING]) { // inline formatting: *em*, **strong**, ...
                const symbols = token[45] || (token[46] || (token[47] || ""));
                const symbol = symbols ? symbols[0] : "";
                const prior = token[44] || "";
    
                if (symbol === "_" || symbol === "*" || symbol === "~") {
                    const formatter_begin = _last_formatter_begin(elements, symbol);
                    const prevchar = prior || text.substring(Math.max(token.index - 1, 0), token.index);
                    const nextchar = text.substring(tokenizer.lastIndex, tokenizer.lastIndex + 1);
                    
                    if (formatter_begin && !token[44]) {
                        if (symbol !== "_" || (!nextchar || nextchar.match(/[^\w\d]/))) {
                            const begin_symbols = formatter_begin.data["symbols"];
                            const length = Math.min(begin_symbols.length, symbols.length);
                            const type = (symbol === "~") ? "linethrough" : (length == 3) ? "em-italic" : (length == 2) ? "em" : "italic";
    
                            formatter_begin["type"] = type + "-begin";
                            formatter_begin["data"] = Object.assign(formatter_begin["data"], {
                                prior: formatter_begin.data["prior"] + begin_symbols.substring(0, symbols.length - length),
                            });
    
                            element = {
                                type: type + "-end",
                                data: {
                                    trailing: symbols.substring(0, begin_symbols.length - length)
                                }
                            }
                        } else {
                            element = {
                                type: "text",
                                data: {
                                    text: prior + symbols,
                                    inline: inline
                                }
                            }
                        }
                    } else {
                        if ((symbol !== "_" || (!prevchar || prevchar.match(/[^\w\d]/))) && (nextchar.match(/[^ \n]/) && (symbol !== "~" || (prevchar !== "~" && nextchar !== "~")))) {
                            element = {
                                type: "formatter-begin",
                                data: {
                                    text: prior + symbols,
                                    symbols: symbols,
                                    prior: prior,
                                    inline: inline
                                }
                            }
    
                            if (formatters.length > 0) {
                                formatters[formatters.length - 1].push(element);
                            }
                        } else {
                            element = {
                                type: "text",
                                data: {
                                    text: prior + symbols,
                                    inline: inline
                                }
                            }
                        }
                    }
                } else {
                    element = {
                        type: "break",
                        data: {
                            text: token[TokenType.TEXT_FORMATTING]
                        }
                    }
    
                    _clear_unhandled_begins(elements);
                }
            }
    
            if (text_chunk) {
                elements.push({
                    type: "text",
                    data: {
                        text: text_chunk,
                        inline: inline
                    }
                });
            }
    
            if (element) {
                const tag = element["type"].match(/(.+)-tag-(begin|end)/);
    
                if (tag) {
                    if (tag[2] === "begin") {
                        begin_tags.push(element);
                    } else {
                        _handle_mismatched_tags(elements, tag[1], element.data["inline"], begin_tags);
                    }
                }
    
                if (element.data["break"]) {
                    _clear_unhandled_begins(elements);
                }
    
                elements.push(element);
            }
    
            element    = null;
            text_chunk = null;
    
            last_index = tokenizer.lastIndex;
        }
    
        text_chunk = text.substring(last_index, text.length);
        
        if (text_chunk) {
            elements.push({
                type: "text",
                data: {
                    text: text_chunk,
                    inline: inline
                }
            });
        }
    
        _handle_mismatched_tags(elements, "", false, begin_tags);
        _clear_unhandled_begins(elements);
    
        return elements;
    }
    
    function _split_text_for_delemeter(text, index, delemeter) {
        const subtext = text.substring(index, text.length);
        const token = delemeter.exec(subtext);
    
        if (token) {
            const first = text.substring(index, index + token.index);
            const last  = text.substring(index + token.index + token[0].length, text.length);
    
            return [ first, last ];
        }
    
        return [ subtext, "" ];
    }
    
    function _normalize_text(text) {
        text = text.replace(/\r\n|\r/g, "\n");
        text = text.replace(/[\xA0\t]/g, " ");
    
        return text;
    }
    
    function _last_link_begin_or_text(elements) {
        if (elements.length > 0) {
            for (var i = elements.length - 1; i >= 0; i--) {
                if (elements[i].type === "link-begin-or-text") {
                    return elements[i];
                }
            }
        }
    }
    
    function _last_formatter_begin(elements, symbol) {
        if (elements.length > 0) {
            for (var i = elements.length - 1; i >= 0; i--) {
                if (elements[i].type === "formatter-begin") {
                    if (elements[i].data["symbols"][0] === symbol) {
                        return elements[i];
                    }
                }
            }
        }
    }
    
    function _handle_mismatched_tags(elements, tag, inline, begin_tags) {
        if (tag && begin_tags.length > 0 && !begin_tags[begin_tags.length - 1]["type"].startsWith(tag)) {
            elements.push({
                type: tag + "-tag-begin",
                data: {
                    inline: inline
                }
            });
    
            return;
        }
    
        while (begin_tags.length > 0) {
            const last_begin_tag = begin_tags.pop();
    
            if (tag && last_begin_tag["type"].startsWith(tag)) {
                return;
            }
    
            elements.push({
                type: last_begin_tag["type"].split("-")[0] + "-tag-end",
                data: {
                    inline: last_begin_tag.data["inline"]
                }
            });
        }
    
        if (tag) {
            elements.push({
                type: tag + "-tag-begin",
                data: {
                    inline: inline
                }
            });        
        }
    }
    
    function _clear_unhandled_begins(elements) {
        elements.forEach((element) => {
            if (["link-begin-or-text", "formatter-begin"].includes(element.type)) {
                element["type"] = "text";
            }
        });
    }
    
    function _align_for_table_column(text) {
        if (text[0] === ":") {
            if (text[text.length - 1] === ":") {
                return "center";
            }
    
            return "left";
        } 
    
        if (text[text.length - 1] === ":") {
            return "right";
        }
    
        return "left";
    }
    
    function _find_level_for_indent(indents, indent) {
        for (let index = indents.length - 1; index >= 0; --index) {
            if (indents[index] <= indent) {
                return index + 1;
            }
        }
    
        return 1;
    }

    return {
        parse: function(text) {
            return _parse_to_markdown(_normalize_text(text), false);
        },
    }
})();

__MODULE__ = module;
