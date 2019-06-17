(function () {
    'use strict';
    
    angular
        .module('SrCidadao')
        .directive('uniqueEmail', function(EmailAvailableService){
            return {
                //restrict: 'A',
                require: 'ngModel',
                link: function($scope, $elem, $attr, ngModel){
                    ngModel.$asyncValidators.unique = EmailAvailableService;
                } 
            };
        }); 
    
})();