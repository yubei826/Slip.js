/*
 * Slip.js 0.0.1
 * Author: beiyu
 * time: 20150908
 */

(function(WIN, DOC){
    // 定义变量
    var UNDEFINED = undefined, NULL = null, X = 'x', Y = 'y', XY = 'xy', LEFT = 'left', RIGHT = 'right', UP = 'up', DOWN = 'down';

    var Slip = (function(){
        function Slip(){

        }

        // 初始化
        Slip.prototype.init = function(){

        };

        return Slip;
    })();

    // 暴漏到window的对象，内部实例化Slip
    var entry = function(){
        var instance = new Slip();
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
