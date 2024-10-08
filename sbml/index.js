const module = (function() {
    function _elements_to_sbml(elements, images, inline) {
        var sbml = "";
        var center_begin_pos = 0;
        var center_began = false;
        var center_ended = false;
        var inline_depth = 0;

        elements.forEach((element) => {
            if (element.type === "text") {
                if (!element.data["inline"] && inline_depth == 0) {
                    sbml += center_ended ? "\n=end center\n" : "";
                    sbml += _handle_text(element.data["text"]);

                    center_begin_pos = sbml.length;
                    center_ended = false;
                } else {
                    sbml += _handle_text(element.data["text"]);
                }

                return;
            }

            if (element.type === "break") {
                if (!element.data["inline"] && inline_depth == 0) {
                    sbml += center_ended ? "\n=end center\n" : "";
                    sbml += "\n\n";

                    center_begin_pos = sbml.length;
                    center_ended = false;
                } else {
                    sbml += "\n\n";
                }

                return;
            }

            if (element.type === "line") {
                if (!element.data["inline"] && inline_depth == 0) {
                    sbml += center_ended ? "\n=end center\n" : "";
                    sbml += "\n";
                    sbml += "=begin line\n"
                    sbml += "=(object blank: style=line)=\n";
                    sbml += "=end line\n";

                    center_begin_pos = sbml.length;
                    center_ended = false;
                } else {

                }

                return;
            }

            if (element.type === "heading") {
                if (!element.data["inline"] && inline_depth == 0) {
                    const has_center_tag = _has_center_tag(element.data["elements"]);
                    const needs_center_style = has_center_tag || center_began;

                    sbml += center_ended ? "\n=end center\n" : "";
                    sbml += has_center_tag ? "\n=begin center\n" : "";
                    sbml += element.data["leadings"];
                    sbml += "\n";
                    sbml += `=begin heading-${element.data["level"]}` + (needs_center_style ? ": style=center" : "") + "\n";
                    sbml += _elements_to_sbml(element.data["elements"], images, true) + "\n";
                    sbml += `=end heading-${element.data["level"]}\n`;
                    sbml += has_center_tag ? "\n=end center\n" : "";

                    center_begin_pos = sbml.length;
                    center_ended = false;
                } else {

                }

                return;
            }

            if (element.type === "quote") {
                if (!element.data["inline"] && inline_depth == 0) {
                    sbml += center_ended ? "\n=end center\n" : "";
                    sbml += "\n";
                    sbml += "=begin quote\n";
                    sbml += _elements_to_sbml(element.data["elements"], images, false) + "\n";
                    sbml += "=end quote\n";

                    center_begin_pos = sbml.length;
                    center_ended = false;
                } else {
                    sbml += _elements_to_sbml(element.data["elements"], images, true) + "\n";
                    sbml += "\n";
                }

                return;
            }

            if (element.type === "list") {
                if (!element.data["inline"] && inline_depth == 0) {
                    sbml += center_ended ? "\n=end center\n" : "";
                    sbml += "\n";
                    sbml += "=begin list\n";
                    element.data["items"].forEach((item) => {
                        sbml += `=begin list-item: style=list-level-${item[1]}, bullet-text="${item[0] || "•"}"\n`;
                        sbml += _elements_to_sbml(item[2], images, false) + "\n";
                        sbml += "=end list-item\n";
                    });
                    sbml += "=end list\n";

                    center_begin_pos = sbml.length;
                    center_ended = false;
                } else {
                    element.data["items"].forEach((item) => {
                        sbml += "\n";
                        sbml += (item[0] || "•") + " " + _elements_to_sbml(item[2], images, true);
                    });
                    sbml += "\n";
                }

                return;
            }

            if (element.type === "table") {
                if (!element.data["inline"] && inline_depth == 0) {
                    sbml += center_ended ? "\n=end center\n" : "";
                    sbml += "\n";
                    sbml += "=begin table\n";
                    sbml += "=begin tr: style=tr-header\n";
                    element.data["headers"].forEach((elements) => {
                        sbml += "=begin th\n";
                        sbml += _elements_to_sbml(elements, images, false) + "\n";
                        sbml += "=end th\n";
                    });
                    sbml += "=end tr\n";

                    var even = false;
                    element.data["rows"].forEach((row) => {
                        sbml += `=begin tr: style=${even ? "tr-even" : "tr-odd"}\n`;
                        row.forEach((elements) => {
                            sbml += `=begin td: style=${even ? "td-even" : "td-odd"}\n`;
                            sbml += _elements_to_sbml(elements, images, false) + "\n";
                            sbml += "=end td\n";
                        });
                        sbml += "=end tr\n";
                        even = even ? false : true;
                    });
                    sbml += "=end table\n";

                    center_begin_pos = sbml.length;
                    center_ended = false;
                } else {

                }

                return;
            }

            if (element.type === "code-begin") {
                if (!element.data["inline"] && inline_depth == 0) {
                    sbml += center_ended ? "\n=end center\n" : "";
                    sbml += "\n";
                    sbml += "=begin code\n";

                    center_begin_pos = sbml.length;
                    center_ended = false;
                } else {

                }

                return;
            }

            if (element.type === "code-end") {
                if (!element.data["inline"] && inline_depth == 0) {
                    sbml += center_ended ? "\n=end center\n" : "";
                    sbml += "\n";
                    sbml += "=end code\n";

                    center_begin_pos = sbml.length;
                    center_ended = false;
                } else {

                }

                return;
            }

            if (element.type === "h-tag-begin") {
                if (!element.data["inline"] && inline_depth == 0) {
                    const needs_center_style = center_began;

                    sbml += center_ended ? "\n=end center\n" : "";
                    sbml += "\n";
                    sbml += `=begin heading-${element.data["level"]}` + (needs_center_style ? ": style=center" : "") + "\n";

                    center_begin_pos = sbml.length;
                    center_ended = false;
                } else {

                }

                return;
            }

            if (element.type === "h-tag-end") {
                if (!element.data["inline"] && inline_depth == 0) {
                    sbml += center_ended ? "\n=end center\n" : "";
                    sbml += "\n";
                    sbml += `=end heading-${element.data["level"]}\n`;

                    center_begin_pos = sbml.length;
                    center_ended = false;
                } else {

                }

                return;
            }

            if (element.type === "div-tag-begin") {
                if (!element.data["inline"] && inline_depth == 0) {
                    sbml += center_ended ? "\n=end center\n" : "";
                    sbml += "\n";
                    sbml += `=begin div: style="${element.data["class"] || ""}"\n`;

                    center_begin_pos = sbml.length;
                    center_ended = false;
                } else {

                }

                return;
            }

            if (element.type === "div-tag-end") {
                if (!element.data["inline"] && inline_depth == 0) {
                    sbml += center_ended ? "\n=end center\n" : "";
                    sbml += "\n";
                    sbml += "=end div\n";

                    center_begin_pos = sbml.length;
                    center_ended = false;
                } else {

                }

                return;
            }

            if (element.type === "blockquote-tag-begin") {
                if (!element.data["inline"] && inline_depth == 0) {
                    sbml += center_ended ? "\n=end center\n" : "";
                    sbml += "\n";
                    sbml += `=begin quote: style="${element.data["class"] || ""}"\n`;

                    center_begin_pos = sbml.length;
                    center_ended = false;
                } else {

                }

                return;
            }

            if (element.type === "blockquote-tag-end") {
                if (!element.data["inline"] && inline_depth == 0) {
                    sbml += center_ended ? "\n=end center\n" : "";
                    sbml += "\n";
                    sbml += "=end quote\n";

                    center_begin_pos = sbml.length;
                    center_ended = false;
                } else {

                }

                return;
            }

            if (element.type === "center-tag-begin") {
                if (!element.data["inline"] && inline_depth == 0) {
                    sbml += center_ended ? "\n=end center\n" : "";
                    sbml = sbml.substring(0, center_begin_pos) + "\n=begin center\n" + sbml.substring(center_begin_pos);

                    center_begin_pos = sbml.length;
                    center_began = true;
                    center_ended = false;
                } else {

                }

                return;
            }

            if (element.type === "center-tag-end") {
                if (!element.data["inline"] && inline_depth == 0) {
                    sbml += center_ended ? "\n=end center\n" : "";

                    center_begin_pos = sbml.length;
                    center_began = false;
                    center_ended = true;
                } else {

                }

                return;
            }

            if (element.type === "paragraph-tag-begin") {
                sbml += "\n\n";

                return;
            }

            if (element.type === "paragraph-tag-end") {
                sbml += "\n\n";

                return;
            }


            if (element.type === "pre-tag-begin") {

                return;
            }

            if (element.type === "pre-tag-end") {

                return;
            }

            if (["table", "tr", "th", "td"].includes(element.type.replace("-tag-begin", ""))) {
                if (!element.data["inline"] && inline_depth == 0) {
                    sbml += center_ended ? "\n=end center\n" : "";
                    sbml += "\n";
                    sbml += `=begin ${element.type.replace("-tag-begin", "") }\n`;

                    center_begin_pos = sbml.length;
                    center_ended = false;
                } else {

                }

                return;
            }

            if (["table", "tr", "th", "td"].includes(element.type.replace("-tag-end", ""))) {
                if (!element.data["inline"] && inline_depth == 0) {
                    sbml += center_ended ? "\n=end center\n" : "";
                    sbml += "\n";
                    sbml += `=end ${element.type.replace("-tag-end", "")}\n`;

                    center_begin_pos = sbml.length;
                    center_ended = false;
                } else {

                }

                return;
            }

            if (element.type === "br-tag") {
                if (!element.data["inline"] && inline_depth == 0) {
                    sbml += center_ended ? "\n=end center\n" : "";
                    sbml += (sbml.length > 0 && sbml[sbml.length - 1] != "\n") ? "\n" : "";
                    sbml += "=[br| ]=\n";

                    center_begin_pos = sbml.length;
                    center_ended = false;
                } else {
                    sbml += (sbml.length > 0 && sbml[sbml.length - 1] != "\n") ? "\n" : "";
                    sbml += "=[br| ]=\n";
                }

                return;
            }

            if (element.type === "hr-tag") {
                if (!element.data["inline"] && inline_depth == 0) {
                    sbml += center_ended ? "\n=end center\n" : "";
                    sbml += "\n";
                    sbml += "=begin line\n"
                    sbml += "=(object blank: style=line)=\n";
                    sbml += "=end line\n";

                    center_begin_pos = sbml.length;
                    center_ended = false;
                } else {

                }

                return;
            }

            if (element.type === "image") {
                var url = _url_for_image(_cleanup_url(element.data["url"]));
                var filename = element.data["filename"] || "";

                if (!element.data["inline"] && inline_depth == 0) {
                    sbml += center_ended ? "\n=end center\n" : "";
                    sbml += "\n";
                    sbml += `=object image: url="${url}", reuse-id="${url}", filename="${filename}", style=image\n`;

                    center_begin_pos = sbml.length;
                    center_ended = false;
                } else {
                    sbml += `=(object image: url="${url}", reuse-id="${url}", filename="${filename}, style=image")=`;
                }

                return;
            }

            if (element.type === "image-tag") {
                var url = _url_for_image(_cleanup_url(element.data["url"]));
                var filename = element.data["filename"] || "";

                if (!element.data["inline"] && inline_depth == 0) {
                    sbml += center_ended ? "\n=end center\n" : "";
                    sbml += "\n";
                    sbml += `=object image: url="${url}", reuse-id="${url}", filename="${filename}", style=image\n`;

                    center_begin_pos = sbml.length;
                    center_ended = false;
                } else {
                    sbml += `=(object image: url=\"${url}", reuse-id="${url}", filename="${filename}", style=image)=`;
                }

                return;
            }

            if (element.type === "iframe-tag") {
                const youtube_video_id = _get_youtube_video_id(element.data["url"]);

                if (youtube_video_id) {
                    if (!element.data["inline"] && inline_depth == 0) {
                        sbml += center_ended ? "\n=end center\n" : "";
                        sbml += "\n";
                        sbml += `=object youtube: video-id="${youtube_video_id}", reuse-id="${youtube_video_id}, style=youtube\n`;

                        center_begin_pos = sbml.length;
                        center_ended = false;
                    } else {
                        sbml += `=(object youtube: video-id="${youtube_video_id}", reuse-id="${youtube_video_id}, style=youtube")=`;
                    }

                    return;
                }

                const url = _cleanup_url(element.data["url"]);

                if (!element.data["inline"] && inline_depth == 0) {
                    sbml += center_ended ? "\n=end center\n" : "";
                    sbml += "\n";
                    sbml += `=object web: url="${url}", reuse-id="${url}, style=web"\n`;

                    center_begin_pos = sbml.length;
                    center_ended = false;
                } else {
                    sbml += `=(object web: url="${url}", reuse-id="${url}", style=web)=`;
                }

                return;
            }

            if (element.type === "link-begin") {
                sbml += `=[link: script=open_url, url="${_cleanup_url(element.data["url"])}"|`;
                inline_depth = inline_depth + 1;

                return;
            }

            if (element.type === "link-end") {
                sbml += "]=";
                inline_depth = inline_depth - 1;

                return;
            }

            if (element.type === "anchor-tag") {
                sbml += `=[link: script=open_url, url="${_cleanup_url(element.data["url"])}"|${_elements_to_sbml(element.data["elements"], images, true)}]=`;

                return;
            }

            if (element.type === "url") {
                const youtube_video_id = _get_youtube_video_id(element.data["url"]);

                if (youtube_video_id) {
                    if (!element.data["inline"] && inline_depth == 0) {
                        sbml += center_ended ? "\n=end center\n" : "";
                        sbml += "\n";
                        sbml += `=object youtube: video-id="${youtube_video_id}", reuse-id="${youtube_video_id}", style=youtube\n`;

                        center_begin_pos = sbml.length;
                        center_ended = false;
                    } else {
                        sbml += `=(object youtube: video-id="${youtube_video_id}", reuse-id="${youtube_video_id}", style=youtube)=`;
                    }

                    return;
                }

                if (_is_image_url((images || []), element.data["url"]) || _is_image_path(element.data["path"] || "")) {
                    const url = _url_for_image(element.data["url"]);
                    const filename = element.data["filename"] || "";

                    if (!element.data["inline"] && inline_depth == 0) {
                        sbml += center_ended ? "\n=end center\n" : "";
                        sbml += "\n";
                        sbml += `=object image: url="${url}", reuse-id="${url}", filename="${filename}", style=image\n`;

                        center_begin_pos = sbml.length;
                        center_ended = false;
                    } else {
                        sbml += `=(object image: url="${url}", reuse-id="${url}", filename="${filename}", style=image)=`;
                    }

                    return;
                }

                sbml += "=[link: script=open_url, url=\"" + _cleanup_url(element.data["url"]) + "\"|" + element.data["url"] + "]=";

                return;
            }

            if (element.type === "code") {
                sbml += "=[code|" + element.data["text"] + "]=";

                return;
            }

            if (["italic", "em", "em-italic", "linethrough"].includes(element.type.replace("-begin", ""))) {
                sbml += element.data["prior"] + `=[${element.type.replace("-begin", "")}|`;
                inline_depth = inline_depth + 1;

                return;
            }

            if (["italic", "em", "em-italic", "linethrough"].includes(element.type.replace("-end", ""))) {
                sbml += "]=" + element.data["trailing"];
                inline_depth = inline_depth - 1;

                return;
            }

            if (["strong", "strike", "b", "i", "code", "sub", "sup"].includes(element.type.replace("-tag-begin", ""))) {
                sbml += `=[${element.type.replace("-tag-begin", "")}|`;
                inline_depth = inline_depth + 1;

                return;
            }

            if (["strong", "strike", "b", "i", "code", "sub", "sup"].includes(element.type.replace("-tag-end", ""))) {
                sbml += "]=";
                inline_depth = inline_depth - 1;

                return;
            }
        });

        sbml += center_ended ? "\n=end center\n" : "";

        return sbml;
    }

    function _has_center_tag(elements) {
        for (let index = 0; index < elements.length; ++index) {
            if (elements[index].type === "center-tag-begin") {
                return true;
            }
        }

        return false;
    }

    function _handle_text(text) {
        text = text.replace(/\u2028|\u2029/g, "\n"); // unicode line seperators
        text = text.replace(/\\/g, "").replace(/(\[|\]|=|\(|\))/g, "\\$1");
        text = text.replace(/(^|\W+)@([a-z0-9\-]+(?:\.[a-z0-9\-]+)*)/g, `$1=[user:username="$2"|@$2]=`);
        text = text.replace(/[ \t][ \t]+/g, " ");
        text = _replace_emoji_chars(text, "=[emoji|$1]=");
        text = decode("html", text);

        return text;
    }

    function _replace_emoji_chars(text, replaced_text) {
        const pattern = /((?:\ud83c[\udf00-\udfff]|\ud83d[\udc00-\ude4f]|\ud83d[\ude80-\udeff])+)/g

        return text.replace(pattern, replaced_text);
    }

    function _get_youtube_video_id(url) {
        let matched = /https?:\/\/.*youtube\.com\/.*\?.*v=([^&/?#]+).*/.exec(url);

        if (!matched) {
            matched = /https?:\/\/.*youtube\.com\/embed\/([^/?#]+).*/.exec(url);
        }

        if (!matched) {
            matched = /https?:\/\/youtu\.be\/([^/?#]+)(?:\?.+)?/.exec(url);
        }

        if (matched) {
            return matched[1];
        }
    }

    function _cleanup_url(url) {
        url = url.replace(/['"‘’]/g, "");

        return url;
    }

    function _is_image_url(images, url) {
        for (let index = 0; index < images.length; index++) {
            if (url.includes(images[index])) {
                return true;
            }
        }

        return false;
    }

    function _is_image_path(path) {
        if (path.match(/\.(jpg|jpeg|png|gif)(\?|\/|$)/ig)) {
            return true;
        }

        return false;
    }

    function _url_for_image(url, size) {
        return url;
    }

    return {
        generate_from_markdown: function(markdown, images) {
            var sbml = _elements_to_sbml(markdown.elements, images, false);

            sbml = sbml.replace(/( *\n){3,}/g, "\n\n");
            console.log(sbml);

            return sbml;
        },
    }
})();

__MODULE__ = module;
