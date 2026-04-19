const User=require("../models/User")
const bcrypt=require("bcryptjs")
const jwt=require("jsonwebtoken")


const getUsers = async (req, res) => {
  const users = await User.find().select("_id name email");
  console.log(users)
  res.json(users);
};

const registerUser=async(req,res)=>{
    try{
    const {name,email,password}=req.body
    const existingUser=await User.findOne({email});
    
    if(existingUser){
        return res.status(400).json({message:"User already exists"})
    }
    const hashedPassword=await bcrypt.hash(password,10)

    const user=await User.create({name,email,password:hashedPassword})
    res.status(201).json({
        message:"User Created Successfully",
        user,
    })}
    catch(error){
        res.status(500).json({message:error.message})
    }
}
const loginUser=async(req,res)=>{
    try{
        const{email,password}=req.body
        const user=await User.findOne({email})
        if(!user){
            return res.status(400).json({message:"Invalid Credentials"});
        }
        const isMatch=await bcrypt.compare(password,user.password)
        if(!isMatch){
            return res.status(400).json({message:"Invalid Credentials"})
        }
        //genearte token
        const token=jwt.sign(
            {id:user._id},"secretkey",{expiresIn:"1d"}
        )
        res.status(200).json({
            message:"Login successful",
            token
        })
        

        }
        catch(error){
         res.status(500).json({message:error.message})
        }

        }

module.exports={registerUser,loginUser,getUsers}