class Box {
    constructor(box) {
        if (box == null) {
            this.minX = 0;
            this.minY = 0;
            this.maxX = 0;
            this.maxY = 0;
        } else {
            this.minX = box.minX;
            this.minY = box.minY;
            this.maxX = box.maxX;
            this.maxY = box.maxY;
        }
    }
}

class Frame {
    constructor(box) {
        this.prev = null;
        this.next = null;
        this.breakpoint = false;
        this.box = new Box(box);
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
        this.currentFrame = new Frame(null);
        this.build(root, this.currentFrame, {}, {}, [], []);
    }

    appendFrame(lastFrame) {
        var transition = new Transition();
        var nextFrame = new Frame(lastFrame.box);
        transition.prev = lastFrame;
        transition.next = nextFrame;
        lastFrame.next = transition;
        nextFrame.prev = transition;
        return nextFrame;
    }

    build(node, lastFrame, progress, labels, transitions, unresolvedProgress) {
        var toResolveProgress = [];
        var firstFrame = lastFrame;
        if (node.children) {
            node.children.forEach(function(child) {
                var line = child.line;
                var item_progress = incrementProgress(progress, line);
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
                    var childUnresolvedProgress = [];
                    lastFrame = this.build(
                        child, lastFrame, {}, labels, layerTransitions,
                        childUnresolvedProgress);
                    childUnresolvedProgress.forEach(function(add_action) {
                        var data = add_action.data;
                        data.progress = incrementProgress(progress, data.line);
                        toResolveProgress.push(add_action);
                    });
                    lastFrame.breakpoint = true;
                    lastFrame = this.appendFrame(lastFrame);
                    layerTransitions.slice().reverse().forEach(function(transition) {
                        transition.actions.slice().reverse().forEach(function(action) {
                            if (action.type == 'add') {
                                lastFrame.prev.actions.push(
                                    new Action('remove', action.data));
                            }
                        });
                    });
                } else if (child.type == 'break') {
                    lastFrame.breakpoint = true;
                } else {
                    var points = child.points;
                    if (child.type == 'segment') {
                        points = [[child.x1, child.y1],
                                  [child.x2, child.y2]];
                    } else if (child.type == 'triangle') {
                        points = [[child.x1, child.y1],
                                  [child.x2, child.y2],
                                  [child.x3, child.y3]];
                    } else if (child.type == 'rect') {
                        points = [[child.x1, child.y1],
                                  [child.x1, child.y2],
                                  [child.x2, child.y2],
                                  [child.x2, child.y1]];
                    }
                    child.points = points;
                    if (child.type == 'point') {
                        points = [[child.x, child.y]];
                    } else if (child.type == 'circ') {
                        points = [[child.x - child.r, child.y],
                                  [child.x + child.r, child.y],
                                  [child.x, child.y - child.r],
                                  [child.x, child.y + child.r]];
                    } else if (child.type == 'arc' || child.type == 'pie') {
                        points = [[child.x, child.y],
                                  [child.x + child.r * Math.cos(child.sAngle),
                                   child.y + child.r * Math.sin(child.sAngle)],
                                  [child.x + child.r * Math.cos(child.eAngle),
                                   child.y + child.r * Math.sin(child.eAngle)]];
                    } else if (child.type == 'line') {
                        var a = (child.y2 - child.y1);
                        var b = (child.x1 - child.x2);
                        var c = - a * child.x1 - b * child.y1;
                        var x = -(a * c) / (a * a + b * b);
                        var y = -(b * c) / (a * a + b * b);
                        points = [[x, y]];
                    }
                    points.forEach(function(p) {
                        var box = lastFrame.box;
                        box.minX = Math.min(box.minX, p[0]);
                        box.maxX = Math.max(box.maxX, p[0]);
                        box.minY = Math.min(box.minY, p[1]);
                        box.maxY = Math.max(box.maxY, p[1]);
                    });
                    
                    child['progress'] = item_progress - 0.5;
                    var add_action = new Action('add', child);
                    transition.actions.push(add_action);
                    transitions.push(transition);
                    toResolveProgress.push(add_action);
                }
            }.bind(this));
        }

        toResolveProgress.forEach(function(add_action) {
            if (progress[add_action.data.line] == 1) {
                unresolvedProgress.push(add_action);
            } else {
                add_action.data.progress /= progress[add_action.data.line];
            }
        });
        return lastFrame;
    }
}
