/*
 *  Variables
 *
 */
const scaleFactor = 1.1;
const size = 32;

let _identifier, _tool, _touch;

let mousePressed = false;
let origin, lastX, lastY;

let _grid, _identifiers, _identifierMeasurements, _lines;

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
 *	Example
 *
 */
window.addEventListener("load", function( ) {
	let _example = new Image( );
	_example.src = "data:image/png;base64,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";

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
};

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
	let grid = [ ];
    
    for(let x = 0; x < width; x++) {
        grid[x] = [ ];
      
        for(let y = 0; y < height; y++) {
            grid[x][y] = { };
        }
    }
	
	// Categorize colors
	const element = document.querySelectorAll(".colors")[0];
	
	while(element.firstChild) {
		element.removeChild(element.firstChild);
	}
	
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;

	const context = canvas.getContext("2d");

	context.drawImage(image, 0, 0, width, height);
	
	let identifiers = [ ];
	let identifierMeasurements = [ ];
	
	context.font = "500 " + (size / 2) + "px Inter, sans-serif";
	
	for(let x = 0; x < width; x++) {
		for(let y = 0; y < height; y++) {
			const { data } = context.getImageData(x, y, 1, 1);
			
			const alpha = data[3];
			if(alpha < 255) continue;

			const red = data[0];
			const green = data[1];
			const blue = data[2];

			const color = "rgb(" + red + ", " + green + ", " + blue + ")";
			let identifier = identifiers.indexOf(color);
			
			if(identifier === -1) {
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
	let lines = [ ];
	
	let lineStart;
	
	// Border top to bottom
    for(let x = 0; x < width + 1; x++) {
        for(let y = 0; y < height; y++) {
			const coordinate = grid[x] ? grid[x][y] : { identifier: null };
			const adjacentCoordinate = grid[x - 1] ? grid[x - 1][y] : { identifier: null };
			
			if(coordinate.identifier || coordinate.identifier === 0 || adjacentCoordinate.identifier || adjacentCoordinate.identifier === 0) {
				if( ! lineStart ) lineStart = { x: x * size, y: y * size };
				
				if(y === height - 1) {
					const lineEnd = { x: x * size, y: height * size };
					const line = { start: lineStart, end: lineEnd };
					
					lines.push(line);
					
					lineStart = null;
				}
				
				continue;
			}
			
			if(lineStart) {
				const lineEnd = { x: x * size, y: y * size };
				const line = { start: lineStart, end: lineEnd };

				lines.push(line);
				
				lineStart = null;
			}
		}
	}
	
	// Border left to right
    for(let y = 0; y < height + 1; y++) {
        for(let x = 0; x < width; x++) {
			const coordinate = grid[x][y] || { identifier: null };
			const adjacentCoordinate = grid[x][y - 1] || { identifier: null };
			
			if(coordinate.identifier || coordinate.identifier === 0 || adjacentCoordinate.identifier || adjacentCoordinate.identifier === 0) {
				if( ! lineStart ) lineStart = { x: x * size, y: y * size };
				
				if(x === width - 1) {
					const lineEnd = { x: width * size, y: y * size };
					const line = { start: lineStart, end: lineEnd };
					
					lines.push(line);
					
					lineStart = null;
				}
				
				continue;
			}
			
			if(lineStart) {
				const lineEnd = { x: x * size, y: y * size };
				const line = { start: lineStart, end: lineEnd };

				lines.push(line);
				
				lineStart = null;
			}
		}
	}
	
	// Update event listeners
	for( const element of document.querySelectorAll(".colors .color") ) {
		element.addEventListener("click", handleColorClick, false);
	}
	
	// Update state
	setIdentifier(0);
	setTool("pen");
	
	_grid = grid;
	_identifiers = identifiers;
	_identifierMeasurements = identifierMeasurements;
	_lines = lines;
	
	// Set default transformation and render
	resetTransform( );
}

function render( ) {
    // Clear the canvas
    const start = _context.transformedPoint(0, 0);
    const end = _context.transformedPoint(_canvas.width, _canvas.height);
  
    _context.clearRect(start.x, start.y, end.x - start.x, end.y - start.y);
	
	// Draw grid
    _context.strokeStyle = "rgba(0, 0, 0, 0.05)";
    _context.beginPath( );
	
	for(const line of _lines) {
        _context.moveTo(line.start.x, line.start.y);
        _context.lineTo(line.end.x, line.end.y);
	}
  
    _context.stroke( );
  
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
	if(squareX < 0 || squareX > _grid.length - 1 || squareY < 0 || squareY > _grid[0].length - 1) return;
	
	const coordinate = _grid[squareX][squareY];
  
    if( coordinate.identifier === _identifier && ! coordinate.fill ) {
		coordinate.fill = true;
		
		_context.fillStyle = _identifiers[coordinate.identifier];
		_context.fillRect(x * size, y * size, size, size);
		
		// render( )
	}
}

function zoom(power) {
    const point = _context.transformedPoint(lastX, lastY);
    _context.translate(point.x, point.y);
  
    const factor = Math.pow(scaleFactor, power);
    _context.scale(factor, factor);
	
    _context.translate(-point.x, -point.y);
  
    render( );
}

function trackTransforms(context) {
    // getTransform
    let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    let form = svg.createSVGMatrix( );
  
    context.getTransform = function( ) {
        return form;
    }
  
    // save
    let savedTransforms = [ ];
    let save = context.save( );
  
    context.save = function( ) {
        savedTransforms.push( form.translate(0, 0) );
      
        return save.call(context);
    }
  
    // restore
    let restore = context.restore;
    
    context.restore = function( ) {
        form = savedTransforms.pop( );
      
        return restore.call(context);
    };

    // scale
    let scale = context.scale;
  
    context.scale = function(scaleX, scaleY) {
        form = form.scaleNonUniform(scaleX, scaleY);
      
        return scale.call(context, scaleX, scaleY);
    }
  
    // rotate
    let rotate = context.rotate;
  
    context.rotate = function(radians) {
        form = form.rotate(radians * 180 / Math.PI);
      
        return rotate.call(context, radians);
    }
  
    // translate
    let translate = context.translate;
  
    context.translate = function(distanceX, distanceY) {
        form = form.translate(distanceX, distanceY);
      
        return translate.call(context, distanceX, distanceY);
    }
  
    // transform
    let transform = context.transform;
    
    context.transform = function(a, b, c, d, e, f) {
      let matrix = svg.createSVGMatrix( );
      
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
  
    context.setTransform = function(a,b,c,d,e,f){
        form.a = a;
        form.b = b;
        form.c = c;
        form.d = d;
        form.e = e;
        form.f = f;
      
        return setTransform.call(context, a, b, c, d, e, f);
    };
  
    // transformedPoint
    let point = svg.createSVGPoint( );
  
    context.transformedPoint = function(x, y) {
        point.x = x; 
        point.y = y;
      
        return point.matrixTransform( form.inverse( ) );
    }
}
