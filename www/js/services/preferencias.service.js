(function () {
    'use strict';

    angular
        .module('SrCidadao')
        .factory('PreferenciasService', PreferenciasService);    
        
    function PreferenciasService($q, $http, configuracao, ConfigurationService) {  
    
        var service = {};

        service.instituicoes = instituicoes;
        service.instituicoesUsuario = instituicoesUsuario;
        service.partidos = partidos;
        service.estados = estados;
        service.interesses = interesses;
        service.salvar = salvar;
        service.politicos = politicos;

        return service;    
        
        function instituicoes(callback){        
            $http.get(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/preferencias/instituicoes')
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
        
        function instituicoesUsuario(callback){        
            $http.get(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/preferencias/instituicoes/usuario')
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
        
        function partidos(callback){        
            $http.get(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/preferencias/partidos')
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
        
        function estados(callback){        
            $http.get(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/preferencias/estados')
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
        
        function interesses(callback){        
            $http.get(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/preferencias/interesses')
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
        
        function politicos(ufs, callback){ 
            $http.get(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/preferencias/politicos?uf=' + ufs.join(","))
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
        
        function salvar(pref, id, flgAtivo, callback){        
            $http.put(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/preferencias/salvar', {pref : pref, id : id, flgAtivo : flgAtivo})
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