(function () {
    'use strict';

    angular
        .module('SrCidadao')
        .factory('PoliticoService', PoliticoService);    
        
    function PoliticoService($q, $http, $localStorage, MessageService, configuracao, ConfigurationService) {  
    
        var service = {};

        service.friends = friends;
        service.friendsAdvisor = friendsAdvisor;
        service.friendsCount = friendsCount;
        service.detail = detail;
        service.detailSlim = detailSlim;
        service.ficha = ficha;
        service.curtidas = curtidas;
        service.descurtidas = descurtidas;
        service.getRating = getRating;
        service.setRating = setRating;
        service.contadores = contadores;
        service.representantes = representantes;

        return service;    

        function detail(id, callback){        
            $http.get(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/politico/' + id)
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

        function representantes(callback){        
            $http.get(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/politico/representantes')
                .success(function (response) {
                    if (response) {
                        callback(true, response);
                    } else {
                        callback(false);
                    }
                })
                .error(function() {
                    callback(false);
                });
        }
        
        function detailSlim(id, callback){        
            $http.get(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/politico/slim/' + id)
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
        
        function contadores(id, callback){        
            $http.get(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/politico/contadores/' + id)
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
        
        function getRating(id, callback){        
            $http.get(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/politico/rating/' + id)
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
        
        function setRating(id, nota, callback){
            $http.put(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/politico/rating/' + id + '?nota=' + nota)
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
        
        function ficha(id, callback){        
            $http.get(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/politico/ficha/' + id)
                .success(function (response) {
                    if (response.success) {
                        callback(response);
                    } else {
                        callback(false);
                    }
                })
                .error(function() {
                    callback(false);
                });
        }
    
        function friends(page, key, callback){    
        
            if(!$localStorage.Friends) $localStorage.Friends = {};//Inicia cache, caso não exista 
            var items = $localStorage.Friends["_"+page]; //Cache  
            
            if(!MessageService.isOnline()){ //Offline
                callback(items ? items : false);
            }else{                  
                $http.get(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/politico/friends?page=' + page + "&key=" + key)
                    .success(function (response) {
                        if (response) {
                            $localStorage.Friends["_"+page] = response;
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
        
        function friendsAdvisor(page, key, order, politicianType, instituicao, callback){         
        
            if(!$localStorage.Friends) $localStorage.Friends = {};//Inicia cache, caso não exista 
            var items = $localStorage.Friends["_"+page]; //Cache  
            
            if(!MessageService.isOnline()){ //Offline
                callback(items ? items : false);
            }else{                  
                $http.get(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/politico/friends/advisor?page=' + page + "&key=" + key + "&order=" + order + "&politicianType=" + politicianType + "&instituicao=" + instituicao)
                    .success(function (response) {
                        if (response) {
                            $localStorage.Friends["_"+page] = response;
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
        
        function friendsCount(callback){        
            $http.get(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/politico/friends/count')
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
        
        function curtidas(oidNotificacao, callback){        
            $http.get(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/politico/curtidas/' + oidNotificacao)
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
        
        function descurtidas(oidNotificacao, callback){        
            $http.get(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/politico/descurtidas/' + oidNotificacao)
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
    }
})();