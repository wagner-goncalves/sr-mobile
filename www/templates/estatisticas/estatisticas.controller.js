(function () {
    'use strict';

    angular
        .module('SrCidadao')
        .controller('EstatisticasCtrl', Controller);

    function Controller($rootScope, $scope, $ionicSlideBoxDelegate, $interval, PreferenciasService, EstatisticasService, Notification) {
        var vm = this;
        initController();
        function initController() {
            
            //Variáveis da view
            vm.estados = null;
            vm.paramsGostei = {
                "tipo" : "gostei",
                "uf" : "",
                "partido" : "",
                "dataInicio" : "",
                "dataFim" : "",
            };
            
            vm.chartLoaded = false;
            
            vm.chartGostei = null;
            vm.chartGosteiLabels = null;
            
            vm.chartNaoGostei = null;
            vm.chartNaoGosteiLabels = null;  

            //Funções
            vm.graficos = graficos;
            carregaBase();
            graficos();
            $scope.$broadcast('scroll.refreshComplete');   
        }
        
        function carregaBase(){
            PreferenciasService.estados(function(response){
                if(response){
                    vm.estados = response;
                }else{
                    //erro    
                }
            });
        }
        
        function graficos(){
            vm.chartLoaded = false;
            
            vm.paramsGostei.tipo = "gostei";
            EstatisticasService.gostei(vm.paramsGostei,function(success, response){
                if(success){
                    vm.chartGostei = response;
                    vm.chartGosteiLabels = angular.copy(vm.chartGostei.labels);
                    for(var i = 0; i < vm.chartGostei.labels.length; i++){
                        vm.chartGostei.labels[i] = "#" + (i + 1);
                        vm.chartGosteiLabels[i] = (i + 1) + ": " + vm.chartGosteiLabels[i] + " - " + vm.chartGostei.data[i] + "%";
                    }
                    vm.chartLoaded = true;
                }else{
                    Notification.error({message: "Não conseguimos recuperar os dados solicitados.", delay: 5000});  
                }
            });
            
            vm.paramsGostei.tipo = "naogostei";
            EstatisticasService.gostei(vm.paramsGostei,function(success, response){
                if(success){
                    vm.chartNaoGostei = response;
                    vm.chartNaoGosteiLabels = angular.copy(vm.chartNaoGostei.labels);
                    for(var i = 0; i < vm.chartNaoGostei.labels.length; i++){
                        vm.chartNaoGostei.labels[i] = "#" + (i + 1);
                        vm.chartNaoGosteiLabels[i] = (i + 1) + ": " + vm.chartNaoGosteiLabels[i] + " - " + vm.chartNaoGostei.data[i] + "%";
                    }
                    vm.chartLoaded = true;
                }else{
                    Notification.error({message: "Não conseguimos recuperar os dados solicitados.", delay: 5000});  
                }
            });            
        }    
        
        function estados(){
            $ionicSlideBoxDelegate.next();    
        }         
          
    }

})();