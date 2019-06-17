(function () {
    'use strict';

    angular
        .module('SrCidadao')
        .factory('LembreteService', LembreteService);    
        
    function LembreteService($q, $http, configuracao, ConfigurationService) {  
    
        var service = {};

        service.listar = listar;
        service.ultimo = ultimo;
        service.cria = cria;
        service.votacao = votacao;
        service.getLembrete = getLembrete;
        service.curtirProposicao = curtirProposicao;

        return service;   
        
        function curtirProposicao(curtir, tipoNotificacao, oidProposicao, callback){
            $http.put(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/lembrete/curtir-proposicao/'+ oidProposicao, {
                curtir : curtir,
                tipoNotificacao : tipoNotificacao
            })
            .success(function(response) {
                if (response) {
                    callback(response.success, response.notificacoes);
                }
            })
            .error(function() { //Erro
                callback(false);
            });
        }         
        
        function getLembrete(oidLembrete, callback){ 

            $http.get(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/lembrete/' + oidLembrete)
                .success(function(response) {
                    if (response && response.lembrete) {
                        callback(response.success, response.lembrete);
                    } else {
                        callback(false);
                    }
                })
                .error(function() { //Erro
                    callback(false);
                });
        }     
        
        function cria(oidProposicao, callback){ 

            $http.post(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/lembrete/cria/' + oidProposicao)
                .success(function(response) {
                    if (response) {
                        callback(response.success, response.id);
                    } else {
                        callback(false);
                    }
                })
                .error(function() { //Erro
                    callback(false);
                });
        }             
        
        function listar(page, callback){
            $http.get(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/lembrete/listar?page=' + page)
                .success(function(response) {
                    if (response) {
                        callback(response.success, response.lembretes);
                    }
                })
                .error(function() { //Erro
                    callback(false);
                });
        }  
        
        function ultimo(callback){
            $http.get(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/lembrete/ultimo')
                .success(function(response) {
                    if (response) {
                        callback(response.success, response.lembrete);
                    }
                })
                .error(function() { //Erro
                    callback(false);
                });
        }  
        
        function votacao(idProposicao, callback){
            $http.get(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/lembrete/votacao/' + idProposicao)
                .success(function(response) {
                    if (response) {
                        callback(response.success, response.votacao);
                    }else{
                        callback(false);
                    }
                })
                .error(function() { //Erro
                    callback(false);
                });
        }          
    }
})();