(function () {
    'use strict';
    
    angular
        .module('SrCidadao')

            //Usado na listagem de políticos - friends
            .directive('friendMenu', function(UsuarioService){
                return {
                    scope:{
                        friend : '=',
                        callbackApaga : '=',
                        callbackAdiciona : '='
                    },
                    restrict: 'EA',
                    controller: function($scope, $ionicActionSheet, UsuarioService){

                        $scope.ctrl.actionSheet = actionSheet;

                        function actionSheet(friend){
                            var hideSheet = $ionicActionSheet.show({
                                buttons : [
                                    { text : '<div class="buttom-text"><i class="fa fa-times" aria-hidden="true"></i><div><span class="buttom-title">Não monitorar</span><br /><span class="small">Parar de ver eventos deste político</span></div></div>' }
                                ],
                                cancelText : "<div class='cancelar'>Cancelar</div>",
                                buttonClicked : function(index){
                                    if(index == 0){
                                        return excluirAmizade(friend);
                                    }
                                }    
                            });
                        }

                        function excluirAmizade(friend){
                            UsuarioService.ExcluirAmizade(friend.oidPolitico, function(success){
                                $scope.ctrl.callbackApaga(success ? friend : false);
                            });
                            return true;
                        }  

                    },
                    controllerAs: 'ctrl',
                    transclude: true,
                    bindToController: true,
                    templateUrl: 'templates/feed/feed-menu.html'
                };            
                /*
                return {
                    scope:{
                        id : '=',
                        callback : '='
                    },
                    restrict: 'EA',
                    controller: function($scope){
                        $scope.ctrl.excluirAmizade = function(id){
                            UsuarioService.ExcluirAmizade(id, function(success){
                                $scope.ctrl.callback(success);
                            });
                        }   
                    },
                    controllerAs: 'ctrl',
                    transclude: true,
                    bindToController: true,
                    templateUrl: 'templates/friends/friend-menu.html'
                };
                */
            })

            //Um item do feed
            .directive('feedItems', function(){
                return {        
                    restrict: 'E',
                    templateUrl: 'templates/feed/feed-items.html'
                };
            })         
        
            //Usado na listagem de eventos. Texto de um feed - feed
            .directive('feedText', function(FeedService){
                return {
                    scope:{
                        event : '='
                    },
                    restrict: 'E',
                    controller: function($scope){
                        $scope.hasJustification = ($scope.event.justificativa && $scope.event.justificativa.length > 3);
                        $scope.hasTipo = ($scope.event.tipo && $scope.event.tipo.length > 5);
                        $scope.hasTema = ($scope.event.tema && $scope.event.tema.length > 5);
                        $scope.hasObjeto = ($scope.event.objeto && $scope.event.objeto.length > 5);
                        

                    },
                    templateUrl: 'templates/feed/feed-text.html'
                };
            }) 
            
            //Usado na listagem de eventos - feed
            .directive('feedMenu', function(){
                return {
                    scope:{
                        friend : '=',
                        callbackApaga : '=',
                        callbackAdiciona : '='
                    },
                    restrict: 'EA',
                    controller: function($scope, $ionicActionSheet, UsuarioService){
                        
                        $scope.ctrl.actionSheet = actionSheet;
                        
                        function actionSheet(friend){
                            var hideSheet = $ionicActionSheet.show({
                                buttons : [
                                    {text : '<div class="buttom-text"><i class="fa fa-times" aria-hidden="true"></i><div><span class="buttom-title">Não monitorar</span><br /><span class="small">Parar de ver eventos deste político</span></div></div>'},
                                    //{text : '<div class="buttom-text"><i class="fa fa-times" aria-hidden="true"></i><div><span class="buttom-title">Ocultar</span><br /><span class="small">Não quero ver este alerta</span></div></div>' }
                                ],
                                cancelText : "<div class='cancelar'>Cancelar</div>",
                                buttonClicked : function(index){
                                    if(index == 0){
                                        return excluirAmizade(friend);
                                    }
                                }    
                            });
                        }

                        function excluirAmizade(friend){
                            UsuarioService.ExcluirAmizade(friend.oidPolitico, function(success){
                                $scope.ctrl.callbackApaga(success ? friend : false);
                            });
                            
                            return true;
                        }  
                        
                    },
                    controllerAs: 'ctrl',
                    transclude: true,
                    bindToController: true,
                    templateUrl: 'templates/feed/feed-menu.html'
                };
            })
            
        .directive('checkImagePolitico', function($http, configuracao) {
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {

                    attrs.$observe('ngSrc', function(ngSrc) {
                        $http.get(ngSrc).success(function(){
                            element.attr('src', ngSrc); // set default image
                        }).error(function(){
                            element.attr('src', 'assets/img/default-user.png'); // set default image
                        });
                    });
                }
            };
        })
        
        //Usa imagem padrão caso não encontre a imagem
        .directive('checkImage', function($http) {
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {
/*
                    attrs.$observe('ngSrc', function(ngSrc) {
                        $http.get(ngSrc).success(function(){
                            
                        }).error(function(){
                            element.attr('src', '/assets/img/default-user.png'); // set default image
                        });
                    });
*/

                }
            };
        })   
        
        .directive('searchBar', function(){
            return {        
                restrict : 'E',
                controller : 'SearchCtrl',
                controllerAs: 'vm',
                templateUrl : 'templates/search/bar.html'
            };
        })
        
        .directive('selectOnClick', ['$window', function ($window) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    element.on('click', function () {
                        if (!$window.getSelection().toString()) {
                            // Required for mobile Safari
                            this.setSelectionRange(0, this.value.length)
                        }
                    });
                }
            };
        }])     
        
        .directive('searchPanel', function(){
            return {        
                restrict : 'E',
                controller : 'SearchCtrl',
                templateUrl : 'templates/search/bar.html'
            };
        })
        
        .directive('animatedCustom', function($animate){
            return{
                restrict: 'A',
                scope : {
                        animatedCustom : '@'
                },
                link: function(scope, element, attrs){
                    element.on('click', function(){
                        element.addClass("animated " + scope.animatedCustom);  
                        element.on('animationend webkitAnimationEnd MSAnimationEnd transitionend webkitTransitionEnd', function(){
                            element.removeClass("animated " + scope.animatedCustom);  
                        });                         
                    }); 
                }    
            }    
        })
        
        .directive('animatedCustomRemove', function($animate){
            return{
                restrict: 'A',
                scope : {
                        animatedCustomRemove : '@'
                },
                link: function(scope, element, attrs){
                    element.on('click', function(){
                        element.addClass("animated " + scope.animatedCustomRemove);  
                        element.on('animationend webkitAnimationEnd MSAnimationEnd transitionend webkitTransitionEnd', function(){
                            element.remove();
                        });                         
                    }); 
                }    
            }    
        })     
        
        .directive('nextOnEnter', function () {
            return {
                restrict: 'A',
                link: function ($scope, selem, attrs) {
                    selem.bind('keydown', function (e) {
                        var code = e.keyCode || e.which;
                        if (code === 13) {
                            e.preventDefault();
                            var pageElems = document.querySelectorAll('input, select, textarea, button'),
                                elem = e.srcElement,
                                focusNext = false,
                                len = pageElems.length;
                            for (var i = 0; i < len; i++) {
                                var pe = pageElems[i];
                                if (focusNext) {
                                    if (pe.style.display !== 'none') {
                                        pe.focus();
                                        break;
                                    }
                                } else if (pe === e.srcElement) {
                                    focusNext = true;
                                }
                            }
                        }
                    });
                }
            }
        })        
        .directive('termosDeUso', function(){
            return {        
                restrict : 'E',
                controllerAs : 'ctrl',
                controller : function($scope, $ionicModal, UsuarioService, Notification){

                    $scope.ctrl.abreTermos = abreTermos;
                    $scope.termoUso = "";
                    
                    //MODAL MENSAGEM #############################
                    $ionicModal.fromTemplateUrl("templates/user/termos-modal.html", {
                        scope : $scope,
                        animation : 'slide-in-up',
                        focusFirstInput : true    
                    }).then(function(modal){
                        $scope.modal = modal;   
                    });
                    
                    termoUso();
                    
                    function termoUso(){
                        UsuarioService.TermosUso(function(success, response){
                            if(success){
                                $scope.termoUso = response.termo; 
                            }else{
                                var mensagem = "Erro ao recuperar termos de uso.";
                                if(response && response.message) mensagem = response.message;
                                Notification.error({message: mensagem, delay: 2000});  
                            }
                        });
                    }         
                    
                    function abreTermos(){
                        $scope.modal.show();
                    }
                        
                },
                templateUrl : 'templates/user/termos.html'
            };
        });                                
    
})();