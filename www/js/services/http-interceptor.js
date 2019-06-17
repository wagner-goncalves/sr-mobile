(function () {
    'use strict';

    angular
        .module('SrCidadao')
        .factory('HttpInterceptor', HttpInterceptor);  
        
    function HttpInterceptor($injector, $q, LocalStorageService, $rootScope, ConnectivityMonitor, 
                              configuracao, ConfigurationService){  
        return{
            request : function(config){
                
                if (LocalStorageService.GetCurrentUser() && LocalStorageService.GetCurrentUser().token) {
                    config.headers.Authorization = 'Bearer ' + LocalStorageService.GetCurrentUser().token;
                }
                
                if(config.url == configuracao.geoPlugin) delete config.headers.Authorization;
                
                if(ConnectivityMonitor.isOffline()){ 
                    $rootScope.isOnline = false;
                }else{
                    $rootScope.isOnline = true;
                } 
                
                if(configuracao.loghttp){
                    var strlog = JSON.stringify(config);
                    console.log(config);
                    console.log("REQUEST #######\nURL: " + config.url + "\n" +
                    "METHOD: " + config.method + "\n" +
                    "DATA: " + JSON.stringify(config.data) + "\n" +
                    "HEADERS: " + JSON.stringify(config.headers) + "\n" +
                    "RAW: " + JSON.stringify(config)           
                    );
                } 
                
                return config;
            },
            response : function(response){
                if(configuracao.loghttp){
                    
                    console.log(response);
                    
                    var strlog = JSON.stringify(response);
                    console.log("RESPONSE #######\nURL: " + response.config.url + "\n" +
                    "RESPONSE DATA: " + JSON.stringify(response.data) + "\n" +
                    "RESPONSE STATUS: " + response.status  + "\n" +                                
                    "REQUEST METHOD: " + response.config.method + "\n" +
                    "REQUEST DATA: " + JSON.stringify(response.config.data) + "\n" +
                    "REQUEST HEADERS: " + JSON.stringify(response.config.headers) + "\n" +
                    "REQUEST RAW: " + JSON.stringify(response.config)
                    );
                } 
                return response;
            },
            responseError : function(response){
                if (response.status == 401){ //Desautorizado
                    $injector.get('$state').transitionTo('login'); //Força login
                }
                return $q.reject(response);
            },
            requestError : function(rejectReason){

                return rejectReason;
            }
        }
    }
})();