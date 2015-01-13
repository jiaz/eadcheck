'use strict';

angular.module('eadcheckApp')
  .controller('MainCtrl', function ($scope, $http) {
    $scope.cases = [];

    $http.get('/api/cases').success(function(cases) {
      $scope.cases = cases;
    })

  });
