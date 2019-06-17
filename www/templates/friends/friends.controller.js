(function () {
    'use strict';

    angular
        .module('SrCidadao')
        .controller('FriendsCtrl', Controller);

    function Controller($rootScope, $scope, $state, $location, $ionicPopover, AnalyticsService, PoliticoService, MessageService, configuracao) {
		//Verificar conexão com a internet
        MessageService.validateConnection($scope, $state);

        var vm = this;
        vm.initController = initController;
        vm.initController();

        function initController() {
            //Funções
            vm.politicianDetail = politicianDetail;
            vm.loadMoreFriends = loadMoreFriends; //Infinite scroll
            vm.apagaAmigo = apagaAmigo; //Remove item da lista de amigos
            vm.searchMoreFriends = searchMoreFriends; //Busca
            vm.ficha = ficha;
    
            //variáveis
            vm.noMoreItemsAvailable = false;
            vm.friends = [];
            vm.page = 0;
            vm.key = "";
            vm.configuracao = configuracao;
    
            //Redirects
            vm.searchPanel = searchPanel;
            
            //Listeners
            $rootScope.$on("friends-update", function(event, args){
                vm.searchMoreFriends()    
            });
        }
        
        function searchPanel(){
            AnalyticsService.trackView("wizard-passo-um");
            $state.go("wizard-passo-um");
        }             
        
        function searchMoreFriends(){
            vm.noMoreItemsAvailable = false;                    
            vm.page = 0;
            vm.friends = [];                  
            vm.loadMoreFriends();
        }
        
        function ficha(id){
            vm.noMoreItemsAvailable = true; 
            $scope.$broadcast('scroll.infiniteScrollComplete');    
            AnalyticsService.trackView("app.ficha");
            $state.go("app.ficha", {id : id});
        }        
        
        function loadMoreFriends(){
            vm.page++;
            vm.noMoreItemsAvailable = false;
            PoliticoService.friends(vm.page, vm.key, function(response){
                if(response){
                    if(response.length == 0){ 
                        vm.noMoreItemsAvailable = true;
                    }else{
                        if(vm.page == 1) vm.friends = [];
                        for (var i = 0; i < response.length; i++) {                            
                            var temPolitico = false;
                            for (var j = 0; j < vm.friends.length; j++){
                                if(vm.friends[j].oidPolitico == response[i].oidPolitico){
                                    temPolitico = true;
                                }
                            }
                            if(!temPolitico && response[i]) vm.friends.push(response[i]);   
                        }
                    }
                }else{
                    vm.noMoreItemsAvailable = true;
                }
                $scope.$broadcast('scroll.infiniteScrollComplete');
            });  
                    
        }
        
        function apagaAmigo(friend){
            for(var i = 0; i < vm.friends.length; i++){
                if(vm.friends[i].oidPolitico === friend.oidPolitico){
                    vm.friends.splice(i, 1); 
                    RootScopeService.subtraiFriend();
                }
            }            
        }    
        
        function politicianDetail(id){
            AnalyticsService.trackView("app.friend");
            $state.go("app.friend", {id : id});
        }                     
    }

})();