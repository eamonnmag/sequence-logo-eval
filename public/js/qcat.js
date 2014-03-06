/**
 * Created by eamonnmaguire on 10/02/2014.
 */

var QCAT = {}

// Contains the items that have been selected by the user. Key is the item id...value is the object definition
QCAT.basket = {}

QCAT.functions = {
    filter: function (filterInputId, listId) {
        var valThis = $(filterInputId).val().toLowerCase();
        $(listId + '>li').each(function () {
            var text = $(this).text().toLowerCase().trim();
            (text.indexOf(valThis) != -1) ? $(this).show() : $(this).hide();
        });
    },

    removeItemFromBasket: function (id) {
        $("#event-" + id).removeClass("event-selected");
        delete QCAT.basket[id];
    },

    updateBasketView: function () {
        var html = "There are no items yet...";
        console.log(QCAT.basket.length);

        var basketCount = Object.keys(QCAT.basket).length;
        if (basketCount > 0) {
            html = "You have selected " + basketCount + " items.";
        }

        $("#basket-count").html(html);

        var source = $("#basket-list-template").html();
        var template = Handlebars.compile(source);
        var html = template({"basket": QCAT.basket});
        $('#basket-list').html(html);
    },

    toggleItemVisible: function (id, name, type) {
        if (!(id in QCAT.basket)) {
            QCAT.basket[id] = {"id": id, "name": name, "type": type}
            $("#event-" + id).addClass("event-selected");
        } else {
            this.removeItemFromBasket(id);
        }

        this.updateBasketView();
    },

    emptyBasket: function () {
        for (var key in QCAT.basket) {
            this.removeItemFromBasket(key);
        }

        this.updateBasketView();
    },

    populateEventList: function (url) {
        d3.json(url, function (data) {
            var source = $("#event-list-template").html();
            var template = Handlebars.compile(source);
            var html = template(data);
            $('#event-list').html(html);
        });

    },

    drawMap: function (placement, map) {
        var arcs = new Datamap({
            element: document.getElementById(placement),
            projection: "mercator",
            scope: map,
            fills: {
                defaultFill: "#F6F7F6",
                win: '#DDD'
            },
            data: {
                'TX': { fillKey: 'win' },
                'FL': { fillKey: 'win' },
                'NC': { fillKey: 'win' },
                'CA': { fillKey: 'win' },
                'NY': { fillKey: 'win' },
                'CO': { fillKey: 'win' }
            },
            geographyConfig: {

                popupOnHover: false, //disable the popup while hovering
                highlightOnHover: true,
                highlightFillColor: '#AAA',
                highlightBorderColor: '#fff',
                highlightBorderWidth: 2,
                borderColor: '#DDD'
            }
        });

        arcs.arc([
            {
                origin: {
                    latitude: 40.639722,
                    longitude: -73.778889
                },
                destination: {
                    latitude: 37.618889,
                    longitude: -122.375
                }
            },
            {
                origin: {
                    latitude: 30.194444,
                    longitude: -97.67
                },
                destination: {
                    latitude: 25.793333,
                    longitude: -80.290556
                }
            },
            {
                origin: {
                    latitude: 39.861667,
                    longitude: -104.673056
                },
                destination: {
                    latitude: 35.877778,
                    longitude: -78.7875
                }
            }
        ], {strokeWidth: 2, arcSharpness: 1.4, strokeColor: '#0086c0'});
    }
}