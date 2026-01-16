import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utiles.js";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs"

// sign up a new user
export const signup = async (req, res) => {

    const { email, bio, fullName, password } = req.body

    console.log(req.body)

    try {
        if (!email || !bio || !fullName || !password) {
            return res.json({ success: false, message: "Missing details" })
        }

        const user = await User.findOne({ email });

        if (user) {
            return res.json({ success: false, message: "Account already exist" })
        }

        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(password, salt)

        const newUser = await User.create({ fullName, email, password: hashPassword, bio })

        const token = generateToken(newUser._id)

        res.json({ success: true, userData: newUser, token, message: "Account create successfully" })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// controller for login a user
export const login = async (req, res) => {

    try {
        const { email, password } = req.body;

        const isUser = await User.findOne({ email })

        const isPasswordCorrect = await bcrypt.compare(password, isUser.password)

        if (!isPasswordCorrect) {
            return res.json({ success: false, message: "Invalid credentials" })
        }

        const token = generateToken(isUser._id)

        res.json({ success: true, userData: isUser, token, message: "Login successfully" })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}


// controller to check if user is authenticated
export const checkAuth = (req, res) => {
    res.json({ success: true, user: req.user });
}

// controller to update user profile detail
export const updateProfile = async (req, res) => {
    try {
        const { profilePic, bio, fullName } = req.body;

        const userId = req.user._id;
        let updatedUser;

        if (!profilePic) {
            updatedUser = await User.findByIdAndUpdate(userId, { bio, fullName }, { new: true })
        }
        else {
            const upload = await cloudinary.uploader.upload(profilePic);
            updatedUser = await User.findByIdAndUpdate(userId, { profilePic: upload.secure_url, bio, fullName }, { new: true })
        }

        res.json({ success: true, user: updatedUser })
    } catch (error) {
        console.log(error.message)
        res.json({ success: true, message: error.message })
    }
}