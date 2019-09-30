class Viewport {
    constructor(canvas) {
        this.canvas = canvas;
        this.x0 = -10;
        this.y0 = -10;
        this.scale = 0.02;

        this.startTime = null;
        this.startX0 = null;
        this.startY0 = null;
        this.startScale = null;
        this.targetTime = null;
        this.targetX0 = null;
        this.targetY0 = null;
        this.targetScale = null;
        
        this.state = 'rest';
        this.draggingLastX = 0;
        this.draggingLastY = 0;
        this.drawCallbacks = [];
        this.coordsX = null;
        this.coordsY = null;
        this.coordsCallbacks = [];
        canvas.addEventListener('mousedown', this.mouseDown.bind(this), false);
        canvas.addEventListener('mousemove', this.mouseMove.bind(this), false);
        canvas.addEventListener('mouseup', this.mouseUp.bind(this), false);
        canvas.addEventListener('mouseleave', this.mouseLeave.bind(this), false);
        canvas.addEventListener('wheel', this.mouseWheel.bind(this), false);
    }

    setBox(minX, minY, maxX, maxY, animate) {
        var W = canvas.width;
        var H = canvas.height;
        var dx = maxX - minX + 1;
        var dy = maxY - minY + 1;
        var centerX = (minX + maxX) / 2;
        var centerY = (minY + maxY) / 2;
        var scale = Math.max(1.05 * dx / W, 1.05 * dy / H);
        var x0 = centerX - W / 2 * scale;
        var y0 = centerY - H / 2 * scale;
        // TODO(kalinov): Check the math.
        var shouldMove = (Math.abs(x0 - this.x0) > 0.001 ||
                          Math.abs(y0 - this.y0) > 0.001 ||
                          Math.abs(Math.log(scale) -
                                   Math.log(this.scale)) > 0.001);
        if (shouldMove) {
            if (animate) {
                this.setViewport(x0, y0, scale);
            } else {
                this.x0 = x0;
                this.y0 = y0;
                this.scale = scale;
            }
        }
    }

    setViewport(x0, y0, scale) {
        this.startTime = (new Date()).getTime();
        this.startX0 = this.x0;
        this.startY0 = this.y0;
        this.startScale = this.scale;
        this.targetTime = this.startTime + 800;
        this.targetX0 = x0;
        this.targetY0 = y0;
        this.targetScale = scale;
        this.fireDrawEvent();
        if (this.state != 'animation') {
            this.state = 'animation';
            window.setTimeout(this.updateViewport.bind(this), 20);
        }
    }

    updateViewport() {
        if (this.state == 'animation') {
            var time = (new Date()).getTime();
            var f = (time - this.startTime) / (this.targetTime - this.startTime);
            f = 2 / (1 + Math.exp(-3 * f)) - 0.95;
            if (f >= 1.0) {
                this.x0 = this.targetX0;
                this.y0 = this.targetY0;
                this.scale = this.scale;
                this.state = 'rest';
            } else {
                this.x0 = f * this.targetX0 + (1 - f) * this.startX0;
                this.y0 = f * this.targetY0 + (1 - f) * this.startY0; 
                this.scale = f * this.targetScale + (1 - f) * this.startScale;
                window.setTimeout(this.updateViewport.bind(this), 20);
            }
            this.fireDrawEvent();
        }
    }
    
    mouseDown(e) {
        this.state = 'dragging';
        this.draggingLastX = e.offsetX;
        this.draggingLastY = e.offsetY;
    }
    
    mouseMove(e) {
        if (this.state == 'dragging') {
            var dX = e.offsetX - this.draggingLastX;
            var dY = e.offsetY - this.draggingLastY;
            this.draggingLastX = e.offsetX;
            this.draggingLastY = e.offsetY;
            this.x0 -= dX * this.scale;
            this.y0 += dY * this.scale;
            this.fireDrawEvent();
        }
        this.coordsX = this.x0 + e.offsetX * this.scale;
        this.coordsY = this.y0 + (this.canvas.height - e.offsetY) * this.scale;
        this.fireCoordsEvent();
    }
    
    mouseUp(e) {
        this.state = 'rest';
    }

    mouseLeave(e) {
        this.state = 'rest';
        this.coordsX = null;
        this.coordsY = null;
        this.fireCoordsEvent();
    }
    
    mouseWheel(e) {
        this.state = 'rest';
        var x = e.offsetX;
        var y = this.canvas.height - e.offsetY;
        if (e.deltaY < 0) {
            this.x0 += x * this.scale;
            this.y0 += y * this.scale;
            this.scale /= 1.1;
            this.x0 -= x * this.scale;
            this.y0 -= y * this.scale;
        } else {
            this.x0 += x * this.scale;
            this.y0 += y * this.scale;
            this.scale *= 1.1;
            this.x0 -= x * this.scale;
            this.y0 -= y * this.scale;
        }
        this.fireDrawEvent();
    }
    
    fireDrawEvent() {
        this.drawCallbacks.forEach(function(callback) {
            callback();
        });
    }
    
    addDrawEventListener(callback) {
        this.drawCallbacks.push(callback);
    }
    
    fireCoordsEvent() {
        this.coordsCallbacks.forEach(function(callback) {
            callback();
        });
    }
    
    addCoordsEventListener(callback) {
        this.coordsCallbacks.push(callback);
    }
}
