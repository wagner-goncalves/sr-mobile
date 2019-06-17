(function () {
    'use strict';

    angular
        .module('SrCidadao')
        .controller('FeedCtrl', Controller);

    function Controller($rootScope, $scope, $state, $stateParams, $ionicModal, $localStorage, $filter, $window, $ionicPopup, PreferenciasService, AnalyticsService, UsuarioService, LocalStorageService, FeedService, Notification, RootScopeService, FacebookService, MessageService, LembreteService, ErroService, SocialSharingService, configuracao) {
        
		//Verificar conexão com a internet
        MessageService.validateConnection($scope, $state);
		
        var vm = this;
        vm.initController = initController;
        vm.initController();
        
        vm.notificacoes = false;
        vm.lembrete = false;
        vm.sharingPlataforma = false;
        
        vm.filtro = {
            proposicoes : true,
            presencas : true,
            gostei : true,
            naogostei : true,
            semavaliacao : true,
            instituicoes : {},
            curtidas : false //Legado
        };
        
        
        //Recebe notificações específicas para mostrar no feed
        $rootScope.$on('FeedCtrl.initController', function(event, args){
            if(args && args.notificacoes) vm.notificacoes = args.notificacoes;
            vm.initController();
        });   
        
        //Atualiza foto
        $scope.$on('FeedCtrl.updatePhoto', function(event, data) {
            updatePhoto();
        });               
        
        
        function initController(){
            //Variáveis da view
            vm.itensFeatured = []; //Guarda destaques
            vm.configuracao = configuracao; //Configurações do APP
            vm.EventsLoaded = false; //Indica se todos os eventos já foram carregados
            vm.noMoreItemsAvailable = false; //Indica que não há mais itens a carregar - infinite scroll
            vm.itensEvent = []; //Itens da tela
            vm.page = 0; //Página atual - infinite scroll
            vm.key = ""; //Chave de filtro - infinite scroll
            vm.noMoreFeaturedAvailable = true; //Indica que não há mais itens em destaque a carregar  
            vm.preferencias = [];
            vm.time = new Date(); //Data de referência para a página      
            vm.loggedUser = LocalStorageService.GetLoggedUser();
            vm.preferencias = vm.loggedUser.preferencias;
            vm.preferencesLoaded = false;
            vm.oidLembrete = $stateParams.oidLembrete;
            
    
            //Funções da view
            vm.featured = featured; //Função
            vm.apagaAmigo = apagaAmigo; //
            vm.like = like; //Função
            vm.comment = comment; //Função
            vm.addComment = addComment; //Função
            vm.deleteComment = deleteComment; //Função
            vm.compartilhar = compartilhar; //Função
            vm.loadMoreEvents = loadMoreEvents; //Função - infinite scroll  
            vm.editPreferences = editPreferences;
            vm.inteiroTeor = inteiroTeor;
            vm.reloadFeed = reloadFeed;
            vm.getLembreteDestaque = getLembreteDestaque; //Recupera último lembrete
            vm.abreLembrete = abreLembrete; //Redireciona para template do lembrete
			vm.lembretes = lembretes;
            vm.aplicaFiltro = aplicaFiltro;
            vm.filtrar = filtrar;
            vm.getInstituicoes = getInstituicoes;
            vm.socialShare = socialShare;
            
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
            vm.getInstituicoes(); //Busca casas ativas
            vm.featured(); //Carrega destaques
            vm.getLembreteDestaque();
            loadMoreEvents(); //Carrega itens iniciais
            FeedService.MarkAsRead(function(){
                $rootScope.$broadcast('MenuCtrl.unread', {});                 
            }); //Marca como lido todos os feeds novos    
            
            //Carrega preferências caso não existam
            $scope.$on('$ionicView.enter', function(event, viewData) {
                preferences();
                vm.noMoreItemsAvailable = false; 
            });
            
            //Zera badge com quantidade de notificações
            if(window.cordova && window.cordova.plugins && window.cordova.plugins.notification){
                cordova.plugins.notification.badge.clear();
            }        
            $scope.$broadcast('scroll.refreshComplete');
        }
        
        function socialShare(plataforma){
            vm.sharingPlataforma = plataforma;
            if(window.plugins && window.plugins && window.plugins.socialsharing){
				SocialSharingService.registraShareApp("app.timeline", function(success, id, mensagemShare, linkShare){
					if(success){
                        var dadosCompartilhar = {
                            mensagem : mensagemShare,
                            link : linkShare
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
      
        function loadMoreEvents(){
            if(vm.notificacoes){
                loadNotificacoes();
            }else if(!vm.lembrete && !vm.notificacoes){
                loadFeed();
            }
        }
        
        function loadFeed(){
            vm.page++;
            FeedService.Events(vm.page, vm.key, 0, function(response){
                if(response){
                    if(response.length == 0){ 
                        vm.noMoreItemsAvailable = true;
                    }else{
                        for (var i = 0; i < response.length; i++) {
                            
                            var temNotificacao = false;
                            for (var j = 0; j < vm.itensEvent.length; j++){
                                if(vm.itensEvent[j].oidNotificacao == response[i].oidNotificacao){
                                    temNotificacao = true;
                                }
                            }
                            if(!temNotificacao && response[i]) vm.itensEvent.push(response[i]);   

                        }
                    }
                    vm.EventsLoaded = true;
                }else{
                    vm.noMoreItemsAvailable = true;  
                    ErroService.lentidao();
                } 
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }, vm.filtro);
        }   

        function filtrar(assunto, instituicao){
            
            var temErro = false;
            
            if(assunto == 'proposicoes'){
                vm.filtro.proposicoes = !vm.filtro.proposicoes;
            }else if(assunto == 'presencas'){
                vm.filtro.presencas = !vm.filtro.presencas;
            } 
            else if(assunto == 'gostei') vm.filtro.gostei = !vm.filtro.gostei;
            else if(assunto == 'semavaliacao') vm.filtro.semavaliacao = !vm.filtro.semavaliacao;
            else if(assunto == 'naogostei') vm.filtro.naogostei = !vm.filtro.naogostei;
            else if(assunto == 'instituicao'){                
                vm.filtro.instituicoes["i" + instituicao].selecionada = !vm.filtro.instituicoes["i" + instituicao].selecionada;
            } 
            
            if(!vm.filtro.proposicoes && !vm.filtro.presencas){
                vm.filtro[assunto] = true;
                Notification({message: "Escolha pelo menos um filtro de notificação.", delay: 3000}); 
                temErro = true;
            } 
            
            if(!vm.filtro.semavaliacao && !vm.filtro.gostei && !vm.filtro.naogostei){
                vm.filtro[assunto] = true;
                Notification({message: "Escolha pelo menos um filtro de avaliação.", delay: 3000}); 
                temErro = true;
            }
            
            var instituicaoSelecionada = false;
            for(var k in vm.filtro.instituicoes){
                if(vm.filtro.instituicoes[k].selecionada){
                   instituicaoSelecionada = true; 
                }
            }  
            if(!instituicaoSelecionada){
                vm.filtro.instituicoes["i" + instituicao].selecionada = true;
                Notification({message: "Escolha pelo menos uma casa.", delay: 3000}); 
                temErro = true;
            }
            if(!temErro){
                vm.page = 0;
                vm.EventsLoaded = false;
                vm.noMoreItemsAvailable = false;
                vm.itensEvent = [];
                loadFeed();
            }
        }
            
        function getInstituicoes(){
            PreferenciasService.instituicoesUsuario(function(response){
                if(response){
                    for(var i = 0; i < response.length; i++){
                        vm.filtro.instituicoes["i" + response[i].oidInstituicao] = response[i];
                        vm.filtro.instituicoes["i" + response[i].oidInstituicao].selecionada = true;
                    }
                }
            });
        }
        
        function aplicaFiltro(){
            vm.page = 0;
            vm.EventsLoaded = false;
            vm.noMoreItemsAvailable = false;
            vm.itensEvent = [];
            loadFeed();
        }
        
        function loadNotificacoes(){
            vm.page++;
            FeedService.LimitedEvents(vm.page, vm.key, 0, vm.notificacoes, function(response){
                if(response){
                    if(response.length == 0){ 
                        vm.noMoreItemsAvailable = true;
                    }else{
                        for (var i = 0; i < response.length; i++) {
                            
                            var temNotificacao = false;
                            for (var j = 0; j < vm.itensEvent.length; j++){
                                if(vm.itensEvent[j].oidNotificacao == response[i].oidNotificacao){
                                    temNotificacao = true;
                                }
                            }
                            if(!temNotificacao && response[i]) vm.itensEvent.push(response[i]);                            
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
        
        function getLembreteDestaque(){
            LembreteService.ultimo(function(success, lembrete){
                if(success){
                    vm.lembreteDestaque = lembrete;
                }else{
                    //erro    
                }
            });
        }     
        
        function updatePhoto(){
            vm.loggedUser = LocalStorageService.GetLoggedUser(); 
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
                            Notification.error({message: "Inteiro Teor: não conseguimos completar esta ação.", delay: 5000}); 
                        }
                    });
                }
            });
        }
        
        function preferences(){
            var loggedUser = LocalStorageService.GetLoggedUser();
            if(!loggedUser.preferencias){
                UsuarioService.Preferencias(function(response){
                    if(response){
                        loggedUser.preferencias = response;
                        LocalStorageService.SetLoggedUser(loggedUser); //Atualiza preferências
                        vm.preferencias = loggedUser.preferencias;
                    }else{
                        //erro    
                    }
                    vm.preferencesLoaded = true;
                });
            }else{
                vm.preferencesLoaded = true;
            }
        }        
        
        
        //ACTIONS ####################################
        
        function editPreferences(){
            vm.noMoreItemsAvailable = true; 
            $scope.$broadcast('scroll.infiniteScrollComplete');    
            AnalyticsService.trackView("app.user-preferences");
            $state.go("app.user-preferences");
        }            

        function featured(){
            vm.itensFeatured = [];
            vm.noMoreFeaturedAvailable = false; 
            FeedService.Featured(function(response){
                if(response){
                    for (var i = 0; i < response.length && vm.itensFeatured.length < 3; i++) {
                        var temPolitico = false;
                        for (var j = 0; j < vm.itensFeatured.length; j++){
                            if(vm.itensFeatured[j].oidPolitico == response[i].oidPolitico){
                                temPolitico = true;
                            }
                        }
                        if(!temPolitico && response[i]) vm.itensFeatured.push(response[i]);                        
                    }
                }
                vm.noMoreFeaturedAvailable = true;
                $scope.$broadcast('scroll.infiniteScrollComplete');
            });
        }       
        
        function like(like, event){

            if(like == 1) event.loadingLike = true;
            else if(like == 0) event.loadingDislike = true;

            if(event.flgCurtir == like) like = null;

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
                if(like != null){
                    FeedService.eventoEmLote(like, event, vm.itensEvent, $scope, function(eventosAlterados){

                        //Apaga itens alterados da timeline
                        angular.forEach(eventosAlterados, function(itemAlterado, index1) {
                            angular.forEach(vm.itensEvent, function(item, index2) {
                                if(itemAlterado.oidNotificacao == item.oidNotificacao){
                                    vm.itensEvent.splice(index2, 1);
                                }
                            });
                        });
                    });
                } 
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
                    Notification.error({message: "Enviar Comentário: não conseguimos completar esta ação.", delay: 5000}); 
                }
            });    
            vm.modal.show();
        }
        
        function addComment(event){
            event.addingComment = true;
            FeedService.AddComment(event, function(response){
                if(response && response.success){
                    vm.event.contaComentarios++;
                    vm.event.comentario = ''; //Limpa texto
                    vm.modal.hide();
                    Notification.success({message: response.message, delay: 4000});
                }else{
                    Notification.error({message: response.message, delay: 4000}); 
                }
                event.addingComment = false;
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
                var mensagem = "";
                if(event.error && event.error.data.error && event.error.data.error.code == 200){
                    mensagem += "Por favor, reveja suas permissões de compartilhamento no facebook.";
                }
                
                var msg = "Erro ao compartilhar no facebook. " + mensagem;
                if(data.data && data.data.error && data.data.error.code &&  data.data.error.code == 506) msg = ";-) Esta mensagem foi compartilhada no facebook!";
                Notification.error({message: msg, delay: 5000}); 
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
        
        function politicianDetail(id){ 
            vm.noMoreItemsAvailable = true; 
            $scope.$broadcast('scroll.infiniteScrollComplete');
            AnalyticsService.trackView("app.friend");
            $state.go("app.friend", {id : id});
        }
        
        function searchPanel(){
            vm.noMoreItemsAvailable = true; 
            $scope.$broadcast('scroll.infiniteScrollComplete');
            AnalyticsService.trackView("wizard-passo-um");
            $state.go("wizard-passo-um");
        }     
        
        function editProfile(){
            vm.noMoreItemsAvailable = true; 
            $scope.$broadcast('scroll.infiniteScrollComplete');
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
            vm.noMoreItemsAvailable = true; 
            $scope.$broadcast('scroll.infiniteScrollComplete');            
            AnalyticsService.trackView("app.advisor");
            $state.go("app.advisor");
        }      
        
        function reloadFeed(){
            vm.notificacoes = false;
            vm.initController();
            
        }      
        
        function abreLembrete(lembrete){
            vm.noMoreItemsAvailable = true; 
            $scope.$broadcast('scroll.infiniteScrollComplete');            
            AnalyticsService.trackView("app.lembrete");
            if(lembrete.oidLembrete && lembrete.oidLembrete != 0){
                $state.go("app.lembrete", {oidLembrete : lembrete.oidLembrete});
            }else if(lembrete.oidProposicao){ //Cria lembrete se não existe ainda
                LembreteService.cria(lembrete.oidProposicao, function(success, oidLembrete){
                    if(success){
                        $state.go("app.lembrete", {oidLembrete : oidLembrete});
                    }
                });
            }
        }    
		
        function lembretes(){
            vm.noMoreItemsAvailable = true; 
            $scope.$broadcast('scroll.infiniteScrollComplete');            
            AnalyticsService.trackView("app.lembretes");
            $state.go("app.lembretes");
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