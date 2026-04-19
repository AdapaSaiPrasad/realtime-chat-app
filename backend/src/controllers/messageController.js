const Message=require("../models/Message")


const sendMessage = async (req, res) => {
  try {
    const { receiver, content } = req.body;
    if (!receiver || !content) {
    return res.status(400).json({ message: "Receiver and content required" });
}

    // 1. Save in DB
    const message = await Message.create({
      sender: req.user.id,
      receiver,
      content,
    });

    // 2. Emit via socket
    const io = req.app.get("io"); // get io instance
    const users = req.app.get("users");

    const receiverSocketId = users[receiver];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receiveMessage", message);
    }
    else{
        console.log("User offline, message stored in DB")
    }

    res.status(201).json({
      message: "Message sent successfully",
      data: message,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const getMessages=async(req,res)=>{
    try{
        const receiverId=req.params.receiverId;
        const userId=req.user.id
        const messages=await Message.find({
        $or:[
            {sender:userId,receiver:receiverId},
            {sender:receiverId,receiver:userId}
        ]
    }).sort({createdAt:1})

    res.status(200).json({
        data:messages
    })
}
catch(error){

    res.status(500).json({message:error.message})
}
}

module.exports={sendMessage,getMessages}


