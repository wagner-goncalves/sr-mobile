(function () {
    'use strict';

    angular
        .module('SrCidadao')
        .controller('ErrorCtrl', Controller);

    function Controller($rootScope, $scope, $state, $stateParams, $ionicHistory, ErroService, AnalyticsService, ConnectivityMonitor, Notification) {
        
        $scope.$on('$ionicView.afterEnter', function(){
            vm.url = $stateParams.url;
        });          
        
        var vm = this;
        
        initController();
        
        function initController() {
            
            //Variáveis da view
            vm.url = ""; //Url de reload
            vm.tryingAgain = false;            
            
            
            //Funções
            vm.tryAgain = tryAgain;
            vm.tryAgainLentidao = tryAgainLentidao;
            vm.sair = sair;
            
        }
        
        function sair(){
            $ionicHistory.nextViewOptions({disableBack : true});
            AnalyticsService.trackView("login");
            $state.go("login");
        }    
        
        function tryAgain(){
            if(ConnectivityMonitor.isOffline()){
                Notification.error({message: '<i class="fa fa-frown-o" aria-hidden="true"></i> Você ainda está offline.', delay: 2000}); 
            }else{
                $ionicHistory.nextViewOptions({disableBack : true});
                AnalyticsService.trackView(vm.url);
                $state.go(vm.url, {},
                { 
                    reload : true
                });
            }
        }            
        
        function tryAgainLentidao(){
            vm.tryingAgain = true;
            if(ConnectivityMonitor.isOffline()){
                Notification.error({message: '<i class="fa fa-frown-o" aria-hidden="true"></i> Você está offline. Verifique sua conexão com a internet.', delay: 2000}); 
            }else{
                
                ErroService.checkConnection(function(success){
                    vm.tryingAgain = false;
                    if(!success){
                        Notification.error({message: '<i class="fa fa-frown-o" aria-hidden="true"></i> Ainda sem resposta.', delay: 2000}); 
                    }else{
                        $ionicHistory.nextViewOptions({disableBack : true});
                        $state.go(vm.url);
                        AnalyticsService.trackView(vm.url);
                    }
                });
            }            
        }           
    }

})();