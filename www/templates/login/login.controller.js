(function () {
    'use strict';       

    angular
        .module('SrCidadao')
        .controller('Login.IndexController', Controller);

    function Controller($rootScope, $scope, $state, $ionicPopup, $ionicLoading, $ionicSlideBoxDelegate, 
            $openFB, $ionicHistory, AuthenticationService, ErroService,
			AnalyticsService, UsuarioService, Notification, LocationService, 
            FacebookService, LocalStorageService, MessageService, NotificationService, InfoService, configuracao) {
        var vm = this;
		vm.initController = initController;
        vm.initController();

        function initController() { // reset login status
			//Funções
			vm.login = login;
			vm.cadastro = cadastro;
			vm.proximoSlide = proximoSlide;
			vm.fbLogin = fbLogin;
            vm.fbLoginNativo = fbLoginNativo;
            vm.resetForm = resetForm;
            vm.esqueciSenha = esqueciSenha;
            
			
			//Variáveis
			vm.MessageService = MessageService;	
            vm.termosuso = false;
            vm.emailEsqueciSenha = "";
			
			vm.versaoOK = true;
			vm.htmlMinVersao = "";

			//Starters
            AuthenticationService.Logout();
			
			InfoService.checkVersion(configuracao.appVersion ,function(success, response){
				//console.log(response);
				if(success){
					vm.versaoOK = response.versaoOK;
					vm.htmlMinVersao = response.parametroHtml.valor;
				}
			});
            
            //Limpa cache ao acessar tela de login
            $scope.$on('$ionicView.enter', function(event, viewData) {
                $ionicHistory.clearCache();
            });
            AnalyticsService.trackView($state.current.name);
        }     
        
        function resetForm(form) {
            /*
            // Each control (input, select, textarea, etc) gets added as a property of the form.
            // The form has other built-in properties as well. However it's easy to filter those out,
            // because the Angular team has chosen to prefix each one with a dollar sign.
            // So, we just avoid those properties that begin with a dollar sign.
            let controlNames = Object.keys(form).filter(key => key.indexOf('$') !== 0);
        
            // Set each control back to undefined. This is the only way to clear validation messages.
            // Calling `form.$setPristine()` won't do it (even though you wish it would).
            for (let name of controlNames) {
                let control = form[name];
                control.$setViewValue(undefined);
            }
        
            form.$setPristine();
            form.$setUntouched();
            */
        }; 
        
        function fbLoginNativo() {
            
            //Limpa qualquer msg na tela
            vm.errorLogin = false;            
            
            if(!MessageService.online){
                alertOffline();
                return;
            }            

            FacebookService.loginNativo(function(success, response){
                var mensagem = "Não conseguimos autenticá-lo. Verifique seu usuário e senha, suas permissões no Facebook e tente em instantes.";
                if(success){
                    vm.loading = true;
                    $ionicLoading.show({template : '<ion-spinner class="spinner my-spinner">'});
                    UsuarioService.CadastroFb(response, function(success, data){
                        AuthenticationService.LoginFb(response.email, response.token, function (result) {
                            vm.loading = false;
                            if (result === true) {
                                
                                salvaLocalizacao();
                                
                                AnalyticsService.trackEvent("Login Facebook", "Sucesso", "Sucesso no login");

                                //Carrega o profile do usuário
                                profile(function(success){
                                    if(!success) ErroService.lentidao();
                                    $ionicLoading.hide();
                                    
                                    //Salva aparelho para envio de push
                                    NotificationService.saveDevice(function(success, response){
                                        if(data.firstAccess){
                                            //boasVindas();
                                        } 
                                    });    
                                    
                                    if(data.firstAccess){
                                        //Mostra tutorial
                                        AnalyticsService.trackView("walkthrough");
                                        $state.go("walkthrough"); 
                                    }else{
                                        //Redireciona para a home
                                        AnalyticsService.trackView("app.timeline");
                                        $state.go("app.timeline");   
                                    }
                                });
                            } else {
                                //$ionicLoading.hide();
                                //Notification.error({message: mensagem, delay: 5000}); 
                                //vm.loading = false;
                                //AnalyticsService.trackEvent("Login Facebook", "Erro", "Erro no login");
                                vm.fbLogin(); //Login web tradicional
                            }
                        });
                    });
                }else{
                    //if(response && response.message) mensagem = response.message;
                    //Notification.error({message: mensagem, delay: 5000}); 
                    //AnalyticsService.trackEvent("Login Facebook", "Erro", "Erro no login");
                    vm.fbLogin(); //Login web tradicional
                }
            });
        }
        
        function fbLogin() {
            
            //Limpa qualquer msg na tela
            vm.errorLogin = false;            
            
            if(!MessageService.online){
                alertOffline();
                return;
            }            

            FacebookService.login(function(success, response){
                var mensagem = "Não conseguimos autenticá-lo usando o facebook. Verifique seu usuário e senha, sua conexão e tente em instantes.";
                if(success){
                    vm.loading = true;
                    $ionicLoading.show({template : '<ion-spinner class="spinner my-spinner">'});
                    UsuarioService.CadastroFb(response, function(success, data){
                        AuthenticationService.LoginFb(response.email, response.token, function (result) {
                            vm.loading = false;
                            if (result === true) {
                                
                                salvaLocalizacao();
                                
                                AnalyticsService.trackEvent("Login Facebook", "Sucesso", "Sucesso no login");

                                //Carrega o profile do usuário
                                profile(function(success){
                                    if(!success) ErroService.lentidao();
                                    $ionicLoading.hide();
                                    
                                    //Salva aparelho para envio de push
                                    NotificationService.saveDevice(function(success, response){
                                        if(data.firstAccess){
                                            //boasVindas();
                                        } 
                                    });    
                                    
                                    if(data.firstAccess){
                                        //Mostra tutorial
                                        AnalyticsService.trackView("walkthrough");
                                        $state.go("walkthrough"); 
                                    }else{
                                        //Redireciona para a home
                                        AnalyticsService.trackView("app.timeline");
                                        $state.go("app.timeline");   
                                    }
                                });
                            } else {
                                $ionicLoading.hide();
                                Notification.error({message: mensagem, delay: 5000}); 
                                vm.loading = false;
                                AnalyticsService.trackEvent("Login Facebook", "Erro", "Erro no login");
                            }
                        });
                    });
                }else{
                    if(response && response.message) mensagem = response.message;
                    Notification.error({message: mensagem, delay: 5000}); 
                    AnalyticsService.trackEvent("Login Facebook", "Erro", "Erro no login");
                }
            });
        }
        
        function esqueciSenha(){
            var esqueciSenhaPop = null;
            var options = {
                template : '<input autofocus style="padding: 4px 10px" type="text" placeholder="E-mail" class="form-control" ng-model="vm.emailEsqueciSenha">',
                title : "Esqueci minha senha",
                subTitle : "Informe o email cadastrado para recuperarmos sua senha.",
                scope : $scope,
                buttons : [
                    {
                        text : "Cancelar"
                    },
                    {
                        text : "Confirmar",
                        type: "button-positive",
                        onTap : function(e){
                            e.preventDefault();
                            
                            //Validar email
                            
                            UsuarioService.EsqueciSenha(vm.emailEsqueciSenha, function(success, message){
                                if(success){
                                    Notification.success({message: '<i class="fa fa-check fa-2x"></i><br />' + message, delay: 5000}); 
                                    esqueciSenhaPop.close();
                                }else{
                                    Notification.error({message: '<i class="fa fa-frown-o fa-2x"></i><br />' + message, delay: 5000}); 
                                }
                            });
                        }
                    }
                ]
            };
            var esqueciSenhaPop = $ionicPopup.show(options);
        }
        
        function salvaLocalizacao(){
            //Recupera localização
			
            LocationService.CurrentLocation(function(success, response){
                if(success){  
                    //Recupera UF do usuário pelas coordenadas do aparelho                            
                    LocationService.GetGoogleGeoInfo(response.latitude, response.longitude, function(success_2, response_2){
                       if(success_2){
                           response_2.origem = 1;//LAT-LON
                           LocationService.SaveGeoInfo(response_2);
                       }else{
                           
                       }
                    })
                }else{
                    //Recupera UF do usuário pelo IP
                    LocationService.GetGeoInfo(function(success_2, response_2){
                        if(success_2){
                            response_2.origem = 2;//IP
                            LocationService.SaveGeoInfo(response_2);    
                        }
                    });
                }
            });
        }      
        
        function alertOffline(){
            $ionicPopup.alert({
                title : 'Sem conexão',
                template : 'Não conseguimos acessar o Sr.Cidadão. Verifique sua conexão com a internet.'    
            });
        }
        
        
        function login() {

            //Limpa qualquer msg na tela
            vm.errorLogin = false;

            if(!MessageService.online){
                alertOffline();
                return;
            }

            vm.loading = true;
            $ionicLoading.show({template : '<ion-spinner class="spinner my-spinner">'});

            AuthenticationService.Login(vm.username, vm.password, function (result) {
                vm.loading = false;
                if (result === true) {
                    
                    salvaLocalizacao();                   
                    
                    //Carrega o profile do usuário
                    profile(function(success){
                        if(!success) ErroService.lentidao();
                        $ionicLoading.hide();
                        
                        //Salva aparelho para envio de push
                        NotificationService.saveDevice(function(success, response){
                            if(LocalStorageService.isFirstAccess()){
                                //boasVindas();
                            } 
                        });                         
                        
                        AnalyticsService.trackEvent("Login", "Sucesso", "Sucesso no login");
                        
                        if(LocalStorageService.isFirstAccess()){
                            //Mostra tutorial
                            LocalStorageService.setFirstAccess();
                            AnalyticsService.trackView("walkthrough");
                            $state.go("walkthrough");  
                        }else{
                            //Redireciona para a home
                            AnalyticsService.trackView("app.timeline");
                            $state.go("app.timeline");   
                        }
                    });
									
                } else {
                    $ionicLoading.hide();
                    ErroService.lentidao();
                    //Notification.error({message: 'E-mail ou senha incorretos.', delay: 5000}); 
                    vm.loading = false;
                    //AnalyticsService.trackEvent("Login", "Erro", "Erro no login");
                }
            });
        }
        
        function boasVindas(){
            UsuarioService.BoasVindas(function(response){
                if(response){
                    //Sucesso
                }else{
                    //Erro
                }
            });
        }        

        function profile(callback){
            UsuarioService.Profile(function(response){
                if(response){
                    LocalStorageService.SetLoggedUser(response);
                    AnalyticsService.setUserId(response.email);
                    callback(true);
                }else{
                    callback(false);
                }
            });
        }

        
        function cadastro() {

            if(!MessageService.online){
                alertOffline();
                return;
            }
            
            vm.loading = true;
            $ionicLoading.show({template : 'Aguarde...'});
            var usuario = {
                nome : vm.nome,
                email : vm.email,
                senha : vm.senha
            };
            UsuarioService.Cadastro(usuario, function (success, response) {
                $ionicLoading.hide();
                if (success) {
                    vm.username = vm.email;
                    vm.password = vm.senha;
                    LocalStorageService.LimpaSessao();
                    LocalStorageService.DeleteFirstAccess();
                    vm.login();
                } else {
                    Notification.error({message: response.message, delay: 2000}); 
                    vm.error = response.message;
                    vm.loading = false;
                }
            });           
        }
        
        function proximoSlide(){
            AnalyticsService.trackView("cadastro");
            $state.go("cadastro");
        }
        
    }
})();    