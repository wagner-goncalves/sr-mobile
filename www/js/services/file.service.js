(function () {
    'use strict';

    angular
        .module('SrCidadao')
        .factory('FileService', FileService);    
        
    function FileService(configuracao) {  
    
        var service = {};

        service.b64toBlob = b64toBlob;
        service.savebase64AsPDF = savebase64AsPDF;

        return service;        

        /**
         * Convert a base64 string in a Blob according to the data and contentType.
         * 
         * @param b64Data {String} Pure base64 string without contentType
         * @param contentType {String} the content type of the file i.e (application/pdf - text/plain)
         * @param sliceSize {Int} SliceSize to process the byteCharacters
         * @see http://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
         * @return Blob
         */
        function b64toBlob(b64Data, contentType, sliceSize) {
                contentType = contentType || '';
                sliceSize = sliceSize || 512;

                var byteCharacters = atob(b64Data);
                var byteArrays = [];

                for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                    var slice = byteCharacters.slice(offset, offset + sliceSize);

                    var byteNumbers = new Array(slice.length);
                    for (var i = 0; i < slice.length; i++) {
                        byteNumbers[i] = slice.charCodeAt(i);
                    }

                    var byteArray = new Uint8Array(byteNumbers);

                    byteArrays.push(byteArray);
                }

              var blob = new Blob(byteArrays, {type: contentType});
              return blob;
        }

        /**
         * Create a PDF file according to its database64 content only.
         * 
         * @param folderpath {String} The folder where the file will be created
         * @param filename {String} The name of the file that will be created
         * @param content {Base64 String} Important : The content can't contain the following string (data:application/pdf;base64). Only the base64 string is expected.
         */
        function savebase64AsPDF(folderpath,filename,content,contentType, callback){
            // Convert the base64 string in a Blob
            var DataBlob = b64toBlob(content,contentType);

            console.log("Starting to write the file :3");

            window.resolveLocalFileSystemURL(folderpath, function(dir) {
                console.log("Access to the directory granted succesfully");
                dir.getFile(filename, {create:true}, function(file) {
                    console.log("File created succesfully.");
                    file.createWriter(function(fileWriter) {
                        console.log("Writing content to file");
                        fileWriter.write(DataBlob);
                        callback(true, file);
                    }, function(){
                        callback(false);
                    });
                });
            });
        }   
    }
})();