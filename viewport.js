class Viewport {
    constructor(canvas) {
        this.canvas = canvas;
        this.x0 = -5;
        this.y0 = -5;
        this.scale = 0.02;
        this.state = 'rest';
        this.draggingLastX = 0;
        this.draggingLastY = 0;
        this.callbacks = [];
        canvas.addEventListener('mousedown', this.mouseDown.bind(this), false);
        canvas.addEventListener('mousemove', this.mouseMove.bind(this), false);
        canvas.addEventListener('mouseup', this.mouseUp.bind(this), false);
        canvas.addEventListener('mouseleave', this.mouseUp.bind(this), false);
        canvas.addEventListener('wheel', this.mouseWheel.bind(this), false);
    }
    
    mouseDown(e) {
        this.state = 'dragging';
        this.draggingLastX = e.clientX;
        this.draggingLastY = e.clientY;
    }
    
    mouseMove(e) {
        if (this.state == 'dragging') {
            var dX = e.clientX - this.draggingLastX;
            var dY = e.clientY - this.draggingLastY;
            this.draggingLastX = e.clientX;
            this.draggingLastY = e.clientY;
            this.x0 -= dX * this.scale;
            this.y0 += dY * this.scale;
            //console.log(dX, dY);
            //console.log(this.x0, this.y0);
            this.fireEvent();
        }
    }
    
    mouseUp(e) {
        this.state = 'rest';
    }
    
    mouseWheel(e) {
        this.state = 'rest';
        var x = e.clientX;
        var y = this.canvas.height - e.clientY;
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
        this.fireEvent();
    }
    
    fireEvent() {
        this.callbacks.forEach(function(callback) {
            callback();
        });
    }
    
    addEventListener(callback) {
        this.callbacks.push(callback);
    }
}
