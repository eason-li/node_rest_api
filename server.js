var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var jwt = require('jsonwebtoken');
var sha1 = require('sha1');

if(!fs.existsSync('user_store'))
fs.mkdirSync('user_store');

var app = express();
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.post('/info',function(req,res){
  var token = req.body.token;
  jwt.verify(token,'some_magic_word',function(err,decoded){
    if(err){
      res.status(500);
      res.end();
    }else{
      res.json({success:true,email:decoded.email});
    }

  });
});


app.post('/register',function(req,res){
  var email = req.body.email;
  var password = req.body.password;
  var filepath = 'user_store/' + email;
  fs.exists(filepath, function(exists){
    if(exists){
      res.json({success:false,message:'email exists'});
    }else{
      fs.appendFile(filepath,sha1(password),function(err){
        if(err) throw err;
        res.json({success:true});
      });
    }
  });
});



app.post('/login',function(req,res){
  var email = req.body.email;
  var password = req.body.password;
  var filepath = 'user_store/' + email;
  var token;
  fs.exists(filepath, function(exists){
    if(exists){
      fs.readFile(filepath,function(err,data){
        if(err) throw err;
        if(data == sha1(password)){
          token = jwt.sign({email:email},'some_magic_word',{
            expiresIn: 60
          });
          res.json({success:true,token:token});
        }else{
          res.status(401);
          res.end();
        }
      });
    }else{
      res.status(401);
      res.end();
    }
  });

});




app.listen(3000);
