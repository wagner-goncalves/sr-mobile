(function () {
    'use strict';

    angular
        .module('SrCidadao')
        .factory('MachineLearnigService', MachineLearnigService);    
        
    function MachineLearnigService($q, $http, QuizService, PoliticoService, InfoService, configuracao, ConfigurationService) {  
    
        var service = {};

        service.predicoes = predicoes;

        return service;   
        
        function predicoes(parametros, callback){
            //Calcular político
            QuizService.politicoFavoritoUsuario(parametros, function(success, politico){
                if(success){
                    callback(true);
                    QuizService.ideologiaPartidariaUsuario(parametros, function(success2, ideologia){
                        if(success2){
                            //Recupera ideologia
                            InfoService.ideologia(ideologia.ideologia[0], function(success3, ideologiaUsuario){
                                if(success3){     
                                    //callback(true);
                                }else{
                                    //callback(false);
                                }
                            });
                        }else{
                            //callback(false);
                        }
                    });
                }else{
                    callback(false); 
                }
            }); 
        }          
    }
})();