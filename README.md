Geometry debugger
=================

geodeb is a small C++ library written with competitive programming usage in mind. The library allows you to visualize computational geometry problems that are often hard to code right due to tricky corner cases or floating point errors. You may use the library to debug failing examples, or just to draw an algorithm you're learning or teaching to somebody else.

Installation
------------
The easiest way to install and use the library is to download and copy the [geodeb.h](https://raw.githubusercontent.com/lukakalinovcic/geodeb/master/lib/geodeb.h) file to the working directory where your source code is. That way you can simply include it as follows: 

    #include "geodeb.h"

Also, it is advised to execute the program from the same working directory where the source code lives, so that the library can find the code and include it in the UI.

Initialization
--------------

    GD_INIT(output_html);

Before you call any other function, you have to call GD_INIT to tell the library where to write the output html.

Optionally, if you won't have internet access, you can provide the path to the local copy of the geodeb/client directory:

    GD_INIT(output_html, resource_dir);

Draw attributes
---------------

All the drawing functions below accept an optional string as the last argument to specify things like colors or thickness.

The colors are specified using [html color names](https://www.w3schools.com/colors/colors_names.asp). If you want to specify both the stroke and the fill color (where applicable), separate the two with a colon ':'. For example, "blue:yellow" will make the stroke color blue and fill color yellow.

You can make the stroke width thicker by adding the "bold" attribute.

You can also combine the two by separating the attributes with a space. For example "red bold" will specify both the stroke color and the bold thickness.

Draw functions
--------------

    GD_POINT(x, y, attr);

Draws a point at (x, y).

    GD_CIRCLE(x, y, r, attr);

Draws a circle of radius r with a center at (x, y).

    GD_SEGMENT(x1, y1, x2, y2, attr);

Draws a line segment from (x1, y1) to (x2, y2).

    GD_LINE(x1, y1, x2, y2, attr);

Draws a line through points (x1, y1) and (x2, y2).

    GD_TRIANGLE(x1, y1, x2, y2, x3, y3, attr);

Draws a triangle at points: (x1, y1), (x2, y2) and (x3, y3).

    GD_RECT(x1, y1, x2, y2, attr);

Draws a rectangle parallel to coordinate axis, specified with two opposing corners: (x1, y1) and (x2, y2).

Flow functions
--------------

To create animations where the drawing evolves in time, you'll need these functions:

    GD_PAUSE();

Forces a break point in the visualization.

    GD_LAYER();

Specifies a layer to draw temporary shapes on. Everything that is drawn in the same scope is removed from the drawing when the scope in which the layer is defined ends. There is an implicit break point just before the shapes are removed.

Extra debug information
-----------------------

All the draw and flow functions above are output streams and can be fed any debug data the same way you would use std::cout or std::cerr. The data will be displayed in the UI as the line producing the debug data is executed.

    GD_LAYER() << "iteration = " << i;
    GD_POINT(best.x, best.y) << "best score so far is " << best_score;

Polygons and polylines
----------------------

In general, it is recommended to draw polylines and polygons using GD_SEGMENT in a for-loop. However, if you need to fill a custom polygon, you'll have to use:

    GD_POLYGON(attr,
               code);

The code is an arbitrary C++ code that adds points to the polygon using GD_POLYPOINT(x, y) calls.

    GD_POLYLINE(attr,
                code);

Analog functions for drawing polylines.

Additional options
------------------

    GD_LOG_TO_STDERR(enable);

Enables or disables the logging of functions to the standard error stream. The argument is a boolean, true or false.

    GD_SET_PRECISION(digits);

Sets the number of digits after the decimal points to use in the output. The default is set to 6.

    GD_DARK(output_html);

An alternative to GD_INIT that changes the UI theme to the dark mode, and makes the canvas that you draw on black.