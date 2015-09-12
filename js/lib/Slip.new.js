/*
 * Slip.js 0.0.2
 * Author: beiyu
 * time: 20150908
 */

(function(WIN, DOC){

    // 定义变量
    var UNDEFINED = undefined, NULL = null, X = 'x', Y = 'y', XY = 'xy', LEFT = 'left', RIGHT = 'right', UP = 'UP', DOWN = 'down';

    // 从一串包含数字的字符串中提取数字 用于在css值中提取偏移值
    // transform: translate(-270px, 180px, 0);
    var NUMBER_REG = /\-?[0-9]+\.?[0-9]]*/g;

    // 是不是触屏设备 如果是触屏设备使用`touch`事件，否则使用`mouse`事件
    var IsTouch = 'ontouchend' in WIN;

    // 定义开始，进行，结束的事件名
    var START_EVENT = IsTouch ? 'touchstart' : 'mousedown';
    var MOVE_EVENT = IsTouch ? 'touchmove' : 'mousemove';
    var END_EVENT = IsTouch ? 'touchend' : 'mouseup';

    // 浏览器窗口的宽度和高度
    var WINDOW_WIDTH = WIN['innerWidth'];
    var WINDOW_HEIGHT = WIN['innerHeight'];

    // 空函数 作为默认的回调函数
    var noop = function(){};
    

    var Slip = (function(){

        function Slip(){

        }


        // 初始化
        Slip.prototype.init = function(){

        };

        return Slip;
    })();

    // slip
    // 暴露到 window 的对象，内部实例化 Slip
    var entry = function(ele,parms){
        var instance = new Slip(ele, parms);
        return instance.init();
    };
    if(typeof define == 'function'){
        return define('lib/Slip.js',function(require, exports, module){
            return entry;
        });
    }else{
        return WIN['Slip'] = entry;
    }

})(window, document);