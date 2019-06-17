(function () {
    'use strict';

    angular
        .module('SrCidadao')
        .controller('FichaCtrl', Controller);

    function Controller($scope, $rootScope, $stateParams, $filter, $ionicPopup, FichaService, PoliticoService, FileService, SocialSharingService, Notification, ConfigurationService, configuracao) {

        var vm = this;
        vm.initController = initController;
        vm.initController();   

        function initController(){
            vm.ficha = [];
            vm.votacao = [];
            vm.politico;
			vm.presenca = [];
            vm.citacao = [];
            vm.contastcu = [];
            vm.sharingPlataforma = false;
			vm.graphVotacao = {data : [], labels: []};			
            vm.configuracao = configuracao;
            
            //Funções
            vm.getFicha = getFicha;
            vm.makePdf = makePdf;
            vm.socialShare = socialShare;
            vm.logCitacao = logCitacao;
            vm.logContasTcu = logContasTcu;
            vm.getFicha();
            
        }
        
        function logCitacao(oidCitacao, url){
            var confirmPopup = $ionicPopup.confirm({
                title: 'Abrir página externa',
                template: 'Você está prestes a sair do Sr.Cidadão para abrir um link no navegador. Continuar?'               
            });

            confirmPopup.then(function(res) {
                if(res) {
                    //Registra log
                    FichaService.logCitacao(oidCitacao, function(success, citacao){});
                    
                    //Abre janela
                    if(window.cordova){
                        cordova.InAppBrowser.open(url, "_system", "location=yes");
                    }else{
                        window.open(url, "_system");
                    }
                    
                }
            });
        }
        

        function logContasTcu(oidContasTcu, url){
            var confirmPopup = $ionicPopup.confirm({
                title: 'Abrir página externa',
                template: 'Você está prestes a sair do Sr.Cidadão para abrir um link no navegador. Continuar?'               
            });

            confirmPopup.then(function(res) {
                if(res) {
                    //Registra log
                    FichaService.logContasTcu(oidContasTcu, function(success, contastcu){});
                    
                    //Abre janela
                    if(window.cordova){
                        cordova.InAppBrowser.open(url, "_system", "location=yes");
                    }else{
                        window.open(url, "_system");
                    }
                    
                }
            });
        }        

        function makePdf(dadosArquivo, callback){
            if(window.cordova && window.cordova.plugins && window.cordova.plugins.pdf && window.cordova.plugins.pdf.htmlToPDF){

                var pdfArea = document.getElementById('pdfArea').innerHTML;
                
                cordova.plugins.pdf.htmlToPDF({
                    data: pdfArea,
                    //url: "www.cloud.org/template.html"
                }, function(base64File){
                    FileService.savebase64AsPDF(dadosArquivo.folderpath, dadosArquivo.filename, base64File, dadosArquivo.contentType, function(success, file){
                        if(success){
                            callback(true, file);
                        }else{
                            Notification.error({message: "Desculpe-nos. Não conseguimos criar o PDF solicitado.", delay: 5000}); 
                        }
                    });                    
                }, function(error){
                    Notification.error({message: "Desculpe-nos. Não conseguimos criar o PDF solicitado.", delay: 5000}); 
                });
            }else{
                Notification.error({message: "Apenas na versão para celular.", delay: 5000}); 
            }
            callback(false);
        }
        
        function socialShare(plataforma){
            vm.sharingPlataforma = plataforma;
            if(window.plugins && window.plugins && window.plugins.socialsharing){
				SocialSharingService.registraShareFicha(vm.politico.oidPolitico, vm.politico.oidInstituicao, function(success, id, baseMensagemShare){
					if(success){
                        var nomeArquivo = null; (vm.politico ? ("SrCidadao-" + vm.politico.nome + ".pdf") : "SrCidadao-FICHA-POLITICO.pdf");
                        var mensagem = (vm.politico ? (baseMensagemShare + vm.politico.nome) : "Sr.Cidadão: Conheça a ficha do político");
                        var dadosCompartilhar = {
                            contentType : "application/pdf",
                            folderpath : null, //cordova.file.externalRootDirectory,
                            filename : nomeArquivo,
                            mensagem : mensagem,
                            link : (ConfigurationService.desenvolvimento() ? configuracao.urlShareFichaDev : configuracao.urlShareFicha) + id
                        };
                        
						SocialSharingService.share(plataforma, dadosCompartilhar, function(success, plataforma){
                            vm.sharingPlataforma = false;
                        });
					}else{
                        vm.sharingPlataforma = false;
                    }
				});

				/*
                vm.makePdf(dadosCompartilhar, function(success, file){
                    if(success){
                        
                    }
                });
				*/
            }else{
                vm.sharingPlataforma = false;
                Notification.error({message: "Apenas na versão para celular.", delay: 5000}); 
            }
        }
        
        function getFicha(){

            PoliticoService.ficha($stateParams.id, function(response){
                if(response.success){
                    vm.ficha = response.ficha;  
                    vm.politico = response.politico;
                    vm.votacao = response.votacao;
					vm.presenca = response.presenca;
                    vm.citacao = response.citacao;
                    vm.contastcu = response.contastcu;
                    for(var i = 0; i < vm.contastcu.length; i++) vm.contastcu[i].dataLancamento = $filter('date')(new Date(vm.contastcu[i].dataLancamento), "dd/MM/yyyy");
					
                    vm.graphVotacao.data = [];
                    vm.graphVotacao.labels = [];
                    vm.graphVotacao.colors = ["#00ff00","#ff0000","#0000ff"];
                    vm.graphVotacao.options = {
                        responsive: true,
                        legend: { display: true },
                        title: {
                            // display: true,
                            // text: 'Custom Chart Title'
                        },
                        pieceLabel: {
                            // mode 'label', 'value' or 'percentage', default is 'percentage'
                            mode: 'value',
                            // precision for percentage, default is 0
                            precision: 0,
                            // font color, default is '#fff'
                            fontColor: '#000',
                            // font style, default is defaultFontStyle
                            fontStyle: 'bold',
                            // font family, default is defaultFontFamily
                            position: 'outside'
                        }
                    };

                    for(var i = 0; i < vm.presenca.length; i++){
                        vm.graphVotacao.data.push(vm.presenca[i].total);
                        vm.graphVotacao.labels.push(vm.presenca[i].tipo);
                    }					

                    if(vm.ficha.length > 1){
                        var dadosAnterior = {
                            totalBens : 0,
                            totalReceitas : 0,
                            totalDespesas : 0,
                            valorVoto : 0
                        };
                        
                        // - De tras pra frente -- for(var i = vm.ficha.length - 1; i >= 0; i--)
                            
                        for(var i = 0; i < vm.ficha.length; i++){
                            
                            vm.ficha[i].dadosAnterior = {
                                totalBens : !dadosAnterior.totalBens || dadosAnterior.totalBens == 0 ? 0 : ((vm.ficha[i].totalBens / dadosAnterior.totalBens) - 1) * 100,
                                totalReceitas : !dadosAnterior.totalReceitas || dadosAnterior.totalReceitas == 0 ? 0 : ((vm.ficha[i].totalReceitas / dadosAnterior.totalReceitas) - 1) * 100,
                                totalDespesas : !dadosAnterior.totalDespesas || dadosAnterior.totalDespesas == 0 ? 0 : ((vm.ficha[i].totalDespesas / dadosAnterior.totalDespesas) - 1) * 100,
                                valorVoto : !dadosAnterior.valorVoto || dadosAnterior.valorVoto == 0 ? 0 : ((vm.ficha[i].valorVoto / dadosAnterior.valorVoto) - 1) * 100
                            };
                            
                            dadosAnterior = {
                                totalBens : vm.ficha[i].totalBens,
                                totalReceitas : vm.ficha[i].totalReceitas,
                                totalDespesas : vm.ficha[i].totalDespesas,
                                valorVoto : vm.ficha[i].valorVoto
                            };
                        }
                    }
                }else{
                    Notification.error({message: "Ficha: não conseguimos completar esta ação.", delay: 5000}); 
                }
            });  

        }
        
    }

})();