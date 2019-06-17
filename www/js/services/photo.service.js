(function () {
    'use strict';

    angular
        .module('SrCidadao')
        .factory('PhotoService', PhotoService);    
        
    function PhotoService($cordovaCamera, $http, configuracao, ConfigurationService) {  
    
        var service = {};

        service.takePhoto = takePhoto;
        service.choosePhoto = choosePhoto;
        service.upload = upload;
        service.excluir = excluir;

        return service;    
        
        function takePhoto(photoSuccessCallback, photoErrorCallback) {
            var options = {
                quality: 75,
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType: Camera.PictureSourceType.CAMERA,
                allowEdit: true,
                encodingType: Camera.EncodingType.JPEG,
                targetWidth: 300,
                targetHeight: 300,
                popoverOptions: CameraPopoverOptions,
                saveToPhotoAlbum: false
            };
        
            $cordovaCamera.getPicture(options).then(
                photoSuccessCallback, 
                photoErrorCallback);
        }  
                
        function choosePhoto(photoSuccessCallback, photoErrorCallback) {
            var options = {
                quality: 75,
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                allowEdit: true,
                encodingType: Camera.EncodingType.JPEG,
                targetWidth: 300,
                targetHeight: 300,
                popoverOptions: CameraPopoverOptions,
                saveToPhotoAlbum: false
            };
            
            $cordovaCamera.getPicture(options).then(
                photoSuccessCallback, 
                photoErrorCallback);
        }  
        
        function upload(image, successCallback, errorCallback) {
            var server = ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + "/usuario/foto";
            $http.post(server, {arquivoImagem : image})
                .success(function (response) {
                    response.arquivoImagem = ConfigurationService.getApiEndPoint() + "/upload/" + response.arquivoImagem + "?" + new Date().getTime();
                    successCallback(response);
                })
                .error(function() {
                    errorCallback(response);
                });
        }             

        function excluir(callback) {
            $http.delete(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/usuario/delete-image')
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