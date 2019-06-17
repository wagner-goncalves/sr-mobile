(function () {
    'use strict';

    angular
        .module('SrCidadao')
        .controller('MenuCtrl', Controller);

    function Controller($scope, $http, AnalyticsService, ConfigurationService, $rootScope, $state, $ionicHistory, RootScopeService, LocationService, LocalStorageService, FeedService) {
        
        var vm = this;
		vm.initController = initController;
        vm.initController();

        function initController() {
			//Funções
			vm.unread = unread;
            
            //Redirects
			vm.editProfile = editProfile;
			vm.editPreferences = editPreferences;   
            vm.advisor = advisor;            
            vm.friends = friends;   
            vm.feed = feed;   
            vm.logout = logout;   
            vm.search = search; 
            vm.lembretes = lembretes;
            vm.estatisticas = estatisticas;

			//Variáveis
			vm.nome = LocalStorageService.GetCurrentUser().nome || "";
            vm.loggedUser = LocalStorageService.GetLoggedUser();
			
			//Starters
            loadMainProfile();
            LocationService.CurrentLocation(function(success, response){
                if(success){
                    
                }
            });
            vm.unread();
            
			//Listeners
            $scope.$on('MenuCtrl.unread', function(event, data) {
                unread(); 
            });      
            
            $scope.$on('MenuCtrl.updatePhoto', function(event, data) {
                updatePhoto();
            });               
            
        }
        
        function updatePhoto(){
            vm.loggedUser = LocalStorageService.GetLoggedUser(); 
        }
        
        function loadMainProfile(){
            RootScopeService.setUserInfo(LocalStorageService.GetCurrentUser());
            FeedService.Stats(function(response){
				RootScopeService.setStats(response);
            });
        }
        
        function unread(){
            FeedService.Unread(function(response){
                if(response){
                    RootScopeService.setUnread(response.count);
                }else{
                    //erro
                }
            });
        }
        
        function editProfile(){
            $ionicHistory.nextViewOptions({disableBack : true});
            AnalyticsService.trackView("app.user-profile");
            $state.go("app.user-profile");
        }   
        
        function editPreferences(){
            $ionicHistory.nextViewOptions({disableBack : true});
            AnalyticsService.trackView("app.user-preferences");
            $state.go("app.user-preferences");
        }         
        
        function advisor(){
            $ionicHistory.nextViewOptions({disableBack : true});
            AnalyticsService.trackView("app.advisor");
            $state.go("app.advisor");
        }   
        
        function lembretes(){
            $ionicHistory.nextViewOptions({disableBack : true});
            AnalyticsService.trackView("app.lembretes");
            $state.go("app.lembretes");
        }           
        
        function friends(){
            $ionicHistory.nextViewOptions({disableBack : true});
            AnalyticsService.trackView("app.friends");
            $state.go("app.friends");
        }       
        
        function feed(){
            //$ionicHistory.clearCache();
            $ionicHistory.nextViewOptions({disableBack : true});
            //$state.go("app.timeline");
            
            AnalyticsService.trackView("app.timeline");
            //Reinicialia controller
            $state.go("app.timeline").then(function(){
                    //$rootScope.$broadcast('FeedCtrl.initController', {notificacoes : [741818, 741846]});              
                    $rootScope.$broadcast('FeedCtrl.initController');
                }
            );            


        }  
        
        function search(){
            $ionicHistory.nextViewOptions({disableBack : true});
            AnalyticsService.trackView("app.search");
            $state.go("app.search");
        }   
        
        function estatisticas(){
            $ionicHistory.nextViewOptions({disableBack : true});
            AnalyticsService.trackView("app.estatisticas");
            $state.go("app.estatisticas");
        }           
        
        function logout(){
            //LocalStorageService.LimpaSessao();
            $ionicHistory.nextViewOptions({disableBack : true});
            AnalyticsService.trackView("login");
            $state.go("login");
        }                                                  
    }

})();