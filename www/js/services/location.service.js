(function () {
    'use strict';

    angular
        .module('SrCidadao')
        .factory('LocationService', LocationService);    
        
    function LocationService($q, $http, $cordovaGeolocation, configuracao, ConfigurationService) {  
    
        var service = {};

        service.CurrentLocation = CurrentLocation;
        service.Location = Location;
        service.GetGeoInfo = GetGeoInfo;
        service.SaveGeoInfo = SaveGeoInfo;
        service.ReverseLocation = ReverseLocation;
        service.GetGoogleGeoInfo = GetGoogleGeoInfo;

        return service;          
        
        function CurrentLocation(callback){ 
            var posOptions = {timeout: 10000, enableHighAccuracy: false};
            $cordovaGeolocation
                .getCurrentPosition(posOptions)
                    .then(function (position) {
                        service.Location(position.coords);
                        callback(true, position.coords);
                    }, function(err) {
                        callback(false);
                    });
        } 
        
        function ReverseLocation(lat, lng, callback){
            var geocoder = new google.maps.Geocoder();
            var latlng = new google.maps.LatLng(lat, lng);
            geocoder.geocode({
                latLng: latlng
                }, function(responses) {
                    callback(true, responses);
                }
            );
        }
        
        
        function extractFromAddress(components, type, longName){
            for (var i=0; i < components.length; i++)
                for (var j=0; j < components[i].address_components.length; j++)
                    for (var k=0; k < components[i].address_components[j].types.length; k++)
                        if (components[i].address_components[j].types[k]==type){ 
                            if(longName) return components[i].address_components[j].long_name;
                            else return components[i].address_components[j].short_name;
                        }
            return "";
        }   
        
        function extractFullAddress(components, type){
            for (var i=0; i < components.length; i++)
                for (var j=0; j < components[i].types.length; j++)
                    if (components[i].types[j]==type)
                        return components[i].formatted_address;
            return "";
        }                
        
        
        function GetGoogleGeoInfo(lat, lng, callback){
            ReverseLocation(lat, lng, function(success, responses){
                //console.log(responses);
                var geoinfo = {
                    as: extractFullAddress(responses, "street_address"), 
                    city: extractFromAddress(responses, "administrative_area_level_2", false), 
                    country: extractFromAddress(responses, "country", true), 
                    countryCode: extractFromAddress(responses, "country", false), 
                    isp: "",
                    lat: lat,
                    lon: lng,
                    org: "",
                    query: "",
                    region: extractFromAddress(responses, "administrative_area_level_1", false), 
                    regionName:  extractFromAddress(responses, "administrative_area_level_1", true), 
                    status: "success",
                    timezone: "",
                    zip: extractFromAddress(responses, "postal_code", false)
                };
                callback(true, geoinfo);
            });
        }

        function Location(coords){

            var data = {
                accuracy : coords.accuracy,
                altitude : coords.altitude,
                altitudeAccuracy : coords.altitudeAccuracy,
                heading : coords.heading,
                latitude : coords.latitude,
                longitude : coords.longitude,
                speed : coords.speed
            };
        
            $http.post(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/info/location', data)
                .success(function (response) {
                    if (response) {

                    }
                })
                .error(function() {
                    //Erro
                });
        }
        
        function handlerGeoLocation(response){
            return response;
        }

        function SaveGeoInfo(data){
            $http.post(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/info/geo-info', data)
                .success(function(response) {
                    if (response) {

                    }
                })
                .error(function() {
                    //Erro
                });
            
        }
        
        function GetGeoInfo(callback){
            $http.get(configuracao.geoPlugin)
                .success(function(response) {
                    var json = "";
                    try{
                        json = eval(response);
                        callback(true, json);
                    }catch(e){
                        callback(false, response);
                    }                              
                })
                .error(function(response) {
                    callback(false, response);
                });
        }               
    }
})();