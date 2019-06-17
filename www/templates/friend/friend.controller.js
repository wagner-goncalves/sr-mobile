(function () {
    'use strict';

    angular
        .module('SrCidadao')
        .controller('FriendCtrl', Controller);

    function Controller($scope, $rootScope, $state, $ionicModal, $stateParams, $ionicPopup, PreferenciasService, 
                         SocialSharingService, AnalyticsService, InfoService, MachineLearnigService, ErroService, FacebookService, FeedService, PoliticoService, UsuarioService, RootScopeService, LembreteService, Notification, configuracao) {

        var vm = this;
        vm.initController = initController;
        vm.initController();   
        
        vm.filtro = {
            proposicoes : true,
            presencas : true,
            gostei : true,
            naogostei : true,
            semavaliacao : true,
            instituicoes : {},
            curtidas : false //Legado
        };

        function initController(){
                
    
            //MODAL MENSAGEM #############################
            $ionicModal.fromTemplateUrl("templates/feed/feed-message.html", {
                scope : $scope,
                animation : 'slide-in-up',
                focusFirstInput : true    
            }).then(function(modal){
                vm.modal = modal;   
            });        
            
            
            vm.itensFeatured = [];
            vm.configuracao = configuracao;
    
            vm.apagaAmigo = apagaAmigo;
            vm.like = like;
            
            vm.comment = comment;
            vm.addComment = addComment;
            vm.deleteComment = deleteComment;
            vm.compartilhar = compartilhar; //Função
            
            vm.politicianDetail = politicianDetail;
            vm.excluirAmizade = excluirAmizade;
            vm.adicionarAmizade = adicionarAmizade;
            vm.searchPanel = searchPanel;
            vm.advisor = advisor;
            vm.inteiroTeor = inteiroTeor;
            vm.markAnswer = markAnswer;
            
            vm.abreLembrete = abreLembrete;
            vm.aplicaFiltro = aplicaFiltro;
            vm.filtrar = filtrar;
            vm.ficha = ficha;
            vm.rating = 0;
            
            vm.time = new Date();
            
            //SCROLL ####################################
            
            vm.registraRating = registraRating;
            vm.loadMoreEvents = loadMoreEvents;
            vm.noMoreItemsAvailable = false;
            vm.itensEvent = [];
            vm.page = 0;
            vm.key = "";
            vm.eventosProcessados = false;   
            vm.detailLoaded = false;  
            vm.contadoresLoaded = false;  
            vm.idPolitico = $stateParams.id;
            
            loadMoreEvents();   
            
            PoliticoService.detailSlim($stateParams.id, function(response){
                vm.contadores = false;  
                if(response){
                    vm.politico = response;   
                    
                    //Obter contadores
                    PoliticoService.contadores($stateParams.id, function(response){
                        if(response){
                            vm.politico.seguindo = response.seguindo;
                            vm.politico.seguidores = response.seguidores;
                            vm.politico.notificacoes = response.notificacoes;
                            vm.politico.curtidas = response.curtidas;
                            vm.politico.descurtidas = response.descurtidas;
                            vm.politico.curtidasTotais = response.curtidasTotais;
                            vm.politico.descurtidasTotais = response.descurtidasTotais;
                        }else{
                            //erro    
                        }
                        vm.contadoresLoaded = true;  
                    }); 
                    
                }else{
                    //erro    
                }
                vm.detailLoaded = true;
                $scope.$broadcast('scroll.refreshComplete');
            });    
            
            PoliticoService.getRating($stateParams.id, function(response){
                if(response && response.success){
                    vm.rating = response.notapolitico.nota;                
                }
            });
            
            $scope.$on('$ionicView.enter', function(event, viewData) {
                vm.noMoreItemsAvailable = false; 
            });
            
            
            
        }

        function markAnswer(tiponotificacao, proposicao){
            FeedService.marcaProposicao(tiponotificacao, proposicao.oidProposicao, function(success, resposta){
                if(success){
                    InfoService.usuario(function(success, usuario){
                        if(success){
                            //Atualiza político mais aderente
                            MachineLearnigService.predicoes(
                                {
                                    id : usuario.id,
                                    flgMeusPoliticos : 1,
                                    quiz : 0,
                                    instituicao : proposicao.oidInstituicao
                                }, function(success){

                                }
                            );
                        }
                    });
                }
            });
        }            

        function registraRating(nota){
            PoliticoService.setRating($stateParams.id, nota, function(response){
                if(response && response.success){
                    vm.rating = response.nota;                
                }
            });
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
        
        function loadMoreEvents(){

            vm.page++;
            FeedService.Events(vm.page, vm.key, $stateParams.id, function(response){
                if(response){
                    if(response.length == 0){ 
                        vm.noMoreItemsAvailable = true;
                    }else{
                        vm.noMoreItemsAvailable = false;
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
                    vm.eventosProcessados = true;
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

            if(!temErro){
                vm.page = 0;
                vm.eventosProcessados = false;
                vm.noMoreItemsAvailable = false;
                vm.itensEvent = [];
                loadMoreEvents();
            }
        }
        
        function aplicaFiltro(){
            vm.page = 0;
            vm.noMoreItemsAvailable = false;
            vm.eventosProcessados = false;
            vm.itensEvent = [];
            loadMoreEvents();
        }        
        
        //ACTIONS ####################################
        
        vm.politico = {};
        
        function searchPanel(){
            vm.noMoreItemsAvailable = true; 
            $scope.$broadcast('scroll.infiniteScrollComplete');                
            AnalyticsService.trackView("wizard-passo-um");
            $state.go("wizard-passo-um");
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

                //vm.markAnswer(event.oidTipoNotificacao, {oidProposicao : event.oidProposicao});

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
                if(response){
                    //Apaga do DOM
                    for(var i = 0; i < vm.event.comentarios.length; i++){
                        if(vm.event.comentarios[i].oidComentario === comentario.oidComentario){
                            vm.event.comentarios.splice(i, 1);
                            vm.event.contaComentarios--;
                            return;
                        }
                    }
                }else{
                    //erro  
                    Notification.error({message: "Excluir comentário: não conseguimos completar esta ação.", delay: 5000}); 
                }
            });
        }    
        
        function abreLembrete(lembrete){
            vm.noMoreItemsAvailable = true; 
            $scope.$broadcast('scroll.infiniteScrollComplete');                
            AnalyticsService.trackView("app.lembrete");
            if(lembrete.oidLembrete){
                $state.go("app.lembrete", {oidLembrete : lembrete.oidLembrete});
            }else if(lembrete.oidProposicao){ //Cria lembrete se não existe ainda
                LembreteService.cria(lembrete.oidProposicao, function(success, oidLembrete){
                    if(success){
                        $state.go("app.lembrete", {oidLembrete : oidLembrete});
                    }
                });
            }
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

        function excluirAmizade(politico){
            UsuarioService.ExcluirAmizade(politico.oidPolitico, function(success, response){
                if(success){
                    politico.seguindo = 0;
                    politico.seguidores--;
                    RootScopeService.subtraiFriend();
                    $rootScope.$broadcast("friends-update");
                }else{
                    Notification.error({message: response.message, delay: 2000});
                }
            });
            return true;
        }   
        
        function adicionarAmizade(politico){ 
            UsuarioService.AdicionarAmizade(politico.oidPolitico, function(success, response){
                if(success){
                    politico.seguindo = 1;
                    politico.seguidores++;
                    RootScopeService.addFriend();
                    $rootScope.$broadcast("friends-update");
                    
                    vm.page = 0;
                    vm.key = "";
                    vm.eventosProcessados = false;   
                    vm.noMoreItemsAvailable = false;
                    loadMoreEvents();
                }else{
                    Notification.error({message: response.message, delay: 2000});   
                }
            });
            return true;
        }                    
        
        function politicianDetail(id){
            vm.noMoreItemsAvailable = true; 
            $scope.$broadcast('scroll.infiniteScrollComplete');    
            AnalyticsService.trackView("app.friend");
            $state.go("app.friend", {id : id});
        }             
        
        function advisor(){
            vm.noMoreItemsAvailable = true; 
            $scope.$broadcast('scroll.infiniteScrollComplete');    
            AnalyticsService.trackView("app.advisor");
            $state.go("app.advisor");
        } 
        
        function ficha(id){
            vm.noMoreItemsAvailable = true; 
            $scope.$broadcast('scroll.infiniteScrollComplete');    
            AnalyticsService.trackView("app.ficha");
            $state.go("app.ficha", {id : id});
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