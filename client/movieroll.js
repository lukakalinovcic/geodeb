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

class MovieRoll {
    constructor(root) {
	this.currentFrame = new Frame();
        this.build(root, this.currentFrame);
    }

    build(node, last_frame) {
        if (node.children) {
            node.children.forEach(function(child) {
                if (child.type == 'layer') {
                    var start_frame = last_frame;
                    last_frame.breakpoint = true;
                    last_frame = this.build(child, last_frame);
                    last_frame.breakpoint = true;

                    var transition = new Transition();
                    var next_frame = new Frame();
                    transition.prev = last_frame;
                    transition.next = next_frame;
                    last_frame.next = transition;
                    next_frame.prev = transition;
                    // TODO(kalinov): See what to do with nextd layers.
                    for (var frame = last_frame; frame != start_frame;
                         frame = frame.prev.prev) {
                        frame.prev.actions.forEach(function(action) {
                            transition.actions.push(
                                new Action('remove', action.data))
                        });
                    }
                    last_frame = next_frame;
                } else if (child.type == 'break') {
                    last_frame.breakpoint = true;
                } else {
                    var transition = new Transition();
                    var next_frame = new Frame();
                    transition.prev = last_frame;
                    transition.next = next_frame;
                    last_frame.next = transition;
                    next_frame.prev = transition;
                    transition.actions.push(new Action('add', child));
                    last_frame = next_frame;
                }
            }.bind(this));
        }
        return last_frame;
    }
}
