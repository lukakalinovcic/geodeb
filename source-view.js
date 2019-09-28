class SourceView {
    constructor(sourceBox) {
        this.sourceBox = sourceBox;
        this.lines = [];
    }

    setSource(lines) {
        this.lines = lines;
        var escapedLines = lines.map(function(line){
            return line.replace(/[&<>'"]/g, function (ch) {
                return {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    "'": '&#39;',
                    '"': '&quot;'
                }[ch];
            });
        });
        var htmlLines = escapedLines.map(function(line, i) {
            var html = '';
            html += '<span class="src-line" id="srcLine' + i + '">';
            html += '<span class="tooltip"></span>';
            html += line;
            html +='</span>';
            return html;
        });
        if (this.lines.length == 0) {
            this.sourceBox.innerHTML = "source code missing";
        } else {
            this.sourceBox.innerHTML = htmlLines.join('');
        }
    }

    getFirstLine(lastLine, commandName) {
        if (lastLine >= this.lines.length) {
            return lastLine;
        }
        for (var i = lastLine; i >= 0; --i) {
            if (this.lines[i].indexOf('GD_' + commandName.toUpperCase()) >= 0) {
                return i;
            }
        }
        return lastLine;
    }

    updateTooltip(line, commandName, text, highlight) {
        var firstLine = this.getFirstLine(line - 1, commandName);
        var span = document.getElementById('srcLine' + firstLine);
        if (span == null) return;
        var tooltip = span.childNodes[0];
        span.classList.remove('has-tooltip');
        span.classList.remove('new-tooltip');
        if (text != '') {
            tooltip.innerHTML = text;
            span.classList.add('has-tooltip');
            if (highlight) {
              span.classList.add('new-tooltip');
              window.setTimeout(function(span) {
                  return function() { span.classList.remove('new-tooltip'); }
              }(span), 1000);
            }
        }
        this.scrollIntoView(span);
    }
    
    highlight(line, commandName, className) {
        var lastLine = line - 1;
        var firstLine = this.getFirstLine(lastLine, commandName);
        for (var i = firstLine; i <= lastLine; ++i) {
            var span = document.getElementById('srcLine' + i);
            if (span == null) continue;
            span.classList.remove('added');
            span.classList.remove('removed');
            span.classList.add(className);
            window.setTimeout(function(span) {
                return function() { span.classList.remove(className); }
            }(span), 1000);
            this.scrollIntoView(span);
        }
    }

    scrollIntoView(element) {
        var outer = sourceElement.getBoundingClientRect();
        var inner = element.getBoundingClientRect();
        if (inner.top < outer.top) {
            element.scrollIntoView(true);
        }
        if (inner.bottom > outer.bottom) {
            element.scrollIntoView(false);
        }
    }
}
