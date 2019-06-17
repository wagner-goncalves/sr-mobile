(function () {
    'use strict';       

    angular
        .module('SrCidadao')
        .controller('AdvisorCtrl', Controller);

    function Controller($rootScope, $scope, $state, AnalyticsService, FeedService, LocalStorageService , RootScopeService, PoliticoService, MessageService, PreferenciasService, configuracao) {
		//Verificar conexão com a internet
        MessageService.validateConnection($scope, $state);        
        
        var vm = this;
        vm.initController = initController;
        vm.initController();     

        function initController() { // reset login status
        
            vm.loadMoreFriends = loadMoreFriends;
            vm.politicianDetail = politicianDetail;
            vm.calcPercentage = calcPercentage;
            vm.getInstituicoes = getInstituicoes;
            vm.wizard = wizard;
            
            vm.maiorGostei = 0;
            vm.maiorNaoGostei = 0;
            
            vm.noMoreItemsAvailable = false;
            vm.friends = [];
            vm.page = 0;
            vm.key = ""; 
            vm.order = "curtidas";    
            vm.politicianType = "alertas";
            vm.instituicao = 1;  
            vm.configuracao = configuracao;  
            vm.filter = filter;   
            vm.searchPanel = searchPanel;
            vm.advisorProcessado = false;   
            vm.requests = [];
            vm.instituicoes = false;
            
            vm.totalCurtidas = 0;
            vm.totalDescurtidas = 0;               
        
            $rootScope.$on("like-update", function(event, args){
                vm.filter(vm.order, vm.politicianType, vm.instituicao);  
            });
            
            loadMoreFriends();
            getInstituicoes();
            $scope.$broadcast('scroll.refreshComplete');     
            
            vm.loggedUser = LocalStorageService.GetLoggedUser();
            vm.preferencias = vm.loggedUser.preferencias;            

        }     
        
        function wizard(){
            vm.noMoreItemsAvailable = true; 
            $scope.$broadcast('scroll.infiniteScrollComplete');            
            AnalyticsService.trackView("app.advisor");
            $state.go("wizard-passo-um");
        }  

        function getInstituicoes(){
            PreferenciasService.instituicoesUsuario(function(response){
                vm.instituicoes = response;
            });
        }
        
        function politicianDetail(id){
            AnalyticsService.trackView("app.friend");
            $state.go("app.friend", {id : id});
        }
        
        function searchPanel(){
            AnalyticsService.trackView("app.search");
            $state.go("app.search");
        }          
        
        function filter(order, politicianType, instituicao){
            
            if(typeof(instituicao) == undefined && (vm.order == order && vm.politicianType == politicianType)){
                return;
            }
            
            vm.advisorProcessado = false;
            vm.noMoreItemsAvailable = false;
            vm.friends = [];
            vm.maiorGostei = 0;
            vm.maiorNaoGostei = 0;            
            vm.page = 0;
            vm.order = order;
            vm.politicianType = politicianType;
            
            if(instituicao){
                if(vm.instituicao == instituicao){
                    vm.instituicao = 0; //Desativa
                }else{
                    vm.instituicao = instituicao;    
                }   
            }
            
            loadMoreFriends();    
        } 
        
        function updateStats(){
            var stats = RootScopeService.getUserInfo();
            if(vm.politicianType == "alertas"){
                vm.totalCurtidas = stats.curtidas;
                vm.totalDescurtidas = stats.descurtidas;
            }else if(vm.politicianType == "meuspoliticos"){
                vm.totalCurtidas = stats.curtidasAmigos;
                vm.totalDescurtidas = stats.descurtidasAmigos;
            } 
        }
        
        function calcPercentage(base, totalCurtidas, totalDescurtidas){
            return parseInt(base) / (parseInt(totalCurtidas) + parseInt(totalDescurtidas)) * 100;
        }
        
        function loadMoreFriends(){
            vm.page++;
            //vm.noMoreItemsAvailable = false;
            vm.advisorProcessado = false;
            updateStats();
            
            PoliticoService.friendsAdvisor(vm.page, vm.key, vm.order, vm.politicianType, vm.instituicao, function(response){
                if(response){
                    if(response.length == 0){ 
                        vm.noMoreItemsAvailable = true;
                    }else{
                        for (var i = 0; i < response.length; i++) {
                            var temPolitico = false;
                            for (var j = 0; j < vm.friends.length; j++){
                                if(vm.friends[j].oidPolitico == response[i].oidPolitico){
                                    temPolitico = true;
                                }
                            }
                            if(!temPolitico && response[i]){ 
                                vm.friends.push(response[i]);                            
                            }
                        }
                    }
                    vm.advisorProcessado = true;
                }else{
                    vm.noMoreItemsAvailable = true;
                }
                
                for (var j = 0; j < vm.friends.length; j++){
                    if(vm.friends[j].curtidas > vm.maiorGostei) vm.maiorGostei = parseInt(vm.friends[j].curtidas);
                    if(vm.friends[j].descurtidas > vm.maiorNaoGostei) vm.maiorNaoGostei = parseInt(vm.friends[j].descurtidas);

                    vm.friends[j].percentualGostei = parseInt(vm.friends[j].curtidas) / vm.maiorGostei * 100;
                    vm.friends[j].percentualNaoGostei = parseInt(vm.friends[j].descurtidas) / vm.maiorNaoGostei * 100;
                }                
                
                $scope.$broadcast('scroll.infiniteScrollComplete');   
                
                //console.log(vm.friends);
                //console.log(vm.maiorGostei);
                //console.log(vm.maiorNaoGostei);
            });
                   
        }
        
    }
})();    