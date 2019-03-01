(function() {
  angular.module("oxymoron.config.http", [])
  .config(['$httpProvider', '$locationProvider', '$stateProvider', function($httpProvider, $locationProvider, $stateProvider) {
    /*
     *  Set token for AngularJS ajax methods
    */
    $httpProvider.defaults.headers.common['X-Requested-With'] = 'AngularXMLHttpRequest';
    $httpProvider.defaults.paramSerializer = '$httpParamSerializerJQLike';
  }])
angular.module("oxymoron.config.states", [])
  .config(['$locationProvider', '$stateProvider', '$urlRouterProvider', '$urlMatcherFactoryProvider', function ($locationProvider, $stateProvider, $urlRouterProvider, $urlMatcherFactoryProvider) {
    /*
     *  Enable HTML5 History API
    */
    $locationProvider.html5Mode({enabled: true, requireBase: false});

    /*
     *  $stateProvider Rails
    */
    $urlRouterProvider.rule(function($injector, $location) {
      var path = $location.path();
      var hasTrailingSlash = path[path.length-1] === '/';

      //for later access in tempalteUrl callback
      $stateProvider.oxymoron_location = $location;

      if(hasTrailingSlash) {
        var newPath = path.substr(0, path.length - 1); 
        return newPath; 
      }
    });

    var resolve = function (action, $stateParams) {
      return function (actionNames, callback) {
        try {
          var actionNames = angular.isArray(actionNames) ? actionNames : [actionNames];
          
          if (actionNames.indexOf(action)!=-1) {
            callback($stateParams);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }

    $stateProvider.rails = function () {
      $stateProvider
      
        .state('rails_info_properties_path', {
          url: '/rails/info/properties',
          
          templateUrl: function(params) {
            params['ng-view']='';
            
            
            return Routes['rails_info_properties_path'](params);
          },
          controller: 'RailsInfoCtrl as ctrl',
          resolve: {
            action: ['$stateParams', function ($stateParams) {
              return resolve('properties', $stateParams)
            }]
          }
        })
      
        .state('rails_info_routes_path', {
          url: '/rails/info/routes',
          
          templateUrl: function(params) {
            params['ng-view']='';
            
            
            return Routes['rails_info_routes_path'](params);
          },
          controller: 'RailsInfoCtrl as ctrl',
          resolve: {
            action: ['$stateParams', function ($stateParams) {
              return resolve('routes', $stateParams)
            }]
          }
        })
      
        .state('rails_info_path', {
          url: '/rails/info',
          
          templateUrl: function(params) {
            params['ng-view']='';
            
            
            return Routes['rails_info_path'](params);
          },
          controller: 'RailsInfoCtrl as ctrl',
          resolve: {
            action: ['$stateParams', function ($stateParams) {
              return resolve('index', $stateParams)
            }]
          }
        })
      
        .state('rails_mailers_path', {
          url: '/rails/mailers',
          
          templateUrl: function(params) {
            params['ng-view']='';
            
            
            return Routes['rails_mailers_path'](params);
          },
          controller: 'RailsMailersCtrl as ctrl',
          resolve: {
            action: ['$stateParams', function ($stateParams) {
              return resolve('index', $stateParams)
            }]
          }
        })
      
        .state('rails_service_blob_path', {
          url: '/rails/active_storage/blobs/:signed_id/*filename',
          
          templateUrl: function(params) {
            params['ng-view']='';
            
            
            return Routes['rails_service_blob_path'](params);
          },
          controller: 'ActiveStorageBlobsCtrl as ctrl',
          resolve: {
            action: ['$stateParams', function ($stateParams) {
              return resolve('show', $stateParams)
            }]
          }
        })
      
        .state('rails_blob_representation_path', {
          url: '/rails/active_storage/representations/:signed_blob_id/:variation_key/*filename',
          
          templateUrl: function(params) {
            params['ng-view']='';
            
            
            return Routes['rails_blob_representation_path'](params);
          },
          controller: 'ActiveStorageRepresentationsCtrl as ctrl',
          resolve: {
            action: ['$stateParams', function ($stateParams) {
              return resolve('show', $stateParams)
            }]
          }
        })
      
        .state('rails_disk_service_path', {
          url: '/rails/active_storage/disk/:encoded_key/*filename',
          
          templateUrl: function(params) {
            params['ng-view']='';
            
            
            return Routes['rails_disk_service_path'](params);
          },
          controller: 'ActiveStorageDiskCtrl as ctrl',
          resolve: {
            action: ['$stateParams', function ($stateParams) {
              return resolve('show', $stateParams)
            }]
          }
        })
      
      return $stateProvider;
    }
  }])

  .config(['$provide',
    function($provide) {
      $provide.decorator('$state', ['$delegate', function($delegate) {
        var state = $delegate;
        state.baseGo = state.go;

        var go = function(to, params, options) {
          options = options || {};

          if (state.defaultParams) {
            var defaultParams = angular.copy(state.defaultParams);
            params = angular.extend(defaultParams, params);
          }

          options.inherit = false;

          state.baseGo(to, params, options);
        };
        state.go = go;

        return $delegate;
      }]);
    }
  ])
angular.module("oxymoron.config.debug", [])
.config(['$compileProvider', function ($compileProvider) {
  $compileProvider.debugInfoEnabled(true);
}]);

angular.module("oxymoron.config", ['oxymoron.config.http', 'oxymoron.config.states', 'oxymoron.config.debug'])

  angular.module("oxymoron.services.interceptor", [])
  .factory('httpInterceptor', ['$q', '$rootScope', '$log', function ($q, $rootScope, $log) {
    return {
      request: function (config) {
        $rootScope.$broadcast('loading:progress');
        return config || $q.when(config);
      },
      response: function (response) {
        $rootScope.$broadcast('loading:finish', response);
        return response || $q.when(response);
      },
      responseError: function (response) {
        $rootScope.$broadcast('loading:error', response);
        return $q.reject(response);
      }
    };
  }])
  .config(['$httpProvider', function ($httpProvider) {
    $httpProvider.interceptors.push('httpInterceptor');
  }])
angular.module("oxymoron.services.resources", [])
  .factory('resourceDecorator', [function () {
    return function(resource) {
      return resource;
    };
  }])

  
    .factory('RailsServiceBlob', ['$resource', 'resourceDecorator', function ($resource, resourceDecorator) {
      return resourceDecorator($resource('/rails/active_storage/blobs/:signed_id/*filename.json', {"signed_id":"@signed_id","filename":"@filename"}, {
        "new": {
          "method": "GET",
          "url": "/rails/active_storage/blobs/:signed_id/*filename/new.json"
        },
        "edit": {
          "method": "GET",
          "url": "/rails/active_storage/blobs/:signed_id/*filename/edit.json"
        },
        "update": {
          "method": "PUT"
        },
        "create": {
          "method": "POST"
        },
        "destroy": {
          "method": "DELETE"
        }
      }));
    }])
  
    .factory('RailsBlobRepresentation', ['$resource', 'resourceDecorator', function ($resource, resourceDecorator) {
      return resourceDecorator($resource('/rails/active_storage/representations/:signed_blob_id/:variation_key/*filename.json', {"signed_blob_id":"@signed_blob_id","variation_key":"@variation_key","filename":"@filename"}, {
        "new": {
          "method": "GET",
          "url": "/rails/active_storage/representations/:signed_blob_id/:variation_key/*filename/new.json"
        },
        "edit": {
          "method": "GET",
          "url": "/rails/active_storage/representations/:signed_blob_id/:variation_key/*filename/edit.json"
        },
        "update": {
          "method": "PUT"
        },
        "create": {
          "method": "POST"
        },
        "destroy": {
          "method": "DELETE"
        }
      }));
    }])
  
    .factory('RailsDiskService', ['$resource', 'resourceDecorator', function ($resource, resourceDecorator) {
      return resourceDecorator($resource('/rails/active_storage/disk/:encoded_key/*filename.json', {"encoded_key":"@encoded_key","filename":"@filename"}, {
        "new": {
          "method": "GET",
          "url": "/rails/active_storage/disk/:encoded_key/*filename/new.json"
        },
        "edit": {
          "method": "GET",
          "url": "/rails/active_storage/disk/:encoded_key/*filename/edit.json"
        },
        "update": {
          "method": "PUT"
        },
        "create": {
          "method": "POST"
        },
        "destroy": {
          "method": "DELETE"
        }
      }));
    }])
  
angular.module("oxymoron.services.sign", [])
  .service('Sign', ['$http', function ($http) {
    var Sign = this;

    Sign.out = function (callback) {
      $http.delete(Routes.destroy_user_session_path())
        .success(function () {
          if (callback)
            callback()
        })
    }

    Sign.in = function (user_params, callback) {
      $http.post(Routes.user_session_path(), {user: user_params})
        .success(function () {
          if (callback)
            callback();
        })
    }

    Sign.up = function (user_params, callback) {
      $http.post(Routes.user_registration_path(), {user: user_params})
        .success(function () {
          if (callback)
            callback();
        })
    }
  }])
angular.module("oxymoron.services.validate", [])
  .factory('Validate', [function(){
    return function (form, errors){
      try {
        var $form = angular.element(document.querySelector('[name="'+form+'"]')).scope()[form];
      } catch(e) {
        var $form = {};
      }

      angular
        .element(document.querySelectorAll('.rails-errors')).remove();

      angular.forEach($form, function(ctrl, name) {
        if (name.indexOf('$') != 0) {
          angular.forEach(ctrl.$error, function(value, name) {
            ctrl.$setValidity(name, null);
          });
        }
      });


      angular.forEach(errors, function(errors_array, key) {
        var form_key = form+'['+key+']';
        try {
          if ($form[form_key]) {
            $form[form_key].$setTouched();
            $form[form_key].$setDirty();
            $form[form_key].$setValidity('server', false);
          }
          
          angular
            .element(document.querySelector('[name="'+form_key+'"]'))
            .parent()
            .append('<div class="rails-errors" ng-messages="'+form_key+'.$error"><div ng-message="server">'+errors_array[0]+'</div></div>')
        } catch(e) {
          console.log(e)
          console.warn('Element with name ' + form_key + ' not found for validation.')
        }
      });
    };
  }])
angular.module("oxymoron.services.notice", [])
.service('Notice', ['ngNotify', function(ngNotify){
  var Notice = this;

  Notice.callback = function (type, res) {
    ngNotify.set(res.data.msg || res.data.error, type);
  }
}])

angular.module("oxymoron.services", ["oxymoron.services.interceptor", "oxymoron.services.notice", "oxymoron.services.resources", "oxymoron.services.sign", "oxymoron.services.validate"])
  angular.module("oxymoron.directives.contentFor", [])
  .directive("contentFor", [
    "$compile", function($compile) {
      return {
        compile: function(el, attrs, transclude) {
          var template = el.html();

          return {
            pre: function(scope, iElement, iAttrs, controller) {
              var DOMElements = angular.element(document.querySelectorAll('[ng-yield="'+iAttrs.contentFor+'"]'));
              if (DOMElements.attr("only-text") == "true") {
                template = el.text().replace(/(?:\r\n|\r|\n)/g, ' ');
              }
              DOMElements.html((DOMElements.attr("prefix") || "") + template + (DOMElements.attr("postfix") || ""))
              $compile(DOMElements)(scope);

              
              return iElement.remove();
            }
          };
        }
      };
    }
  ])
angular.module("oxymoron.directives.fileupload", [])
  .directive('fileupload', ['$http', '$timeout', '$cookies', 'ngNotify', function ($http, $timeout, $cookies, ngNotify) {
    return {
      scope: {
        fileupload: "=",
        ngModel: "=",
        hash: "=",
        percentCompleted: "=",
        maxSize: "="
      },
      restrict: 'A',
      link: function($scope, element, attrs) {
        $scope.percentCompleted = undefined;

        element.bind('change', function(){
          var valid = true;
          if ($scope.xhr) $scope.xhr.abort();

          var fd = new FormData();

          angular.forEach(element[0].files, function (file) {
            if ($scope.maxSize && file.size/1024/1024 > $scope.maxSize) {
              valid = false;
              return
            }
            fd.append("attachments[]", file);
          })

          if (!valid) {
            ngNotify.set("File size is more then " + $scope.maxSize + " Mb", "error")
            return false;
          }

          $scope.xhr = new XMLHttpRequest;

          $scope.percentCompleted = 0;
          
          $scope.xhr.upload.onprogress = function(e) {
              $scope.$apply(function() {
                  if (e.lengthComputable) {
                      $scope.percentCompleted = Math.round(e.loaded / e.total * 100);
                  }
              });
          };

          $scope.xhr.onload = function() {
            var res = JSON.parse(this.responseText)
            
            if (this.status == 200) {
              $scope.$apply(function() {
                if (!$scope.hash) {
                  if (attrs.multiple) {
                    $scope.ngModel = $scope.ngModel || [];
                    angular.forEach(res, function (attachment) {
                      $scope.ngModel.push(attachment);
                    });
                  } else {
                    $scope.ngModel = res[0];
                  }
                } else {
                  $scope.ngModel = $scope.ngModel || {};
                  angular.forEach(res, function(value, key) {
                    $scope.ngModel[key] = $scope.ngModel[key] || [];
                    angular.forEach(value, function (attachment) {
                      $scope.ngModel[key].push(attachment);
                    });
                  });
                }

                $scope.percentCompleted = undefined;
              });
            } else {
              ngNotify.set(res.msg || "Uploading error", "error")
            }
          };


          $scope.xhr.open('POST', $scope.fileupload);
          $scope.xhr.setRequestHeader('X-XSRF-Token', $cookies.get('XSRF-TOKEN'));
          $scope.xhr.send(fd);

          element[0].value = '';
        })
      }
    }
  }])
angular.module("oxymoron.directives.clickOutside", [])
  .directive('clickOutside', ['$document', function ($document) {
    return {
      restrict: 'A',
      scope: {
        clickOutside: '&',
        clickOutsideIf: '='
      },
      link: function (scope, el, attr) {
        var handler = function (e) {
          if (scope.clickOutsideIf && el !== e.target && !el[0].contains(e.target) && document.body.contains(e.target)) {
            scope.$apply(function () {
                scope.$eval(scope.clickOutside);
            });
          }
        }

        $document.bind('click', handler);

        scope.$on('$destroy', function () {
          $document.unbind('click', handler)
        })
      }
    }
  }])

angular.module("oxymoron.directives", ['oxymoron.directives.fileupload', 'oxymoron.directives.contentFor', 'oxymoron.directives.clickOutside'])
  angular.module("oxymoron.notifier", [])
  .run(['$rootScope', 'ngNotify', 'Validate', '$state', '$http', '$location', 'Notice', function ($rootScope, ngNotify, Validate, $state, $http, $location, Notice) {
    ngNotify.config({
        theme: 'pure',
        position: 'top',
        duration: 2000,
        type: 'info'
    });

    var callback = function(type, res) {
      if (res.data && angular.isObject(res.data)) {
        if (res.data.msg || res.data.error) {
          Notice.callback(type, res);
        }

        if (res.data.errors) {
          Validate(res.data.form_name || res.config.data.form_name, res.data.errors)
        }

        if (res.data.reload) {
          if (res.data.redirect_to_url) {
            window.location = res.data.redirect_to_url;
          } else if (res.data.redirect_to) {
            $state.transitionTo(res.data.redirect_to, res.data.redirect_options || {}, {notify: false, location: true, reload: true});
          }
        } else {
          if (res.data.redirect_to_url) {
            $location.url(res.data.redirect_to_url);
          } else if (res.data.redirect_to) {
            $state.go(res.data.redirect_to, res.data.redirect_options || {});
          }
        }

        if (res.data.reload) {
          window.location.reload();
        }
      }
    }

    $rootScope.$on('loading:finish', function (h, res) {
      callback('success', res)
    })

    $rootScope.$on('loading:error', function (h, res, p) {
      callback('error', res)
    })


  }])

  angular.module('oxymoron', ['ngNotify', 'ngCookies', 'ui.router', 'ngResource', 'oxymoron.directives', 'oxymoron.services', 'oxymoron.config', 'oxymoron.notifier'])

}).call(this);

(function () {
  var Routes = function () {
    var self = this,
        routes = {"rails_info_properties":{"defaults":{},"path":"/rails/info/properties"},"rails_info_routes":{"defaults":{},"path":"/rails/info/routes"},"rails_info":{"defaults":{},"path":"/rails/info"},"rails_mailers":{"defaults":{},"path":"/rails/mailers"},"rails_service_blob":{"defaults":{},"path":"/rails/active_storage/blobs/:signed_id/*filename"},"rails_blob_representation":{"defaults":{},"path":"/rails/active_storage/representations/:signed_blob_id/:variation_key/*filename"},"rails_disk_service":{"defaults":{},"path":"/rails/active_storage/disk/:encoded_key/*filename"},"update_rails_disk_service":{"defaults":{},"path":"/rails/active_storage/disk/:encoded_token"},"rails_direct_uploads":{"defaults":{},"path":"/rails/active_storage/direct_uploads"}};

    self.defaultParams = {}

    var serialize = function(obj, prefix) {
      var str = [];
      for(var p in obj) {
        if (obj.hasOwnProperty(p)) {
          var k = prefix ? prefix + "[" + (Array.isArray(obj) ? '' : p) + "]" : p, v = obj[p];
          str.push(typeof v == "object" ?
            serialize(v, k) :
            encodeURIComponent(k) + "=" + encodeURIComponent(v));
        }
      }
      return str.join("&");
    }

    var omit = function (hash, key) {
      var hash = angular.copy(hash);
      delete hash[key]
      return hash
    }


    angular.forEach(routes, function (val, key) {
      var result = '';

      var gsub = function(params) {
        if (params.format) {
          result += '.' + params.format
        }

        var params = omit(params, 'format');
        angular.forEach(params, function (v, k) {
          var subst = ':' + k;
          if (result.search(subst) != -1) {
            result = result.replace(subst, v);
            params = omit(params, k);
          }
        })

        if (result.search(/\*\w+/)!=-1) {
          result = result.replace(/\*(\w+)/, function (a, b) {
            return params[b];
          })
        }
        
        if (Object.keys(params).length)
          result += '?'+serialize(params)

        return result;
      }

      self[key+'_path'] = function (params) {
        var params = angular.extend(angular.copy(val.defaults), params || {});
        result = val.path;
        var defaultParams = angular.copy(self.defaultParams);
        return gsub(angular.extend(defaultParams, params));
      }

      self[key+'_url'] = function (params) {
        return window.location.origin + self[key+'_path'](params)
      }
    })
  }

  window.Routes = new Routes();

}).call(this)
