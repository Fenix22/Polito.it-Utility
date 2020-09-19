
(function(angular) {

    "use strict";

    angular.module("FileManagerApp").service("fileNavigator", ["apiMiddleware", "fileManagerConfig", "item", 
        function (ApiMiddleware, fileManagerConfig, Item) {

          var FileNavigator = function(x) {
              this.callerCtrl = x;
          
              this.apiMiddleware = new ApiMiddleware();
              this.requesting = false;
              this.fileList = [];
              this.currentPath = [];
              this.currentCode = "";
			  this.pathsToCode = [];
              this.history = [];
              this.error = "";
			  

              this.onRefresh = function() {};
        };

        FileNavigator.prototype.deferredHandler = function(data, deferred, code, defaultMsg) {
            if (!data || typeof data !== "object") {
                this.error = "Error %s - Bridge response error, please check the API docs or this ajax response.".replace("%s", code);
            }
            if (code == 404) {
                this.error = "Error 404 - Backend bridge is not working, please check the ajax response.";
            }
            if (!this.error && data.result && data.result.error) {
                this.error = data.result.error;
            }
            if (!this.error && data.error) {
                this.error = data.error.message;
            }
            if (!this.error && defaultMsg) {
                this.error = defaultMsg;
            }
            if (this.error) {
                return deferred.reject(data);
            }
            return deferred.resolve(data);
        };

        FileNavigator.prototype.list = function(callerCtrl) {
            if (callerCtrl === "FileManagerCtrl") {
                return this.apiMiddleware.list(this.currentPath, this.deferredHandler.bind(this), this.currentCode);
            } else if (callerCtrl === "FileManagerComuneMezzaCtrl") {
                return this.apiMiddleware.listComuneMezza(this.currentPath, this.deferredHandler.bind(this), this.currentCode);
            } else if (callerCtrl === "FileManagerComuneCtrl") {
                return this.apiMiddleware.listComune(this.currentPath, this.deferredHandler.bind(this), this.currentCode);
            }
        };

        FileNavigator.prototype.refresh = function() {
            var self = this;
            var path = self.currentPath.join("/");
			self.pathsToCode[path] = self.currentCode;
			//console.log("pathtocode");
			//console.log(self.pathsToCode);
            self.requesting = true;
            self.fileList = [];

            return self.list(self.callerCtrl).then(function(data) {
                self.fileList = (data.result || []).map(function(file) {
                    return new Item(file, self.currentPath);
                });

                self.buildTree(path);
                self.onRefresh();
            }).finally(function() {
                self.requesting = false;
            });
        };
        
        FileNavigator.prototype.buildTree = function(path) {
            var flatNodes = [], selectedNode = {};

            function recursive(parent, item, path) {
                var absName = path ? (path + "/" + item.model.name) : item.model.name;
                if (parent.name.trim() && path.trim().indexOf(parent.name) !== 0) {
                    parent.nodes = [];
                }
                if (parent.name !== path) {
                    parent.nodes.forEach(function(nd) {
                        recursive(nd, item, path);
                    });
                } else {
                    for (var e in parent.nodes) {
                        if (parent.nodes[e].name === absName) {
                            return;
                        }
                    }
                    parent.nodes.push({item: item, name: absName, nodes: []});
                }
                
                parent.nodes = parent.nodes.sort(function(a, b) {
                    return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : a.name.toLowerCase() === b.name.toLowerCase() ? 0 : 1;
                });
            }

            function flatten(node, array) {
                array.push(node);
                for (var n in node.nodes) {
                    flatten(node.nodes[n], array);
                }
            }

            function findNode(data, path) {
                return data.filter(function (n) {
                    return n.name === path;
                })[0];
            }

            !this.history.length && this.history.push({name: "", nodes: []});
            flatten(this.history[0], flatNodes);
            selectedNode = findNode(flatNodes, path);
            selectedNode && (selectedNode.nodes = []);

            for (var o in this.fileList) {
                var item = this.fileList[o];
                item instanceof Item && item.isFolder() && recursive(this.history[0], item, path);
            }
        };

        FileNavigator.prototype.folderClick = function(item) {
            this.currentPath = [];
            this.currentCode = "";
            if (item && item.isFolder()) {
                this.currentPath = item.model.fullPath().split("/").splice(1);
                                this.currentCode = item.model.code;
            }
            this.refresh();
        };

        FileNavigator.prototype.linkClick = function(item) {
            location.assign("https://didattica.polito.it/portal/pls/portal/" + item.model.link);
        };

		FileNavigator.prototype.updateCurrentCode = function() {
		
			var path = this.currentPath.join("/");

			this.currentCode = this.pathsToCode[path];
		};
		
        FileNavigator.prototype.upDir = function() {
            if (this.currentPath[0]) {
                this.currentPath = this.currentPath.slice(0, -1);
				this.updateCurrentCode();
                this.refresh();
            }
        };

        FileNavigator.prototype.goTo = function(index) {
            this.currentPath = this.currentPath.slice(0, index + 1);
			this.updateCurrentCode();
            this.refresh();
        };

        FileNavigator.prototype.fileNameExists = function(fileName) {
            return this.fileList.find(function(item) {
                return fileName.trim && item.model.name.trim() === fileName.trim();
            });
        };

        FileNavigator.prototype.listHasFolders = function() {
            return this.fileList.find(function(item) {
                return item.model.type === "dir";
            });
        };

        return FileNavigator;
    }]);

})(angular);

