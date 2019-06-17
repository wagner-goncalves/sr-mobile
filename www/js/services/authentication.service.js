(function () {
    'use strict';

    angular
        .module('SrCidadao')
        .factory('AuthenticationService', AuthenticationService)
        .factory('EmailAvailableService', EmailAvailableService);    
        
    function EmailAvailableService($q, $http, configuracao, ConfigurationService) {  
        return function(email){
            var config = {
                params: { email: email}
            };            
            var deferred = $q.defer();
            $http.get(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/usuario/email-disponivel', config)
            .then(function(response){
                if(response.data.email){ //Encontrou email
                    deferred.reject();
                }else{
                    deferred.resolve();
                }
            });
            return deferred.promise;
        }
    }

    function AuthenticationService($http, LocalStorageService, NotificationService, configuracao, ConfigurationService, $localStorage) {
        var service = {};

        service.Login = Login;
        service.LoginFb = LoginFb;
        service.Logout = Logout;

        return service;

        function Login(emailInformado, passwordInformado, callback) {

            var config = {
                params: { email: emailInformado, password: passwordInformado }
            };

            $http.get(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/usuario/login', config).success(
                function (response) {
                    if (response.token) {
                        LocalStorageService.LimpaSessao();
                        LocalStorageService.SetCurrentUser({nome: response.usuario.nome, token: response.token});
                        $http.defaults.headers.common.Authorization = 'Bearer ' + response.token;
                        callback(true);
                    } else {
                        callback(false);
                    }
                }).error(function() {
                    callback(false);
                });
        }
        
        function LoginFb(emailInformado, token, callback) {

            var config = {
                params: { email: emailInformado, token: token }
            };

            $http.get(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/usuario/login-fb', config)
                .success(function (response) {
                    if (response.token) {
                        LocalStorageService.LimpaSessao();
                        LocalStorageService.SetCurrentUser({nome: response.usuario.nome, token: response.token});
                        $http.defaults.headers.common.Authorization = 'Bearer ' + response.token;
                        callback(true);
                    } else {
                        callback(false);
                    }
                }).error(function() {
                    //console.log("ERRO");
                    callback(false);
                });
        }        

        function Logout() {
            // remove user from local storage and clear http auth header
            delete LocalStorageService.DeleteCurrentUser();
            delete $http.defaults.headers.common.Authorization;
        }
    }
})();