/*
 * Slip.js 0.0.2
 * Author: beiyu
 * time: 20150908
 */

(function(){

    var $;

    /*===========================
     Slip
     ===========================*/
    var Slip = function(container, params){
        // 如果不是用 new 实例化 Slip ，就返回一个实例后的 Slip
        if(!(this instanceof Slip)) return new Slip(container, params);

        // 默认配置参数
        var defaults = {

            // Basic (Slip一般选项)
            initialSlide: 0,        // 设定初始化时slide的索引
            direction: 'vertical',  // Slides的滑动方向，可设置水平(horizontal)或垂直(vertical)
            speed: 300,             // 滑动速度，即slider自动滑动开始到结束的时间（单位ms）
            autoplay: false,       //自动切换的时间间隔（单位ms），不设定该参数slide不会自动切换
                                    // 用户操作后autoplay停止，参考基本选项 autoplayDisableOnInteraction
            autoplayDisableOnInteraction: true, // 用户操作slip之后，是否禁止autoplay。默认为true：停止
                                                // 如果设置为false，用户操作slipr之后自动切换不会停止，每次都会重新启动autoplay。
                                                // 操作包括触碰，拖动，点击pagination等。
            grabCursor: false,      // 设置为true时，鼠标覆盖Slip时指针会变成手掌形状，拖动时指针会变成抓手形状。（根据浏览器形状有所不同）
            /*
            * 如需要开启视差效果（相对父元素移动），设置为true并在所需要的元素上增加data-slip-parallax属性。
            *
            *  自从3.03版本后Slip为slip和slide内元素增加视差效果。有两种表现形式：
            *
            *  1. 对于slip-container的子元素，视差效果基于slip的progress（0-1之间的小数，如有三个slide则是0->0.5->1）。
            * 2. 对于slides的子元素，视差效果基于slide的progress（1，0，-1，当前slide向左是从0->1，向右是从0->-1）。
            *
            * data-slip-parallax接受两种类型的参数。
            * 1. number（单位：px），移动距离=number*progress。
            * 2. percentage（百分比），移动距离=元素宽度*percentage*progress。
            *
            * 你还可以通过data-slip-parallax-x 和 data-slip-parallax-y单独设定其移动方向。
            * 还可通过data-slip-parallax-duration设定动画持续时间（可选），单位毫秒，默认值是Slip的speed。
            *
            * 例：slip内有5个slide，则slip的progress是 0，0.25，0.5，0.75，1。
            * slip-container的子元素，设定了data-slip-parallax=1000，当slide从0过渡到1时（初始向右滑动），该元素向右移动250px。
            * slides的子元素，设定了data-slip-parallax=1000，当slide从0过渡到1时（初始向右滑动），该元素相对于slide从0向右移动到250px处。nextslide内元素相对于slide从-250px向右移动0px处。
            * */
            parallax: false,
            hashnav: false,         // 如需使用散列导航（有点像锚链接）将此参数设置为true。此外在每个slide处增加data-hash属性。这样当你的slip切换时你的页面url就会加上这个属性的值了，你也可以通过进入页面时修改页面url让slip在初始化时切换到指定的slide
            setWrapperSize: false,  // Slip从3.0开始使用flexbox布局(display: flex)，开启这个设定会在Wrapper上添加等于slides相加的宽高，在对flexbox布局的支持不是很好的浏览器中可能需要用到
            virtualTranslate: false,// 虚拟位移。当你启用这个参数，Slip除了不会移动外其他的都像平时一样运行，仅仅是不会在Wrapper上设置位移。当你想自定义一些slide切换效果时可以用，启用这个选项时onSlideChange和onTransition事件失效
            roundLengths: false,    // 设定为true将slide的宽和高取整(四舍五入)以防止某些分辨率的屏幕上文字模糊
            slidesOffsetBefore: 0,  // 设定slide与左边框的预设偏移量（单位px） // 属于 网格分布
            slidesOffsetAfter: 0,   // 设定slide与右边框的预设偏移量（单位px） // 属于 网格分布



            // Progress (进度)
            /*
            * 开启这个参数来计算每个slide的progress(进度)，Slip的progress无需设置即开启。
            *
            * 对于slide的progress属性，活动的那个为0，其他的依次减1。例：如果一共有6个slide，活动的是第三个，从第一个到第六个的progress属性分别是：2、1、0、-1、-2、-3。
            * 对于slip的progress属性，活动的slide在最左（上）边时为0，活动的slide在最右（下）边时为1，其他情况平分。例：有6个slide，当活动的是第三个时slip的progress属性是0.4，当活动的是第五个时slip的progress属性是0.8。
            *
            * slip的progress其实就是wrapper的translate值的百分值，与activeIndex等属性不同，progress是随着slip的切换而不停的变化，而不是在某个时间点突变。
            * */
            watchSlidesProgress: false,
            watchSlidesVisibility: false,   // 开启watchSlidesVisibility选项前需要先开启watchSlidesProgress，如果开启了watchSlidesVisibility，则会在每个可见slide增加一个classname，默认为'slip-slide-visible'



            // Free mode (free模式/抵抗反弹)
            freeMode: false,                // 默认为false，普通模式：slide滑动时只滑动一格，并自动贴合wrapper，设置为true则变为free模式，slide会根据惯性滑动且不会贴合
            freeModeMomentum: true,         // free模式动量。free模式下，若设置为false则关闭动量，释放slide之后立即停止不会滑动
            freeModeMomentumRatio: 1,       // free模式动量值（移动惯量）。设置的值越大，当释放slide时的滑动距离越大
            freeModeMomentumBounce: true,   // 动量反弹。false时禁用free模式下的动量反弹，slides通过惯性滑动到边缘时，无法反弹。注意与resistance（手动抵抗）区分
            freeModeMomentumBounceRatio: 1, // 值越大产生的边界反弹效果越明显，反弹距离越大
            freeModeSticky: false,          // 使得freeMode也能自动贴合



            // Slides grid (网格分布)
            centeredSlides: false,  // 设定为true时，活动块会居中，而不是默认状态下的居左
            /*
            * 设置slider容器能够同时显示的slides数量(carousel模式)。
            * 可以设置为number或者 'auto'则自动根据slides的宽度来设定数量。
            * loop模式下如果设置为'auto'还需要设置另外一个参数loopedSlides。
            * */
            slidesPerView: 1,
            slidesPerGroup: 1,  // 在carousel mode下定义slides的数量多少为一组
            spaceBetween: 0,    // slide之间的距离（单位px）
            slidesPerColumn: 1, // 多行布局里面每列的slide数量
            /*
            * 多行布局中以什么形式填充：
            * 'column'（列）
            *  1	3	5
            *  2	4	6
            *  'row'（行）
            *  1	2	3
            *  4	5	6
            * */
            slidesPerColumnFill: 0,



            // Effects (切换效果)
            effect: 'slide',    // slide的切换效果，默认为"slide"（位移切换），可设置为"fade"（淡入）"cube"（方块）"coverflow"（3d流）
            /*
            * fade效果参数。可选参数：crossFade(3.03启用)。
            * 默认：false。关闭淡出。过渡时，原slide透明度为1（不淡出），过渡中的slide透明度从0->1（淡入），其他slide透明度0。
            * 可选值：true。开启淡出。过渡时，原slide透明度从1->0（淡出），过渡中的slide透明度从0->1（淡入），其他slide透明度0。
            * */
            fade: {
                crossFade: false
            },
            // cube效果参数，可选值：
            cube: {
                slideShadows: true, // 开启slide阴影，默认 true
                shadow: true,       // 开启投影，默认 true
                shadowOffset: 20,   // 投影距离，默认 20，单位px
                shadowScale: 0.94   // 投影缩放比例，默认0.94
            },
            // over flow是类似于苹果将多首歌曲的封面以3D界面的形式显示出来的方式。coverflow效果参数，可选值：
            coverflow: {
                rotate: 50,         // slide做3d旋转时Y轴的旋转角度，默认50
                stretch: 0,         // 每个slide之间的拉伸值，越大slide靠得越紧，默认0
                depth: 100,         // slide的位置深度，值越大z轴距离越远，看起来越小，默认100
                modifier: 1,        // depth和rotate和stretch的倍率，相当于depth*modifier、rotate*modifier、stretch*modifier，值越大这三个参数的效果越明显，默认1
                slideShadows : true // 开启slide阴影，默认 true
            },



            // Clicks (点击)
            preventClicks: true,            // 默认为true，当sliping时阻止意外的链接点击
            preventClicksPropagation: true, // 阻止click冒泡。拖动Slip时阻止click事件
            slideToClickedSlide: false,     // 设置为true则sliping时点击slide会过渡到这个slide



            // Touches (触发条件)
            touchRatio: 1,          // 触摸距离与slide滑动距离的比率
            simulateTouch: true,    // 默认为true，Slip接受鼠标点击、拖动
            onlyExternal: false,    // 值为true时，slide无法拖动，只能使用扩展API函数例如slideNext() 或slidePrev()或slideTo()等改变slides滑动
            followFinger: true,     // 如设置为false，拖动slide时它不会动，当你释放时slide才会切换
            shortSwipes: true,      // 设置为false时，进行快速短距离的拖动无法触发Slip
            longSwipesRatio: 0.5,   // 进行longSwipes时触发slip所需要的最小拖动距离比例，即定义longSwipes距离比例。值越大触发Slip所需距离越大。最大值0.5
            threshold: 0,           // 拖动的临界值（单位为px），如果触摸距离小于该值滑块不会被拖动
            touchAngle: 45,         // 允许触发拖动的角度值。默认45度，即使触摸方向不是完全水平也能拖动slide
            longSwipes: true,       // 设置为false时，进行长时间长距离的拖动无法触发Slip
            touchMoveStopPropagation: true, // true时阻止touchmove冒泡事件
            longSwipesMs: 300,      // 定义longSwipes的时间（单位ms），超过则属于longSwipes。
            resistance: true,       // 边缘抵抗。当slip已经处于第一个或最后一个slide时，继续拖动Slip会离开边界，释放后弹回。边缘抵抗就是拖离边界时的抵抗力。值为false时禁用，将slide拖离边缘时完全没有抗力。可以通过resistanceRatio设定抵抗力大小
            resistanceRatio: 0.85,  // 抵抗率。边缘抵抗力的大小比例。值越小抵抗越大越难将slide拖离边缘，0时完全无法拖离



            // Swiping/no sliping (禁止切换)
            noSwiping: true,        // 设为true时，可以在slide上（或其他元素）增加类名'slip-no-sliping'，使该slide无法拖动，该类名可通过noSwipingClass修改
            noSwipingClass: 'slip-no-sliping',    // // 不可拖动块的类名，当noSwiping设置为true时，并且在slide加上此类名，slide无法拖动
            allowSwipeToPrev: true, // 设为false可禁止向左或上滑动。作用类似mySlip.lockSwipeToPrev()
            allowSwipeToNext: true, // 设为false可禁止向左或下滑动。作用类似mySlip.lockSwipeToNext()
            slipHandler: null,     // CSS选择器或者HTML元素。你只能拖动它进行sliping



            // Pagination (分页器)
            pagination: null,               // 分页器容器的css选择器或HTML标签。分页器等组件可以置于container之外，不同Slip的组件应该有所区分，如#pagination1，#pagination2
            paginationClickable: false,     // 此参数设置为true时，点击分页器的指示点分页器会控制Slip切换
            paginationBulletRender: null,   // 渲染分页器小点。这个参数允许完全自定义分页器的指示点。接受指示点索引和指示点类名作为参数
            paginationHide: false,          // true时点击Slip的container会显示/隐藏分页器
            paginationElement: 'span',      // 设定分页器指示器（小点）的HTML标签



            // Next/prev buttons (前进后退按钮)
            prevButton: null,   // 后退按钮的css选择器或HTML元素
            nextButton: null,   // 前进按钮的css选择器或HTML元素



            // Scrollbar (滚动条)
            scrollbar: null,    // Scrollbar容器的css选择器或HTML元素
            scrollbarHide: true,// 滚动条是否自动隐藏。默认：true会自动隐藏



            // Keyboard Mousewheel (鼠标、键盘控制选项)
            keyboardControl: false,         // 是否开启键盘控制Slip切换。设置为true时，能使用键盘方向键控制slide滑动
            mousewheelControl: false,       // 是否开启鼠标控制Slip切换。设置为true时，能使用鼠标滚轮控制slide滑动
            mousewheelForceToAxis: false,   // 当值为true让鼠标滚轮固定于轴向。当水平mode时的鼠标滚轮只有水平滚动才会起效，当垂直mode时的鼠标滚轮只有垂直滚动才会起效。普通家用鼠标只有垂直方向的滚动
            mousewheelReleaseOnEdges: false,// 如果开启这个参数，当Slip处于边缘位置时（第一个或最后一个slide），Slip释放鼠标滚轮事件，鼠标可以控制页面滚动
            mousewheelInvert: false,        // 这个参数会使鼠标滚轮控制方向反转
            mousewheelSensitivity: 1,       // 鼠标滚轮的灵敏度，值越大鼠标滚轮滚动时slip位移越大



            // Images (图片选项)
            preloadImages: true,        // 默认为true，Slip会强制加载所有图片
            updateOnImagesReady: true,  // 当所有的内嵌图像（img标签）加载完成后Slip会重新初始化。使用此选项需要先开启preloadImages: true

            // Lazy Loading (延时加载)
            /*
            * 设为true开启图片延迟加载，使preloadImages无效。
            * 需要将图片img标签的src改写成data-src，并且增加类名slip-lazy。
            * 背景图的延迟加载则增加属性data-background（3.0.7开始启用）。
            *
            * 还可以为slide加一个预加载，<div class="slip-lazy-preloader"></div>
            * 或者白色的<div class="slip-lazy-preloader slip-lazy-preloader-white"></div>
            *
            * 当你设置了slidesPerView:'auto' 或者 slidesPerView > 1，还需要开启watchSlidesVisibility。
            * */
            lazyLoading: false,
            lazyLoadingInPrevNext: false,       // 设置为true允许将延迟加载应用到最接近的slide的图片（前一个和后一个slide）
            lazyLoadingOnTransitionStart: false,// 默认当过渡到slide后开始加载图片，如果你想在过渡一开始就加载，设置为true



            // Loop (环路)
            loop: false,        // 设置为true 则开启loop模式。loop模式：会在wrapper前后生成若干个slides让slides看起来是衔接的，用于无限循环切换。loop模式在与free模式同用时会产生抖动，因为free模式下没有复制slide的时间点
            /*
            * loop模式下会在slides前后复制若干个slide,，前后复制的个数不会大于原总个数。
            * 默认为0，前后各复制1个。0,1,2 --> 2,0,1,2,0
            * 例：取值为1，0,1,2 --> 1,2,0,1,2,0,1
            * 例：取值为2或以上，0,1,2 --> 0,1,2,0,1,2,0,1,2
            * */
            loopAdditionalSlides: 0,
            loopedSlides: null,     // 在loop模式下使用slidesPerview:'auto',还需使用该参数设置所要用到的loop个数



            // Control (双向控制)
            control: undefined,     // 设置为另外一个Slip实例开始控制该Slip
            controlInverse: false,  // 设置为true时控制方向倒转
            /*
            * 设定Slip相互控制时的控制方式。当两个slip的slide数量不一致时可用。
            *  默认为'slide'，自身切换一个slide时，被控制方也切换一个slide。
            *  可选：'container'，按自身slide在container中的位置比例进行控制。
            *  例：有4个slide的slip1控制有7个slide的slip2，
            *  设定'slide',slip1的1,2,3,4对应控制的slip2为1,2,3,7。
            *  设定controlBy:'container',slip1的1,2,3,4对应控制的slip2为1,3,5,7。
            * */
            controlBy: 'slide',



            // Observer (监视器)
            observer: false,        // 启动动态检查器，当改变slip的样式（例如隐藏/显示）或者修改slip的子元素时，自动初始化slip。默认false，不开启，可以使用update()方法更新
            observeParents: false,  // 将observe应用于Slip的父元素。当Slip的父元素变化时，例如window.resize，Slip更新



            // wrapper class 名字 命名空间
            wrapperClass: 'slip-wrapper', // 设置wrapper的css类名
            slideClass: 'slip-slide', // 设置slide的类名
            slideActiveClass: 'slip-slide-active',    // 设置活动块的类名
            slideVisibleClass: 'slip-slide-visible',  // 设置可视块的类名
            bulletClass: 'slip-pagination-bullet',    // pagination分页器内元素的类名
            bulletActiveClass: 'slip-pagination-bullet-active',   // pagination分页器内活动(active)元素的类名
            slideDuplicateClass: 'slip-slide-duplicate',  // loop模式下被复制的slide的类名
            slidePrevClass: 'slip-slide-prev',    // active slide的前一个slide的类名
            slideNextClass: 'slip-slide-next',    // active slide的下一个slide的类名
            paginationHiddenClass: 'slip-pagination-hidden',  // 分页器隐藏时的类名
            buttonDisabledClass: 'slip-button-disabled'  // 前进后退按钮不可用时的类名



            /*
             Callbacks:
             onInit: function (slip)
             onDestroy: function (slip)
             onClick: function (slip, e)
             onTap: function (slip, e)
             onDoubleTap: function (slip, e)
             onSliderMove: function (slip, e)
             onSlideChangeStart: function (slip)
             onSlideChangeEnd: function (slip)
             onTransitionStart: function (slip)
             onTransitionEnd: function (slip)
             onImagesReady: function (slip)
             onProgress: function (slip, progress)
             onTouchStart: function (slip, e)
             onTouchMove: function (slip, e)
             onTouchMoveOpposite: function (slip, e)
             onTouchEnd: function (slip, e)
             onReachBeginning: function (slip)
             onReachEnd: function (slip)
             onSetTransition: function (slip, duration)
             onSetTranslate: function (slip, translate)
             onAutoplayStart: function (slip)
             onAutoplayStop: function (slip),
             onLazyImageLoad: function (slip, slide, image)
             onLazyImageReady: function (slip, slide, image)
             */


        };

        params = params || {};
        for (var def in defaults) {
            if (typeof params[def] === 'undefined') {
                params[def] = defaults[def];
            } else if (typeof params[def] === 'object') {
                for (var deepDef in defaults[def]) {
                    if (typeof params[def][deepDef] === 'undefined') {
                        params[def][deepDef] = defaults[def][deepDef];
                    }
                }
            }
        }

        // 版本
        this.version = '0.0.1';

        // 参数
        this.params = params;

        // Classname
        this.classNames = [];

        /*=========================
         Dom Library and plugins
         ===========================*/
        if (typeof $ !== 'undefined' && typeof Dom7 !== 'undefined'){
            $ = Dom7;
        }
        if (typeof $ === 'undefined') {
            if (typeof Dom7 === 'undefined') {
                $ = window.Dom7 || window.Zepto || window.jQuery;
            } else {
                $ = Dom7;
            }
            if (!$) return;
        }

        // Export it to Slip instance
        this.$ = $;

        /*=========================
         Preparation - Define Container, Wrapper and Pagination
         ===========================*/
        this.container = $(container);
        if (this.container.length === 0) return;
        if (this.container.length > 1) {
            this.container.each(function () {
                new Slip(this, params);
            });
            return;
        }

        // 保存 container HTML元素和数据
        this.container[0].slip = this;
        this.container.data('slip', this);

        this.classNames.push('slip-container-' + this.params.direction);

        this.wrapper = this.container.children('.' + this.params.wrapperClass);

        // 分屏器
        if(this.params.pagination){
            this.paginationContainer = $(this.params.pagination);
            if(this.paginationClickable){
                this.paginationContainer.addClass('slip-pagination-clickable');
            }
        }

        // 判断是否是安卓设备
        if(this.device.android){
            this.classNames.push('slip-container-android');
        }

        // 添加样式
        this.container.addClass(this.classNames.join(' '));

        this.init();

        return this;
    };

    /*==================================================
     Prototype
     ====================================================*/
    Slip.prototype = {
        init: function(){

        },

        // 是否水平滑动
        isH: function(){
            return this.params.direction === 'horizontal';
        },

        // 上下页的锁和解锁
        lockSwipeToPrev: function () {
            this.params.allowSlipToPrev = false;
        },
        lockSlipToNext: function(){
            this.params.allowSlipToNext = false;
        },
        lockSlip: function(){
            this.params.allowSlipToPrev = this.params.allowSlipToNext = false;
        },
        unlockSwipeToPrev: function () {
            this.params.allowSwipeToPrev = true;
        },
        unlockSwipeToNext: function () {
            this.params.allowSwipeToNext = true;
        },
        unlockSwipes: function () {
            this.params.allowSwipeToPrev = this.params.allowSwipeToNext = true;
        },




        device: (function(){
            var ua = navigator.userAgent;
            var android = ua.match(/(Android);?[\s\/]+([\d.]+)?/);
            var ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
            var ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/);
            var iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/);
            return{
                ios: ipad || iphone || ipod,
                android: android
            }
        })()


    };


    /*===========================
     Dom7 Library
     ===========================*/
    var Dom7 = (function () {
        var Dom7 = function (arr) {
            var _this = this, i = 0;
            // Create array-like object
            for (i = 0; i < arr.length; i++) {
                _this[i] = arr[i];
            }
            _this.length = arr.length;
            // Return collection with methods
            return this;
        };
        var $ = function (selector, context) {
            var arr = [], i = 0;
            if (selector && !context) {
                if (selector instanceof Dom7) {
                    return selector;
                }
            }
            if (selector) {
                // String
                if (typeof selector === 'string') {
                    var els, tempParent, html = selector.trim();
                    if (html.indexOf('<') >= 0 && html.indexOf('>') >= 0) {
                        var toCreate = 'div';
                        if (html.indexOf('<li') === 0) toCreate = 'ul';
                        if (html.indexOf('<tr') === 0) toCreate = 'tbody';
                        if (html.indexOf('<td') === 0 || html.indexOf('<th') === 0) toCreate = 'tr';
                        if (html.indexOf('<tbody') === 0) toCreate = 'table';
                        if (html.indexOf('<option') === 0) toCreate = 'select';
                        tempParent = document.createElement(toCreate);
                        tempParent.innerHTML = selector;
                        for (i = 0; i < tempParent.childNodes.length; i++) {
                            arr.push(tempParent.childNodes[i]);
                        }
                    }
                    else {
                        if (!context && selector[0] === '#' && !selector.match(/[ .<>:~]/)) {
                            // Pure ID selector
                            els = [document.getElementById(selector.split('#')[1])];
                        }
                        else {
                            // Other selectors
                            els = (context || document).querySelectorAll(selector);
                        }
                        for (i = 0; i < els.length; i++) {
                            if (els[i]) arr.push(els[i]);
                        }
                    }
                }
                // Node/element
                else if (selector.nodeType || selector === window || selector === document) {
                    arr.push(selector);
                }
                //Array of elements or instance of Dom
                else if (selector.length > 0 && selector[0].nodeType) {
                    for (i = 0; i < selector.length; i++) {
                        arr.push(selector[i]);
                    }
                }
            }
            return new Dom7(arr);
        };
        Dom7.prototype = {
            // Classes and attriutes
            addClass: function (className) {
                if (typeof className === 'undefined') {
                    return this;
                }
                var classes = className.split(' ');
                for (var i = 0; i < classes.length; i++) {
                    for (var j = 0; j < this.length; j++) {
                        this[j].classList.add(classes[i]);
                    }
                }
                return this;
            },
            removeClass: function (className) {
                var classes = className.split(' ');
                for (var i = 0; i < classes.length; i++) {
                    for (var j = 0; j < this.length; j++) {
                        this[j].classList.remove(classes[i]);
                    }
                }
                return this;
            },
            hasClass: function (className) {
                if (!this[0]) return false;
                else return this[0].classList.contains(className);
            },
            toggleClass: function (className) {
                var classes = className.split(' ');
                for (var i = 0; i < classes.length; i++) {
                    for (var j = 0; j < this.length; j++) {
                        this[j].classList.toggle(classes[i]);
                    }
                }
                return this;
            },
            attr: function (attrs, value) {
                if (arguments.length === 1 && typeof attrs === 'string') {
                    // Get attr
                    if (this[0]) return this[0].getAttribute(attrs);
                    else return undefined;
                }
                else {
                    // Set attrs
                    for (var i = 0; i < this.length; i++) {
                        if (arguments.length === 2) {
                            // String
                            this[i].setAttribute(attrs, value);
                        }
                        else {
                            // Object
                            for (var attrName in attrs) {
                                this[i][attrName] = attrs[attrName];
                                this[i].setAttribute(attrName, attrs[attrName]);
                            }
                        }
                    }
                    return this;
                }
            },
            removeAttr: function (attr) {
                for (var i = 0; i < this.length; i++) {
                    this[i].removeAttribute(attr);
                }
                return this;
            },
            data: function (key, value) {
                if (typeof value === 'undefined') {
                    // Get value
                    if (this[0]) {
                        var dataKey = this[0].getAttribute('data-' + key);
                        if (dataKey) return dataKey;
                        else if (this[0].dom7ElementDataStorage && (key in this[0].dom7ElementDataStorage)) return this[0].dom7ElementDataStorage[key];
                        else return undefined;
                    }
                    else return undefined;
                }
                else {
                    // Set value
                    for (var i = 0; i < this.length; i++) {
                        var el = this[i];
                        if (!el.dom7ElementDataStorage) el.dom7ElementDataStorage = {};
                        el.dom7ElementDataStorage[key] = value;
                    }
                    return this;
                }
            },
            // Transforms
            transform : function (transform) {
                for (var i = 0; i < this.length; i++) {
                    var elStyle = this[i].style;
                    elStyle.webkitTransform = elStyle.MsTransform = elStyle.msTransform = elStyle.MozTransform = elStyle.OTransform = elStyle.transform = transform;
                }
                return this;
            },
            transition: function (duration) {
                if (typeof duration !== 'string') {
                    duration = duration + 'ms';
                }
                for (var i = 0; i < this.length; i++) {
                    var elStyle = this[i].style;
                    elStyle.webkitTransitionDuration = elStyle.MsTransitionDuration = elStyle.msTransitionDuration = elStyle.MozTransitionDuration = elStyle.OTransitionDuration = elStyle.transitionDuration = duration;
                }
                return this;
            },
            //Events
            on: function (eventName, targetSelector, listener, capture) {
                function handleLiveEvent(e) {
                    var target = e.target;
                    if ($(target).is(targetSelector)) listener.call(target, e);
                    else {
                        var parents = $(target).parents();
                        for (var k = 0; k < parents.length; k++) {
                            if ($(parents[k]).is(targetSelector)) listener.call(parents[k], e);
                        }
                    }
                }
                var events = eventName.split(' ');
                var i, j;
                for (i = 0; i < this.length; i++) {
                    if (typeof targetSelector === 'function' || targetSelector === false) {
                        // Usual events
                        if (typeof targetSelector === 'function') {
                            listener = arguments[1];
                            capture = arguments[2] || false;
                        }
                        for (j = 0; j < events.length; j++) {
                            this[i].addEventListener(events[j], listener, capture);
                        }
                    }
                    else {
                        //Live events
                        for (j = 0; j < events.length; j++) {
                            if (!this[i].dom7LiveListeners) this[i].dom7LiveListeners = [];
                            this[i].dom7LiveListeners.push({listener: listener, liveListener: handleLiveEvent});
                            this[i].addEventListener(events[j], handleLiveEvent, capture);
                        }
                    }
                }

                return this;
            },
            off: function (eventName, targetSelector, listener, capture) {
                var events = eventName.split(' ');
                for (var i = 0; i < events.length; i++) {
                    for (var j = 0; j < this.length; j++) {
                        if (typeof targetSelector === 'function' || targetSelector === false) {
                            // Usual events
                            if (typeof targetSelector === 'function') {
                                listener = arguments[1];
                                capture = arguments[2] || false;
                            }
                            this[j].removeEventListener(events[i], listener, capture);
                        }
                        else {
                            // Live event
                            if (this[j].dom7LiveListeners) {
                                for (var k = 0; k < this[j].dom7LiveListeners.length; k++) {
                                    if (this[j].dom7LiveListeners[k].listener === listener) {
                                        this[j].removeEventListener(events[i], this[j].dom7LiveListeners[k].liveListener, capture);
                                    }
                                }
                            }
                        }
                    }
                }
                return this;
            },
            once: function (eventName, targetSelector, listener, capture) {
                var dom = this;
                if (typeof targetSelector === 'function') {
                    targetSelector = false;
                    listener = arguments[1];
                    capture = arguments[2];
                }
                function proxy(e) {
                    listener(e);
                    dom.off(eventName, targetSelector, proxy, capture);
                }
                dom.on(eventName, targetSelector, proxy, capture);
            },
            trigger: function (eventName, eventData) {
                for (var i = 0; i < this.length; i++) {
                    var evt;
                    try {
                        evt = new window.CustomEvent(eventName, {detail: eventData, bubbles: true, cancelable: true});
                    }
                    catch (e) {
                        evt = document.createEvent('Event');
                        evt.initEvent(eventName, true, true);
                        evt.detail = eventData;
                    }
                    this[i].dispatchEvent(evt);
                }
                return this;
            },
            transitionEnd: function (callback) {
                var events = ['webkitTransitionEnd', 'transitionend', 'oTransitionEnd', 'MSTransitionEnd', 'msTransitionEnd'],
                    i, j, dom = this;
                function fireCallBack(e) {
                    /*jshint validthis:true */
                    if (e.target !== this) return;
                    callback.call(this, e);
                    for (i = 0; i < events.length; i++) {
                        dom.off(events[i], fireCallBack);
                    }
                }
                if (callback) {
                    for (i = 0; i < events.length; i++) {
                        dom.on(events[i], fireCallBack);
                    }
                }
                return this;
            },
            // Sizing/Styles
            width: function () {
                if (this[0] === window) {
                    return window.innerWidth;
                }
                else {
                    if (this.length > 0) {
                        return parseFloat(this.css('width'));
                    }
                    else {
                        return null;
                    }
                }
            },
            outerWidth: function (includeMargins) {
                if (this.length > 0) {
                    if (includeMargins)
                        return this[0].offsetWidth + parseFloat(this.css('margin-right')) + parseFloat(this.css('margin-left'));
                    else
                        return this[0].offsetWidth;
                }
                else return null;
            },
            height: function () {
                if (this[0] === window) {
                    return window.innerHeight;
                }
                else {
                    if (this.length > 0) {
                        return parseFloat(this.css('height'));
                    }
                    else {
                        return null;
                    }
                }
            },
            outerHeight: function (includeMargins) {
                if (this.length > 0) {
                    if (includeMargins)
                        return this[0].offsetHeight + parseFloat(this.css('margin-top')) + parseFloat(this.css('margin-bottom'));
                    else
                        return this[0].offsetHeight;
                }
                else return null;
            },
            offset: function () {
                if (this.length > 0) {
                    var el = this[0];
                    var box = el.getBoundingClientRect();
                    var body = document.body;
                    var clientTop  = el.clientTop  || body.clientTop  || 0;
                    var clientLeft = el.clientLeft || body.clientLeft || 0;
                    var scrollTop  = window.pageYOffset || el.scrollTop;
                    var scrollLeft = window.pageXOffset || el.scrollLeft;
                    return {
                        top: box.top  + scrollTop  - clientTop,
                        left: box.left + scrollLeft - clientLeft
                    };
                }
                else {
                    return null;
                }
            },
            css: function (props, value) {
                var i;
                if (arguments.length === 1) {
                    if (typeof props === 'string') {
                        if (this[0]) return window.getComputedStyle(this[0], null).getPropertyValue(props);
                    }
                    else {
                        for (i = 0; i < this.length; i++) {
                            for (var prop in props) {
                                this[i].style[prop] = props[prop];
                            }
                        }
                        return this;
                    }
                }
                if (arguments.length === 2 && typeof props === 'string') {
                    for (i = 0; i < this.length; i++) {
                        this[i].style[props] = value;
                    }
                    return this;
                }
                return this;
            },

            //Dom manipulation
            each: function (callback) {
                for (var i = 0; i < this.length; i++) {
                    callback.call(this[i], i, this[i]);
                }
                return this;
            },
            html: function (html) {
                if (typeof html === 'undefined') {
                    return this[0] ? this[0].innerHTML : undefined;
                }
                else {
                    for (var i = 0; i < this.length; i++) {
                        this[i].innerHTML = html;
                    }
                    return this;
                }
            },
            is: function (selector) {
                if (!this[0]) return false;
                var compareWith, i;
                if (typeof selector === 'string') {
                    var el = this[0];
                    if (el === document) return selector === document;
                    if (el === window) return selector === window;

                    if (el.matches) return el.matches(selector);
                    else if (el.webkitMatchesSelector) return el.webkitMatchesSelector(selector);
                    else if (el.mozMatchesSelector) return el.mozMatchesSelector(selector);
                    else if (el.msMatchesSelector) return el.msMatchesSelector(selector);
                    else {
                        compareWith = $(selector);
                        for (i = 0; i < compareWith.length; i++) {
                            if (compareWith[i] === this[0]) return true;
                        }
                        return false;
                    }
                }
                else if (selector === document) return this[0] === document;
                else if (selector === window) return this[0] === window;
                else {
                    if (selector.nodeType || selector instanceof Dom7) {
                        compareWith = selector.nodeType ? [selector] : selector;
                        for (i = 0; i < compareWith.length; i++) {
                            if (compareWith[i] === this[0]) return true;
                        }
                        return false;
                    }
                    return false;
                }

            },
            index: function () {
                if (this[0]) {
                    var child = this[0];
                    var i = 0;
                    while ((child = child.previousSibling) !== null) {
                        if (child.nodeType === 1) i++;
                    }
                    return i;
                }
                else return undefined;
            },
            eq: function (index) {
                if (typeof index === 'undefined') return this;
                var length = this.length;
                var returnIndex;
                if (index > length - 1) {
                    return new Dom7([]);
                }
                if (index < 0) {
                    returnIndex = length + index;
                    if (returnIndex < 0) return new Dom7([]);
                    else return new Dom7([this[returnIndex]]);
                }
                return new Dom7([this[index]]);
            },
            append: function (newChild) {
                var i, j;
                for (i = 0; i < this.length; i++) {
                    if (typeof newChild === 'string') {
                        var tempDiv = document.createElement('div');
                        tempDiv.innerHTML = newChild;
                        while (tempDiv.firstChild) {
                            this[i].appendChild(tempDiv.firstChild);
                        }
                    }
                    else if (newChild instanceof Dom7) {
                        for (j = 0; j < newChild.length; j++) {
                            this[i].appendChild(newChild[j]);
                        }
                    }
                    else {
                        this[i].appendChild(newChild);
                    }
                }
                return this;
            },
            prepend: function (newChild) {
                var i, j;
                for (i = 0; i < this.length; i++) {
                    if (typeof newChild === 'string') {
                        var tempDiv = document.createElement('div');
                        tempDiv.innerHTML = newChild;
                        for (j = tempDiv.childNodes.length - 1; j >= 0; j--) {
                            this[i].insertBefore(tempDiv.childNodes[j], this[i].childNodes[0]);
                        }
                        // this[i].insertAdjacentHTML('afterbegin', newChild);
                    }
                    else if (newChild instanceof Dom7) {
                        for (j = 0; j < newChild.length; j++) {
                            this[i].insertBefore(newChild[j], this[i].childNodes[0]);
                        }
                    }
                    else {
                        this[i].insertBefore(newChild, this[i].childNodes[0]);
                    }
                }
                return this;
            },
            insertBefore: function (selector) {
                var before = $(selector);
                for (var i = 0; i < this.length; i++) {
                    if (before.length === 1) {
                        before[0].parentNode.insertBefore(this[i], before[0]);
                    }
                    else if (before.length > 1) {
                        for (var j = 0; j < before.length; j++) {
                            before[j].parentNode.insertBefore(this[i].cloneNode(true), before[j]);
                        }
                    }
                }
            },
            insertAfter: function (selector) {
                var after = $(selector);
                for (var i = 0; i < this.length; i++) {
                    if (after.length === 1) {
                        after[0].parentNode.insertBefore(this[i], after[0].nextSibling);
                    }
                    else if (after.length > 1) {
                        for (var j = 0; j < after.length; j++) {
                            after[j].parentNode.insertBefore(this[i].cloneNode(true), after[j].nextSibling);
                        }
                    }
                }
            },
            next: function (selector) {
                if (this.length > 0) {
                    if (selector) {
                        if (this[0].nextElementSibling && $(this[0].nextElementSibling).is(selector)) return new Dom7([this[0].nextElementSibling]);
                        else return new Dom7([]);
                    }
                    else {
                        if (this[0].nextElementSibling) return new Dom7([this[0].nextElementSibling]);
                        else return new Dom7([]);
                    }
                }
                else return new Dom7([]);
            },
            nextAll: function (selector) {
                var nextEls = [];
                var el = this[0];
                if (!el) return new Dom7([]);
                while (el.nextElementSibling) {
                    var next = el.nextElementSibling;
                    if (selector) {
                        if($(next).is(selector)) nextEls.push(next);
                    }
                    else nextEls.push(next);
                    el = next;
                }
                return new Dom7(nextEls);
            },
            prev: function (selector) {
                if (this.length > 0) {
                    if (selector) {
                        if (this[0].previousElementSibling && $(this[0].previousElementSibling).is(selector)) return new Dom7([this[0].previousElementSibling]);
                        else return new Dom7([]);
                    }
                    else {
                        if (this[0].previousElementSibling) return new Dom7([this[0].previousElementSibling]);
                        else return new Dom7([]);
                    }
                }
                else return new Dom7([]);
            },
            prevAll: function (selector) {
                var prevEls = [];
                var el = this[0];
                if (!el) return new Dom7([]);
                while (el.previousElementSibling) {
                    var prev = el.previousElementSibling;
                    if (selector) {
                        if($(prev).is(selector)) prevEls.push(prev);
                    }
                    else prevEls.push(prev);
                    el = prev;
                }
                return new Dom7(prevEls);
            },
            parent: function (selector) {
                var parents = [];
                for (var i = 0; i < this.length; i++) {
                    if (selector) {
                        if ($(this[i].parentNode).is(selector)) parents.push(this[i].parentNode);
                    }
                    else {
                        parents.push(this[i].parentNode);
                    }
                }
                return $($.unique(parents));
            },
            parents: function (selector) {
                var parents = [];
                for (var i = 0; i < this.length; i++) {
                    var parent = this[i].parentNode;
                    while (parent) {
                        if (selector) {
                            if ($(parent).is(selector)) parents.push(parent);
                        }
                        else {
                            parents.push(parent);
                        }
                        parent = parent.parentNode;
                    }
                }
                return $($.unique(parents));
            },
            find : function (selector) {
                var foundElements = [];
                for (var i = 0; i < this.length; i++) {
                    var found = this[i].querySelectorAll(selector);
                    for (var j = 0; j < found.length; j++) {
                        foundElements.push(found[j]);
                    }
                }
                return new Dom7(foundElements);
            },
            children: function (selector) {
                var children = [];
                for (var i = 0; i < this.length; i++) {
                    var childNodes = this[i].childNodes;

                    for (var j = 0; j < childNodes.length; j++) {
                        if (!selector) {
                            if (childNodes[j].nodeType === 1) children.push(childNodes[j]);
                        }
                        else {
                            if (childNodes[j].nodeType === 1 && $(childNodes[j]).is(selector)) children.push(childNodes[j]);
                        }
                    }
                }
                return new Dom7($.unique(children));
            },
            remove: function () {
                for (var i = 0; i < this.length; i++) {
                    if (this[i].parentNode) this[i].parentNode.removeChild(this[i]);
                }
                return this;
            },
            add: function () {
                var dom = this;
                var i, j;
                for (i = 0; i < arguments.length; i++) {
                    var toAdd = $(arguments[i]);
                    for (j = 0; j < toAdd.length; j++) {
                        dom[dom.length] = toAdd[j];
                        dom.length++;
                    }
                }
                return dom;
            }
        };
        $.fn = Dom7.prototype;
        $.unique = function (arr) {
            var unique = [];
            for (var i = 0; i < arr.length; i++) {
                if (unique.indexOf(arr[i]) === -1) unique.push(arr[i]);
            }
            return unique;
        };

        return $;
    })();

    /*===========================
     Slip window or AMD Export
     ===========================*/
    if(typeof define === 'function' && define.amd){
        return define('lib/slip.js', function(require, exports, module){
            return Slip;
        });
    }else{
        return window['Slip'] = Slip;
    }


})();

