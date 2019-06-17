(function () {
    'use strict';

    angular
        .module('SrCidadao')
        .factory('UsuarioService', UsuarioService);    
        
    function UsuarioService($q, $http, configuracao, ConfigurationService) {  
    
        var service = {};

        service.Cadastro = Cadastro;
        service.ExcluirAmizade = ExcluirAmizade;
        service.AdicionarAmizade = AdicionarAmizade;
        service.Profile = Profile;
        service.UpdateProfile = UpdateProfile;
        service.Preferencias = Preferencias;
        service.TermosUso = TermosUso;
        service.CadastroFb = CadastroFb;
        service.BoasVindas = BoasVindas;
        service.EsqueciSenha = EsqueciSenha;

        return service;    
        
        function EsqueciSenha(emailInformado, callback) {

            var params = {
                email : emailInformado
            };

            $http.post(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/usuario/esqueci-senha', params).success(
                function (response) {
                    if (response && response.success){
                        callback(true, response.message);
                    } else {
                        callback(false, response.message);
                    }
                }).error(function() {
                    callback(false, "Não conseguimos executar a operação solicitada.");
                });
        }         
        
        function ExcluirAmizade(id, callback){ 
            $http.delete(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/usuario/excluir-amizade?id=' + id)
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
        
        function Preferencias(callback){ 
            $http.get(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/usuario/preferencias')
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
        
        function Profile(callback){ 
            $http.get(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/usuario/profile')
                .success(function (response) {
                    if (response) {
                        if(response.arquivoImagem && response.arquivoImagem.length > 0){ 
                            //console.log(response);
                            
                            if(response.flgFacebook == '1') response.arquivoImagem = response.arquivoImagem;
                            else response.arquivoImagem = ConfigurationService.getApiEndPoint() + "upload/" + response.arquivoImagem + "?" + new Date().getTime();
                        }else{
                            response.arquivoImagem = false;
                        }
                        
                        response.flgRecebeEmail = response.flgRecebeEmail == '1';
                        response.flgRecebeNotificacao = response.flgRecebeNotificacao == '1';                        
                            
                        callback(response);
                    } else {
                        callback(false);
                    }
                })
                .error(function() {
                    callback(false);
                });
        }  
        
        function TermosUso(callback){ 
            $http.get(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/usuario/termos-de-uso')
                .success(function (response) {
                    if(response.termo) {                    
                        callback(true, response);
                    } else {
                        callback(false, response);
                    }
                })
                .error(function() {
                    callback(false, null);
                });
        } 
        
        function BoasVindas(callback){ 
            $http.get(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/notificacao/boas-vindas')
                .success(function (response) {
                    if(response.termo){
                        callback(true, response);
                    } else {
                        callback(false, response);
                    }
                })
                .error(function() {
                    callback(false, null);
                });
        }                  
        
        function UpdateProfile(usuario, callback){ 
            $http.patch(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/usuario/profile', usuario)
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
        
        function AdicionarAmizade(id, callback){ 
            $http.put(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/usuario/adicionar-amizade?id=' + id)
                .success(function (response) {
                    if (response) {
                        callback(true, response);
                    } else {
                        callback(false, response);
                    }
                })
                .error(function(response) {
                    callback(false, response);
                });
        }            
    
        function Cadastro(usuario, callback){        
            $http.post(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/usuario/cadastro', usuario)
                .success(function (response) {
                    if (response.oidUsuario) {
                        callback(true, response);
                    } else {
                        callback(false, response);
                    }
                })
                .error(function(response) {
                    callback(false, response);
                });
        }
        
        function CadastroFb(social, callback){        
            $http.post(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/usuario/cadastro-fb', social)
                .success(function (response) {
                    if (response.oidUsuario) {
                        callback(true, response);
                    } else {
                        callback(false, response);
                    }
                })
                .error(function(response) {
                    callback(false, response);
                });
        }        
    }
})();