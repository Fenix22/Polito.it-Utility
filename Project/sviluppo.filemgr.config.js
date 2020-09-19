
(function(angular) {

    "use strict";

    
    /* angular.module('FileManagerApp').config(function($sceDelegateProvider) {
        //console.log("SCADELEGATE");
        $sceDelegateProvider.resourceUrlWhitelist([
          'self',
          '*://amflgaccempcbjcgehechogijmmmohoj/*',
          '*://amflgaccempcbjcgehechogijmmmohoj/*'
        ]);
      
      }); */

    angular.module("FileManagerApp").provider("fileManagerConfig", function() {

        var values = {
            appName: "angular-filemanager v1.5",
            defaultLang: "it",

            rootCode: "",
            inc: "",

            listUrl: "bridges/php/haXXXndler.php",
            uploadUrl: "bridges/php/handler.php",
            renameUrl: "bridges/php/handler.php",
            copyUrl: "bridges/php/handler.php",
            moveUrl: "bridges/php/handler.php",
            removeUrl: "bridges/php/handler.php",
            //editUrl: "bridges/php/handler.php",
            //getContentUrl: "bridges/php/handler.php",
            createFolderUrl: "bridges/php/handler.php",
            downloadFileUrl: "bridges/php/handler.php",
            downloadMultipleUrl: "bridges/php/handler.php",
            compressUrl: "bridges/php/handler.php",
            extractUrl: "bridges/php/handler.php",
            permissionsUrl: "bridges/php/handler.php",

            searchForm: true,
            sidebar: true,
            breadcrumb: true,
            allowedActions: {
                upload: true,
                rename: true,
                move: true,
                copy: true,
                edit: true,
                changePermissions: true,
                compress: true,
                compressChooseName: true,
                extract: true,
                download: true,
                saveAs: true,                
                downloadMultiple: true,
                preview: false,
                remove: true,
                createFolder: true,
                pickFiles: false,
                pickFolders: false
            },

            multipleDownloadFileName: "angular-filemanager.zip",
            showExtensionIcons: true,
            showSizeForDirectories: false,
            useBinarySizePrefixes: false,
            downloadFilesByAjax: true,
            previewImagesInModal: false,
            enablePermissionsRecursive: false,
            compressAsync: false,
            extractAsync: false,
            pickCallback: null,

            isEditableFilePattern: /\.(txt|diff?|patch|svg|asc|cnf|cfg|conf|html?|.html|cfm|cgi|aspx?|ini|pl|py|md|css|cs|js|jsp|log|htaccess|htpasswd|gitignore|gitattributes|env|json|atom|eml|rss|markdown|sql|xml|xslt?|sh|rb|as|bat|cmd|cob|for|ftn|frm|frx|inc|lisp|scm|coffee|php[3-6]?|java|c|cbl|go|h|scala|vb|tmpl|lock|go|yml|yaml|tsv|lst)$/i,
            isImageFilePattern: /\.(jpe?g|gif|bmp|png|svg|tiff?)$/i,
            isExtractableFilePattern: /\.(gz|tar|rar|g?zip)$/i,
            tplPath: "src/templates"
        };

        return {
            $get: function() {
                return values;
            },
            set: function (constants) {
                angular.extend(values, constants);
            }
        };

    });

})(angular);

