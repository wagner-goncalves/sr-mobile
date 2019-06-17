(function () {
    'use strict';       

    angular
        .module('SrCidadao')
        .controller('ResultadoQuizCtrl', Controller);

    function Controller($rootScope, $scope, $state, $stateParams, $timeout, $ionicModal, 
                         $ionicLoading, $ionicPopup, 
                         InfoService, PoliticoService, LocalStorageService, AnalyticsService, QuizService, FeedService, Notification, configuracao) {
        var vm = this;
		vm.initController = initController;
        vm.initController();

        function initController() {
            //Funções
            vm.iniciar = iniciar;
            vm.calculaResultado = calculaResultado;
            vm.reset = reset;
            vm.getQuiz = getQuiz;
            vm.quizRegras = quizRegras;
            vm.politicianDetail = politicianDetail;
            vm.detalheEspectro = detalheEspectro;
  
            vm.quiz = false;
            vm.politico = false;
            vm.ideologia = false;
            vm.configuracao = configuracao;
            vm.wizard = wizard;
            vm.calculoOk = false;
            vm.erroCalculo = false;
            
            vm.loggedUser = LocalStorageService.GetLoggedUser();
            vm.preferencias = vm.loggedUser.preferencias;
            
            $ionicModal.fromTemplateUrl('quiz-regras.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                $scope.modal = modal;
            });  
            
            $scope.$on('$ionicView.enter', function(event, viewData) {
                iniciar();
            });
            
            
            
            $ionicModal.fromTemplateUrl('quiz-regras.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                $scope.modal = modal;
            });
        }
        
        function wizard(){
            vm.noMoreItemsAvailable = true; 
            $scope.$broadcast('scroll.infiniteScrollComplete');            
            AnalyticsService.trackView("app.advisor");
            $state.go("wizard-passo-um");
        }  
        
        function politicianDetail(id){ 
            $state.go("app.friend", {id : id});
        }
        
        function getQuiz(){
            QuizService.getQuizSlim($stateParams.quiz, function(success, dados){
                if(success){
                    vm.quiz = dados.quiz;
                }
            });
        }     
        
        function quizRegras(){
            $scope.modal.show();
        }            

        function iniciar(){
            $ionicLoading.show();
            vm.calculaResultado($stateParams.quiz, function(success){
                if(success){
                    $ionicLoading.hide();
                    vm.calculoOk = true;
                }else{
                    $ionicLoading.hide();
                    Notification.error({message: 'Não conseguimos identificar o político.', delay: 4000});   
                }
            });
            vm.getQuiz();
        }
        
        function detalheEspectro(url){
            var confirmPopup = $ionicPopup.confirm({
                title: 'Abrir página externa',
                template: 'Você está prestes a sair do Sr.Cidadão para abrir um link no navegador. Continuar?'               
            });
            
            InfoService.getParametro("LINK_IDEOLOGIA", function(success, dados){
                if(success){
                    confirmPopup.then(function(res) {
                        if(res) {
                            if(window.cordova){
                                cordova.InAppBrowser.open(dados.parametro.valor, "_system", "location=yes");
                            }else{
                                window.open(dados.parametro.valor, "_system");
                            }
                        }
                    });
                }else{
                    Notification.error({message: 'Não conseguimos direcioná-lo para mais detalhes.', delay: 4000});   
                }

            });
        }
        
        function calculaResultado(quiz, callback){
            
            //Recuperar usuário corrente
            InfoService.usuario(function(success, usuario){
                if(success){

                    //Calcular político
                    QuizService.politicoFavoritoUsuario(
                        {
                            id : usuario.id, 
                            flgMeusPoliticos: true, 
                            quiz : $stateParams.quiz
                        }, function(success, politico){
                        if(success){

                            //Recupera político favorito


                            PoliticoService.detailSlim(politico.politico[0], function(politicoFavorito){
                                if(politicoFavorito){


                                    //Calcular ideologia
                                    QuizService.ideologiaPartidariaUsuario(
                                        {
                                            id : usuario.id, 
                                            flgMeusPoliticos: true, 
                                            quiz : $stateParams.quiz
                                        }, function(success2, ideologia){
                                        if(success2){

                                            //Recupera ideologia
                                            InfoService.ideologia(ideologia.ideologia[0], function(success3, ideologiaUsuario){
                                                if(success3){     

                                                    vm.politico = politicoFavorito;
                                                    vm.ideologia = ideologiaUsuario.ideologia;                                             
                                                    vm.progress = 0;
                                                    vm.index = 0; 
                                                    
                                                    var resultado = {
                                                        ideologia : vm.ideologia.oidIdeologia,
                                                        politico : vm.politico.oidPolitico,
                                                        quiz : $stateParams.quiz
                                                    };
                                                    
                                                    QuizService.salvaResultado(resultado, function(success){
                                                            
                                                    });

                                                    callback(true);
                                                }else{
                                                    callback(false);
                                                    vm.erroCalculo = true;
                                                }
                                            });
                                        }else{
                                            callback(false);
                                            vm.erroCalculo = true;
                                        }
                                    });                            
                                }else{
                                    callback(false);    
                                    vm.erroCalculo = true;
                                }
                            }); 
                        }else{
                            callback(false); 
                            vm.erroCalculo = true;
                        }
                    });
                }else{
                    Notification.error({message: 'Não conseguimos recuperar a informação solicitada.', delay: 4000});   
                    callback(false);
                    vm.erroCalculo = true;
                }

            });            
 
        } 
        
        function reset(){
            $state.go("app.quiz-intro", {id : $stateParams.quiz}).then(function(){
                $state.reload();
            });
        }        
    }
})();    