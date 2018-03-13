var wagner = require('wagner-core');

var startDuel = function(){
    wagner.invoke(function(Challenge) {
        Challenge.findOne({},null,{sort:{Started:1}}, function(error, firstChallenge) {
            if(error)
            {
                console.log(error);
            
            }
            else if(!firstChallenge){
            }
            else
            {
                var filter ={_id:{$ne: firstChallenge._id},gender:firstChallenge.gender, rank:{$lte:firstChallenge.rank+10, $gte:firstChallenge.rank-10}};
                
                Challenge.findOne(filter, function(error, secondChallenge){
                    if(secondChallenge){
                        
                        wagner.invoke(function(Duel){
                            var duel = new Duel({
                                playerOne:firstChallenge.player,
                                playerTwo:secondChallenge.player,
                                gender:firstChallenge.gender
                            })
                            duel.save(function(error){
                                if(!error){
                                    Challenge.deleteOne({_id: firstChallenge._id}, function(err){
                                        if(err)
                                        {
                                        }
                                        else{
                                            Challenge.deleteOne({_id: secondChallenge._id}, function(erro){
                                            });  
                                        }
                                      
                                    });

                                    
                                }
                            })
                        })
                    }
                    else{

                        firstChallenge.Started = Date.now();
                        firstChallenge.save(function(error){
                        }) 
                    }

                })
            }            
        })
    });    
}

setInterval(startDuel, 1000);