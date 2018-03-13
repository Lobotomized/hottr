module.exports = function(wagner){

    var sendNotification = function(userId, text){
        wagner.invoke(function(Notification){
            var notif = new Notification();
            notif.text = text;
            notif.player = userId;
            notif.save(function(error){
                if(error){
                 console.log(error)
                }
            })            
        })
    }

    var methods = {
        sendNotification: sendNotification
    }

    return methods
};