(function () {
    'use strict';

    angular
        .module('SrCidadao')
        .controller('TimeLineCtrl', Controller);

    function Controller($rootScope, $scope, $state, $stateParams, $ionicLoading, 
                         $ionicModal, $localStorage, $filter, $window, $ionicPopup, 
                         PreferenciasService, AnalyticsService, UsuarioService, LocalStorageService, 
                         FeedService, Notification, RootScopeService, FacebookService, PoliticoService,
                         MessageService, LembreteService, ErroService,
                         SocialSharingService, QuizService, MachineLearnigService, InfoService, configuracao) {
        
		//Verificar conexão com a internet
        MessageService.validateConnection($scope, $state);
		
        var vm = this;
        vm.initController = initController;
        vm.initController();
        
        function initController(){
            vm.configuracao = configuracao;
            //MODAL MENSAGEM #############################
            $ionicModal.fromTemplateUrl("templates/feed/feed-message.html", {
                scope : $scope,
                animation : 'slide-in-up',
                focusFirstInput : true    
            }).then(function(modal){
                vm.modal = modal;   
            });   
            
            //Variáveis da view
            
            initFiltro();


            var localFilter = LocalStorageService.GetFiltroFeed();
            
            if(localFilter){
                vm.filtro = localFilter;
            }else{
                vm.filtro = {
                    proposicoes : true,
                    presencas : true,
                    gostei : true,
                    naogostei : true,
                    semavaliacao : true,
                    comavaliacao : true,
                    instituicoes : {},
                    curtidas : false //Legado
                };
            }
            
            vm.abaAtiva = "votacoes";
            
            vm.ProposicoesLoaded = false; //Indica se todos os eventos já foram carregados
            vm.EventsLoaded = false; //Indica se todos as presenças já foram carregadas
            vm.loggedUser = LocalStorageService.GetLoggedUser();
            vm.preferencias = vm.loggedUser.preferencias;
            vm.sharingPlataforma = false;
            vm.quizzes = [];
            vm.representantes = [];
            vm.itensEvent = []; //Presença
            vm.quiz = quiz;
            vm.searchText = "";

            vm.isCollapsedRepresentantes = LocalStorageService.GetOpenCloseRepresentante();
            
            //Redirects da view
            vm.advisor = advisor; //Função redirect            
            vm.politicianDetail = politicianDetail; //Função redirect
            vm.searchPanel = searchPanel; //Função redirect
            vm.editProfile = editProfile; //Função redirect
            vm.editPreferences = editPreferences;
            vm.wizard = wizard;
            vm.clearText = clearText;
            
            //Funções
            vm.getInstituicoes = getInstituicoes;
            vm.filtrar = filtrar;
            vm.loadProposicoes = loadProposicoes;
            vm.loadMoreProposicoes = loadMoreProposicoes; //Função - infinite scroll  
            vm.loadMoreAssiduidade = loadMoreAssiduidade;
            vm.detalharProposicao = detalharProposicao;
            vm.inteiroTeor = inteiroTeor;
            vm.markAnswer = markAnswer;
            vm.socialShare = socialShare;
            vm.votosProposicao = votosProposicao;
            vm.getQuizzes = getQuizzes;
            vm.getRepresentantes = getRepresentantes;
            vm.votacoes = votacoes;
            vm.assiduidades = assiduidades;
            vm.like = like;
            vm.openCloseRepresentantes = openCloseRepresentantes;
            
            //############### Código duplicado
            vm.comment = comment;
            vm.addComment = addComment;
            vm.deleteComment = deleteComment;
            vm.compartilhar = compartilhar; //Função
            
            var curtidas = parseInt($rootScope.userInfo.curtidas);
            var descurtidas = parseInt($rootScope.userInfo.descurtidas);

            vm.opinioes = curtidas + descurtidas;
            
            //Starters
            vm.getInstituicoes(); //Busca casas ativas
            loadMoreProposicoes(); //Carrega itens iniciais
            //vm.getQuizzes();
            vm.getRepresentantes();
            
            $ionicModal.fromTemplateUrl('detalhe-proposicao.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                $scope.modal = modal;
            });  

            
        }

        function openCloseRepresentantes(){
            vm.isCollapsedRepresentantes = !vm.isCollapsedRepresentantes;
            LocalStorageService.SetOpenCloseRepresentante(vm.isCollapsedRepresentantes);
        }

        function clearText(){
            vm.searchText = "";
            vm.filtro.searchText = "";
            vm.filtrar();
        }
        
        function initFiltro(){
            vm.page = 0; //Página atual - infinite scroll
            vm.key = ""; //Chave de filtro - infinite scroll
            vm.noMoreItemsAvailable = false; //Indica que não há mais itens a carregar - infinite scroll            
            vm.itensProposicoes = []; //Itens da tela
            vm.itensEvent = []; //Presença
            vm.ProposicoesLoaded = false; //Indica se todos os eventos já foram carregados   
            vm.EventsLoaded = false;
        }
        
        function votacoes(){
            vm.abaAtiva = "votacoes";
            initFiltro();
            
            vm.filtro.proposicoes = true;
            vm.filtro.presencas = false;
            vm.filtrar("proposicoes");
        }
        
        function assiduidades(){
            vm.abaAtiva = "assiduidades";
            initFiltro();
            
            vm.filtro.proposicoes = false;
            vm.filtro.presencas = true;
            vm.filtrar("presencas");
        }
        
        function loadMoreProposicoes(){
            loadProposicoes();
        }
        
        function loadMoreAssiduidade(){
            loadFeed();
        }
        
        function loadProposicoes(){
            vm.page++;
            FeedService.proposicoes(vm.page, vm.key, 0, function(response){
                if(response && response.success){
                    if(response.proposicoes.length == 0){ 
                        vm.noMoreItemsAvailable = true;
                    }else{
                        for (var i = 0; i < response.proposicoes.length; i++) {
                            var temProposicao = false;
                            for (var j = 0; j < vm.itensProposicoes.length; j++){
                                if(vm.itensProposicoes[j].oidProposicao == response.proposicoes[i].oidProposicao){
                                    temProposicao = true;
                                }
                            }
                            if(!temProposicao && response.proposicoes[i]) vm.itensProposicoes.push(response.proposicoes[i]);   
                        }
                    }
                    vm.ProposicoesLoaded = true;
                }else{
                    vm.noMoreItemsAvailable = true;  
                    ErroService.lentidao();
                } 
                $scope.$broadcast('scroll.infiniteScrollComplete');
                $scope.$broadcast('scroll.refreshComplete');
            }, vm.filtro);
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
                        //console.log(vm.itensEvent);
                    }
                    vm.EventsLoaded = true;
                }else{
                    vm.noMoreItemsAvailable = true;  
                    ErroService.lentidao();
                } 
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }, vm.filtro);
        }  
        
       function socialShare(plataforma){
            vm.sharingPlataforma = plataforma;
           
            //console.log(window.plugins.socialsharing);
            //console.log(JSON.stringify(window.plugins));
           
            if(window.plugins && window.plugins.socialsharing){
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
        
        function detalharProposicao(proposicao){
            vm.proposicaoDetalhe = proposicao;
            var aux = vm.proposicaoDetalhe.dataHoraEvento.split(/[- :]/);
            vm.proposicaoDetalhe.dataHoraEvento = new Date(aux[0], aux[1]-1, aux[2], aux[3], aux[4], aux[5]);
            $scope.modal.show();
        }  
        
        function advisor(){
            vm.noMoreItemsAvailable = true; 
            $scope.$broadcast('scroll.infiniteScrollComplete');            
            AnalyticsService.trackView("app.advisor");
            $state.go("app.advisor");
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
        
        function editPreferences(){
            vm.noMoreItemsAvailable = true; 
            $scope.$broadcast('scroll.infiniteScrollComplete');    
            AnalyticsService.trackView("app.user-preferences");
            $state.go("app.user-preferences");
        }    
        
        function getInstituicoes(){

            var localFilter = LocalStorageService.GetFiltroFeed();
            PreferenciasService.instituicoes(function(response){
                if(response){
                    for(var i = 0; i < response.length; i++){
                        
                        var selecionado = true;
                        if(localFilter && localFilter.instituicoes["i" + response[i].oidInstituicao] && localFilter.instituicoes["i" + response[i].oidInstituicao].selecionada != true){
                            vm.filtro.instituicoes["i" + response[i].oidInstituicao].selecionada = false;
                        }else{
                            vm.filtro.instituicoes["i" + response[i].oidInstituicao] = response[i];
                            vm.filtro.instituicoes["i" + response[i].oidInstituicao].selecionada = true;
                        }
                    }
                    
                }
            });
        }

        function getRepresentantes(){

            var localFilter = LocalStorageService.GetFiltroFeed();
            var representantesAntigos = angular.copy(vm.representantes);

            PoliticoService.representantes(function(success, representantes){

                if(success){

                    var filtroRepresentantes = [];

                    if(!localFilter) localFilter = vm.filtro;                  

                    for(var i = 0; i < representantes.length; i++){
                        if(localFilter.instituicoes["i" + representantes[i].oidInstituicao] && 
                            localFilter.instituicoes["i" + representantes[i].oidInstituicao].selecionada == true){
                            filtroRepresentantes.push(representantes[i]);
                        }
                    }

                    vm.representantes = filtroRepresentantes;

                    for(var i = 0; i < representantesAntigos.length; i++){
                        for(var j = 0; j < vm.representantes.length; j++){
                            if(representantesAntigos[i].oidInstituicao == vm.representantes[j].oidInstituicao){
                                for(var k = 0; k < representantesAntigos[i].representantes.length; k++){
                                    for(var l = 0; l < vm.representantes[j].representantes.length; l++){
                                        if(representantesAntigos[i].representantes[k].oidPolitico != vm.representantes[j].representantes[l].oidPolitico){
                                            Notification({message: 
                                                //'<img class="media-left thumbnail" check-image-politico="" src="' + vm.configuracao.baseImagemPolitico + vm.representantes[j].representantes[l].arquivoFotoLocal + '">' + 
                                                vm.representantes[j].nome + " - Quem te representa? Primeira posição do ranking de políticos atualizado! "
                                                //vm.representantes[j].representantes[l].politico + " " + 
                                                //vm.representantes[j].representantes[l].sigla + "-" + vm.representantes[j].representantes[l].uf 
                                            , delay: 5000}); 
                                            break;
                                        }
                                    }
                                }
                                break;
                            }
                        }
                    }
                }
            });
        }        
        
        function getQuizzes(){
            QuizService.getQuizzes(function(success, response){
                if(success){
                    vm.quizzes = response.quizzes;
                    
                }
            });
        }
        
        function filtrar(assunto, instituicao){
            
            var temErro = false;
            vm.filtro.searchText = vm.searchText;
            if(assunto == 'proposicoes'){
                vm.filtro.proposicoes = true;
                vm.filtro.presencas = false;
                if(!isNaN(instituicao)){
                    vm.filtro.instituicoes["i" + instituicao].selecionada = !vm.filtro.instituicoes["i" + instituicao].selecionada;
                } 
            }else if(assunto == 'presencas'){
                vm.filtro.proposicoes = false;
                vm.filtro.presencas = true;
                if(!isNaN(instituicao)){
                    vm.filtro.instituicoes["i" + instituicao].selecionada = !vm.filtro.instituicoes["i" + instituicao].selecionada;
                } 
            } 
            else if(assunto == 'gostei') vm.filtro.gostei = !vm.filtro.gostei;
            else if(assunto == 'semavaliacao') vm.filtro.semavaliacao = !vm.filtro.semavaliacao;
            else if(assunto == 'comavaliacao') vm.filtro.comavaliacao = !vm.filtro.comavaliacao;
            else if(assunto == 'naogostei') vm.filtro.naogostei = !vm.filtro.naogostei;
            else if(assunto == 'instituicao'){                
                vm.filtro.instituicoes["i" + instituicao].selecionada = !vm.filtro.instituicoes["i" + instituicao].selecionada;
            } 
            
            if(!vm.filtro.proposicoes && !vm.filtro.presencas){
                vm.filtro[assunto] = true;
                Notification({message: "Escolha pelo menos um filtro de notificação.", delay: 3000}); 
                temErro = true;
            } 
            
            if(!vm.filtro.semavaliacao && !vm.filtro.comavaliacao){
                vm.filtro[assunto] = true;
                Notification({message: "Escolha pelo menos um filtro de resposta.", delay: 3000}); 
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
                vm.ProposicoesLoaded = false;
                vm.noMoreItemsAvailable = false;
                vm.itensProposicoes = [];
                vm.itensEvent = [];
                if(assunto == 'proposicoes' || assunto == 'semavaliacao' || assunto == 'comavaliacao'){
                    loadProposicoes();
                } 
                else if(assunto == 'presencas'){
                    loadFeed();
                } 
                LocalStorageService.SetFiltroFeed(vm.filtro);
                vm.getRepresentantes();
            }
        }
        
        function markAnswer(tiponotificacao, proposicao){
            $ionicLoading.show({template : '<ion-spinner class="spinner my-spinner">'});
            
            FeedService.marcaProposicao(tiponotificacao, proposicao.oidProposicao, function(success, resposta){
                if(success){

                    FeedService.LikeVotacaoEmLote(1, tiponotificacao, proposicao.oidProposicao, function(success){
                        if(success){
                            proposicao.oidTipoNotificacao = tiponotificacao;
                            //Apaga itens alterados da timeline
                            angular.forEach(vm.itensProposicoes, function(item, index) {
                                if(proposicao.oidProposicao == item.oidProposicao){
                                    vm.itensProposicoes.splice(index, 1);
                                    $ionicLoading.hide();
                                }
                            });

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
                                            vm.getRepresentantes();
                                        }
                                    );
                                }
                            });

                        }else{
                            $ionicLoading.hide();
                            Notification.error({message: 'Não conseguimos registrar esta ação.', delay: 4000}); 
                        }
                        
                    });                    
                    

                 
                    
                }else{
                    Notification.error({message: 'Não conseguimos registrar esta ação.', delay: 4000}); 
                }
                $ionicLoading.hide();
            });
        }    

        function inteiroTeor(url){
            
            $scope.modal.hide();
            
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
                }
            });
        }
        
        function wizard(){
            vm.noMoreItemsAvailable = true; 
            $scope.$broadcast('scroll.infiniteScrollComplete');            
            AnalyticsService.trackView("app.advisor");
            $state.go("wizard-passo-um");
        }  
        
        function votosProposicao(proposicao){
            LembreteService.cria(proposicao.oidProposicao, function(success, oidLembrete){
                if(success){
                    $state.go("app.lembrete", {oidLembrete : oidLembrete});
                }
            });
        }
        
        function quiz(id){
            $state.go("app.quiz-intro", {id : id});
        }
        
        
        
        
        
        
        //################# código duplicado :-(
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
        
    }
})();