(function () {
    'use strict';

    angular
        .module('SrCidadao')
        .run(setupFakeBackend);

    // setup fake backend for backend-less development
    function setupFakeBackend($httpBackend) {
        /*
        var testUser = { email: 'test', password: 'test', firstName: 'Test', lastName: 'User' };

        // fake authenticate api end point
        $httpBackend.whenPOST('/usuario/login').respond(function (method, url, data) {
            
            // get parameters from post request
            var params = angular.fromJson(data);
            console.log(params);
            // check user credentials and return fake jwt token if valid
            if (params.email === testUser.email && params.password === testUser.password) {
                return [200, { token: 'fake-jwt-token' }, {}];
            } else {
                return [200, {}, {}];
            }
        });

        // pass through any urls not handled above so static files are served correctly
        
        */
        $httpBackend.whenPUT(/^\w+.*/).passThrough();
        $httpBackend.whenGET(/^\w+.*/).passThrough();
        $httpBackend.whenPOST(/^\w+.*/).passThrough();
        $httpBackend.whenDELETE(/^\w+.*/).passThrough();
        $httpBackend.whenPATCH(/^\w+.*/).passThrough();
    }
})();