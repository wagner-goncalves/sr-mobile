(function () {
    'use strict';
    
    angular
        .module('SrCidadao') 
        
        .directive('offline', function(){
            return {
                restrict : 'E',
                templateUrl : 'templates/error/offline.html'
            };
        });                       
    
})();