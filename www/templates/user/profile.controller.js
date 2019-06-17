(function () {
    'use strict';

    angular
        .module('SrCidadao')
        .controller('ProfileCtrl', Controller);

    function Controller($rootScope, $scope, $state, $ionicPopup, $timeout, $ionicHistory, $http, 
                         $ionicLoading, AnalyticsService, FeedService, LocalStorageService, RootScopeService, Notification, UsuarioService, PreferenciasService, PhotoService, MessageService, configuracao) {
		//Verificar conexão com a internet
        MessageService.validateConnection($scope, $state);   
        
        var vm = this;
        vm.initController = initController;
        initController();
 
        function initController() {
            
            $scope.$state = $state;
            
            //Funções
            vm.profile = profile;
            vm.updateProfile = updateProfile;
            vm.editEmail = editEmail;
            vm.editPassword = editPassword;
            vm.editPreferences = editPreferences;
            vm.confirmEditEmail = confirmEditEmail;
            vm.confirmEditSenha = confirmEditSenha;
            vm.confirmRecebeEmail = confirmRecebeEmail;
            vm.confirmRecebeNotificacao = confirmRecebeNotificacao;
            vm.savePreference = savePreference;
            vm.finalizar = finalizar;
            
            
            vm.takePhoto = takePhoto;
            vm.choosePhoto = choosePhoto;
            vm.deletePhoto = deletePhoto;
            
            vm.passoUm = passoUm;
            vm.passoDois = passoDois;
            vm.passoTres = passoTres;
            
            vm.savePolitico = savePolitico;
            
            //Variáveis
            vm.loggedUser = LocalStorageService.GetLoggedUser();

            vm.originalLoggedUser = {};
            vm.profileLoaded = false;
            vm.userPreferencesLoaded = false;
            vm.basePreferencesLoaded = false;
            vm.politicos = false;
            vm.checkedPolitico = [];
            vm.checkedEstado = [];
    
            //Listeners;
            $rootScope.$on('ProfileCtrl.profile', function(event, data) {
                vm.profile();
            });
            
            var desregister = $rootScope.$on('ProfileCtrl.loadPoliticos', function(event, data) {
                loadPoliticos();
                desregister();
            });              
            
            //Starters
            vm.profile();
        }
        
        function profile(){
            //Limpa cache com fotinhas
            $ionicHistory.clearCache();
            UsuarioService.Profile(function(response){
                if(response){
                    LocalStorageService.SetLoggedUser(response);
                    vm.loggedUser = response;
                    vm.originalLoggedUser = angular.copy(vm.loggedUser); //Copia o original para enviar só dados alterados
                    
                    userPreferences(function(){
                        basePreferences();
                    });
                    
                    //Atualiza foto do menu
                    $rootScope.$broadcast('MenuCtrl.updatePhoto');                    
                    
                }else{
                    //erro    
                }
                vm.profileLoaded = true;
            });
        }
        
        function userPreferences(callback){
            //Preferências do usuário
            UsuarioService.Preferencias(function(response){
                if(response){
                    vm.loggedUser = LocalStorageService.GetLoggedUser();
                    vm.loggedUser.preferencias = response;
                    LocalStorageService.SetLoggedUser(vm.loggedUser);                 
                    //$rootScope.loggedUser.preferencias = response;
                }else{
                    //erro    
                }
                vm.userPreferencesLoaded = true;
                callback();
            });
        }
        
        function updateProfile(key, value){
            if(value !== undefined && vm.originalLoggedUser[key] !== value){ //Mudou um valor
                var usuario = {};
                usuario[key] = value;
                UsuarioService.UpdateProfile(usuario, function(response){
                    if(response){

                    }else{
                        //erro    
                    }
                });
            }
            vm.originalLoggedUser = angular.copy(vm.loggedUser);
        }
        
        function confirmRecebeEmail(flag){
            var usuario = {};
            usuario.flgRecebeEmail = flag;
            UsuarioService.UpdateProfile(usuario, function(response){
                if(response){
                                 
                }else{
                    usuario.flgRecebeEmail = !flag;  
                }
            });
        }
        
        function confirmRecebeNotificacao(flag){
            var usuario = {};
            usuario.flgRecebeNotificacao = flag;
            UsuarioService.UpdateProfile(usuario, function(response){
                if(response){
                                 
                }else{
                    usuario.flgRecebeNotificacao = !flag;  
                }
            });
        }                
        
        function confirmEditEmail(email){
            var usuario = {};
            usuario.email = email;
            UsuarioService.UpdateProfile(usuario, function(response){
                if(response){
                    vm.loggedUser.email = email;

                    delete vm.loggedUser.novoEmail;
                    delete vm.loggedUser.confirmaEmail;
                    
                    LocalStorageService.SetLoggedUser(vm.loggedUser);    
                    
                    var popup = $ionicPopup.alert({title : '<i class="fa fa-check fa-3x text-success"></i>', 
                        template : 'Email atualizado com sucesso!',
                        subTitle : 'Enviamos um email para nova verificação.'
                    });
                    popup.then(function(){
                        $ionicHistory.goBack();
                    });                    
                }else{
                    //erro    
                }
            });
        }
        
        function confirmEditSenha(senhaAtual, novaSenha){
            
            var usuario = {};
            
            usuario.senhaAtual = senhaAtual;
            usuario.novaSenha = novaSenha;
            
            UsuarioService.UpdateProfile(usuario, function(response){
                //console.log(response);
                if(response){
                    delete vm.loggedUser.senhaAtual;
                    delete vm.loggedUser.novaSenha;
                    delete vm.loggedUser.confirmaSenha;
                    var popup = $ionicPopup.alert({title : '<i class="fa fa-check fa-3x text-success"></i>', template : 'Senha atualizada com sucesso!'});
                    popup.then(function(){
                        $ionicHistory.goBack();
                    });

                }else{
                    //Erro
                    var popup = $ionicPopup.alert({title : '<i class="fa fa-close fa-3x text-danger"></i>', template : "Senha atual não confere."});
                    $timeout(function(){popup.close();}, 3000);
                }
            });
        }        
        
        function editEmail(){
            AnalyticsService.trackView("app.user-email");
            $state.go("app.user-email");
        }   
        
        function editPassword(){
            AnalyticsService.trackView("app.user-password");
            $state.go("app.user-password");
        }  
        
        function editPreferences(){
            AnalyticsService.trackView("app.user-preferences");
            $state.go("app.user-preferences");
        }     
        
        function passoUm(){
            AnalyticsService.trackView("wizard-passo-um");
            $state.go("wizard-passo-um");
        }  
        
        function passoDois(){
            AnalyticsService.trackView("wizard-passo-dois");
            $state.go("wizard-passo-dois");
        }   
        
        function passoTres(){
            var temEstado = false;
            //console.log(vm.checkedEstado);
            for(var k in vm.checkedEstado){
                if(vm.checkedEstado.hasOwnProperty(k)){
                    if(vm.checkedEstado[k]) temEstado = true;
                }
            }
            if(!temEstado){
                Notification.error({message: 'Escolha pelo menos um Estado.', delay: 3000});
                $ionicLoading.hide();
            }else{
                AnalyticsService.trackView("wizard-passo-tres");
                $state.go("wizard-passo-tres").then(function(){
                    $rootScope.$broadcast('ProfileCtrl.loadPoliticos');
                });
            }
        }   
        
        function finalizar(){
            var temEstado = false;
            for(var i = 0; i < vm.politicos.length; i++){
                if(vm.checkedPolitico["P" + vm.politicos[i].oidPolitico]){
                    temEstado = true;
                }
            }
            //if(!temEstado){
               // Notification.error({message: 'Escolha pelo menos um Político.', delay: 3000});
           // }else{
                $state.go("app.timeline"); 
            //}
        }   
        
        function loadPoliticos(){
            vm.politicos = [];
            vm.checkedPolitico = [];
            PreferenciasService.politicos(vm.loggedUser.preferencias.estados, function(success, response){
                
                for (var i = 0; i < response.length; i++) {

                    var temNotificacao = false;
                    for (var j = 0; j < vm.politicos.length; j++){
                        if(vm.politicos[j].oidPolitico == response[i].oidPolitico){
                            temNotificacao = true;
                        }
                    }
                    if(!temNotificacao && response[i]) vm.politicos.push(response[i]);   
                } 

                for(var i = 0; i < vm.politicos.length; i++){
                    vm.checkedPolitico["P" + vm.politicos[i].oidPolitico] = true;
                }
                
            });   
        }
        
        function savePolitico(oidPolitico){
            for(var i = 0; i < vm.politicos.length; i++){
                savePreference("politico", vm.politicos[i].oidPolitico, vm.checkedPolitico["P" + vm.politicos[i].oidPolitico]);
            }
        }        
        
        function basePreferences(){
            PreferenciasService.instituicoes(function(response){
                if(response){
                    vm.instituicoes = response;
                }else{
                    //erro    
                }
                
                PreferenciasService.partidos(function(response){
                    if(response){
                        vm.partidos = response;
                    }else{
                        //erro    
                    }
                    
                    PreferenciasService.estados(function(response){
                        if(response){
                            vm.estados = response;
                        }else{
                            //erro    
                        }
                        
                        PreferenciasService.interesses(function(response){
                            if(response){
                                vm.interesses = response;
                            }else{
                                //erro    
                            }
                            
                            FeedService.Stats(function(response){
                                RootScopeService.setStats(response);
                            });
                            
                            vm.basePreferencesLoaded = true;
                        });
                    });                    
                });                
            });
        }      
        
        function savePreference(pref, id, val){
            $ionicLoading.show({template : '<ion-spinner class="spinner my-spinner">'});
            PreferenciasService.salvar(pref, id, val, function(response){
                if(response && response.success == false){
                    Notification.error({message: response.message, delay: 3000});
                    profile();
                    $ionicLoading.hide();
                }else if(response){
                    vm.interesses = response;
                    $rootScope.$broadcast('SearchCtrl.preferences');      
                    $rootScope.$broadcast('ProfileCtrl.update');
                    profile();
                    $ionicLoading.hide();
                    //$rootScope.$broadcast('LembreteCtrl.initController');
                }
            }); 
        } 

        function takePhoto() {
            PhotoService.takePhoto(photoSuccessCallback, photoErrorCallback);
        }
        
        function choosePhoto() {
            PhotoService.choosePhoto(photoSuccessCallback, photoErrorCallback);
        }        

        function deletePhoto() {
            //
            PhotoService.excluir(function(response){
                if(response){
                    vm.loggedUser.arquivoImagem = false;
                    Notification.success({message: '<i class="fa fa-check"></i> Foto excluida.', delay: 3000});
                    profile();
                }else{
                    //erro  
                    vm.loggedUser.arquivoImagem = false;  
                } 
                LocalStorageService.SetLoggedUser(vm.loggedUser); 
            });
        }        

        
        function photoSuccessCallback(imageData) {
            $ionicLoading.show({template : '<ion-spinner class="spinner my-spinner">'});
            PhotoService.upload("data:image/jpeg;base64," + imageData, 
                function(data){
                    Notification.success({message: 'Foto atualizada com sucesso!', delay: 3000});
                    vm.loggedUser.arquivoImagem = data.arquivoImagem;
                    $ionicLoading.hide();
                }, 
                function(data){
                    $ionicLoading.hide();
                    //vm.loggedUser.arquivoImagem = false;
                    //Notification.error({message: '<i class="fa fa-close"></i> Erro ao atualizar foto. ', delay: 2000});
                });
            LocalStorageService.SetLoggedUser(vm.loggedUser); 
            $rootScope.$broadcast('MenuCtrl.updatePhoto');
            $rootScope.$broadcast('FeedCtrl.updatePhoto');
        }
        
        function photoErrorCallback(err) {
            Notification.error({message: '<i class="fa fa-close"></i> Erro ao atualizar foto. ', delay: 2000});
        }        
                          
    }

})();