/*
 * Slip.js 0.0.1
 * Author: beiyu
 * time: 20150908
 */

(function(WIN, DOC){

    var Slip = (function(){

        // 定义变量
        var UNDEFINED = undefined, NULL = null, X = 'x', Y = 'y', XY = 'xy', LEFT = 'left', RIGHT = 'right', UP = 'up', DOWN = 'down';

        // 从一串包含数字的字符串中提取数字 用于在css值中提取偏移值
        // transform: translate(-270px, 180px, 0);
        var NUMBER_REG = /\-?[0-9]+\.?[0-9]*/g;

        var stateClass = ['sta-pre', 'sta-in', 'sta-next'];

        // 是不是触屏设备 如果是触屏设备使用`touch`事件，否则使用`mouse`事件
        var IsTouch = 'ontouchend' in WIN;

        // 定义开始，进行，结束的事件名
        var START_EVENT = IsTouch ? 'touchstart' : 'mousedown';
        var MOVE_EVENT = IsTouch ? 'touchmove' : 'mousemove';
        var END_EVENT = IsTouch ? 'touchend' : 'mouseup';

        // 浏览器窗口的高度，宽度
        var WINDOW_HEIGHT = WIN['innerHeight'];
        var WINDOW_WIDTH = WIN['innerWidth'];

        // 空函数 作为默认的回调函数
        var noop = function () { };

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
                };
            },
            function(event){
                var e = event;
                return {
                    'x': e.clientX,
                    'y': e.clientY
                };
            }
        ];

        var getCoordinates = IsTouch ? getCoordinatesArray[0] : getCoordinatesArray[1];

        function Slip(ele, params){

            // 节点元素
            this.ele = ele;

            // 滑动方向 X || Y || XY
            this.direction = params.direction || Y;

            // 滑动方向中最小允许距离 小于这个值不触发滑动
            this.min_dis = params.min_dis || 40;

            // 如果是单方向滑动 非滑动方向最大允许距离
            this.max_dis = params.max_dis || 40;

            // CSS的前缀
            this.css_prefix = params.css_prefix || ['webkit', 'moz', 'ms', 'o', ''];

            // 是否滑动
            this.isSlider = params.isSlider || true;

            // 是否需要页面跟随手势移动
            this.isFollowTouch = params.isFollowTouch || false;

            // 是不是被按下了，只有按下才允许移动
            this._isPressed = false;

            /*
             * 默认的滑屏过渡时间，单位为ms
             * ```
             * // 设置过度时间为200ms
             * Slip(ele, 'y').time(200);
             * */
            this.duration = params.duration || '400';

            /*
             * 开始的回调
             * 移动中回调
             * 结束的回调
             * */
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

        Slip.prototype.start = function(fn){
            return (this.onStart = fn) && this;
        };

        Slip.prototype.move = function (fn) {
            return (this.onMove = fn) && this;
        };

        Slip.prototype.end = function (fn) {
            return (this.onEnd = fn) && this;
        };


        /*
         * 设置css的transition
         * @parm ele: 原生的dom元素
         * @parm css: transition的值
         * */
        Slip.prototype.setTransition = function(css){
            var prefix = '', name = '';
            for(var i = 0, len = this.css_prefix.length; i < len; i++){
                prefix = this.css_prefix[i];
                name = prefix ? prefix + 'Transition' : 'transition';
                this.ele.style[name] = css;
            }
        };

        /*
         * 设置元素的CSS位移
         * @parm ele: 原生的DOM元素
         * @parm x|y|x: 偏移的x, y, z
         * */
        Slip.prototype.setTranslate = function(x, y, z){
            var prefix ='', name = '';
            for(var i = 0, len = this.css_prefix.length; i < len; i++){
                prefix = this.css_prefix[i];
                name = prefix ? prefix + 'Transform' : 'transform';
                this.ele.style[name] = 'translate3d(' + (x || 0) + 'px, ' + (y || 0) + 'px, ' + (z || 0) + 'px)';
            }
        };

        /*
         * 获取元素的translate值
         * @parm ele: 原生的DOM元素
         * */
        Slip.prototype.getTranslate = function(){
            var prefix = '', name = '', css = '', coord = '', translate = [];
            for (var i = 0, len = this.css_prefix.length; i < len; i++) {
                prefix = this.css_prefix[i];
                name = prefix ? prefix + 'Transform' : 'transform';
                css = this.ele.style[name];
                if(css && typeof css == 'string'){
                    coord = css.match(/\((.*)\)/g)[0];
                    translate = coord && coord.match(NUMBER_REG);
                    break;
                }
            }
            if(translate.length){
                return {
                    x: translate[0] || 0,
                    y: translate[1] || 0,
                    z: translate[2] || 0
                }
            }
        };

        /*
         * Slip(ele).setCoord(...)
         * 设置元素坐标
         * 如果元素初始化就有一定的偏移，就可以使用这个方法
         * * `userCoords`: 一个坐标对象
         * ```
         * Slip(ele, 'x')
         *   .setCoord({
         *     x: 100,
         *     y: 0,
         *     z: 0
         *   });
         * */
        Slip.prototype.setCoord = function (userCoords) {
            var coords = this.coord = {
                'x': userCoords[X] || 0,
                'y': userCoords[Y] || 0
            };

            var ele = this.ele;
            this.setTranslate(coords[X], coords[Y]);
            for (attr in coords) {
                ele.setAttribute(attr, coords[attr]);
            }
            return this;
        };

        // 触摸开始的回调
        Slip.prototype.onTouchStart = function(event){
            this._isPressed = true;
            this.eventCoords = getCoordinates(event);
            this.cacheCoords = this.coord;
            // 清空手指位移
            this.finger = this.absFinger = NULL;
            if(this.isSlider){
                this.onSliderStart(event);
            }

            return this.onStart.apply(this, [event]);
        };

        // 触摸进行中的回调
        Slip.prototype.onTouchMove = function(event) {
            event.preventDefault();
            if(!this._isPressed){
                return false;
            }
            var moveCoords = getCoordinates(event);
            var direction = this.direction;

            /*
             * 手指偏移
             * 左滑 finger.x < 0
             * 右滑 finger.x > 0
             * 上滑 finger.y < 0
             * 下滑 finger.y > 0
             * */
            var finger = this.finger = {
                x: moveCoords.x - this.eventCoords.x,
                y: moveCoords.y - this.eventCoords.y
            };

            // 手指偏移的绝对值
            var absFinger = this.absFinger = {
                x: Math.abs(finger.x),
                y: Math.abs(finger.y)
            };

            // 单方向滑动时，小于正方向最小距离，大于反方向最大距离，不是正确的手指行为
            if(direction != XY){
                var oppDirection = direction == X ? Y : X;
                if(absFinger[direction] < this.min_dis || absFinger[oppDirection] > this.max_dis){
                    return false;
                }
            }

            // 手指移动方向
            var orient = [];
            if(absFinger.x > this.min_dis){
                orient.push(finger.x < 0 ? LEFT : RIGHT);
            }
            if (absFinger.y > this.min_dis) {
                orient.push(finger.y < 0 ? UP : DOWN);
            }

            this.orient = orient;

            /*
             * 执行用户定义的进行中回调
             * 用户定义回调可以有返回值
             * 如果返回值为 false，那就不继续了
             * */
            var ret = this.onMove.apply(this, [event]);
            if (ret == false) {
                return false;
            }

            var ele = this.ele;

            // 元素的实际位移
            var eleMove = this.coord = {
                'x': direction.indexOf(X) < 0 ? this.cacheCoords[X] : this.cacheCoords[X] - 0 + finger.x,
                "y": direction.indexOf(Y) < 0 ? this.cacheCoords[Y] : this.cacheCoords[Y] - 0 + finger.y
            };

            if(this.isFollowTouch){
                this.setTranslate(eleMove[X], eleMove[Y]);
            }
            for(attr in eleMove){
                ele.setAttribute(attr, eleMove[attr]);
            }
        };

        // 触摸结束的回调
        Slip.prototype.onTouchEnd = function(event){
            this._isPressed = false;
            var ele = this.ele;
            if(this.isSlider){
                this.onSliderEnd(event);
            }

            // 结束后设置一次translate
            // 防止用户在自己定义的回调中改变了translate的值
            var trans = this.getTranslate(this.ele);
            if (trans) {
                this.setCoord(trans);
            }

            // 最后来清空手指滑动的方向
            this.orient = [];
        };


        Slip.prototype.onSliderStart = function(event){
            return this.setTransition(NULL);
        };

        // 当滑动结束时，针对轮播器做些特别处理
        Slip.prototype.onSliderEnd = function(event, data){
            if(data == null){
                data = {};
            }
            var jumpPage = data.jumpPage;
            var isJump = jumpPage;

            // 手指滑动方向
            var orient = this.orient.join('');

            var trans = 0;

            // 是不是超出了，即第一页向前滑，最后一页向后滑
            var isOut = false;

            var page = this.page;
            var pageNum = this.pageNum;
            var ele = this.ele;
            var duration = this.duration;
            var absFinger = this.absFinger;

            var isUp = orient.indexOf(UP) > -1;
            var isDown = orient.indexOf(DOWN) > -1;
            var isLeft = orient.indexOf(LEFT) > -1;
            var isRight = orient.indexOf(RIGHT) > -1;

            // 是不是垂直滑动
            var isVerticalWebapp = this.direction == Y;

            if(jumpPage != UNDEFINED){
                page = jumpPage;
            }else{
                if(isVerticalWebapp){
                    if(isUp){
                        page++;
                    }
                    if (isDown) {
                        page--;
                    }
                }else{
                    if (isLeft) {
                        page++;
                    }
                    if (isRight) {
                        page--;
                    }
                }
            }


            if (page >= pageNum) {
                page = pageNum - 1;
                isOut = true;
            }
            if (page < 0) {
                page = 0;
                isOut = true;
            }

            /*
             * 这里做了个细节处理
             * 1. 当用户定义整页滑动的时长为400ms
             * 2. 如果在超出时，反弹回去的时间不应为400ms
             * 3. 反弹的距离 < 页面的距离
             * 4. 所以反弹的时长 = 整页的时长 * (反弹的距离 / 整页的距离)
             * 5. 即反弹的时长 < 整页过渡的时长
             * */
            if (isOut == true && !isJump) {
                duration *= isVerticalWebapp ? absFinger[Y] / this.pageHeight : absFinger[X] / this.pageWidth;
            }
            this.setTransition('all ' + duration + 'ms ease-in');
            if (isVerticalWebapp) {
                trans = '-' + (page * this.pageHeight);
                this.setTranslate(0, trans, 0);
            } else {
                trans = '-' + (page * this.pageWidth);
                this.setTranslate(trans, 0, 0);
            }
            this.page = page;
            if (isJump) {
                this.onTouchEnd.call(this, NULL);
            }
            var ret = this.onEnd.apply(this, [event]);
            return this;
        };



        // Slip(ele).destroy()
        // 摧毁元素的滑动
        Slip.prototype.destroy = function () {
            var ele = this.ele;
            ele.removeEventListener(START_EVENT, this._onTouchStart, false);
            ele.removeEventListener(MOVE_EVENT, this._onTouchMove, false);
            ele.removeEventListener(END_EVENT, this._onTouchEnd, false);
            return this;
        };

        /*
         * Slip(ele).slider()
         * 设置是个普通的轮播器
         * 'elPages': 可接受三种类型的值
         * 1. String: 传入一个选择器
         * 2. Array|类Array的Obejct: 子元素列表
         * 3. undifined|null... 传入空值，那就默认获取滑动元素的所有直接子元素（儿子）。
         * ----
         *# 推荐第二种做法。
         * */
        Slip.prototype.slider = function (elPages) {
            var ele = this.ele;
            if (typeof elPages == 'string') {
                elPages = ele.querySelectorAll(elPages);
            } else if (!elPages) { // 传入为空
                elPages = [];
                var elChilds = ele.childNodes;
                var elChild = '';
                for (var i = 0, len = elChilds.length; i < len; i++) {
                    elChild = elChilds[i];
                    if (elChild.nodeType == 1) {
                        elPages.push(elChild);
                    }
                }
            }

            this.isSlider = true;
            this.page = 0;
            this.elPages = elPages;
            var elPagesLen = elPages.length;
            var pageNum = this.pageNum = elPagesLen ? elPagesLen : 0;

            // 横向滑动
            if (this.direction == X) {
                var elPage = '';
                for (var j = 0, len1 = elPages.length; j < len1; j++) {
                    elPage = elPages[j];
                    elPage.style.cssFloat = LEFT;
                }
            }

            return this;
        };

        /*
         * Slip(ele).webapp()
         * 设置页面是个全屏的webapp
         * 继承了slider，再做些特别处理。
         * */
        Slip.prototype.webapp = function (elPages) {
            this.isWebapp = true;

            // 如果是webapp肯定全屏
            this.slider(elPages).fullscreen();

            elPages = this.elPages;
            var ele = this.ele;
            var pageNum = this.pageNum;

            ele.style.height = WINDOW_HEIGHT * pageNum + 'px';
            this.height(WINDOW_HEIGHT);

            // 横向滑动的webapp
            if (this.direction == X) {
                this.width(WINDOW_WIDTH);
            }

            return this;
        };

        /*
         * Slip(ele).slider().width('100%');
         * 设置轮播器的宽度
         * */
        Slip.prototype.width = function (num) {
            var ele = this.ele;
            var elPages = this.elPages;
            var pageNum = this.pageNum;
            num = String(num).replace('px', '');

            if (num == '100%') {
                num = WINDOW_WIDTH;
            }

            this.pageWidth = num;

            if (this.direction == X) {
                ele.style.width = (num * pageNum) + 'px';
            }

            var elPage = '';
            for (var i = 0, len = elPages.length; i < len; i++) {
                elPage = elPages[i];
                elPage.style.width = num + 'px';
            }

            return this;
        };

        /*
         * Slip(ele).slider().height(200)
         * 设置轮播器的高度
         * */
        Slip.prototype.height = function (num) {
            var ele = this.ele;
            var elPages = this.elPages;
            var pageNum = this.pageNum;
            num = String(num).replace('px', '');

            if (num == "100%") {
                num = WINDOW_HEIGHT;
            }

            this.pageHeight = num;

            if (this.direction == X) {
                ele.style.height = num + 'px';
            }

            var elPage = '';
            for (var i = 0, len = elPages.length; i < len; i++) {
                elPage = elPages[i];
                elPage.style.height = num + 'px';
            }

            return this;
        };

        /*
         * Slip(ele).fullscreen()
         * 设置全屏
         * */
        Slip.prototype.fullscreen = function () {
            var child = this.ele;
            var parent = '';
            while (parent = child.parentNode) {
                if (parent.nodeType == 1) {
                    parent.style.height = '100%';
                    parent.style.overflow = 'hidden';
                }
                child = parent;
            }
            return this;
        };



        // 初始化
        Slip.prototype.init = function(){
            this.coord = {'x': 0, 'y': 0};

            // 之所以加上下划线方法，是为了给 destroy 用
            var onTouchStart = this._onTouchStart = (function (_this) {
                return function (event) {
                    return _this.onTouchStart(event);
                }
            })(this);

            var onTouchMove = this._onTouchMove = (function (_this) {
                return function (event) {
                    return _this.onTouchMove(event);
                };
            })(this);

            var onTouchEnd = this._onTouchEnd = (function (_this) {
                return function (event) {
                    return _this.onTouchEnd(event);
                };
            })(this);

            var ele = this.ele;
            ele.addEventListener(START_EVENT, onTouchStart, false);
            ele.addEventListener(MOVE_EVENT, onTouchMove, false);
            ele.addEventListener(END_EVENT, onTouchEnd, false);

            // 初始化元素位移
            var initMove = this.coord = {'x': 0, 'y': 0};
            var direction = this.direction;
            this.setTranslate(initMove[X], initMove[Y]);
            for (attr in initMove) {
                ele.setAttribute(attr, initMove[attr]);
            }

            return this;
        };

        return Slip;
    })();

    // 暴漏到window的对象，内部实例化Slip
    var entry = function(ele, params){
        var instance = new Slip(ele, params);
        return instance.init();
    };
    if(typeof define == 'function'){
        return define('',function(require, exports, module){
            return entry;
        });
    }else{
        return WIN['Slip'] = entry;
    }
})(window, document);
