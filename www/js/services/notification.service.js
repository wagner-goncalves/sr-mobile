(function () {
    'use strict';

    angular
        .module('SrCidadao')
        .factory('NotificationService', NotificationService);    
        
    function NotificationService($http, $rootScope, $state, $ionicHistory, LocalStorageService, configuracao, ConfigurationService) {  
    
        var service = {};

        service.initialize = initialize;   
		service.saveDevice = saveDevice;   		

        return service;
    
        function initialize(){ 
            initializeOneSignal();
        }
        
        function initializeOneSignal(){
            if(window.plugins && window.plugins.OneSignal){
				//window.plugins.OneSignal.setLogLevel({logLevel: 4, visualLevel: 4}); // Enable to debug issues
				window.plugins.OneSignal
					.startInit(configuracao.oneSignalId, configuracao, ConfigurationService.googleAppId)
					.handleNotificationOpened(handleNotificationOpenedCallback)
					.handleNotificationReceived(handleNotificationReceivedCallback)
					.endInit();
			}
        }
        
        function handleNotificationOpenedCallback(data){
            $http.post(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/notificacao/registra-abertura', data)
                .success(function(response) {
                    if(response.success){
                        var alerts = response.notificacoes; //Vetor com notificações
						var tipoMensagem = response.tipoMensagem; //Vetor com tipos da mensagem
						var stateGo = response.stateGo;
						var stateParams = response.stateParams;
						
						/*
							1 BOAS VINDAS
							2 MENSAGEM AGRUPADA POLITICO
							3 MENSAGEM INDIVIDUAL POLITICO
							4 MENSAGEM LEMBRETE
						*/
						if(tipoMensagem.length > 0 && (tipoMensagem[0] == "2" || tipoMensagem[0] == "3")){
							$state.go(stateGo).then(function(){
									//Recarrega feed
									$rootScope.$broadcast('FeedCtrl.initController', { notificacoes : alerts});
								}
							);
						}else{
							$state.go(stateGo, stateParams);
						}
                    }
                })
                .error(function(response) {

                });
        }
        
        function handleNotificationReceivedCallback(data){
            $http.post(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/notificacao/registra-recebimento', data)
                .success(function(response) {
                    if(response.success){
                        var alerts = response.notificacoes; //Vetor com notificações
						var tipoMensagem = response.tipoMensagem; //Vetor com tipos da mensagem
						if(tipoMensagem.length > 0 && (tipoMensagem[0] == "2" || tipoMensagem[0] == "3")){
							//Seta badge com quantidade de notificações
							if(alerts.length > 0 && window.cordova && window.cordova.plugins && window.cordova.plugins.notification){
								cordova.plugins.notification.badge.set(alerts.length);
							}
						}
                    }
                })
                .error(function(response) {

                });            
        }        
		
		//Recupera e salva dados do aparelho no usuário
		function saveDevice(callback){
			if(window.plugins && window.plugins.OneSignal){
				window.plugins.OneSignal.getIds(function(ids) {
					var usuario = {};
					usuario.tokenDevice = ids.pushToken;
					usuario.idUserCloudMessage = ids.userId;

					$http.patch(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/usuario/device', usuario)
						.success(function(response) {
							callback(true, response);
						})
						.error(function(response) {
							callback(false, response);
						});
				});
			}else{
				callback(false, {message : "Não foi possível salvar o device."});
			}
		}
    }
})();