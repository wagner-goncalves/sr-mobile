(function () {
    'use strict';

    angular
        .module('SrCidadao')
        .controller('SearchCtrl', Controller);

    function Controller($scope, $rootScope, $state, $stateParams, AnalyticsService, LocalStorageService, RootScopeService, SearchService, UsuarioService, Notification, MessageService, configuracao) {
		//Verificar conexão com a internet
        MessageService.validateConnection($scope, $state);   

        var vm = this;
        vm.initController = initController;
        vm.initController();

        function initController() {
            //Funções
            vm.loadMoreSearch = loadMoreSearch;
            vm.adicionarAmizade = adicionarAmizade;
            vm.excluirAmizade = excluirAmizade;        
            vm.politicianDetail = politicianDetail;
            vm.loadMorePoliticos = loadMorePoliticos;
            vm.loadMoreSearch = loadMoreSearch;
            vm.loadMoreSearchPartido = loadMoreSearchPartido;
            vm.getInfo = getInfo    ;

            //Redirects
            vm.searchPanel = searchPanel;
            vm.searchPartidoPanel = searchPartidoPanel;  
            vm.editPreferences = editPreferences;      
            
            //Variáveis
            vm.estados = [];
            vm.configuracao = configuracao;
            vm.sigla = $stateParams.sigla != undefined ? $stateParams.sigla : "";   
            vm.noMorePoliticosAvailable = false;
            vm.itemsPoliticos = [];
            vm.itemsPartidos = [];
            vm.page = 0;
            vm.key = "";
            vm.requests = [];
            vm.canceler = null; 
            vm.info = null;
                
            //Listeners
            $rootScope.$on('ProfileCtrl.update', function(event, data) {
                loadMoreSearch();
            });   
            
            vm.getInfo();
        }             
        
        function searchPanel(){
            AnalyticsService.trackView("app.search");
            $state.go("app.search");
        }
        
        function searchPartidoPanel(partido){
            AnalyticsService.trackView("app.search-partido");
            $state.go("app.search-partido", {sigla : partido.sigla});
        }  
        
        function editPreferences(){
            AnalyticsService.trackView("app.user-preferences");
            $state.go("app.user-preferences");
        }               

             
        //Busca comum
        function loadMoreSearch(){
            vm.noMorePoliticosAvailable = false;    
            vm.itemsPoliticos = [];    
            //vm.itemsPartidos = [];            
            vm.page = 0;
            loadMorePoliticos(true);
            //loadMorePartidos();
        }
        
        //Busca no filtro do partido
        function loadMoreSearchPartido(){
            /*
            vm.noMorePoliticosAvailable = false;
            vm.page++;
            loadMorePartidos();
            $scope.$broadcast('scroll.infiniteScrollComplete'); 
            */
        }
        
        function loadMorePoliticos(umaPagina){
            vm.page++;
            vm.noMorePoliticosAvailable = false;
            SearchService.Politicos(vm.page, vm.key, vm.sigla, function(response){
                if(response){
                    if(response.length == 0){ 
                        vm.noMorePoliticosAvailable = true;
                    }else{
                        if(vm.page == 1) vm.friends = [];
                        for (var i = 0; i < response.length; i++) {
                            var temPolitico = false;
                            for (var j = 0; j < vm.itemsPoliticos.length; j++){
                                if(vm.itemsPoliticos[j].oidPolitico == response[i].oidPolitico){
                                    temPolitico = true;
                                }
                            }
                            if(!temPolitico && response[i]) vm.itemsPoliticos.push(response[i]);
                        }
                    }
                }else{
                    vm.noMorePoliticosAvailable = true;
                }
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }); 
        }
        
        function loadMorePartidos(){
            SearchService.Partidos(vm.page, vm.key, function(response){
                if(response){
                    if(response.length == 0){ 
                        vm.noMorePartidosAvailable = true;
                    }else{
                        for (var i = 0; i < response.length; i++) {
                            vm.itemsPartidos.push(response[i]);
                        }
                    }
                }else{
                    //erro    
                } 
            });     
        }
        
        function addLog(adicionar, politico){
            var busca = {
                oidPolitico : politico.oidPolitico,
                oidInstituicao : politico.oidInstituicao,
                keyWord : vm.key,
                flgAdicionar : adicionar
            };            
            SearchService.LogSearch(busca, function(){});   
        }
        
        function adicionarAmizade(politico){
            addLog(true, politico);
            UsuarioService.AdicionarAmizade(politico.oidPolitico, function(success, response){
                if(success){
                    politico.seguindo = 1;
                    RootScopeService.addFriend();
                    $rootScope.$broadcast("friends-update");
                }else{
                    Notification.error({message: response.message, delay: 2000});
                }
            });
            return true;
        }    
        
        function excluirAmizade(politico){
            addLog(false, politico);
            UsuarioService.ExcluirAmizade(politico.oidPolitico, function(success, response){
                if(success){
                    politico.seguindo = 0;
                    RootScopeService.subtraiFriend();
                    $rootScope.$broadcast("friends-update");
                }else{
                    Notification.error({message: response.message, delay: 2000});
                }
            });
            return true;
        }           
        
        function politicianDetail(politico){
            var busca = {
                oidPolitico : politico.oidPolitico,
                oidInstituicao : politico.oidInstituicao,
                keyWord : vm.key,
                flgDetalhar : 1
            };            
            SearchService.LogSearch(busca, function(){});
            AnalyticsService.trackView("app.friend");
            $state.go("app.friend", {id : politico.oidPolitico});
        } 
        
        function getInfo(){       
            SearchService.Info(function(response){
                vm.info = response;
            });
        }         
               
    }

})();