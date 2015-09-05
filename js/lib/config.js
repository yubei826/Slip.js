seajs.config({
    base: './js',
    //plugins: ['shim'],
    alias: {
        'zepto': 'lib/zepto.min',
        'slip': 'lib/slip'
    },
    map: [
        //[/^(.*\.(?:css|js|tpl))(.*)$/i, '$1?v=1.1.35']
    ],
    preload: [
        //'lib/seajs-text'
    ],
    charset: 'utf-8'
});