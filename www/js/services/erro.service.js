(function () {
    'use strict';

    angular
        .module('SrCidadao')
        .factory('ErroService', ErroService);    
        
    function ErroService($state, $stateParams, $ionicHistory, $http, ConfigurationService) {  
    
        var service = {};

        service.lentidao = lentidao;
        service.checkConnection = checkConnection;

        return service;    
        
        function checkConnection(callback){
            $http.get(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/info/check-connection')
                .success(function (response) {
                    if (response.success) {
                        callback(true);
                    } else {
                        callback(false);
                    }
                })
                .error(function() {
                    callback(false);
                });
        }          
        
        function lentidao(){
            
            /*
			$ionicHistory.nextViewOptions({disableBack : true});
            var urlAtual = angular.copy($state.current.name);
            if(urlAtual != "app.lentidao"){
                $state.go("app.lentidao", {
                    url : urlAtual
                });
            }
            */
            
        }  
    }
})();