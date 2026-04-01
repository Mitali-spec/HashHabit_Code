const express=require("express");
const app=express();

const mongoose=require("mongoose");

app.use(express.static(__dirname)); //ALLOWS STATIC FILES TO BE SEND

//when user types url, fetch website

app.use(express.urlencoded({extended: true}));
app.get("/", function(req,res){
    res.sendFile(__dirname + "/signup_and_login.html");
})
app.listen(3000,function(){
    console.log("server is listening on port 3000");
})


//connect node.js to mongodb
mongoose.connect("mongodb://127.0.0.1:27017/username_and_password")
.then(() => {
    console.log("connected");
})
.catch(err => {
    console.log(err);
})

//create schema
const schema= new mongoose.Schema({
    username:String,
    password:String
});
//create model
const user = mongoose.model("user",schema);

//when user clicks signup submit data to mongodb

app.post("/signup", async function(req,res){
    const username=req.body.username;
   
    const password = req.body.password;

    //to ensure that username is unique
    const existing_user=await user.findOne({username:username});
    if(existing_user){
        return res.send("username already exists");
    }
    
    const newuser=new user({
        username:username,
        password:password

    });
    await newuser.save();
    // ✅ REDIRECT
    res.redirect("/HOME_PAGE/home_page.html");
  
})
//LOGIN LOGIC
app.post("/login",async function(req,res){
    const username=req.body.username;
    const password=req.body.password;
    const existing_user=await user.findOne({username:username});
    if(!existing_user){
        return res.send("user not found");
    }
    if(existing_user.password===password){
        // ✅ REDIRECT
    res.redirect("/HOME_PAGE/home_page.html");

    }
    else{
         res.send("wrong password");
    }


});
