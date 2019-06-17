(function () {
    'use strict';

    angular
        .module('SrCidadao')
        .factory('InfoService', InfoService);    
        
    function InfoService($q, $http, configuracao, ConfigurationService) {  
    
        var service = {};

        service.notificacaoStats = notificacaoStats;
        service.ideologia = ideologia;
        service.getParametro = getParametro;
        service.usuario = usuario;
		service.checkVersion = checkVersion;

        return service;  

        function checkVersion(v, callback){        
            $http.get(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/app/check-version?v=' + v)
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
        
        function notificacaoStats(callback){        
            $http.get(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/info/notificacao-stats')
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
        
        function usuario(callback){
            $http.get(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/info/usuario')
                .success(function(response) {
                    if (response && response.success) {
                        callback(true, response);
                    } else {
                        callback(false);
                    }
                })
                .error(function() { //Erro
                    callback(false);
                });
        }  
        
        function ideologia(id, callback){
            $http.get(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/info/ideologia/' + id)
                .success(function(response) {
                    if (response && response.success) {
                        callback(true, response);
                    } else {
                        callback(false);
                    }
                })
                .error(function() { //Erro
                    callback(false);
                });
        }  
        
        function getParametro(chave, callback){
            $http.get(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/info/parametro/' + chave)
                .success(function(response) {
                    if (response && response.success) {
                        callback(true, response);
                    } else {
                        callback(false);
                    }
                })
                .error(function() { //Erro
                    callback(false);
                });
        }  
    }
})();