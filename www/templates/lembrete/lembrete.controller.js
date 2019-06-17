(function () {
    'use strict';

    angular
        .module('SrCidadao')
        .controller('LembreteCtrl', Controller);

    function Controller($rootScope, $scope, $state, $stateParams, $ionicModal, $localStorage, $window, 
                         $ionicLoading, SocialSharingService, ConfigurationService,
                         $ionicActionSheet, AnalyticsService, ErroService, UsuarioService, LocalStorageService, 
                         FeedService, Notification, RootScopeService, FacebookService, MessageService, LembreteService, configuracao) {
        
		//Verificar conexão com a internet
        MessageService.validateConnection($scope, $state);
		
        var vm = this;
        vm.initController = initController;
        vm.initController();
        
        vm.notificacoes = false;
        vm.lembrete = false;
        
        
        
        
        //Recebe notificações específicas para mostrar no feed
        $rootScope.$on('LembreteCtrl.initController', function(event, args){
            vm.initController();
        });
        
        function initController(){
            //Variáveis da view
            vm.configuracao = configuracao; //Configurações do APP
            vm.EventsLoaded = false; //Indica se todos os eventos já foram carregados
            vm.noMoreItemsAvailable = false; //Indica que não há mais itens a carregar - infinite scroll
            vm.itensEvent = []; //Itens da tela
            vm.page = 0; //Página atual - infinite scroll
            vm.key = ""; //Chave de filtro - infinite scroll
            vm.noMoreFeaturedAvailable = true; //Indica que não há mais itens em destaque a carregar  
            vm.time = new Date(); //Data de referência para a página      
            vm.loggedUser = LocalStorageService.GetLoggedUser();
            vm.preferencias = vm.loggedUser.preferencias;
            vm.preferencesLoaded = false;
            vm.oidLembrete = $stateParams.oidLembrete;
            vm.votacao = false;
            
            //Lista lembretes
            vm.noMoreLembretesAvailable = false;
            vm.pageLembretes = 0;
            vm.itensLembrete = [];
            vm.LembretesLoaded= false;    
            vm.sharingPlataforma = false;
            
    
            //Funções da view
            vm.ficha = ficha;
            vm.apagaAmigo = apagaAmigo; //
            vm.like = like; //Função
            vm.comment = comment; //Função
            vm.addComment = addComment; //Função
            vm.deleteComment = deleteComment; //Função
            vm.compartilhar = compartilhar; //Função
            vm.loadMoreEvents = loadMoreEvents; //Função - infinite scroll  
            vm.editPreferences = editPreferences;
            vm.inteiroTeor = inteiroTeor;
            vm.getLembrete = getLembrete; //Obtém lembrete por ID
            vm.loadMoreLembretes = loadMoreLembretes;
            vm.abreLembrete = abreLembrete;
            vm.actionSheet = actionSheet;
            vm.curtirProposicao = curtirProposicao;
            vm.detalheVotacao = detalheVotacao;
            vm.socialShare = socialShare;
            vm.wizard = wizard;
			
            
            //Redirects da view
            vm.advisor = advisor; //Função redirect            
            vm.politicianDetail = politicianDetail; //Função redirect
            vm.searchPanel = searchPanel; //Função redirect
            vm.editProfile = editProfile; //Função redirect

            //Starters
            $ionicModal.fromTemplateUrl("templates/feed/feed-message.html", {
                scope : $scope,
                animation : 'slide-in-up',
                focusFirstInput : true    
            }).then(function(modal){
                vm.modal = modal;   
            }); //Envia mensagem para a notificação
            
            $ionicModal.fromTemplateUrl('detalhe-votacao.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                $scope.modal = modal;
            });            
			
            vm.getLembrete(loadMoreLembretes);
            $scope.$broadcast('scroll.refreshComplete');
        }
        
        function detalheVotacao(){
            $scope.modal.show();
        }        
        
        function socialShare(plataforma){
            vm.sharingPlataforma = plataforma;
            if(window.plugins && window.plugins && window.plugins.socialsharing){
				SocialSharingService.registraShareLembrete(vm.lembrete.oidLembrete, function(success, id){
					if(success){
                        var dadosCompartilhar = {
                            mensagem : vm.lembrete.titulo + " - " + vm.lembrete.chamada,
                            link : (ConfigurationService.desenvolvimento() ? configuracao.urlShareLembreteDev : configuracao.urlShareLembrete) + id
                        };
						SocialSharingService.share(plataforma, dadosCompartilhar, function(success, plataforma){
                            vm.sharingPlataforma = false;
                        });
					}else{
                        vm.sharingPlataforma = false;
                    }
				});
            }else{
                vm.sharingPlataforma = false;
                Notification.error({message: "Apenas na versão para celular.", delay: 5000}); 
            }
        } 
        
        function ficha(id){
            vm.noMoreItemsAvailable = true; 
            $scope.$broadcast('scroll.infiniteScrollComplete');    
            AnalyticsService.trackView("app.ficha");
            $state.go("app.ficha", {id : id});
        }         
        
        function wizard(){
            vm.noMoreItemsAvailable = true; 
            $scope.$broadcast('scroll.infiniteScrollComplete');            
            AnalyticsService.trackView("app.advisor");
            $state.go("wizard-passo-um");
        }  
        
        function actionSheet(lembrete){
            var hideSheet = $ionicActionSheet.show({
                buttons : [
                    { text : '<div><i class="fa fa-fw fa-thumbs-up fa-lg" aria-hidden="true"></i><i class="fa fa-fw fa-check fa-lg" aria-hidden="true"></i><span class="buttom-title">  GOSTEI dos votos SIM</span></div>' },
                    { text : '<div><i class="fa fa-fw fa-thumbs-up fa-lg" aria-hidden="true"></i><i class="fa fa-fw fa-close fa-lg" aria-hidden="true"></i><span class="buttom-title">  GOSTEI dos votos NÃO </span>' },
                    { text : '<div><i class="fa fa-fw fa-thumbs-down fa-lg" aria-hidden="true"></i><i class="fa fa-fw fa-check fa-lg" aria-hidden="true"></i><span class="buttom-title">  NÃO gostei dos votos SIM</span></div>' },
                    { text : '<div><i class="fa fa-fw fa-thumbs-down fa-lg" aria-hidden="true"></i><i class="fa fa-fw fa-close fa-lg" aria-hidden="true"></i><span class="buttom-title">  NÃO gostei dos votos NÃO</span></div>' }
                ],
                cancelText : "<div class='cancelar'>Cancelar</div>",
                buttonClicked : function(index){
                    var curtir = 1;
                    var tipoNotificacao = false;

                    if(index == 0){
                        curtir = 1;
                        tipoNotificacao = 3;
                    }else if(index == 1){
                        curtir = 1;
                        tipoNotificacao = 4;
                    }else if(index == 2){
                        curtir = 0;
                        tipoNotificacao = 3;
                    }else if(index == 3){
                        curtir = 0;
                        tipoNotificacao = 4;
                    }   
                    
                    hideSheet();
                    curtirProposicao(curtir, tipoNotificacao, lembrete, function(){});
                }    
            });
        }    
        
        function curtirProposicao(curtir, tipoNotificacao, lembrete, callback){
            $ionicLoading.show({template : '<ion-spinner class="spinner my-spinner">'});
            LembreteService.curtirProposicao(curtir, tipoNotificacao, lembrete.oidProposicao, function(success, politicos){
                $ionicLoading.hide();
                if(success){
                    vm.initController();
                    callback();
                }else{
                    //Erro
                    callback();   
                    Notification.error({message: "Gostei: não conseguimos completar esta ação.", delay: 5000}); 
                }
            });    
        }
		
        /*
		function openPopover( $event ) {
			vm.popover.show($event);
		}
        */
		
        function loadMoreEvents(){
            vm.page++;
            FeedService.LembreteEvents(vm.page, vm.oidLembrete, function(response){
                if(response){
                    if(response.length == 0){ 
                        vm.noMoreItemsAvailable = true;
                    }else{
                        for (var i = 0; i < response.length; i++) {
                            vm.itensEvent.push(response[i]);
                        }
                    }
                    vm.EventsLoaded = true;
                }else{
                    vm.noMoreItemsAvailable = true;  
                    ErroService.lentidao();
                } 
                $scope.$broadcast('scroll.infiniteScrollComplete');
            });
        }   
        

        
        function loadMoreLembretes(){
            vm.pageLembretes++;
            LembreteService.listar(vm.pageLembretes, function(success, lembretes){
                if(success){
                    if(lembretes.length == 0){ 
                        vm.noMoreLembretesAvailable = true;
                    }else{
                        for (var i = 0; i < lembretes.length; i++) {
                            vm.itensLembrete.push(lembretes[i]);
                        }
                    }
                    vm.LembretesLoaded = true;
                }else{
                    vm.noMoreLembretesAvailable = true;  
                    ErroService.lentidao();
                } 
                $scope.$broadcast('scroll.infiniteScrollComplete');
            });
        }           
        
        function getLembrete(callback){
            if(vm.oidLembrete){
                LembreteService.getLembrete(vm.oidLembrete, function(success, lembrete){
                    if(success){
                        vm.lembrete = lembrete;
                        
                        LembreteService.votacao(vm.lembrete.oidProposicao, function(success, votacao){
                            vm.votacao = votacao;
                        });
                        
                    }else{
                        //erro
                        ErroService.lentidao();
                    }
                    callback();
                });
            }
        }             
        
        function inteiroTeor(event){

            var confirmPopup = $ionicPopup.confirm({
                title: 'Abrir página externa',
                template: 'Você está prestes a sair do Sr.Cidadão para abrir um link no navegador. Continuar?'               
            });

            confirmPopup.then(function(res) {
                if(res) {
                    
                    FeedService.InteiroTeor(event.oidNotificacao, function(response){
                        if(response.success && response.url){
                            if(window.cordova){
                                cordova.InAppBrowser.open(response.url, "_system", "location=yes");
                            }else{
                                window.open(response.url, "_system");
                            }
                            
                        }else{
                            //erro    
                            Notification.error({message: "Inteiro teor: não conseguimos completar esta ação.", delay: 5000}); 
                            
                        }
                    });
                }
            });
        }      
        
        
        //ACTIONS ####################################
        
        function editPreferences(){
            AnalyticsService.trackView("app.user-preferences");
            $state.go("app.user-preferences");
        }                
        
        function like(event){

            var like = event.flgCurtir == 1 ? null : 1; //Se estava curtido, cancela curtida.
            
            if(like == 1) event.loadingLike = true;
            else if(like == 0) event.loadingDislike = true;

            //if(event.flgCurtir == like) like = null; //Cancela

            FeedService.Like(like, event.oidNotificacao, function(response){
                if(response){
                    RootScopeService.registraLikes(event.flgCurtir, like);
                    event.flgCurtir = like;
                    //$rootScope.$broadcast("like-update");
                }else{
                    //erro    
                    Notification.error({message: "Gostei: não conseguimos completar esta ação.", delay: 5000}); 
                }
                event.loadingLike = false;
                event.loadingDislike = false;
                FeedService.likeEmLote(like, event, vm.itensEvent, $scope);
            });

        }   
        
        //COMENTÁRIOS ############################
        function comment(event){            
            vm.event = event;
            FeedService.Comments(event.oidNotificacao, function(response){
                if(response){
                    vm.event.comentarios = response;
                }else{
                    //erro   

                }
            });    
            vm.modal.show();
        }
        
        function addComment(event){
            FeedService.AddComment(event.comentario, event.oidNotificacao, function(response){
                if(response && response.success){
                    vm.event.contaComentarios++;
                    vm.event.comentario = ''; //Limpa texto
                    vm.modal.hide();
                    Notification.success({message: response.message, delay: 2000});
                }else{
                    Notification.error({message: response.message, delay: 2000}); 
                }
            });
        }    
        
        function deleteComment(comentario){
            FeedService.DeleteComment(comentario.oidComentario, function(response){
                if(response && response.success){
                    //Apaga do DOM
                    for(var i = 0; i < vm.event.comentarios.length; i++){
                        if(vm.event.comentarios[i].oidComentario === comentario.oidComentario){
                            vm.event.comentarios.splice(i, 1);
                            vm.event.contaComentarios--;
                            Notification.success({message: response.message, delay: 2000});
                            return;
                        }
                    }
                }else{
                    Notification.error({message: response.message, delay: 2000});  
                }
            });
        }    
        
        function compartilhar(itemEvent){
            itemEvent.loadingShare = true;
           if(window.plugins && window.plugins.socialsharing){
               var plataforma = "";
                //Faz log no sistema do compartilhamento
                FacebookService.notificacaoFb(itemEvent, function(successNotificacao, response, event){
                    
                    if(successNotificacao){
                        var dadosCompartilhar = {
                            mensagem : response.texto,
                            link : response.link + response.id
                        };
                        
                        //Compartilha
                        SocialSharingService.share(plataforma, dadosCompartilhar, function(success, plataforma){
                            itemEvent.loadingShare = false;
                        });
                        
                        
                    }else{
                        Notification.error({message: 'Erro ao compartilhar no facebook.', delay: 2000}); 
                        itemEvent.loadingShare = false;
                    }
                });

            }else{
                itemEvent.loadingShare = false;
                Notification.error({message: "Apenas na versão para celular.", delay: 5000}); 
            }
        }
        
        function callbackPostFb(success, oidFacebookPost, data, event){
            if(!success){
                var msg = "Erro ao compartilhar no facebook.";
                if(data.data && data.data.error && data.data.error.code &&  data.data.error.code == 506) msg = ";-) Esta mensagem foi compartilhada no facebook!";
                Notification.error({message: msg, delay: 2000}); 
            }else{
                //Mensagem enviada para o FB!!!
                //3 - Atualiza o ID fornecido pelo FB no banco local
                FacebookService.setIdPostFeed(oidFacebookPost, data.id, function(success, response){
                    if(success){
                        Notification.success({message: 'Mensagem compartilhada com sucesso!', delay: 2000}); 
                        event.temPostFb = "1";
                    }else{
                        Notification.error({message: 'Erro ao atualizar id do facebook!', delay: 2000});
                    }
                });
                
            }
            event.loadingShare = false;
        }    
		
        function abreLembrete(lembrete){
            AnalyticsService.trackView("app.lembrete");
            $state.go("app.lembrete", {oidLembrete : lembrete.oidLembrete}).then(function(){
                    //$rootScope.$broadcast('FeedCtrl.initController', {lembrete : lembrete});
                }
            );
        }          
        
        function politicianDetail(id){
            AnalyticsService.trackView("app.friend");
            $state.go("app.friend", {id : id});
        }
        
        function searchPanel(){
            AnalyticsService.trackView("wizard-passo-um");
            $state.go("wizard-passo-um");
        }     
        
        function editProfile(){
            var loggedUser = LocalStorageService.GetLoggedUser();
            if(loggedUser && loggedUser.flgFacebook && loggedUser.flgFacebook != "1"){ 
                AnalyticsService.trackView("app.user-profile");
                $state.go("app.user-profile");
            }else{
                AnalyticsService.trackView("app.user-preferences");
                $state.go("app.user-preferences");
            }
        }
        
        function advisor(){
            AnalyticsService.trackView("app.advisor");
            $state.go("app.advisor");
        }      
        
        function reloadFeed(){
            vm.notificacoes = false;
            vm.initController();
        }
        
        //CALLBACKS ###################################################
        
        //Apaga um amigo do feed via DOM
        function apagaAmigo(friend){
            for(var i = 0; i < vm.itensEvent.length; i++){
                if(vm.itensEvent[i].oidPolitico === friend.oidPolitico){
                    vm.itensEvent.splice(i, 1);  
                }
            }
        }                     
    }
})();