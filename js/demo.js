define(function (require, exports, module) {
    var $ = require('zepto');
    var Slip = require('slip');

    var ele = document.getElementById("slip");
    var slip = Slip(ele, "xy");
    var initCoord = {
        x: 0,
        y: 120
    };
    slip.setCoord(initCoord)
        .start(function (event) {
            $(this.ele).removeClass('anim')
        })
        .move(function (event) {
            console.log(this.coord);
        })
        .end(function () {
            var x = Math.abs(this.coord.x);
            var y = Math.abs(this.coord.y);


            if (x < 60 || y < 60) {
                $(this.ele).addClass('anim').css({
                    "-webkit-transform": "translate3d(" + initCoord.x + "px ," + initCoord.y + "px ,0)",
                    "transform": "translate3d(" + initCoord.x + "px ," + initCoord.y + "px ,0)"
                });
                this.setCoord(initCoord);
            } else {
                initCoord = {
                    x: this.coord.x,
                    y: this.coord.y
                };
            }
            console.log(this.orient);
        });
});