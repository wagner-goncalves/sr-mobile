(function () {
    'use strict';

    angular
        .module('SrCidadao')
        .factory('FeedService', FeedService);    
        
    function FeedService($q, $http, $localStorage, $filter, $ionicPopup, Notification, MessageService, LocalStorageService, configuracao, ConfigurationService) {  
    
        var service = {};

        service.proposicoes = proposicoes;
        
        service.Events = Events;
        service.LimitedEvents = LimitedEvents;
        service.Featured = Featured;
        service.Like = Like;
        service.AddComment = AddComment;
        service.Comments = Comments;   
        service.DeleteComment = DeleteComment;    
        service.MarkAsRead = MarkAsRead;  
        service.Unread = Unread;    
        service.Stats = Stats;   
        service.InteiroTeor = InteiroTeor; 
        service.LembreteEvents = LembreteEvents; 
        service.LikePresencaEmLote = LikePresencaEmLote;
        service.LikePresencaEmLoteExclusivo = LikePresencaEmLoteExclusivo;
        service.LikeVotacaoEmLoteExclusivo =LikeVotacaoEmLoteExclusivo;
        service.LikeVotacaoEmLote = LikeVotacaoEmLote;
        service.eventoEmLote = eventoEmLote;
        service.marcaProposicao = marcaProposicao;
        service.likeEmLote = likeEmLote;

        return service;
        
        
        function proposicoes(page, key, politico, callback, filtro){ 
            var urlFiltro = "";
            if(filtro){ 
                urlFiltro = "&proposicoes=" + filtro.proposicoes + 
                    "&presencas=" + filtro.presencas + 
                    "&curtidas=" + filtro.curtidas + 
                    "&gostei=" + filtro.gostei + 
                    "&naogostei=" + filtro.naogostei + 
                    "&semavaliacao=" + filtro.semavaliacao + 
                    "&comavaliacao=" + filtro.comavaliacao + 
                    "&searchText=" + filtro.searchText;
                if(filtro.instituicoes){
                    for(var k in filtro.instituicoes){
                        if(filtro.instituicoes[k].selecionada) urlFiltro += "&instituicao[]=" + filtro.instituicoes[k].oidInstituicao;
                    }
                }
            }
                
            $http.get(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/feed/proposicoes?page=' + page + "&key=" + key + "&id=" + politico + urlFiltro)
                .success(function(response) {
                    if (response) {
                        callback(response);
                    } else {
                        callback(false);
                    }
                })
                .error(function() { //Erro
                    callback(false);
                });
        }  
        

        function LembreteEvents(page, oidLembrete, callback){ 
            var params = {
                page : page,
                oidLembrete : oidLembrete
            };

            $http.get(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/feed/lembrete-events', {
                    params : params
                })
                .success(function(response) {
                    if (response) {
                        callback(response);
                    } else {
                        callback(false);
                    }
                })
                .error(function() { //Erro
                    callback(false);
                });
        }             
    
        function LimitedEvents(page, key, politico, notificacoes, callback){ 
            $http.get(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/feed/events', {
                    params : {
                        page : page,
                        key : key,
                        id : politico,
                        'notificacoes[]' : notificacoes
                    }
                })
                .success(function(response) {
                    if (response) {
                        callback(response);
                    } else {
                        callback(false);
                    }
                })
                .error(function() { //Erro
                    callback(false);
                });
        }         
        
        function Events(page, key, politico, callback, filtro){ 
            var urlFiltro = "";
            if(filtro){ 
                urlFiltro = "&proposicoes=" + filtro.proposicoes + 
                    "&presencas=" + filtro.presencas + 
                    "&curtidas=" + filtro.curtidas + 
                    "&gostei=" + filtro.gostei + 
                    "&naogostei=" + filtro.naogostei + 
                    "&semavaliacao=" + filtro.semavaliacao;
                if(filtro.instituicoes){
                    for(var k in filtro.instituicoes){
                        if(filtro.instituicoes[k].selecionada) urlFiltro += "&instituicao[]=" + filtro.instituicoes[k].oidInstituicao;
                    }
                }
            }
                
            $http.get(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/feed/events?page=' + page + "&key=" + key + "&id=" + politico + urlFiltro)
                .success(function(response) {
                    if (response) {
                        callback(response);
                    } else {
                        callback(false);
                    }
                })
                .error(function() { //Erro
                    callback(false);
                });
        }        
    
        function Featured(callback){   
            if(!$localStorage.Featured) $localStorage.Featured = {};//Inicia cache, caso não exista 
            var items = $localStorage.Featured; //Cache
             
            if(!MessageService.isOnline()){ //Offline
                callback(items ? items : false);
            }else{             
             
                $http.get(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/feed/featured')
                    .success(function (response) {
                        if (response) {
                            $localStorage.Featured = response;
                            callback(response);
                        } else {
                            callback(false);
                        }
                    })
                    .error(function() {
                        callback(items ? items : false);
                    });
            }
        }
        
        function Like(like, id, callback){        
            $http.put(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/feed/like', {like : like, id : id})
                .success(function(response) {
                    if (response) {
                        callback(response);
                    } else {
                        callback(false);
                    }
                })
                .error(function() {
                    callback(false);
                });
        }  
        
        function LikePresencaEmLote(like, oidTipoNotificacao, dataHora, callback){        
            $http.put(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/feed/like-presenca', {like : like, id : oidTipoNotificacao, dataHora : dataHora})
                .success(function(response) {
                    if (response) {
                        callback(true); //Sucesso
                    } else {
                        callback(false);
                    }
                })
                .error(function() {
                    callback(false);
                });
        }  
        
        function LikePresencaEmLoteExclusivo(like, oidTipoNotificacao, dataHora, callback){        
            $http.put(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/feed/like-presenca-exclusivo', {like : like, id : oidTipoNotificacao, dataHora : dataHora})
                .success(function(response) {
                    if (response) {
                        callback(true); //Sucesso
                    } else {
                        callback(false);
                    }
                })
                .error(function() {
                    callback(false);
                });
        }  
        
        function LikeVotacaoEmLote(like, oidTipoNotificacao, oidProposicao, callback){        
            $http.put(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/feed/like-votacao', {like : like, id : oidTipoNotificacao, oidProposicao : oidProposicao})
                .success(function(response) {
                    if (response) {
                        callback(true); //Sucesso
                    } else {
                        callback(false);
                    }
                })
                .error(function() {
                    callback(false);
                });
        }      
        
        function LikeVotacaoEmLoteExclusivo(like, oidTipoNotificacao, oidProposicao, callback){        
            $http.put(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/feed/like-votacao-exclusivo', {like : like, id : oidTipoNotificacao, oidProposicao : oidProposicao})
                .success(function(response) {
                    if (response) {
                        callback(true); //Sucesso
                    } else {
                        callback(false);
                    }
                })
                .error(function() {
                    callback(false);
                });
        }      
        
        function InteiroTeor(id, callback){        
            $http.put(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/feed/inteiro-teor', {id : id})
                .success(function(response) {
                    if (response) {
                        callback(response);
                    } else {
                        callback(false);
                    }
                })
                .error(function() {
                    callback(false);
                });
        }          
        
        function AddComment(event, callback){
			var msg = event.comentario;
			var id = event.oidNotificacao;
			var politico = event.oidPolitico;
            $http.put(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/feed/comment', {msg : msg, id : id, politico : politico})
                .success(function(response) {
                    if (response) {
                        callback(response);
                    } else {
                        callback(false);
                    }
                })
                .error(function() {
                    callback(false);
                });
        }  
        
        function MarkAsRead(callback){        
            $http.put(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/feed/mark-as-read')
                .success(function(response) {
                    if (response) {
                        callback(response);
                    } else {
                        callback(false);
                    }
                })
                .error(function() {
                    callback(false);
                });
        }  
        
        function marcaProposicao(tiponotificacao, proposicao, callback){     
            $http.post(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/feed/marca-proposicao', {
                tiponotificacao : tiponotificacao, 
                proposicao : proposicao
            })
                .success(function(response) {
                    if (response && response.success) {
                        callback(true, response);
                    } else {
                        callback(false, null);
                    }
                })
                .error(function() {
                    callback(false, null);
                });
        }  
        
        function DeleteComment(id, callback){        
            $http.delete(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/feed/comment/delete?id=' + id)
                .success(function(response) {
                    if (response) {
                        callback(response);
                    } else {
                        callback(false);
                    }
                })
                .error(function() {
                    callback(false);
                });
        }             
        
        function Comments(id, callback){        
            $http.get(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/feed/comments?id=' + id)
                .success(function (response) {
                    if (response) {
                        callback(response);
                    } else {
                        callback(false);
                    }
                })
                .error(function() {
                    callback(false);
                });
        }
        
        function Unread(callback){        
            $http.get(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/feed/unread')
                .success(function (response) {
                    if (response) {
                        callback(response);
                    } else {
                        callback(false);
                    }
                })
                .error(function() {
                    callback(false);
                });
        }   
        
        function Stats(callback){        
            $http.get(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/feed/stats')
                .success(function (response) {
                    if (response) {
                        callback(response);
                    } else {
                        callback(false);
                    }
                })
                .error(function() {
                    callback(false);
                });
        }      
        
        function likeEmLote(like, event, itensEvent, scope, callbackApagaEventos){
            var eventosAlterados = [];
            var dataHoraEvento = $filter('date')(new Date(event.dataHoraEvento), "dd/MM/yyyy");

            switch(event.oidTipoNotificacao){
                case "1": case "2": case "5":
                    LikePresencaEmLoteExclusivo(like, event.oidTipoNotificacao, event.dataHoraEvento, function(success){
                        if(success){
                            angular.forEach(itensEvent, function(item, index) {
                                if(item.dataHoraEvento == event.dataHoraEvento && 
                                   item.oidTipoNotificacao == event.oidTipoNotificacao){ 
                                    item.flgCurtir = like;
                                    eventosAlterados.push(item);
                                }else if(item.dataHoraEvento == event.dataHoraEvento && 
                                    item.oidTipoNotificacao != event.oidTipoNotificacao){
                                    item.flgCurtir = null;
                                    eventosAlterados.push(item);
                                }
                            });
                            if(callbackApagaEventos) callbackApagaEventos(eventosAlterados);
                        }
                    });
                break;
                case "3": case "4": case "6": case "7": case "8":
                    LikeVotacaoEmLoteExclusivo(like, event.oidTipoNotificacao, event.oidProposicao, function(success){
                        if(success){
                            angular.forEach(itensEvent, function(item, index) {
                                if(item.oidProposicao == event.oidProposicao && 
                                    item.oidTipoNotificacao == event.oidTipoNotificacao){ 
                                    item.flgCurtir = like;
                                    eventosAlterados.push(item);
                                }else if(item.oidProposicao == event.oidProposicao && 
                                    item.oidTipoNotificacao != event.oidTipoNotificacao){
                                    item.flgCurtir = null;
                                    eventosAlterados.push(item);
                                }
                            });
                            if(callbackApagaEventos) callbackApagaEventos(eventosAlterados);
                        }
                    });  
                break;
            }

        }   
        
        function eventoEmLote(like, event, itensEvent, scope, callbackApagaEventos){
            var eventosAlterados = [];
            if(LocalStorageService.perguntar(event)){ //Verifica se usuário marcou não perguntar
                
                var titulo = (like ? "GOSTEI" : "NÃO GOSTEI");
                var subtitulo = "Você deseja marcar com " + (like ? "GOSTEI" : "NÃO GOSTEI") + " ";
                
                var dataHoraEvento = $filter('date')(new Date(event.dataHoraEvento), "dd/MM/yyyy");
                switch(event.oidTipoNotificacao){
                    case "1":
                        subtitulo += "todos os políticos que registraram PRESENÇA em " + dataHoraEvento + "?";
                    break;
                        
                    case "2":
                        subtitulo += "todos os políticos que NÃO registraram PRESENÇA em " + dataHoraEvento + "?";
                    break;   
                        
                    case "5":
                        subtitulo += "todos os políticos com AUSÊNCIA JUSTIFICADA em " + dataHoraEvento + "?";
                    break;   
                        
                    case "3":
                        subtitulo += "todos os políticos que votaram SIM nesta proposta?";
                    break; 
                        
                    case "4":
                        subtitulo += "todos os políticos que votaram NÃO nesta proposta?";
                    break; 
                        
                    case "6":
                        subtitulo += "todos os políticos que votaram ABSTENÇÃO nesta proposta?";
                    break; 
                        
                    case "7":
                        subtitulo += "todos os políticos que votaram OBSTRUÇÃO nesta proposta?";
                    break; 
                        
                    case "8":
                        subtitulo += "todos os políticos que NÃO VOTARAM nesta proposta?";
                    break;                         
                        
                }

                var popup = $ionicPopup.show({
                    title: titulo,
                    subTitle: subtitulo,
                    scope: scope,
                    buttons: [
                        {
                            text: '<b>SIM</b>',
                            type: 'button-positive',
                            onTap: function(e) {
                                switch(event.oidTipoNotificacao){
                                    case "1": case "2": case "5":
                                        LikePresencaEmLote(like, event.oidTipoNotificacao, event.dataHoraEvento, function(success){
                                            if(success){
                                                angular.forEach(itensEvent, function(item, index) {
                                                    if(item.dataHoraEvento == event.dataHoraEvento && item.oidTipoNotificacao == event.oidTipoNotificacao){ 
                                                        item.flgCurtir = like;
                                                        eventosAlterados.push(item);
                                                    }
                                                });
                                                if(callbackApagaEventos) callbackApagaEventos(eventosAlterados);
                                            }
                                        });
                                    break;    
                                    case "3": case "4": case "6": case "7": case "8":
                                        LikeVotacaoEmLote(like, event.oidTipoNotificacao, event.oidProposicao, function(success){
                                            if(success){
                                                angular.forEach(itensEvent, function(item, index) {
                                                    if(item.oidProposicao == event.oidProposicao && item.oidTipoNotificacao == event.oidTipoNotificacao){ 
                                                        item.flgCurtir = like;
                                                        eventosAlterados.push(item);
                                                    }
                                                });
                                                if(callbackApagaEventos) callbackApagaEventos(eventosAlterados);
                                            }
                                        });
                                    break;                        
                                }
                                //Notification.success({message: "Operação concluída.", delay: 2000}); 
                            }
                        },                    
                        { 
                            text: 'Perguntar depois',
                            onTap: function(e) {
                                eventosAlterados.push(event);
                                if(callbackApagaEventos) callbackApagaEventos(eventosAlterados);
                            }
                        },
                        {
                            text: 'Não perguntar novamente',
                            onTap: function(e) {
                                LocalStorageService.setNaoPerguntar(event);
                                eventosAlterados.push(event);
                                if(callbackApagaEventos) callbackApagaEventos(eventosAlterados);
                            }
                        }
                    ]
                });
            }
        }        
        
    }
})();