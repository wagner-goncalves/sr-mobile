(function () {
    'use strict';

    angular
        .module('SrCidadao')
        .factory('FichaService', FichaService);    
        
    function FichaService($q, $http, configuracao, ConfigurationService) {  
    
        var service = {};

        service.logCitacao = logCitacao;
        service.logContasTcu = logContasTcu;

        return service;    
        
        function logCitacao(oidCitacao, callback){        
            $http.post(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/ficha/log-citacao', {"oidCitacao" : oidCitacao})
                .success(function (response) {
                    if (response.success) {
                        callback(true, response);
                    } else {
                        callback(false, response);
                    }
                })
                .error(function() {
                    callback(false);
                });
        }  
        
        function logContasTcu(oidContasTcu, callback){        
            $http.post(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/ficha/log-contas-tcu', {"oidContasTcu" : oidContasTcu})
                .success(function (response) {
                    if (response.success) {
                        callback(true, response);
                    } else {
                        callback(false, response);
                    }
                })
                .error(function() {
                    callback(false);
                });
        }          
    }
})();