(function () {
    'use strict';

    angular
        .module('SrCidadao')
        .factory('AnalyticsService', AnalyticsService);    
        
    function AnalyticsService(configuracao, 
                            //$cordovaGoogleAnalytics, 
                            $ionicPlatform) {  
    
        var service = {};

        service.inicializa = inicializa;
        service.producao = producao;
        service.setUserId = setUserId;
        service.trackView = trackView;
        service.trackEvent = trackEvent;

        return service;        

        function inicializa(){  
            if(producao()){
                //$cordovaGoogleAnalytics.debugMode(); 
                //$cordovaGoogleAnalytics.startTrackerWithId(configuracao.googleAnalytics);
            }
        }    
        
        function setUserId(id){        
            if(producao()){
                $ionicPlatform.ready(function() {
                    //$cordovaGoogleAnalytics.setUserId(id);
                });                
            }
        } 
        
        function trackView(view){  
            if(producao()){
                $ionicPlatform.ready(function() {
                    //$cordovaGoogleAnalytics.trackView(view);
                });                
            }
        }   
        
        function trackEvent(categoria, acao, etiqueta, valor){        
            if(producao()){
                $ionicPlatform.ready(function() {
                    //$cordovaGoogleAnalytics.trackEvent(categoria, acao, etiqueta, valor);
                });
            }
        }           
        
        function producao(){       
            return true;
            //if(window.cordova && $cordovaGoogleAnalytics) return true;
            //else return false;
        }        
    }
})();