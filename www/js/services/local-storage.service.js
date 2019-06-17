(function () {
    'use strict';

    angular
        .module('SrCidadao')
        .factory('LocalStorageService', LocalStorageService);    
        
    function LocalStorageService($rootScope, $localStorage, $filter, configuracao, ConfigurationService) {  
    
        var service = {};

        service.SetCurrentUser = SetCurrentUser;
        service.GetCurrentUser = GetCurrentUser;
        service.SetLoggedUser = SetLoggedUser;
        service.GetLoggedUser = GetLoggedUser;        
        service.DeleteCurrentUser = DeleteCurrentUser;
        service.DeleteLoggedUser = DeleteLoggedUser;
        service.DeleteFbToken = DeleteFbToken;
        service.LimpaSessao = LimpaSessao;
        service.isFirstAccess = isFirstAccess;
        service.setFirstAccess = setFirstAccess;
        service.DeleteFirstAccess = DeleteFirstAccess;
        service.setNaoPerguntar = setNaoPerguntar;
        service.perguntar = perguntar;
        service.SetFiltroFeed = SetFiltroFeed;
        service.GetFiltroFeed = GetFiltroFeed;

        service.SetOpenCloseRepresentante = SetOpenCloseRepresentante;
        service.GetOpenCloseRepresentante = GetOpenCloseRepresentante;
        
        service.SetState = SetState;
        service.GetState = GetState;

        return service;   
        
        function perguntar(event){ 
            var perguntar = true;
            
            if(!$localStorage.naoPerguntar){
                $localStorage.naoPerguntar = {
                    "presenca" : [], 
                    "votacao" : []
                };
                return perguntar;
            } 

            switch(event.oidTipoNotificacao){
                case "1": case "2": case "5":
                    var dataHoraEvento = $filter('date')(new Date(event.dataHoraEvento), "dd/MM/yyyy");
                    if($localStorage.naoPerguntar.presenca.indexOf(dataHoraEvento) >= 0) perguntar = false;
                    break;    
                case "3": case "4": case "6": case "7": case "8":
                    var oidProposicao = event.oidProposicao;
                    if($localStorage.naoPerguntar.votacao.indexOf(oidProposicao) >= 0) perguntar = false;
                    break;                        
            }
            
            return perguntar;
        }         
        
        function setNaoPerguntar(event){

            if(!$localStorage.naoPerguntar){
                $localStorage.naoPerguntar = {
                    "presenca" : [], 
                    "votacao" : []
                };
            } 

            switch(event.oidTipoNotificacao){
                case "1":
                case "2": 
                case "5":
                    var dataHoraEvento = $filter('date')(new Date(event.dataHoraEvento), "dd/MM/yyyy");
                    
                    if($localStorage.naoPerguntar.presenca.indexOf(dataHoraEvento) < 0){
                        $localStorage.naoPerguntar.presenca.push(dataHoraEvento);
                    } 
                    
                    break;    
                case "3":
                case "4": 
                case "6":
                case "7":
                case "8":
                    var oidProposicao = event.oidProposicao;
                    
                    if($localStorage.naoPerguntar.votacao.indexOf(oidProposicao) < 0){
                        $localStorage.naoPerguntar.votacao.push(oidProposicao);
                    } 
                    
                    break;
            }
        }         
        
        function isFirstAccess(){
            if($localStorage.firstAccess) return false;
            else return true;
        }
        
        function setFirstAccess(){ 
            $localStorage.firstAccess = true;
        }  
        
        function DeleteFirstAccess(){ 
            if($localStorage.firstAccess) delete $localStorage.firstAccess;
        }          
        
        function SetCurrentUser(user){ 
            $localStorage.currentUser = user;
        } 
        
        function GetCurrentUser(){ 
            return $localStorage.currentUser;
        } 
        
        function SetLoggedUser(user){ 
            $localStorage.loggedUser = user;
        } 
        
        function GetLoggedUser(){ 
            return $localStorage.loggedUser;
        }         
        
        function DeleteLoggedUser(){ 
            //Não deletar para não perder token de notificações
            delete $localStorage.loggedUser;
        }         
        
        function DeleteCurrentUser(){ 
            //Não deletar para não perder token de notificações
            delete $localStorage.currentUser;
        } 
        
        function DeleteFbToken(){ 
            delete $localStorage.fbtoken;
        } 
        
        function LimpaSessao(){
            $rootScope.loggedUser = {};
            DeleteCurrentUser();
            DeleteFbToken();
        }  
        
        function SetState(state){ 
            $localStorage.state = state;
        } 
        
        function GetState(){ 
            return $localStorage.state;
        }  
        
        function SetFiltroFeed(filtro){ 
            $localStorage.filtroFeed = filtro;
        } 
        
        function GetFiltroFeed(){ 
            return $localStorage.filtroFeed;
        }          

        function SetFiltroFeed(filtro){ 
            $localStorage.filtroFeed = filtro;
        } 
        
        function GetFiltroFeed(){ 
            return $localStorage.filtroFeed;
        }          
        
        function SetOpenCloseRepresentante(open){ 
            $localStorage.openCloseRepresentante = open;
        } 
        
        function GetOpenCloseRepresentante(){ 
            return $localStorage.openCloseRepresentante ? $localStorage.openCloseRepresentante : false;
        }            


        
                               
    }
})();