(function () {
    'use strict';       

    angular
        .module('SrCidadao')
        .controller('QuizCtrl', Controller);

    function Controller($rootScope, $scope, $state, $stateParams, $timeout, $ionicModal, 
                         $ionicLoading, $ionicPopup, 
                         InfoService, PoliticoService, QuizService, FeedService, Notification, configuracao) {
        var vm = this;
		vm.initController = initController;
        vm.initController();

        function initController() {
            //Funções
            vm.iniciar = iniciar;
            vm.intro = intro;
            vm.perguntas = perguntas;
            vm.finish = finish;
            vm.quizRegras = quizRegras;
            vm.inteiroTeor = inteiroTeor;
            vm.mostraDetalhe = mostraDetalhe;


            //Variáveis
            vm.quiz = false;
            vm.detalhar = false;
            vm.percentualRespostas = 0;
            vm.progress = 0;
            vm.index = 0;
            vm.id = 0;
            vm.animation_type = 'back';    
            vm.configuracao = configuracao;
            
            iniciar();
            
            $ionicModal.fromTemplateUrl('quiz-regras.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                $scope.modal = modal;
            });              
            
        }    
        
        function mostraDetalhe(){
            vm.detalhar = !vm.detalhar;
        }

        function iniciar(){
            $ionicLoading.show();
            QuizService.getQuiz($stateParams.id, function(success, dados){
                if(success){
                    vm.quiz = dados.quiz;   
                    
                    if(vm.quiz.info && vm.quiz.info.oidUsuario) vm.id = vm.quiz.info.oidUsuario;
                    
                    vm.percentualRespostas = (vm.quiz.stats.totalRespostas / vm.quiz.stats.totalPerguntas) * 100;
                    $ionicLoading.hide();
                }else{
                    ErroService.lentidao();
                }
            });
        }
        
        function quizRegras(){
            $scope.modal.show();
        }    

        function perguntas(){
            vm.progress = 0;
            vm.index = 0;
            vm.percentualRespostas = 0;
            $state.go("app.quiz-question", $stateParams).then(function(){
                vm.progress = 0;
                vm.index = 0; 
                vm.percentualRespostas = 0;
            });
        }
        function intro(){
            $state.go("app.quiz-intro", $stateParams).then(function(){
                vm.progress = 0;
                vm.index = 0; 
                vm.percentualRespostas = 0;
            });
        }
        
        function inteiroTeor(url){
            var confirmPopup = $ionicPopup.confirm({
                title: 'Abrir página externa',
                template: 'Você está prestes a sair do Sr.Cidadão para abrir um link no navegador. Continuar?'               
            });

            confirmPopup.then(function(res) {
                if(res) {
                    if(window.cordova){
                        cordova.InAppBrowser.open(url, "_system", "location=yes");
                    }else{
                        window.open(url, "_system");
                    }
                }else{
                    Notification.error({message: 'Não conseguimos registrar esta ação.', delay: 4000}); 
                }
            });
        }
        
        function finish(callback){
            $state.go("app.quiz-finish", {"quiz" : $stateParams.id}).then(function(){
                vm.index = 0; 
                if(callback) callback(true);
            });     
            
        }

        vm.reset = function (){
            vm.intro();
        };

        vm.next = function(){
            vm.detalhar = false;
          vm.animation_type = 'next';
            if(vm.index >= vm.quiz.perguntas.length - 1){
                vm.finish(function(success){
                    if(success){
                        vm.index = 0;
                        //vm.index = vm.quiz.perguntas.length; 
                    }
                });
            }else{
                vm.index++;
                vm.percent();
            }
        }
        
        vm.back = function(){
            vm.detalhar = false;
            vm.animation_type = 'back';
            if(vm.index <= 0){
                vm.index = 0; 
                vm.intro();
            }else{
                vm.index--;
                vm.percent();
            }
            
        }
        
        vm.percent = function(){
          var precent = (vm.index * 100) / vm.quiz.perguntas.length;
          vm.progress = precent;
        }

        vm.markAnswer = function($resposta,$pergunta){
            $ionicLoading.show({template : '<ion-spinner class="spinner my-spinner">'});
            switch($pergunta.flgTipo){
                case 'radio': 
                    for(var resposta in vm.quiz.perguntas[vm.index].respostas){
                        vm.quiz.perguntas[vm.index].respostas[resposta].selected = false;
                    }
                    $resposta.selected = true;
                    break;
                case 'checkbox':
                    $resposta.selected = !$resposta.selected;
                    break;
            }
            
            QuizService.responder($resposta.oidQuizPergunta, $resposta.oidQuizResposta, $resposta.oidTipoNotificacao, function(success, resposta){
                if(success){
                    vm.id = resposta.id;
                    FeedService.LikeVotacaoEmLote(1, $resposta.oidTipoNotificacao, $pergunta.oidProposicao, function(success){
                        if(success){
                            vm.quiz.perguntas[vm.index]["respondida"] = true;
                            vm.next();
                        }else{
                            Notification.error({message: 'Não conseguimos registrar esta ação.', delay: 4000}); 
                        }
                        $ionicLoading.hide();
                    });
                }else{
                    Notification.error({message: 'Não conseguimos registrar esta ação.', delay: 4000}); 
                    $ionicLoading.hide();
                }
            });
        }        
    }
})();    