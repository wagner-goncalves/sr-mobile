(function () {
    'use strict';

    angular
        .module('SrCidadao')
        .factory('SearchService', SearchService);    
        
    function SearchService($q, $http, configuracao, ConfigurationService) {  
    
        var service = {};

        service.Politicos = Politicos;
        service.Partidos = Partidos;
        service.LogSearch = LogSearch;
        service.Info = Info;

        return service;    

    
        function Politicos(page, key, siglaPartido, callback){
            $http.get(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/search/politicos?page=' + page + "&key=" + key + "&sigla=" + siglaPartido)
                .success(function(response) {
                    if (response) {
                        callback(response);
                    } else {
                        callback(false);
                    }
                })
                .error(function() { //Erro
                    callback(false);
                });
        }
        
        function Info(callback){
            $http.get(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/search/info')
                .success(function(response) {
                    if (response) {
                        callback(response);
                    } else {
                        callback(false);
                    }
                })
                .error(function() { //Erro
                    callback(false);
                });
        }        
        
        function Partidos(page, key, callback){        
            $http.get(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/search/partidos?page=' + page + "&key=" + key)
                .success(function (response) {
                    if (response) {
                        callback(response);
                    } else {
                        callback(false);
                    }
                })
                .error(function() {
                    callback(false);
                });
        }  
        
        function LogSearch(busca, callback){        
            $http.post(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/search/log-busca-politico', busca)
                .success(function (response) {
                    if (response) {
                        callback(response);
                    } else {
                        callback(false);
                    }
                })
                .error(function() {
                    callback(false);
                });
        }                
    }
})();