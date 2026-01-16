import cloudinary from "../lib/cloudinary.js";
import Message from "../models/messageModel.js";
import User from "../models/userModel.js";
import { io, userSocketMap } from "../server.js";

// get all user except loged in user
export const getUsersForSidebar = async (req, res) => {
    try {
        const userId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: userId } }).select("-password");

        // count number of message not seen
        const unseenMessages = {};
        const promises = filteredUsers.map(async (user) => {
            const message = await Message.find({ senderId: user._id, receiverId: userId, seen: false })

            if (message.length > 0) {
                unseenMessages[user._id] = message.length;
            }
        })
        await Promise.all(promises)
        res.json({ success: true, users: filteredUsers, unseenMessages })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// gett all message selected user
export const getMessages = async (req, res) => {
    try {
        const { id: selectedUserId } = req.params;
        const myId = req.user._id

        const messages = await Message.find({
            $or: [
                {
                    senderId: myId,
                    receiverId: selectedUserId,
                },
                {
                    senderId: selectedUserId,
                    receiverId: myId,
                },
            ]
        })
        await Message.updateMany({ senderId: selectedUserId, receiverId: myId }, { seen: true })

        res.json({ success: true, messages })
    }
    catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// Api to mark message as senn using message id
export const markMessageAsSeen = async (req, res) => {
    try {
        const { id } = req.params;
        await Message.findByIdAndUpdate(id, { seen: true })

        res.json({ success: true })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// send message to selected user
export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const receiverId = req.params.id;
        const senderId = req.user._id;
        let imageUrl;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }
        const newMessage = await Message.create({
            senderId,
            receiverId,
            text,
            image: imageUrl
        })

        // Emmit the new message to reciver message
        const receiverSocketId = userSocketMap[receiverId]
        if (receiverId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        return res.json({ success: true, newMessage });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}