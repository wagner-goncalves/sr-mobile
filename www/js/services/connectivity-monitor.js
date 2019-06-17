(function () {
    'use strict';

    angular
        .module('SrCidadao')
        .factory('ConnectivityMonitor', function ($rootScope, $cordovaNetwork, configuracao, ConfigurationService) {

            return {
                isOnline: function () {
                    if(ConfigurationService.desenvolvimento()) return true;
                    if (ionic.Platform.isWebView()) {
                        try {
                            return $cordovaNetwork.isOnline();
                        } catch (e) {
                            return true;
                        }

                    } else {
                        return navigator.onLine;
                    }
                },
                isOffline: function () {
                    if(ConfigurationService.desenvolvimento()) return false;
                    if (ionic.Platform.isWebView()) {
                        try {
                            return !$cordovaNetwork.isOnline();
                        } catch (e) {
                            return false;
                        }
                    } else {
                        return !navigator.onLine;
                    }
                },
                startWatching: function () {

                    if (ionic.Platform.isWebView()) {
                        $rootScope.$on('$cordovaNetwork:online', function (event, networkState) {
                            $rootScope.MessageService.online = true;
                        });

                        $rootScope.$on('$cordovaNetwork:offline', function (event, networkState) {
                            $rootScope.MessageService.online = false;
                        });
                    } else {
                        window.addEventListener("online", function (e) {
                            $rootScope.MessageService.online = true;
                        }, false);

                        window.addEventListener("offline", function (e) {
                            $rootScope.MessageService.online = false;
                        }, false);
                    }
                }
            }
        })
})();
