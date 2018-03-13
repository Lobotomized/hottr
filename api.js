var wagner = require('wagner-core');
var express = require('express');
var status = require('http-status');
var request = require('request');
var Notifications = require('./notifications')(wagner);
var roundsPassedMax = 3;


function getFakeDuel(sex){
    var images = ['images/g1.jpg','images/g2.jpg',
    'images/g3.jpg','images/g4.jpg','images/g5.jpg',
    'images/g6.jpg']


    if(sex == 'female'){
        images = ['images/b1.jpg','images/b2.jpg',
    'images/b3.jpg','images/b4.jpg','images/b5.jpg',
    'images/b6.jpg']
    }

    var numOne = Math.floor(Math.random()*images.length)
    var numTwo = Math.floor(Math.random()*images.length)
    while(numTwo == numOne){
        numTwo = Math.floor(Math.random()*images.length);
    }  
    var randomItem = images[numOne];
    var randomItem2 = images[numTwo];

    return {photoOne:randomItem, photoTwo:randomItem2}
}

module.exports = function(wagner){ 
    var api = express.Router();




    var updateDuel = function(duel, User){
            if(duel.roundsPassed>=roundsPassedMax){
                
                    if(duel.score>0){
                        User.findOne({_id:duel.playerOne}, function(error,user){
                            if(user.rank>0){
                                user.rank-=1;
                                user.save(function(error){
                                    if(!error){
                                        Notifications.sendNotification(duel.playerOne, "You've won a duel =) your new rank is " + user.rank)
                                    }
                                });
                            }
                            
                            
                        })

                        User.findOne({_id:duel.playerTwo}, function(error,user){
                            if(user.rank<100){
                                user.rank+=1;
                                user.save(function(error){
                                    if(!error){
                                        Notifications.sendNotification(duel.playerTwo, "You've lost a duel =( your new rank is " + user.rank)
                                    }
                                });
                            }
                        })
                        
                    }
                    else if(duel.score<0){
                        User.findOne({_id:duel.playerTwo}, function(error,user){
                            if(user.rank>0){
                                user.rank-=1;
                                user.save(
                                    function(error){
                                        if(!error){
                                            Notifications.sendNotification(duel.playerTwo, "You've won a duel =) your new rank is " + user.rank)
                                        }
                                    }                                    
                                );
                            }
                        })

                        User.findOne({_id:duel.playerOne}, function(error,user){
                            if(user.rank<100){
                                user.rank+=1;
                                user.save(
                                    function(error){
                                        if(!error){
                                            Notifications.sendNotification(duel.playerOne, "You've lost a duel =( your new rank is " + user.rank)
                                        }
                                    }                                    
                                );
                            }
                        })                    
                    }
                }
    }


    var givePointsToUser = function(req, User){
        if(req.user.points<roundsPassedMax-1){
            User.findOne({_id:req.user._id}, function(error,user){
                    user.points+=1;
                    user.save(function(error){
                        if(error){
                            console.log(error);
                        }
                    })
            })
        }
        else{
            challenge(req);
        }        
    }

    api.get('/', function(req,res){
 
        if(req.user){
            res.redirect("../static");
        }
        else{ 
            res.redirect("../auth/facebook")
        }
    })


    api.get('/duel', wagner.invoke(function(Duel, User){
        return function(req,res){
           return getDuel(req, res, Duel, User);
        }
    }))

    api.get('/notifications', wagner.invoke(function(Notification, User){
        return function(req,res){
            if(!req.user){
                return res.status(status.UNAUTHORIZED).json({error: 'You need to register to check notifications'})
            }
            else{
                Notification.find({ player: req.user._id }).sort({SendedTime:-1}).limit(5).exec(function(error, notifications) {
                    if(error){
                        res.status(status.BAD_REQUEST).json({error: 'This is a bad request'});
                    }
                    else if(!notifications){
                        res.status(status.EXPECTATION_FAILED).json({error:'No such notification'})
                    }
                    else
                    {
                        res.status(status.ACCEPTED).json(notifications);
                    } 
                })
            }
        }
    }))


    api.get('/setnotificationsseen', wagner.invoke(function(Notification, User){
        return function(req,res){
            if(!req.user){
                return res.status(status.UNAUTHORIZED).json({error: 'You need to register to check notifications'})
            }
            else{
                Notification.find({ player: req.user._id }).sort({SendedTime:-1}).limit(5).exec(function(error, notifications) {
                    if(error){
                        res.status(status.BAD_REQUEST).json({error: 'This is a bad request'});
                    }
                    else if(!notifications){
                        res.status(status.EXPECTATION_FAILED).json({error:'No such notification'})
                    }
                    else
                    {
                        for(var i = notifications.length-1; i>=0; i--){
                            if(!notifications[i].seen){
                                notifications[i].seen = true;
                                
                            
                                notifications[i].save(function(error){
                                    if(error){
                                        console.log(error)
                                    }
                                })                                
                            }
                        }
                        res.status(status.ACCEPTED)
                    }
                })
            }
        }
    }))    
    
   var getDuel =  function(req, res, Duel, User){
            if(!req.user){
                return res.
                    status(status.UNAUTHORIZED).
                    json({ error: 'You have to login to vote' });
            } 
            else{
                Duel.findOne({playerOne:{$ne:req.user._id}, playerTwo:{$ne:req.user._id},
                voters:{$ne:req.user._id}, roundsPassed:{$lte:roundsPassedMax},gender:req.user.preferences
                },null,{sort:{Started:-1}}, function(error,duel){
                    if(error){
                        return res.
                            status(status.NOT_FOUND).
                            json({error:"Duel not found"})
                    }
                    else if(!duel){
                        Duel.findOne({playerOne:{$ne:req.user._id}, playerTwo:{$ne:req.user._id},voters:{$ne:req.user._id},
                        gender:req.user.preferences
                        },null,{sort:{Started:-1}}, function(error,duel){
                            if(error){
                                return res.
                                    status(status.NOT_FOUND).
                                    json({error:"Duel not found"})
                            }
                            else if(!duel){
                                var fakeDuel = getFakeDuel(req.user.gender);

                                return res.status(status.OK)
                                          .json(fakeDuel)
                            }
                            else{
                                    var json = {duel:duel,photoOne:null,photoTwo:null}
                                    User.findOne({_id:duel.playerOne}, function(error,userOne){ 
                                        json.photoOne = userOne.picture;

                                    User.findOne({_id:duel.playerTwo}, function(error,userTwo){
                                        json.photoTwo = userTwo.picture;
                                            return res.
                                                status(status.OK).
                                                json(json)                            
                                            })
                                    })
                            }
                        })
                    }
                    else{
                        var json = {duel:duel,photoOne:null,photoTwo:null, user:req.user}
                        User.findOne({_id:duel.playerOne}, function(error,userOne){
                            json.photoOne = userOne.picture;

                           User.findOne({_id:duel.playerTwo}, function(error,userTwo){
                             json.photoTwo = userTwo.picture;
                                return res.
                                    status(status.OK).
                                    json(json)                            
                                })
                        })

                    }
                })
            }
    }


    api.get('/changephoto/:photoId', wagner.invoke(function(User){
        return function(req,res){
            if(!req.user){
                if(!req.user){ 
                    return res.
                        status(status.UNAUTHORIZED).
                        json({ error: 'You have to choose image' });                
                }else{
                    user.picture = user.params.photoId
                    user.save(function(error){
                        if(error){
                            res.status(status.EXPECTATION_FAILED).json({error:error})
                        }else{
                            res.status(status.OK).json({msg:'Image changed'})
                        }
                    })
                }
            }
        }
    }))

    api.get('/albums/:albumId', wagner.invoke(function(User){
        return function(req,res){
            if(!req.user){
                return res.
                    status(status.UNAUTHORIZED).
                    json({ error: 'You have to login to check albums' });                
            }else{
                User.findOne({_id:req.user._id}, function(error,user){
                    if(!user){
                        return res.status(status.INTERNAL_SERVER_ERROR).json({error:error})
                    }
                    else{
                        var options = {
                                    url: 'https://graph.facebook.com/v2.11/'+req.params.albumId+'/photos?fields=album,images',
                                    headers: {
                                        'Authorization':"Bearer "+ user.fbToken
                                    }
                                };
                                request(options, function (error, response, body) {
                                    if(error){
                                        return res.status(status.INTERNAL_SERVER_ERROR).json({error:error})
                                    }else{
                                        var body = JSON.parse(body);
                                        return res.status(status.ACCEPTED).json(body)
                                    }

                                });
                    }

                })
            }
        }
    }))

    api.get('/albums', wagner.invoke(function(User){
        return function(req,res){
            if(!req.user){
                return res.
                    status(status.UNAUTHORIZED).
                    json({ error: 'You have to login to check albums' });                
            }else{
                User.findOne({_id:req.user._id}, function(error,user){
                    if(!user){
                        return res.status(status.INTERNAL_SERVER_ERROR).json({error:error})
                    }
                    else{
                        var options = {
                                    url: 'https://graph.facebook.com/v2.11/'+user.oauth+'/albums',
                                    headers: {
                                        'Authorization':"Bearer "+ user.fbToken
                                    }
                                };
                                request(options, function (error, response, body) {
                                    if(error){
                                        return res.status(status.INTERNAL_SERVER_ERROR).json({error:error})
                                    }else{
                                        var body = JSON.parse(body);
                                        return res.status(status.ACCEPTED).json(body)
                                    }

                                });
                    }

                })
            }
        }
    }))

    api.get('/duel/:duel', wagner.invoke(function(Duel, User){
        return function(req,res){
            
            if(!req.user){
                return res.
                    status(status.UNAUTHORIZED).
                    json({ error: 'You have to login to vote' });
            }
            else{
                Duel.findOne({_id:req.params.duel}, function(error,duel){
                    if(error || !duel){
                        return res.
                            status(status.NOT_FOUND).
                            json({error:"Duel not found"})
                    }
                    else{
                        var json = {duel:duel,photoOne:null,photoTwo:null}
                        User.findOne({_id:duel.playerOne}, function(error,userOne){
                            json.photoOne = userOne.picture;

                           User.findOne({_id:duel.playerTwo}, function(error,userTwo){
                             json.photoTwo = userTwo.picture;
                                return res.
                                    status(status.OK).
                                    json(json)                            
                                })
                        })

                    }
                })
            }
        }
    }))

    api.get('/preferencechange/:preferences', wagner.invoke(function(User){
        return function(req, res){

                if(!req.user){
                    return res.
                        status(status.UNAUTHORIZED).
                        json({ error: 'You have to login to vote' });
                }
            User.findOne({_id:req.user._id}, function(err, user){
                
                if(err){
                    return res.status(status.EXPECTATION_FAILED).json({error:'error'})
                }
                if(!user){
                    return res.status(status.EXPECTATION_FAILED).json({error:'error'})
                }
                if(req.params.preferences == 1 && req.user.preferences == 'female'){
                    user.preferences = 'male';

                    user.save(function(error){
                        if(error){
                            return res.status(status.BAD_REQUEST).json({error:error})
                        }else{
                            return res.status(status.OK).json({ok:'ok'})
                        }
                    })                    

                }
                else if(req.params.preferences == 2 && req.user.preferences == 'male')
                {
                    user.preferences = 'female';

                    user.save(function(error){
                        if(error){
                            return res.status(status.BAD_REQUEST).json({error:error})
                        }else{
                            return res.status(status.OK).json({ok:'ok'})
                        }
                    })                    
                }
                else{
                    return res.status(status.OK).json({ok:'ok'})
                }
            })
        }

    }))

    api.post('/vote/:duel/:vote', wagner.invoke(function(Duel, User){
        return function(req,res){
            if(!req.user){
            return res.
                status(status.UNAUTHORIZED).
                json({ error: 'You have to login to vote' });
            }

            if(!req.params.vote =="first" && !req.params.vote== "second"){
                return res.
                        status(status.EXPECTATION_FAILED).
                        json({error:'Unavailable vote'})
            }

            if(req.params.duel != 'fake')
            {
                
                Duel.findOne({_id:req.params.duel}, function(error,duel){
                    console.log(duel.roundsPassed>=roundsPassedMax)
                    if(error || !duel){
                        return res.
                            status(status.NOT_FOUND).
                            json({error:"Duel not found"})
                    }
                    else if(duel.voters.indexOf(req.user._id)>-1){
                        return res.status(status.EXPECTATION_FAILED).json("Can't vote for duel twice")
                    }
                    else if(duel.roundsPassed>=roundsPassedMax){

                        duel.voters.push(req.user._id);
                        duel.save(function(error){
                            if(error){
                                console.log(error)
                            }
                            else{
                                givePointsToUser(req, User);
                            }
                        }).then(
                            function(err){
                                return getDuel(req,res,Duel,User)
                            }
                        )
                        
                    }                
                    else if(req.params.vote=="first"){

                        duel.score+=1;
                        duel.roundsPassed+=1;
                        duel.voters.push(req.user._id);
                        duel.save(function(error){
                            if(error){
                                console.log(error)
                            }
                            else{
                                givePointsToUser(req, User);
                            }
                        }).then(
                            function(err){
                                if(duel.roundsPassed>=roundsPassedMax){
                                    updateDuel(duel, User);
                                }

                                return getDuel(req,res,Duel,User)
                            }
                        )
                    

                    }
                    else if(req.params.vote == "second"){
                        duel.score-=1;
                        duel.roundsPassed+=1;
                        duel.voters.push(req.user._id);
                        
                        duel.save(function(error){
                            if(error){
                                console.log(error)
                            }
                            else{
                                givePointsToUser(req,User);
    
                            }
                            
                        }).then(function(err){
                            if(duel.roundsPassed>=roundsPassedMax){
                                updateDuel(duel, User); 
                            } 

                                return getDuel(req,res,Duel,User)
                        })   
   
                    }
                    

                    
                })
            }
            else{
                
                        givePointsToUser(req,User)
                        return getDuel(req,res, Duel, User)
                }

            
        }
    }))


  function challenge(req){
      wagner.invoke(function(Challenge,User){
        if(req.user.points>=roundsPassedMax-1){
        var challenge = new Challenge({player:req.user._id, rank:req.user.rank, gender:req.user.gender});


            Challenge.find({ player: req.user._id }, function(error, docs) {
                if (error) {
                console.log(error);
                }
                console.log(docs);
                if(docs.length>0){
                    console.log("Already in a challenge")
                }
                else{
                    challenge.save(function(error) {
                        if (error) {
                            console.log("error");
                        }
                        Challenge.find({ player: req.user._id }, function(error, docs) {
                            if (error) {
                            console.log(error);
                            }
                            
                        });

                        User.findOne({_id:req.user._id}, function(error,user){
                            user.points=0;
                            user.save(function(error){
                                if(error){
                                    console.log(error);
                                } 
                            })
                        })                        
                    });      
                }
            });            
        }          
      })
  }




    return api;
}