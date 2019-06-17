(function () {
    'use strict';

    angular
        .module('SrCidadao')
        .factory('QuizService', QuizService);    
        
    function QuizService($q, $http, configuracao, ConfigurationService) {  
    
        var service = {};

        service.getQuiz = getQuiz;
        service.getQuizzes = getQuizzes;
        service.getQuizSlim = getQuizSlim;
        service.responder = responder;
        service.salvaResultado = salvaResultado;
        
        service.politicoFavoritoUsuario = politicoFavoritoUsuario;
        service.ideologiaPartidariaUsuario = ideologiaPartidariaUsuario;

        return service;    
        
        function getQuizzes(callback){
            $http.get(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/quizzes')
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

        function getQuiz(id, callback){
            $http.get(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/quiz/detalhe/' + id)
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
        
        function getQuizSlim(id, callback){
            $http.get(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/quiz/' + id)
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
        
        function responder(pergunta, resposta, opcaoSelecionada, callback){
            $http.post(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/quiz/responder', {
                pergunta : pergunta,
                resposta : resposta, 
                opcaoSelecionada : opcaoSelecionada
            })
            .success(function(response) {
                if (response) {
                    callback(true, response);
                } else {
                    callback(false);
                }
            })
            .error(function() { //Erro
                callback(false);
            });
        }  
        
        function politicoFavoritoUsuario(parametros, callback){
            $http.get(ConfigurationService.getMlEndPoint() + ConfigurationService.getApiVersion() + '/processa/politico-favorito-usuario?id=' + parametros.id + '&meuspoliticos=' + (parametros.flgMeusPoliticos ? 1 : 0) + '&quiz=' + parametros.quiz + '&instituicao=' + (parametros.instituicao ? parametros.instituicao : 0))
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
        
        function ideologiaPartidariaUsuario(parametros, callback){
            $http.get(ConfigurationService.getMlEndPoint() + ConfigurationService.getApiVersion() + '/processa/ideologia-partidaria-usuario?id=' + parametros.id + '&meuspoliticos=' + (parametros.flgMeusPoliticos ? 1 : 0) + '&quiz=' + parametros.quiz + '&instituicao=' + (parametros.instituicao ? parametros.instituicao : 0))
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
        
        function salvaResultado(resultado, callback){
            $http.post(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/quiz/resultado', resultado)
            .success(function(response) {
                if (response && response.success) {
                    callback(true);
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