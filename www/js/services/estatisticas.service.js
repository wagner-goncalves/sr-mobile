(function () {
    'use strict';

    angular
        .module('SrCidadao')
        .factory('EstatisticasService', EstatisticasService);    
        
    function EstatisticasService($q, $http, configuracao, ConfigurationService) {  
    
        var service = {};

        service.gostei = gostei;

        return service;    

        function gostei(params, callback){
            //console.log(params);
            $http.get(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/report/gostei' + 
                      "?tipo="+params.tipo+"&uf="+params.uf+"&partido="+params.partido+"&dataInicio="+params.dataInicio+"&dataFim="+params.dataFim)
                .success(function(response) {
                    callback(true, response);
                })
                .error(function() {
                    callback(false);
                });
        }
                    
    }
})();