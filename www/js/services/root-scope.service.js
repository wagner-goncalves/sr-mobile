(function () {
    'use strict';

    angular
        .module('SrCidadao')
        .factory('RootScopeService', RootScopeService);    
        
    function RootScopeService($rootScope) {  
    
        var service = {};

        service.registraLikes = registraLikes;
		service.setStats = setStats;
		service.getStats = getStats;
		service.subtraiFriend = subtraiFriend;
		service.addFriend = addFriend;
		service.setUserInfo = setUserInfo;
		service.getUserInfo = getUserInfo;
		service.setUnread = setUnread;

        return service;    
		
		function setUserInfo(userInfo){
			$rootScope.userInfo = userInfo;
		}
		
		function getUserInfo(){
			return $rootScope.userInfo;
		}		

        function registraLikes(statusAnterior, novoStatus){
			var stats = getStats();
            if(novoStatus == 0){ 
                stats.descurtidas++;
                if(statusAnterior == 1) stats.curtidas--;
            }else if(novoStatus == 1){ 
                stats.curtidas++;
                if(statusAnterior == 0) stats.descurtidas--;
            }
        }
		
		function subtraiFriend(){
			var stats = getStats();
			stats.friends--;
		}
		
		function addFriend(){
			var stats = getStats();
			stats.friends++;
		}	

		function setUnread(total){
			var stats = getStats();
			stats.unread = total;
		}			
		
		function setStats(stats){
			if(stats.friends && $rootScope.userInfo) $rootScope.userInfo.friendsCount = stats.friends;
			if(stats.curtidas && $rootScope.userInfo) $rootScope.userInfo.curtidas = stats.curtidas;
			if(stats.descurtidas && $rootScope.userInfo) $rootScope.userInfo.descurtidas = stats.descurtidas;
			if(stats.curtidasAmigos && $rootScope.userInfo) $rootScope.userInfo.curtidasAmigos = stats.curtidasAmigos;
			if(stats.descurtidasAmigos && $rootScope.userInfo) $rootScope.userInfo.descurtidasAmigos = stats.descurtidasAmigos;
			return stats;
		}
        
		function getStats(){
			return $rootScope.userInfo;
		}   
    }
})();