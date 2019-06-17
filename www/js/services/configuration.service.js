(function () {
    'use strict';

    angular
        .module('SrCidadao')
        .factory('ConfigurationService', ConfigurationService);    
        
    function ConfigurationService(configuracao) {  
    
        var service = {};

        service.desenvolvimento = desenvolvimento;
        service.getApiEndPoint = getApiEndPoint;
        service.getMlEndPoint = getMlEndPoint;
        service.getApiVersion = getApiVersion;
        service.getApiImagePath = getApiImagePath;

        return service;        

        function getMlEndPoint(){        
            if(desenvolvimento()){
                return configuracao.mlDev;    
            }else{
                return configuracao.ml;    
            }
        }  
        
        function getApiEndPoint(){        
            if(desenvolvimento()){
                return configuracao.servicesDev;    
            }else{
                return configuracao.services;    
            }
        }          
        
        function getApiVersion(){        
            if(desenvolvimento()){
                return configuracao.apiVersion;    
            }else{
                return configuracao.apiVersion;    
            }
        }                

        function getApiImagePath(){        
            if(desenvolvimento()){
                return configuracao.baseImagemPoliticoDev;    
            }else{
                return configuracao.baseImagemPolitico;
            }
        }        
        
        function desenvolvimento(){       
            if(window.cordova) return false;
            else return true;
        }        
    }
})();