(function () {
    'use strict';       

    angular
        .module('SrCidadao')
        .controller('WalkthroughCtrl', Controller);

    function Controller($rootScope, $scope, $state, $ionicSlideBoxDelegate, AnalyticsService) {
        var vm = this;
		vm.initController = initController;
        vm.next = next;
        vm.feed = feed;
        vm.initController();
        vm.slider = null;

        function initController() {
            vm.options = {
              loop: false,
              effect: 'fade',
              speed: 500,
            }        
            
            $scope.$on("$ionicSlides.sliderInitialized", function(event, data){
              vm.slider = data.slider;
            });
                        
            $scope.$on("$ionicSlides.slideChangeStart", function(event, data){

            });
            
            $scope.$on("$ionicSlides.slideChangeEnd", function(event, data){
              $scope.activeIndex = data.slider.activeIndex;
              $scope.previousIndex = data.slider.previousIndex;
            });
        }    
        
        function next(){
            $ionicSlideBoxDelegate.next();    
        } 
        
        function feed(){
            AnalyticsService.trackView("wizard-passo-um");
            $state.go("wizard-passo-um");
            
            //$state.go("app.timeline");      
        }
    }
})();    