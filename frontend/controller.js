var app = angular.module('main', []);
app.controller('Ctrl', function($scope, $http) {

    $scope.duel = {}
    $scope.notifications = [];
    $scope.user = {};
    $scope.accepts = true;
    $scope.photoOne = '';
    $scope.photoTwo = '';
    $scope.newNotifications = 0;


    $scope.vote = function(vote){
        if(!$scope.accepts){
            return;
        }
        $scope.accepts = false;
        var word = 'fake'
        if($scope.duel){
            word = $scope.duel._id
        }
        console.log(word);
            $http({
                method:'POST',
                url: '/vote/'+word+'/'+vote
            }).then(function successCallback(response){
                console.log(response.data)
                if(!response.data.duel){
                  $scope.photoOne = response.data.photoOne;
                  $scope.photoTwo = response.data.photoTwo;
                  $scope.duel = false;
                }else{
                    $scope.duel = response.data.duel;
                    $scope.photoOne = response.data.photoOne;
                    $scope.photoTwo = response.data.photoTwo;

                    $scope.user = response.data.user;
                    
                }
                $scope.accepts = true;

            }, function errorCallback(response){

            })
    }

    $scope.getNotifications = function(){
        $http({
            method:'GET',
            url:'/notifications'
        }).then(function successCallback(response){
            $scope.notifications = response.data;
            numberOfUnseenNotifications();
        }, function errorCallback(response){
            
        })
    }

    
    $scope.setNotificationsSeen = function(){
        $http({
            method:'POST',
            url:'/setnotificationsseen'
        }).then(function successCallback(response){

        }, function errorCallback(response){

        })
    }

    function numberOfUnseenNotifications(){
        $scope.newNotifications = 0;
        console.log($scope.notifications)
        for(var i= $scope.notifications.length-1; i>=0; i--){
            if(!$scope.notifications[i].seen){
                $scope.newNotifications++;
            }
        }
    }

    function getDuel(){
        $http({
            method: 'GET',
            url: '/duel'
            }).then(function successCallback(response) {
                // this callback will be called asynchronously
                // when the response is available
                $scope.duel = response.data.duel;
                $scope.photoOne = response.data.photoOne;
                $scope.photoTwo = response.data.photoTwo;
            }, function errorCallback(response) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });  
    }

    $scope.init = function(){
        getDuel();
        $scope.getNotifications(); 
        
    }
    
    $scope.init();

});
