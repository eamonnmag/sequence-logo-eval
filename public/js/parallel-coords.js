/**
 * Created by eamonnmaguire on 28/01/2014.
 */
var margins = {"left": 30, "right": 10, "top": 19, "bottom": 0},
    width, height;

var x ,
// will map from the fileIndex > yscale
    y = {},
    dragging = {},
    variablesToDimension = {};

var line = d3.svg.line(),
    axis = d3.svg.axis().orient("left"),
    background = {},
    foreground = {};

var colorGroupColumn = "";

var colors = d3.scale.category10();

var ParallelCoordinates = {}

ParallelCoordinates.rendering = {

    loadAndDraw: function (placement, files, w, h, ordinalColumns, options) {
        width = w;
        height = h;

        if (options) {
            if (options.colorGroup) {
                colorGroupColumn = options.colorGroup;
            }
        }

        x = d3.scale.ordinal().rangePoints([0, w], 1)


        for (var fileIndex in files) {

            d3.csv(files[fileIndex], function (data) {

                var data_index = new Date().getTime();
                y[data_index] = {};

                var graphHeight = (h - margins.bottom - margins.top) / files.length;

                var svg = d3.select(placement).append("svg")
                    .attr("width", w + margins.left + margins.right)
                    .attr("height", graphHeight + 30)
                    .attr("class", "plot-" + fileIndex)
                    .append("g")
                    .attr("transform", "translate(" + margins.left + "," + margins.top + ")");

                x.domain(dimensions = d3.keys(data[0]).filter(function (d) {

                    if (ordinalColumns.indexOf(d) != -1) {
                        data.forEach(function (columnData) {
                            // Coerce values to numbers.
                                variablesToDimension[columnData[d]] = d;
                        });

                        y[data_index][d] = d3.scale.ordinal().domain(data.map(function(p) {
                            return p[d];
                        })).rangePoints([graphHeight, 0]);
                    } else {

                        y[data_index][d] = d3.scale.linear()
                            .domain(d3.extent(data, function (p) {
                                return +p[d];
                            }))
                            .range([graphHeight, 0]);
                    }

                    return d != "name" && y[data_index][d];
                }));

                background[data_index] = svg.append("g")
                    .attr("class", "background")
                    .selectAll("path")
                    .data(data)
                    .enter().append("path")
                    .attr("d", function (d) {
                        // we assign it with an axis
                        d.value_scale = y[data_index];
                        d.data_key = data_index;
                        return ParallelCoordinates.rendering.path(d);
                    });

                foreground[data_index] = svg.append("g")
                    .attr("class", "foreground")

                    .selectAll("path")
                    .data(data)
                    .enter().append("path")
                    .attr("d", ParallelCoordinates.rendering.path)
                    .style("stroke", function (d) {
                        return colors(d[colorGroupColumn]);
                    });

                var g = svg.selectAll(".dimension")
                    .data(dimensions)
                    .enter().append("g")
                    .attr("class", function (d, i) {
                        return "dimension d-" + data_index + "-" + i;
                    })
                    .attr("transform", function (d) {
                        return "translate(" + x(d) + ")";
                    })
                    .call(d3.behavior.drag()
                        .on("dragstart", function (d) {

                            dragging[d] = this.__origin__ = x(d);
                            for (var fileIn in background) {
                                background[fileIn].attr("opacity", "0");
                            }
                        })
                        .on("drag", function (d) {
                            dragging[d] = Math.min(w, Math.max(0, this.__origin__ += d3.event.dx));
                            foreground[data_index].attr("d", ParallelCoordinates.rendering.path);
                            dimensions.sort(function (a, b) {
                                return ParallelCoordinates.rendering.position(a) - ParallelCoordinates.rendering.position(b);
                            });
                            x.domain(dimensions);
                            svg.selectAll(".dimension").attr("transform", function (d) {
                                return "translate(" + ParallelCoordinates.rendering.position(d) + ")";
                            })
                        })
                        .on("dragend", function (d) {
                            delete this.__origin__;
                            delete dragging[d];

                            d3.selectAll(".dimension").transition().duration(1000).ease("elastic").attr("transform", function (d) {
                                return "translate(" + ParallelCoordinates.rendering.position(d) + ")";
                            })

                            for (var fileIn in foreground) {
                                ParallelCoordinates.rendering.transition(foreground[fileIn])
                                    .attr("d", ParallelCoordinates.rendering.path);

                                background[fileIn]
                                    .attr("d", ParallelCoordinates.rendering.path)
                                    .transition()
                                    .delay(0)
                                    .duration(1000)
                                    .attr("opacity", ".7");
                            }
                        }));

                g.append("g")
                    .attr("class", "axis")
                    .each(function (d) {
                        d3.select(this).call(axis.scale(y[data_index][d]));
                    })
                    .append("text")
                    .attr("text-anchor", "middle")
                    .attr("y", -9)
                    .text(String);

                // Add and store a brush for each axis.
                // Add and store a brush for each axis.
                g.append("g")
                    .attr("class", function (d, i) {
                        return "brush brush-" + fileIndex + "-" + i;
                    })
                    .each(function (d, i) {
                        d3.selectAll("g.brush-" + fileIndex + "-" + i).call(y[data_index][d].brush = d3.svg.brush().y(y[data_index][d]).on("brush", ParallelCoordinates.rendering.brush));
                    })
                    .selectAll("rect")
                    .attr("x", -8)
                    .attr("width", 16);
            });
        }
    },

    position: function (d) {
        var v = dragging[d];
        return v == null ? x(d) : v;
    },

    transition: function (g) {
        return g.transition().duration(500);
    },

    path: function (d) {
        return line(dimensions.map(function (p) {
            return [ParallelCoordinates.rendering.position(p), d.value_scale[p](d[p])];
        }));
    },

    brush: function () {
        // change this to consider each axis individually when calculating whether or not something falls with the extent.
        // active = data_index -> p -> extents
        var actives = {};

        for (var fileIn in foreground) {
            dimensions.forEach(function (p) {
                brushEmpty = y[fileIn][p].brush.empty();
                if (!y[fileIn][p].brush.empty()) {
                    if (!(fileIn in actives)) {
                        actives[fileIn] = {}
                    }
                    actives[fileIn][p] = y[fileIn][p].brush.extent();
                }
            });
        }


        d3.selectAll("g.foreground path").style("display", function (d) {
            // TODO: change this to consider each axis individually when calculating whether or not something falls with the extent.

            var on = true;
            for (var activeKey in actives) {
                for (var activeDimension  in actives[activeKey]) {

                    try {
                        if (typeof d[activeDimension] === "string") {
                            var scale = d.value_scale[variablesToDimension[d[activeDimension]]];
                            on = actives[activeKey][activeDimension][0] <= scale(d[activeDimension]) && scale(d[activeDimension]) <= actives[activeKey][activeDimension][1];
                        }
                    } catch (e) {
                        on = actives[activeKey][activeDimension][0] <= d[activeDimension] && d[activeDimension] <= actives[activeKey][activeDimension][1];
                    }

                    if (!on) return "none";
                }
            }
            return on ? null : "none";
        });
    }
}