function showSection(sectionId) {
    const sections = ['ColorByNumber', 'main', 'Options'];
    sections.forEach(id => {
        document.getElementById(id).style.display = id === sectionId ? 'block' : 'none';
    });
}

function returnButton(otherSectionId) {
    const otherSections = ['ColorByNumber', 'main', 'Options'];
    if (document.getElementById('main').style.display === 'none') {
        otherSections.forEach(id => {
            document.getElementById(id).style.display = 'none';
        });
        document.getElementById('main').style.display = 'block';
    }
}

/*
 *  Variables
 *
 */
const scaleFactor = 1.1;
const size = 32;
const minScale = 0.09; // Minimum scale factor to limit zoom out

let _identifier, _tool, _touch;

let mousePressed = false;
let origin, lastX, lastY;

let _grid, _identifiers, _identifierMeasurements, _lines;
let _totalCells, _filledCells;

/*
 *  Application
 *
 */
setTool("pen");

let _canvas = document.getElementById("canvas");
_canvas.width = window.innerWidth;
_canvas.height = window.innerHeight;

let _context = _canvas.getContext("2d");
trackTransforms(_context);

/*
 *  Example
 *
 */
window.addEventListener("load", function( ) {
    let _example = new Image( );
    _example.src = "ZuezLvL1.png";
    _example.addEventListener("load", function( ) {
        initialize(this);
    });
}, false);

/*
 *  Events
 *
 */
window.addEventListener("resize", function( ) {
    _canvas.width = window.innerWidth;
    _canvas.height = window.innerHeight;

    if( ! _grid ) return;

    resetTransform( );
});

function updateProgressBar() {
    const progress = (_filledCells / _totalCells) * 100;
    const progressBar = document.getElementById("progress-bar");
    progressBar.style.width = progress + "%";
}

// Tool selection
function handleToolClick(event) {
    const tool = event.currentTarget.getAttribute("data-tool");

    setTool(tool);
}

for( const element of document.querySelectorAll("ul.tools li.tool") ) {
    element.addEventListener("click", handleToolClick, false);
}

// Color selection
function handleColorClick(event) {
    const identifier = parseInt( event.currentTarget.getAttribute("data-identifier") );

    setIdentifier(identifier);
}

// Image selection
document.getElementById("upload").addEventListener("change", function( ) {
    const file = this.files[0];

    let image = new Image( );                   
    image.src = URL.createObjectURL(file);

    image.addEventListener("load", function( ) {
        initialize(this);
    });
}, false);

// Locate context
document.getElementById("location").addEventListener("click", function( ) {
    if( ! _grid ) return;

    resetTransform( );
}, false);

// Canvas mouse down
function handleCanvasMouseDown(event) {
    lastX = event.offsetX;
    lastY = event.offsetY;

    const point = _context.transformedPoint(lastX, lastY);

    mousePressed = true;

    if(_tool === "pen") {
        draw(point.x, point.y);
    } else if(_tool === "pan") {
        origin = point;
    }

    render( );
}

_canvas.addEventListener("mousedown", handleCanvasMouseDown, false);
_canvas.addEventListener("touchstart", function(event) {
    event.preventDefault( );

    if(_touch) return;

    const touch = event.changedTouches[0];
    _touch = touch.identifier;

    const mockEvent = { offsetX: touch.pageX, offsetY: touch.pageY };
    handleCanvasMouseDown(mockEvent);
}, false);

// Canvas mouse move
function handleCanvasMouseMove(event) {
    lastX = event.offsetX;
    lastY = event.offsetY;

    if( ! mousePressed ) return;

    const point = _context.transformedPoint(lastX, lastY);

    if(_tool === "pen") {
        draw(point.x, point.y);
    } else if(_tool === "pan") {
        _context.translate(point.x - origin.x, point.y - origin.y);
    }

    render( );
}

_canvas.addEventListener("mousemove", handleCanvasMouseMove, false);
_canvas.addEventListener("touchmove", function(event) {
    event.preventDefault( );

    if( ! _touch ) return;

    const touches = event.changedTouches;

    for(const touch of touches) {
        if(touch.identifier !== _touch) return;

        const mockEvent = { offsetX: touch.pageX, offsetY: touch.pageY };
        handleCanvasMouseMove(mockEvent);
    }
}, false);

// Canvas mouse up
function handleCanvasMouseUp( ) {
    mousePressed = false;

    _touch = null;

    origin = null;

    if(_tool === "zoom_in") {
        zoom(1);
    } else if(_tool === "zoom_out") {
        zoom(-1);
    }
}

_canvas.addEventListener("mouseup", handleCanvasMouseUp, false);
_canvas.addEventListener("touchcancel", handleCanvasMouseUp, false);
_canvas.addEventListener("touchend", handleCanvasMouseUp, false);

// Canvas mouse wheel
function handleCanvasMouseWheel(event) {
    const power = event.wheelDelta ? event.wheelDelta / 40 : event.detail ? -event.detail : 0;

    if(power) zoom(power);
}

_canvas.addEventListener("DOMMouseScroll", handleCanvasMouseWheel, false);
_canvas.addEventListener("mousewheel", handleCanvasMouseWheel, false);

/*
 *  Functions
 *
 */
let colorTemplate = function(identifier, color) {
    return `
    <div class="color" data-identifier="${identifier}">
        <span class="color-preview" style="background-color: ${color}"><!-- color --></span>
        
        <p class="color-identifier">#${identifier}</p>
    </div>
    `;
}

function resetTransform( ) {
    _context.setTransform(1, 0, 0, 1, 0, 0);

    // Scale context
    let scale = 1;

    const width = _grid.length * size;
    const height = _grid[0].length * size;

    const overflowX = width - (window.innerWidth - 48);
    const overflowY = height - (window.innerHeight - 48);

    if(overflowX > 0 && overflowX >= overflowY) {
        scale = 1 - overflowX / width;
    } else if(overflowY > 0) {
        scale = 1 - overflowY / height;
    }

    _context.scale(scale, scale);

    // Center context
    const amplifier = scale < 1 ? 1 / scale : 1;

    const left = (window.innerWidth - width * scale) / 2 * amplifier ;
    const top = (window.innerHeight - height * scale) / 2 * amplifier;

    _context.translate(left, top);

    // Render
    render( );
}

function setIdentifier(identifier) {
    const previousColor = document.querySelectorAll(".colors .color.active")[0];
    if(previousColor) previousColor.classList.remove("active");

    const currentColor = document.querySelectorAll(".colors .color[data-identifier='" + identifier + "']")[0];
    currentColor.classList.add("active");

    _identifier = identifier;
}

function setTool(tool) {
    // Update tool
    const previousTool = document.querySelectorAll("ul.tools li.tool.active")[0];
    if(previousTool) previousTool.classList.remove("active");

    const currentTool = document.querySelectorAll("ul.tools li.tool[data-tool='" + tool + "']")[0];
    currentTool.classList.add("active");

    _tool = tool;

    // Update cursor
    let cursor = "auto";

    if(_tool === "pan") {
        cursor = "move";
    } else if(_tool === "pen") {
        cursor = "crosshair";
    } else if(_tool === "zoom_in") {
        cursor = "zoom-in";
    } else if(_tool === "zoom_out") {
        cursor = "zoom-out";
    }

    const canvas = document.getElementById("canvas");
    canvas.style.cursor = cursor;
}

function initialize(image) {
    const width = image.width;
    const height = image.height;
    
    const gridWidth = width * size;
    const gridHeight = height * size;

    // Generate grid
    let grid = [];
    for (let x = 0; x < width; x++) {
        grid[x] = [];
        for (let y = 0; y < height; y++) {
            grid[x][y] = {};
        }
    }
    
    // Categorize colors
    const element = document.querySelectorAll(".colors")[0];
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
    
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    context.drawImage(image, 0, 0, width, height);
    
    let identifiers = [];
    let identifierMeasurements = [];
    context.font = "500 " + (size / 2) + "px Inter, sans-serif";
    
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            const { data } = context.getImageData(x, y, 1, 1);
            const alpha = data[3];
            if (alpha < 255) continue;

            const red = data[0];
            const green = data[1];
            const blue = data[2];
            const color = "rgb(" + red + ", " + green + ", " + blue + ")";
            let identifier = identifiers.indexOf(color);
            
            if (identifier === -1) {
                identifiers.push(color);
                identifier = identifiers.length - 1;
                const template = colorTemplate(identifier, color);
                element.insertAdjacentHTML("beforeend", template);
                const { width } = context.measureText(identifier);
                identifierMeasurements.push(width);
            }
            
            const coordinate = grid[x][y];
            coordinate.identifier = identifier;
            coordinate.fill = false;
        }
    }
    
    // Generate grid border
    let lines = [];
    let lineStart;
    
    // Border top to bottom
    for (let x = 0; x < width + 1; x++) {
        for (let y = 0; y < height; y++) {
            const coordinate = grid[x] ? grid[x][y] : { identifier: null };
            const adjacentCoordinate = grid[x - 1] ? grid[x - 1][y] : { identifier: null };
            
            if (coordinate.identifier || coordinate.identifier === 0 || adjacentCoordinate.identifier || adjacentCoordinate.identifier === 0) {
                if (!lineStart) lineStart = { x: x * size, y: y * size };
                
                if (y === height - 1) {
                    const lineEnd = { x: x * size, y: height * size };
                    const line = { start: lineStart, end: lineEnd };
                    lines.push(line);
                    lineStart = null;
                }
                continue;
            }
            
            if (lineStart) {
                const lineEnd = { x: x * size, y: y * size };
                const line = { start: lineStart, end: lineEnd };
                lines.push(line);
                lineStart = null;
            }
        }
    }
    
    // Border left to right
    for (let y = 0; y < height + 1; y++) {
        for (let x = 0; x < width; x++) {
            const coordinate = grid[x][y] || { identifier: null };
            const adjacentCoordinate = grid[x][y - 1] || { identifier: null };
            
            if (coordinate.identifier || coordinate.identifier === 0 || adjacentCoordinate.identifier || adjacentCoordinate.identifier === 0) {
                if (!lineStart) lineStart = { x: x * size, y: y * size };
                
                if (x === width - 1) {
                    const lineEnd = { x: width * size, y: y * size };
                    const line = { start: lineStart, end: lineEnd };
                    lines.push(line);
                    lineStart = null;
                }
                continue;
            }
            
            if (lineStart) {
                const lineEnd = { x: x * size, y: y * size };
                const line = { start: lineStart, end: lineEnd };
                lines.push(line);
                lineStart = null;
            }
        }
    }
    
    // Update event listeners
    for (const element of document.querySelectorAll(".colors .color")) {
        element.addEventListener("click", handleColorClick, false);
    }
    
    // Update state
    setIdentifier(0);
    setTool("pen");
    
    _grid = grid;
    _identifiers = identifiers;
    _identifierMeasurements = identifierMeasurements;
    _lines = lines;
    
    // Calculate total cells
    _totalCells = width * height;
    _filledCells = 0;
    
    // Set default transformation and render
    resetTransform();
}

function render( ) {
    // Clear the canvas
    const start = _context.transformedPoint(0, 0);
    const end = _context.transformedPoint(_canvas.width, _canvas.height);

    _context.clearRect(start.x, start.y, end.x - start.x, end.y - start.y);
    
    // Draw grid
    _context.strokeStyle = "rgba(0, 0, 0, 0.05)";
    _context.beginPath();
    
    for(const line of _lines) {
        _context.moveTo(line.start.x, line.start.y);
        _context.lineTo(line.end.x, line.end.y);
    }

    _context.stroke();

    // Draw identifiers and filled coordinates
    _context.font = "500 " + (size / 2) + "px Inter, sans-serif";
    _context.textBaseline = "middle";
    
    for(let x = 0; x < _grid.length; x++) {
        for(let y = 0; y < _grid[x].length; y++) {
            const coordinate = _grid[x][y];
            
            if(coordinate.fill) {
                _context.fillStyle = _identifiers[coordinate.identifier];
                _context.fillRect(x * size, y * size, size, size);
                
                // Skip drawing identifiers for filled coordinates
                continue;
            }
            
            if(coordinate.identifier || coordinate.identifier === 0) {        
                const width = _identifierMeasurements[coordinate.identifier];

                _context.fillStyle = "black";
                _context.fillText(coordinate.identifier, x * size + (size - width) / 2, y * size + size / 2);
            }
        }
    }
}

function draw(x, y) {
    const squareX = Math.floor(x / size);
    const squareY = Math.floor(y / size);
    
    // Skip coordinates outside of the canvas
    if (squareX < 0 || squareX > _grid.length - 1 || squareY < 0 || squareY > _grid[0].length - 1) return;
    
    const coordinate = _grid[squareX][squareY];

    if (coordinate.identifier === _identifier && !coordinate.fill) {
        coordinate.fill = true;
        _context.fillStyle = _identifiers[coordinate.identifier];
        _context.fillRect(squareX * size, squareY * size, size, size);
        
        // Update filled cells count and progress bar
        _filledCells++;
        updateProgressBar();
    }
}

function zoom(power) {
    const point = _context.transformedPoint(lastX, lastY);
    _context.translate(point.x, point.y);

    let factor = Math.pow(scaleFactor, power);
    const newScale = _context.getTransform().a * factor;
    
    // Limit zoom out
    if (newScale < minScale) {
        factor = minScale / _context.getTransform().a;
    }

    _context.scale(factor, factor);
    _context.translate(-point.x, -point.y);

    render();
}

function trackTransforms(context) {
    // getTransform
    let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    let form = svg.createSVGMatrix();

    context.getTransform = function() {
        return form;
    };

    // save
    let savedTransforms = [];
    let save = context.save;

    context.save = function() {
        savedTransforms.push(form.translate(0, 0));
        return save.call(context);
    };

    // restore
    let restore = context.restore;

    context.restore = function() {
        form = savedTransforms.pop();
        return restore.call(context);
    };

    // scale
    let scale = context.scale;

    context.scale = function(scaleX, scaleY) {
        form = form.scaleNonUniform(scaleX, scaleY);
        return scale.call(context, scaleX, scaleY);
    };

    // rotate
    let rotate = context.rotate;

    context.rotate = function(radians) {
        form = form.rotate(radians * 180 / Math.PI);
        return rotate.call(context, radians);
    };

    // translate
    let translate = context.translate;

    context.translate = function(distanceX, distanceY) {
        form = form.translate(distanceX, distanceY);
        return translate.call(context, distanceX, distanceY);
    };

    // transform
    let transform = context.transform;

    context.transform = function(a, b, c, d, e, f) {
        let matrix = svg.createSVGMatrix();
        matrix.a = a;
        matrix.b = b;
        matrix.c = c;
        matrix.d = d;
        matrix.e = e;
        matrix.f = f;
        form = form.multiply(matrix);
        return transform.call(context, a, b, c, d, e, f);
    };

    // setTransform
    let setTransform = context.setTransform;

    context.setTransform = function(a, b, c, d, e, f) {
        form.a = a;
        form.b = b;
        form.c = c;
        form.d = d;
        form.e = e;
        form.f = f;
        return setTransform.call(context, a, b, c, d, e, f);
    };

    // transformedPoint
    let point = svg.createSVGPoint();

    context.transformedPoint = function(x, y) {
        point.x = x;
        point.y = y;
        return point.matrixTransform(form.inverse());
    };
}

document.addEventListener("DOMContentLoaded", function() {
    var overlay = document.getElementById("overlay");
    setTimeout(function() {
        overlay.style.display = "none";
        document.body.style.overflow = "auto"; // Re-enable scrolling
    }, 10000); // 10 seconds
});