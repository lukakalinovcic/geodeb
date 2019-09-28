class Frame {
    constructor() {
        this.prev = null;
        this.next = null;
        this.breakpoint = false;
    }
}

class Transition {
    constructor() {
        this.prev = null;
        this.next = null;
        this.actions = [];
    }
}

class Action {
    constructor(type, data) {
        this.type = type;
        this.data = data;
    }
}

function incrementProgress(progress, line) {
    if (!(line in progress)) {
        progress[line] = 0;
    }
    progress[line] = progress[line] + 1;
    return progress[line];
}

function updateLabel(data, line, newLabel) {
    var oldLabel = '';
    if (line in data) {
        oldLabel = data[line];
    }
    data[line] = newLabel;
    return oldLabel;
}

class MovieRoll {
    constructor(root) {
        this.currentFrame = new Frame();
        var progress = {};
        this.build(root, this.currentFrame, progress, {}, []);
        for (var frame = this.currentFrame; frame.next != null;
             frame = frame.next.next) {
            var transition = frame.next;
            transition.actions.forEach(function(action) {
                if (action.type == 'add') {
                    action.data.progress /= progress[action.data.line];
                }
            });
        }
    }

    appendFrame(lastFrame) {
        var transition = new Transition();
        var nextFrame = new Frame();
        transition.prev = lastFrame;
        transition.next = nextFrame;
        lastFrame.next = transition;
        nextFrame.prev = transition;
        return nextFrame;
    }

    build(node, lastFrame, progress, labels, transitions) {
        if (node.children) {
            node.children.forEach(function(child) {
                var line = child.line;
                var i = incrementProgress(progress, line);
                var newLabel = ('label' in child) ? child.label : '';
                var oldLabel = updateLabel(labels, line, newLabel);
                lastFrame = this.appendFrame(lastFrame);
                var transition = lastFrame.prev;
                var data = {
                    'type': child.type,
                    'line': line,
                    'oldLabel': oldLabel,
                    'newLabel': newLabel
                };
                transition.actions.push(new Action('execute', data));
                if (child.type == 'layer') {
                    var layerTransitions = [];
                    var startFrame = lastFrame;
                    lastFrame = this.build(child, lastFrame, progress, labels,
                                           layerTransitions);
                    lastFrame.breakpoint = true;
                    lastFrame = this.appendFrame(lastFrame);
                    for (var i = layerTransitions.length - 1; i >= 0; --i) {
                        var transition = layerTransitions[i];
                        for (var j = transition.actions.length - 1; j >= 0; --j) {
                            var action = transition.actions[j];
                            if (action.type == 'add') {
                                lastFrame.prev.actions.push(
                                    new Action('remove', action.data));
                            }
                        }
                    }
                } else if (child.type == 'break') {
                    lastFrame.breakpoint = true;
                } else {
                    if (child.type == 'triangle') {
                        child.points = [[child.x1, child.y1],
                                        [child.x2, child.y2],
                                        [child.x3, child.y3]];
                    } else if (child.type == 'rect') {
                        child.points = [[child.x1, child.y1],
                                        [child.x1, child.y2],
                                        [child.x2, child.y2],
                                        [child.x2, child.y1]];
                    }
                    child['progress'] = i - 0.5;
                    transition.actions.push(new Action('add', child));
                    transitions.push(transition);
                }
            }.bind(this));
        }
        return lastFrame;
    }
}
