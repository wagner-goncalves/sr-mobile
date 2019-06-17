(function () {
    'use strict';

    angular
        .module('SrCidadao')
        .factory('SocialSharingService', SocialSharingService);    
        
    function SocialSharingService($http, ConfigurationService, configuracao, Notification) {  
    
        var service = {};

        service.share = share;
		service.registraShareFicha = registraShareFicha;
        service.registraShareApp = registraShareApp;
        service.registraShareLembrete = registraShareLembrete;

        return service;      
		
        function registraShareFicha(politico, instituicao, callback){
            $http.put(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/share/registra-ficha', {
                politico : politico,
                instituicao : instituicao
            })
            .success(function(response) {
                if (response) {
                    callback(response.success, response.id, response.baseMensagemShare);
                }
            })
            .error(function() { //Erro
                callback(false);
            });
        }  
        
        function registraShareLembrete(lembrete, callback){
            $http.put(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/share/registra-lembrete', {
                lembrete : lembrete
            })
            .success(function(response) {
                if (response) {
                    callback(response.success, response.id, response.mensagemShare, response.linkShare);
                }
            })
            .error(function() { //Erro
                callback(false);
            });
        }          
        
        function registraShareApp(pagina, callback){
            $http.put(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/share/registra-app', {
                pagina : pagina
            }).success(function(response) {
                if(response) {
                    callback(response.success, response.id, response.mensagem, response.link);
                }else{
                    callback(false);
                }
            }).error(function(err) { //Erro
                callback(false);
            });
        }           
		
        function share(plataforma, dadosCompartilhar, callback) {
            if(plataforma == "whatsapp"){
                window.plugins.socialsharing.shareViaWhatsApp(dadosCompartilhar.mensagem, 
                    null, //dadosCompartilhar.folderpath + dadosCompartilhar.filename, 
                    dadosCompartilhar.link,
                    function(result){
                        //console.log(JSON.stringify(result));
                        callback(true, plataforma);
                    },
                    function(err){
                        callback(false, plataforma);
                        Notification.error({message: "WHATSAPP: Não conseguimos compartilhar. O aplicativo está instalado?", delay: 5000}); 
                    }
                );
            }else if(plataforma == "facebook"){
                window.plugins.socialsharing.shareViaFacebook(null, 
                    null, 
                    dadosCompartilhar.link,
                    function(result){
                        callback(true, plataforma);
                        //console.log(JSON.stringify(result));
                    },
                    function(err){
                        callback(false, plataforma);
                        Notification.error({message: "FACEBOOK: Não conseguimos compartilhar. O aplicativo está instalado?", delay: 5000}); 
                    }
                );
            }else if(plataforma == "twitter"){
                window.plugins.socialsharing.shareViaTwitter(dadosCompartilhar.mensagem, 
                    null, //dadosCompartilhar.folderpath + dadosCompartilhar.filename, 
                    dadosCompartilhar.link,
                    function(result){
                        callback(true, plataforma);
                        //console.log(JSON.stringify(result));
                    },
                    function(err){
                        callback(false, plataforma);
                        Notification.error({message: "TWITTER: Não conseguimos compartilhar. O aplicativo está instalado?", delay: 5000}); 
                    }
                );
            }else if(plataforma == ""){
                var options = {
                    message : dadosCompartilhar.mensagem, 
                    files : [], //[dadosCompartilhar.folderpath + dadosCompartilhar.filename],
                    url : dadosCompartilhar.link,
                    chooserTitle : "Compartilhar com..."
                };
                window.plugins.socialsharing.shareWithOptions(options,
                    function(result){
                        callback(true, plataforma);
                        //console.log(JSON.stringify(result));
                    },
                    function(err){
                        callback(false, plataforma);
                        Notification.error({message: "Não conseguimos compartilhar. Verifique as permissões do Sr.Cidadão.", delay: 5000}); 
                    }
                );
            }
        }
    }
})();