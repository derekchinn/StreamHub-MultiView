require.config({
    baseUrl: '.',
    packages: [{
        name: 'streamhub-backbone',
        location: 'lib/streamhub-backbone'
    }],
    paths: {
        jquery: 'lib/jquery/jquery',
        underscore: 'lib/underscore/underscore',
        backbone: 'lib/backbone/backbone',
    },
    shim: {
        backbone: {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        underscore: {
            exports: '_'
        },
        jquery: {
        	exports: "$"
        }
    }
});
