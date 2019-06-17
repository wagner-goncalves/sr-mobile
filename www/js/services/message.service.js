(function () {
    'use strict';

    angular
        .module('SrCidadao')
        .factory('MessageService', MessageService);    
        
    function MessageService($rootScope, $localStorage, ConnectivityMonitor, configuracao, ConfigurationService) {  
    
        var service = {};
        
        //Variáveis
        service.online = configuracao.online ? true : ConnectivityMonitor.isOnline();

        //Funções
        service.isOnline = isOnline;
        service.forceReload = forceReload;
        service.hasErrors = hasErrors;
        service.startWatching = startWatching;
        service.setOnline = setOnline;
        service.hasCache = hasCache;
        service.validateConnection = validateConnection;

        return service;    
        
        function validateConnection(scope, state){
            scope.$on('$ionicView.beforeEnter', function(){
                if(!service.online){
                    state.go("offline", {
                        url : state.current.name
                    });
                }
            });            
        }

        function isOnline(){
            return configuracao.online ? true : ConnectivityMonitor.isOnline();
        }
        
        function setOnline(online){
            service.online = online;
        }        
    
        function forceReload(){
            service.online = configuracao.online ? true : ConnectivityMonitor.isOnline();
        }
        
        function startWatching(){
            ConnectivityMonitor.startWatching();
        } 
        
        function hasErrors(){
            return false;
        }  
        
        function hasCache(controllerName, variableName){
            if($localStorage[controllerName] && $localStorage[controllerName][variableName]){
                return true;    
            }
            
            return false;
        }                        
                      
    }
})();