   angular
        .module('SrCidadao', ['ionic', 'angularMoment', 'ngCordova', 'ngIOS9UIWebViewPatch', 'ui.router', 'ui-notification',
            'ngMessages', 'ngStorage', 'ngMockE2E', 'ngNotificationsBar', 'ngSanitize', 'ui.bootstrap', 'angular.filter', 'ui.utils.masks.br', 
            'ngOpenFB', 'angularRipple', 'ionic-native-transitions', 'chart.js', 'jkAngularRatingStars'])
        .constant("configuracao", {
       
            "mlDev": "http://machinelearning.srcidadao.com.br/public/",       
            "servicesDev": "http://servicos.srcidadao.com.br/public/",
            "baseImagemPoliticoDev" : "http://servicos.srcidadao.com.br/public/politicos/",   
       
            "loghttp" : false, //Console log de requisições http
       
            //"mlDev": "http://machine-learning.srcidadao.dev.br/public/",       
            //"servicesDev": "http://servicos.srcidadao.dev.br/public/",
            //"baseImagemPoliticoDev" : "http://servicos.srcidadao.com.br/public/politicos/",
       
            "ml": "http://machinelearning.srcidadao.com.br/public/",
            "services": "http://servicos.srcidadao.com.br/public/",
            "baseImagemPolitico" : "http://servicos.srcidadao.com.br/public/politicos/",
			
            "urlShareFicha": "http://site.srcidadao.com.br/public/compartilhar/resumo?id=",
            "urlShareFichaDev" : "http://site.srcidadao.com.br/public/compartilhar/resumo?id=",	
       
            "urlShareLembrete": "http://site.srcidadao.com.br/public/compartilhar/lembrete?id=",
            "urlShareLembreteDev" : "http://site.srcidadao.com.br/public/compartilhar/lembrete?id=",	       
			
            "apiVersion": "v1",
			"appVersion": 1.0,
            "online": false, //Força online
            "geoPlugin" : "http://ip-api.com/json/?callback=handlerGeoLocation",
            "fbId" : "1291658950856461",
            "fbScope" : "email,public_profile,user_friends,publish_actions",
            "fbFields" : "id,name,email,picture.height(200),about,age_range,birthday,cover,currency,devices,education,first_name,middle_name,last_name,gender,hometown,inspirational_people,install_type,installed,is_verified,link,location,political,relationship_status,religion,website,work",
            "oneSignalId" : "ae1e4c2c-92a1-4db5-9e22-1fb7e0a1e195",
            "googleAppId" : "884092009918",
            "googleAnalytics" : "UA-100972517-1"
        }) 
        .config(config)
        .run(run);

    function config($stateProvider, $urlRouterProvider, $httpProvider, $provide, 
                     $ionicConfigProvider, $ionicNativeTransitionsProvider) {
        
        //Transições nativas
        $ionicNativeTransitionsProvider.setDefaultTransition({
            type: 'slide',
            direction: 'left'
        });
        $ionicNativeTransitionsProvider.setDefaultBackTransition({
            type: 'slide',
            direction: 'right'
        });        
        
        //Scroll nativo
        $ionicConfigProvider.scrolling.jsScrolling(false);
       
        //Cria função no state para forçar reload.
        $provide.decorator('$state', function($delegate, $stateParams) {
            $delegate.forceReload = function() {
                return $delegate.go($delegate.current, $stateParams, {
                    reload: true,
                    inherit: false,
                    notify: true
                });
            };
            return $delegate;
        });  
        
        
        $httpProvider.interceptors.push('HttpInterceptor');    
                
        $urlRouterProvider.otherwise('app/timeline');
        
        $stateProvider

            .state('app', {
              url: "/app",
              abstract: true,
              templateUrl: "templates/menu/menu.html",
              controller: 'MenuCtrl',
              controllerAs: 'vm'
            })
            
            .state('app.friends', {
              url: "/friends",
              views: {
                'menuContent' :{
                  controller: 'FriendsCtrl',
                  controllerAs: 'vm',
                  templateUrl: "templates/friends/friends.html"
                }
              }
            })
            
            .state('app.friend', {
              url: "/friend/:id",
              views: {
                'menuContent' :{
                  controller: 'FriendCtrl',
                  controllerAs: 'vm',
                  templateUrl: "templates/friend/friend.html"
                }
              }
            })   
        
            .state('app.ficha', {
              url: "/ficha/:id",
              views: {
                'menuContent' :{
                  controller: 'FichaCtrl',
                  controllerAs: 'vm',
                  templateUrl: "templates/ficha/ficha.html"
                }
              }
            })
            
            .state('app.feed', {
                url: "/feed",
                params: {
                    success : null,
                    notificacoes : null
                },
                views: {
                    'menuContent' : {
                        controller : 'FeedCtrl',
                        controllerAs : 'vm',
                        templateUrl : "templates/feed/feed.html"
                    }
                }
            })  
        
            .state('app.timeline', {
                url: "/timeline",
                params: {
                    success : null,
                    notificacoes : null
                },
                views: {
                    'menuContent' : {
                        controller : 'TimeLineCtrl',
                        controllerAs : 'vm',
                        templateUrl : "templates/timeline/timeline.html"
                    }
                }
            })  
        
            .state('app.lembrete', {
                url: "/lembrete/:oidLembrete",
                params: {
                    success : null,
                    notificacoes : null
                },
                views: {
                    'menuContent' : {
                        controller : 'LembreteCtrl',
                        controllerAs : 'vm',
                        templateUrl : "templates/lembrete/lembrete.html"
                    }
                }
            })   
        
            .state('app.lembretes', {
                url: "/lembretes",
                params: {
                    success : null,
                    notificacoes : null
                },
                views: {
                    'menuContent' : {
                        controller : 'LembreteCtrl',
                        controllerAs : 'vm',
                        templateUrl : "templates/lembrete/lembretes.html"
                    }
                }
            })           
        
            .state('app.search', {
              url: "/search",
              views: {
                'menuContent' :{
                  controller: 'SearchCtrl',
                  controllerAs: 'vm',
                  templateUrl: "templates/search/search-panel.html"
                }
              }
            })  
            
            .state('app.search-partido', {
              url: "/search/:sigla",
              views: {
                'menuContent' :{
                  controller: 'SearchCtrl',
                  controllerAs: 'vm',
                  templateUrl: "templates/search/search-panel.html"
                }
              }
            }) 
            
            .state('app.user-profile', {
              url: "/user/profile",
              views: {
                'menuContent' :{
                  controller: 'ProfileCtrl',
                  controllerAs: 'vm',
                  templateUrl: "templates/user/profile.html"
                }
              }
            })   
            
            .state('app.user-email', {
              url: "/user/email",
              views: {
                'menuContent' :{
                  controller: 'ProfileCtrl',
                  controllerAs: 'vm',
                  templateUrl: "templates/user/email.html"
                }
              }
            })  
            
            .state('app.user-password', {
              url: "/user/password",
              views: {
                'menuContent' :{
                  controller: 'ProfileCtrl',
                  controllerAs: 'vm',
                  templateUrl: "templates/user/senha.html"
                }
              }
            })  
            
            .state('app.user-preferences', {
              url: "/user/preferences",
              views: {
                'menuContent' :{
                  controller: 'ProfileCtrl',
                  controllerAs: 'vm',
                  templateUrl: "templates/user/preferences.html"
                }
              }
            })   
            
            .state('app.advisor', {
              url: "/advisor",
              views: {
                'menuContent' :{
                  controller: 'AdvisorCtrl',
                  controllerAs: 'vm',
                  templateUrl: "templates/advisor/advisor.html"
                }
              }
            })   
            
            .state('offline', {
                url: "/offline/:url",
                controller: 'ErrorCtrl',
                controllerAs: 'vm',
                templateUrl: "templates/error/semconexao.html"
            })                                  
          
            .state('app.lentidao', {
              url: "/lentidao/:url",
              views: {
                'menuContent' :{
                  controller: 'ErrorCtrl',
                  controllerAs: 'vm',
                  templateUrl: "templates/error/conexaoLenta.html"
                }
              }
            })   
        
            .state('app.estatisticas', {
              url: "/estatisticas",
              views: {
                'menuContent' :{
                  controller: 'EstatisticasCtrl',
                  controllerAs: 'vm',
                  templateUrl: "templates/estatisticas/estatisticas.html"
                }
              }
            })           
        
            .state('login', {
                url: '/login',
                templateUrl: 'templates/login/login.html',
                controller: 'Login.IndexController',
                controllerAs: 'vm'
            })
            
            .state('cadastro', {
                url: '/cadastro',
                templateUrl: 'templates/login/cadastro.html',
                controller: 'Login.IndexController',
                controllerAs: 'vm'
            })
            
            .state('walkthrough', {
                url: '/walkthrough',
                templateUrl: 'templates/walkthrough/walkthrough.html',
                controller: 'WalkthroughCtrl',
                controllerAs: 'vm'
            })
        
        
        
        
            .state('app.wizard-passo-um', {
              url: "/wizard/passo-um",
              views: {
                'menuContent' :{
                  controller: 'ProfileCtrl',
                  controllerAs: 'vm',
                  templateUrl: 'templates/wizard/passo-um.html',
                }
              }
            })  
        
            .state('app.wizard-passo-dois', {
              url: "/wizard/passo-dois",
              views: {
                'menuContent' :{
                  controller: 'ProfileCtrl',
                  controllerAs: 'vm',
                  templateUrl: 'templates/wizard/passo-dois.html',
                }
              }
            })  
        
            .state('app.wizard-passo-tres', {
              url: "/wizard/passo-tres",
              views: {
                'menuContent' :{
                  controller: 'ProfileCtrl',
                  controllerAs: 'vm',
                  templateUrl: 'templates/wizard/passo-tres.html',
                }
              }
            }) 
    
            .state('wizard-passo-um', {
                url: '/wizard/passo-um',
                templateUrl: 'templates/wizard/passo-um.html',
                controller: 'ProfileCtrl',
                controllerAs: 'vm'
            })  
        
            .state('wizard-passo-dois', {
                url: '/wizard/passo-dois',
                templateUrl: 'templates/wizard/passo-dois.html',
                controller: 'ProfileCtrl',
                controllerAs: 'vm'
            })  
        
            .state('wizard-passo-tres', {
                url: '/wizard/passo-tres',
                params: {
                    uf : null,
                },
                templateUrl: 'templates/wizard/passo-tres.html',
                controller: 'ProfileCtrl',
                controllerAs: 'vm'
            })
        
            .state('app.quiz-intro', {
              url: "/quiz/intro/:id",
              views: {
                'menuContent' :{
                  controller: 'QuizCtrl',
                  controllerAs: 'vm',
                  templateUrl: "templates/quiz/intro.html"
                }
              }
            })
        
            .state('app.quiz-question', {
              url: "/quiz/question/:id",
              views: {
                'menuContent' :{
                  controller: 'QuizCtrl',
                  controllerAs: 'vm',
                  templateUrl: "templates/quiz/question.html"
                }
              }
            })
        
            .state('app.quiz-finish', {
              url: "/quiz/finish/:quiz",
              views: {
                'menuContent' :{
                  controller: 'ResultadoQuizCtrl',
                  controllerAs: 'vm',
                  templateUrl: "templates/quiz/finish.html"
                }
              }
            })
        
            ;          
    }

    function run($ionicPlatform, $rootScope, $http, $location, $state, $localStorage,   
		LocalStorageService, MessageService, InfoService, AnalyticsService, notifications, configuracao, $openFB,
		NotificationService) {
        
        //Inicializa integração com Facebook
		$openFB.init({
			appId: configuracao.fbId,
			tokenStore : $localStorage,
			//browserOauthCallback : "/templates/facebook/oauthcallback.html",
			//cordovaOauthCallback : "/templates/facebook/oauthcallback.html"
		});

		//Controla mensagems de erro e offline
		$rootScope.MessageService = MessageService;
		$rootScope.MessageService.startWatching(); //Monitora se o aparelho muda de status (online / offline)

		//JWT
		if (LocalStorageService.GetCurrentUser()) {            
			$http.defaults.headers.common.Authorization = 'Bearer ' + LocalStorageService.GetCurrentUser().token;
		}
        
        /*
        $internal(function(){
            InfoService.notificacaoStats(function(success, response){
                  alert("#");
            });
        }, 30000);
        */

		//Redireciona usuário caso não esteja logado
		$rootScope.$on('$locationChangeStart', function (event, next, current) {
			var publicPages = ['/login', '/cadastro'];
			var restrictedPage = publicPages.indexOf($location.path()) === -1;
			if (restrictedPage && !LocalStorageService.GetCurrentUser()) {
				$location.path('/login');
			}
		});        
        
		$ionicPlatform.ready(function() {
            
      AnalyticsService.inicializa();
            
      //Monitora push notifications
			NotificationService.initialize();

      //Padrões do Cordova
			if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
			  //cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true); // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard for form inputs)
			  cordova.plugins.Keyboard.disableScroll(true); //Desabilita scroll javascript e dá espaço ao nativo
			}
            
			if (window.StatusBar) {
			  // org.apache.cordova.statusbar required
			  StatusBar.styleDefault();
			}
            
      document.addEventListener("pause", function() {
          var state = {
                  "name" : $state.current.name,
                  "params" : $state.params
          }
          LocalStorageService.SetState(state);
          console.log(JSON.stringify(state));
      }, false);
      
      document.addEventListener("resume", function() {
          var previousState = LocalStorageService.GetState();
          if(previousState) $state.go(previousState.name, previousState.params, {reload : true});
          console.log(JSON.stringify(previousState));
      }, false);
            
		});
    }
