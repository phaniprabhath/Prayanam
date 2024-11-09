const express=require("express");
const router = express.Router();
const User=require("../models/user");
const wrapAsync=require("../utils/wrapAsync");
const passport=require("passport");

router.get("/signup",(req,res)=>{
    res.render("users/signup.ejs");
});

router.post("/signup",wrapAsync(async(req,res)=>{
    try{
        let {username,email,password}=req.body;
        const newUser =new User({email,username});
        const registeredUser=await User.register(newUser,password); // important async method to register a user
        req.login(registeredUser,(err)=>{
            if(err){
                return next(err);
            }
            req.flash("success","Welcome");
            res.redirect("/listings");
        });
    } catch(e){
        req.flash("error",e.message);
        res.redirect("/signup");
    }
}));

router.get("/login",(req,res)=>{
    res.render("users/login.ejs");
})

router.post("/login",passport.authenticate("local",{
    failureRedirect:"/login",
    failureFlash:true,
    }),
    async(req,res)=>{
        req.flash("success","Welcome back ");
        res.redirect("/listings");
    }
);

router.get("/logout",(req,res,next)=>{
    req.logout((err)=>{ // an error parameter is written inside callback,err will be empty if there is no error while logging out 
        if(err){
            next(err);
        }
        req.flash("success","You are logged out");
        res.redirect("/listings");
    })
})

module.exports=router;