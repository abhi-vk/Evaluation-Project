const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const Workspace = require('../models/Workspace');

const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const userdata = await User.findOne({ email: email }).populate('workspaces'); // Populate workspaces

        if (userdata) {
            if (await bcrypt.compare(password, userdata.password)) {
                // Create default workspace if user doesn't have one (edge case)
                if (userdata.workspaces.length === 0) {
                    const defaultWorkspace = await Workspace.create({
                        name: `${userdata.username}'s workspace`,
                        owner: userdata._id,
                        members: [userdata._id],
                        folders: [],
                        forms: [],
                    });

                    // Link workspace to user
                    userdata.workspaces.push(defaultWorkspace._id);
                    await userdata.save();
                }

                const token = jwt.sign({ uid: userdata._id }, process.env.JWT_SECRET);
                res.status(200).json({ 
                    status: "success", 
                    msg: "Login successful.", 
                    token, 
                    workspaces: userdata.workspaces 
                });
            } else {
                throw Object.assign(Error("Wrong password entered."), { code: 401 });
            }
        } else {
            throw Object.assign(Error("No user found with this email."), { code: 404 });
        }
    } catch (err) {
        next(err);
    }
};

const registerUser = async (req, res, next) => {
    try {
        const { username, email, confirmPassword } = req.body;
        if (await User.findOne({ email: email })) {
            throw Object.assign(Error("User with this email already exists."), { code: 409 });
        } else {
            const hashedPassword = await bcrypt.hash(confirmPassword, 10);
            
            
            const newUser = await User.create({ 
                username, 
                email, 
                password: hashedPassword,
            });

           
            const defaultWorkspace = await Workspace.create({
                name: `${username}'s workspace`,
                owner: newUser._id,
                members: [newUser._id],
                folders: [],
                forms: [],
            });

            
            newUser.workspaces.push(defaultWorkspace._id);
            await newUser.save();

            res.status(200).json({ 
                status: "success", 
                msg: "Registered successfully. Please login now.",
            });
        }
    } catch (err) {
        next(err);
    }
};

module.exports = { loginUser, registerUser, updateUser, userDashboard };