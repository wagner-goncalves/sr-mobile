(function () {
    'use strict';

    angular
        .module('SrCidadao')
        .factory('FacebookService', FacebookService);    
        
    function FacebookService($q, $http, $openFB, configuracao, ConfigurationService) {  
    
        var service = {};

        service.login = login;
        service.loginNativo = loginNativo;
        
        service.isLoggegIn = isLoggegIn;
        service.postFeed = postFeed;
        service.notificacaoFb = notificacaoFb;
        service.setIdPostFeed = setIdPostFeed;

        return service;        
        
        function notificacaoFb(event, callback){        
            $http.get(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/feed/notificacao-fb/' + event.oidNotificacao)
                .success(function(response) {
                    if (response) {
                        callback(true, response, event);
                    } else {
                        callback(false, response, event);
                    }
                })
                .error(function(err) {
                    callback(false, err, event);
                });
        }        
        
        function isLoggegIn(callback){
            $openFB.isLoggedIn().then(function(loginStatus){
                    callback(true, loginStatus);
                }, function(err){
                    callback(false, err);
                }
            );
        }  
        
        function postFeed(message, callback, event){
            
            var postParams = {};
            postParams.message = message.texto;
            if(message.link && message.link != "") postParams.link = message.link;
            
            $openFB.api({
                method: 'POST',
                path: '/me/feed',
                params: postParams
            }).then(function(data){             
                callback(true, message.id, data, event);
            }, function(data){  
                event.error = data;
                callback(false, message.id, data, event);
            });
        }   
        
        function setIdPostFeed(oidFacebookPost, idPost, callback){
            $http.patch(ConfigurationService.getApiEndPoint() + ConfigurationService.getApiVersion() + '/feed/notificacao-fb/' + oidFacebookPost + '/' + idPost)
                .success(function(response) {
                    if (response.success) {
                        callback(true, response);
                    } else {
                        callback(false, response);
                    }
                })
                .error(function(err) {
                    callback(false, err);
                });
        }                  

        function loginNativo(callback){ 
            try{
                var permissions = ["email","public_profile","user_friends"];
                facebookConnectPlugin.login(permissions, 
                    function(response){
                        /*
                        var responseExample = {
                            "status":"connected",
                            "authResponse":{
                                "accessToken":"EAASWwcjvzw0BAEKtfTf6vCZAoe0866ozayTi8ZCDGqxYTPzxQ7oYN9PwFr47ifLw1V0lBVsPZCLalhhMErfe8EgIIQOsf0Kf7WgP9ZCeD61joTridgF1LXbfEHS3KJFPQZCZBnPsQtCrl0InJU79j2SK8op8mXywQ3wGEchFMAUPX7jMB07fQUtxi5AwdJNyjBGZC4Cgi8fcZAez9h5gQvgMbFi0qYBffHAT7h9tBsgoZCgZDZD",
                                "expiresIn":"5152908",
                                "session_key":true,
                                "sig":"...",
                                "userID":"1203289879741159"
                            }
                        };     
                        */     
                    
                        //Recuperar dados do facebook
                        facebookConnectPlugin.api(response.authResponse.userID + "/?fields=id,email,picture,cover,first_name,last_name,gender,link,about,birthday,currency,devices,education,favorite_athletes,favorite_teams,hometown,inspirational_people,install_type,installed,interested_in,is_verified,languages,locale,location,meeting_for,middle_name,name,name_format,political,public_key,relationship_status,religion", null,
                            function (user) {
                                var social = {};

                                social.dados = JSON.stringify(user);
                                social.id = user.id;
                                social.name = user.name;
                                social.email = user.email;
                                social.picture = user.picture && user.picture.data && user.picture.data.url ? user.picture.data.url : null;                    
                                social.age_range_min = user.age_range && user.age_range.min ? user.age_range.min : null;
                                social.age_range_max = user.age_range && user.age_range.max ? user.age_range.max : null;   
                                social.cover = user.cover && user.cover.source ? user.cover.source : null;
                                social.first_name = user.first_name;  
                                social.last_name = user.last_name;
                                social.gender = user.gender; 
                                social.link = user.link;   
                                social.token = response.authResponse && response.authResponse.accessToken ? response.authResponse.accessToken : null;

                                callback(true, social);
                            }, function (err) {
                                callback(false, err);
                            }
                        );
                    }, function(err){
                        callback(false, err);
                    }
                );
            }catch(e){
                callback(false, "");   
            }

        } 
        
        
        function login(callback){ 
            try{
                $openFB.login({
                    scope: configuracao.fbScope
                }).then(function(token) {
                    $openFB.api({ //Dados do usuario
                        path: '/me',
                        params : {'fields' : configuracao.fbFields}
                    }).then(function(user) {
                        
                        var social = {};
                        
                        social.dados = JSON.stringify(user);
                        social.id = user.id;
                        social.name = user.name;
                        social.email = user.email;
                        social.picture = user.picture && user.picture.data && user.picture.data.url ? user.picture.data.url : null;                    
                        social.age_range_min = user.age_range && user.age_range.min ? user.age_range.min : null;
                        social.age_range_max = user.age_range && user.age_range.max ? user.age_range.max : null;   
                        social.cover = user.cover && user.cover.source ? user.cover.source : null;
                        social.first_name = user.first_name;  
                        social.last_name = user.last_name;
                        social.gender = user.gender; 
                        social.link = user.link;   
                        social.token = token.authResponse && token.authResponse.token ? token.authResponse.token : null;
                        
                        callback(true, social);
                    }, function(err) {
                        callback(false, err);
                    });
                }, function(err) {
                    callback(false, err);
                });
            }catch(e){
                callback(false, "");   
            }

        } 
    }
})();