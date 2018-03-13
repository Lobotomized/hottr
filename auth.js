function setupAuth(User,app){
    var passport = require('passport');
    var FacebookStrategy = require('passport-facebook').Strategy;
    

    passport.serializeUser(function(user, done){
        done(null,user._id);
    })  

    passport.deserializeUser(function(id,done){
        User.findOne({_id:id}).exec(done);
    })

    passport.use(new FacebookStrategy({
      clientID: "1976250656033790",
      clientSecret: "3aec1af8d77ed4c50b78c443839eac3a",
      callbackURL: 'http://hottr.xyz/auth/facebook/callback',
      authorizationURL: 'https://www.facebook.com/v2.11/dialog/oauth',
      profileFields: ['id','displayName','gender', 'photos','albums']
    },

    
    function(accessToken, refreshToken,profile,done){
      var preferences = 'male'
      if(profile.gender == 'male'){
        preferences = 'female'
      }
      console.log(accessToken, ' token')
        User.findOneAndUpdate(
            { 'oauth': profile.id }, 
            {
            $set: {
                'username': profile.displayName, 
                'picture': 'http://graph.facebook.com/' +
                 profile.id.toString() + '/picture?type=large',
                 'preferences':preferences,
                 'gender':profile.gender,
                 'fbToken':accessToken
            }
            },
            { 'new': true, upsert: true, runValidators: true, setDefaultsOnInsert:true },
            function(error, user) {
            done(error, user);
            }); 

} 
    
    ))

  // Express middlewares
  app.use(require('express-session')({
    secret: 'this is a secret'
  }));  
  app.use(passport.initialize());
  app.use(passport.session());


  // Express routes for auth
  app.get('/auth/facebook',
    passport.authenticate('facebook', { scope : ['email', 'user_friends','user_photos'] }));

  app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/fail' }),
    function(req, res) {
      res.redirect("/static");
    }); 

}


module.exports = setupAuth;