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

    /*
     * 设置css的transition
     * @parm ele: 原生的dom元素
     * @parm css: transition的值
     * @parm prefixs: css 前缀
     * */
    var setTransition = function(ele, css, prefixs){
        var prefix = '', name = '';
        for(var i = 0, len = prefix.length; i < len; i++){
            prefix = prefixs[i];
            name = prefix ? prefix + 'Transition' : 'transition';
            ele.style[name] = css;
        }
    };

    /*
     * 设置元素的CSS位移
     * @parm ele: 原生的DOM元素
     * @parm x|y|x: 偏移的x, y, z object对象 {'x': 0, 'y': 0, 'z': 0}
     * @parm prefixs: css 前缀
     * */
    var setTranslate = function (ele, positions, prefixs) {
        var prefix = '', name = '';
        for (var i = 0, len = prefixs.length; i < len; i++) {
            prefix = prefixs[i];
            name = prefix ? prefix + 'Transform' : 'transform';
            ele.style[name] = 'translate3d(' + (positions.x || 0) + 'px, ' + (positions.y || 0) + 'px, ' + (positions.z || 0) + 'px)';
        }
    };

    /*
     * 获取元素的translate值
     * @parm ele: 原生的DOM元素
     * @parm prefixs: css 前缀
     * */
    var getTranslate = function(ele, prefixs){
        var prefix = '', name = '', css = '', coord = '', translate = [];
        for(var i = 0, len = prefixs.length; i < len; i++){
            prefix = prefixs[i];
            name = prefix ? prefix + 'Transform' : 'transform';
            css = ele.style[name];
            if(css && typeof css == 'string'){
                coord = css.match(/\((.*)\)/g)[0];
                translate = coord && coord.match(NUMBER_REG);
                break;
            }
        }
        if(translate.length){
            return{
                x: translate[0] || 0,
                y: translate[1] || 0,
                z: translate[2] || 0
            }
        }
    };


    var Slip = (function(){

        // 获取事件触发距离 处理一堆兼容
        var getCoordinatesArray = [
            function(event){
                // touches: 表示当前跟踪的触摸操作的Touch对象的数组。
                // changedTouches: 包含每个接触状态变化的触点信息的列表。
                var touches = event.touches && (event.touches.length ? event.touches : [event]);
                var e = (event.changedTouches && event.changedTouches[0]) || (event.originalEvent && event.originalEvent.changedTouches && event.originalEvent.changedTouches[0]) || touches[0].originalEvent || touches[0];
                return {
                    'x': e.clientX,
                    'y': e.clientY
                }
            },
            function(event){
                var e = event;
                return{
                    'x': e.clientX,
                    'y': e.clientY
                }
            }
        ];

        var getCoordinates = IsTouch ? getCoordinatesArray[0] : getCoordinatesArray[1];


        // 构造器
        function Slip(ele, parms){
            this.ele = ele;

            // 滑动方向
            this.direction = parms.direction || Y;

            // 是否允许用户滚动
            this.isSlider = parms.isSlider || true;

            // 设置滑动时动画过度时间，单位为 ms
            this.duration = parms.duration ||  '400';

            // CSS的前缀
            this.cssPrefix = parms.cssPrefix || ['webkit', 'moz', 'ms', 'o', ''];

            // 滑动方向中最小允许距离 小于这个值不触发滑动
            this.minDis = parms.minDis || 60;

            // 如果是单方向滑动 非滑动方向最大允许距离
            this.maxDis = parms.maxDis || 60;



            // 是不是被按下了，只有按下才允许移动
            this._isPressed = false;

            // 开始的回调 移动中回调 结束的回调
            this.onStart = this.onMove = this.onEnd = noop;

            /*
             * coord: 元素实际坐标值
             * eventCoords: 手指的坐标，用于在各种事件中传递
             * cacheCoords: 当touchstart时候，缓存的当前位移，用于touchmove中计算
             * finger: 手指的位移
             * absFinger: 手指位移的绝对值
             * */
            this.coord = this.eventCoords = this.cacheCoords = this.finger = this.absFinger = NULL;

            /*
             * 结束后手指滑动的方向 这个值是个数组
             * 左滑: ['left']
             * 右滑: ['right']
             * 上滑: ['up']
             * 下滑: ['down']
             * 左上滑: ['left', 'up']
             * 右上滑: ['right', 'up']
             * 右下滑: ['right', 'down']
             * 左下滑: ['left', 'down']
             * */
            this.orient = [];


        }


        // 初始化
        Slip.prototype.init = function(){

            // 所以加上下划线方法，是为了给 destroy 用
            var onTouchStart = this._onTouchStart = (function (_this) {
                return function(event){
                    return _this.onTouchStart(event);
                }
            })(this);

            var onTouchMove = this._onTouchMove = (function(_this){
                return function(event){
                    return _this.onTouchMove(event);
                }
            })(this);

            var onTouchEnd = this._onTouchEnd = (function (_this) {
                return function (event) {
                    return _this.onTouchEnd(event);
                };
            })(this);

            var ele = this.ele;

            // 绑定监听事件
            ele.addEventListener(START_EVENT, onTouchStart, false);
            ele.addEventListener(MOVE_EVENT, onTouchMove, false);
            ele.addEventListener(END_EVENT, onTouchEnd, false);

            // 初始化元素位移
            var initMove = this.coord = {'x': 0, 'y': 0};
            setTranslate(ele, {'x': initMove[X], 'y':initMove[Y]}, this.cssPrefix);

            return this;
        };


        Slip.prototype.start = function(fn){
            return (this.onStart = fn) && this;
        };

        Slip.prototype.move = function(){
            return (this.onMove = fn) && this;
        };

        Slip.prototype.end = function(){
            return (this.onEnd = fn) && this;
        };


        // 触摸开始的回调
        Slip.prototype.onTouchStart = function(event){
            console.log('开始了');
        };

        // 触摸进行中的回调
        Slip.prototype.onTouchMove = function(event){
            console.log('移动中');
        };

        // 触摸结束的回调
        Slip.prototype.onTouchEnd = function(event){
            console.log('结束了');
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