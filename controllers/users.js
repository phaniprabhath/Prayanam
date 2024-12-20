const User=require("../models/user");

module.exports.renderSignUpForm=(req,res)=>{
    res.render("users/signup.ejs");
};

module.exports.signup=async(req,res)=>{
    try{
        let {username,email,password}=req.body;
        const newUser =new User({email,username});
        const registeredUser=await User.register(newUser,password); // important async method to register a user
        req.login(registeredUser,(err)=>{
            if(err){
                return next(err);
            }
            req.flash("success",`Welcome  ${username}`);
            res.redirect("/listings");
        });
    } catch(e){
        req.flash("error",e.message);
        res.redirect("/signup");
    }
};

module.exports.renderLoginForm=(req,res)=>{
    res.render("users/login.ejs");
};

module.exports.login=  async(req,res)=>{
    req.flash("success","Welcome back ");
    let redirectUrl=res.locals.redirectUrl || "/listings"; // This is for making user login to his desired page rather than '/listings' always
    res.redirect(redirectUrl);
};

module.exports.logout=(req,res,next)=>{
    req.logout((err)=>{ // an error parameter is written inside callback,err will be empty if there is no error while logging out 
        if(err){
            next(err);
        }
        req.flash("success","You are logged out");
        res.redirect("/listings");
    })
};