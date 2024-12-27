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
                        name: `${userdata.username}`,
                        owner: userdata._id,
                        members: [{ userId: userdata._id, permission: 'edit' }],
                        folders: [],
                        forms: [],
                    });

                    // Link workspace to user
                    userdata.workspaces.push(defaultWorkspace._id);
                    await userdata.save();
                }

                const token = jwt.sign(
                    { uid: userdata._id, activeWorkspaceId: userdata.workspaces[0]._id },
                    process.env.JWT_SECRET
                );

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
                name: `${username}`,
                owner: newUser._id,
                members: [{ userId: newUser._id, permission: 'edit' }],
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

const userDashboard = async (req, res, next) => {
    try {
        const userdata = await User.findById(req.user)
            .populate({
                path: 'workspaces',
                select: '_id name', // Fetch only the _id and name fields of workspaces
            });

        if (!userdata) {
            throw Object.assign(Error("User not found."), { code: 404 });
        }

        res.status(200).json({
            status: "success",
            user: {
                username: userdata.username,
                email: userdata.email,
                workspaces: userdata.workspaces, // Array of workspace IDs and names
            },
        });
    } catch (err) {
        next(err);
    }
};

const updateUser = async (req, res, next) => {
    try {
        const userId = req.user;
        const { username, email, oldPassword, newPassword } = req.body;
        const userdata = await User.findById(userId);

        if (userdata) {
            const updatedata = {};
            if (username) updatedata.username = username;
            if (email) {
                if (await User.findOne({ email: email })) {
                    throw Object.assign(Error("User with this email already exists."), { code: 409 });
                }
                updatedata.email = email;
            }

            if (newPassword) {
                if (!await bcrypt.compare(oldPassword, userdata.password)) {
                    throw Object.assign(Error("Your old password seems to be incorrect."), { code: 409 });
                }
                if (await bcrypt.compare(oldPassword, userdata.password) === await bcrypt.compare(newPassword, userdata.password)) {
                    throw Object.assign(Error("New password cannot be the same as old password."), { code: 409 });
                }
                updatedata.password = await bcrypt.hash(newPassword, 10);
            }

            if (Object.keys(updatedata).length === 0) {
                return res.status(200).json({ status: "success", msg: "No changes were made." });
            }

            await User.findByIdAndUpdate(userId, updatedata);
            res.status(200).json({ status: "success", msg: "Profile updated successfully." });
        } else {
            throw Object.assign(Error("Not a valid user, please relogin."), { code: 404 });
        }
    } catch (err) {
        next(err);
    }
};

module.exports = { loginUser, registerUser, updateUser, userDashboard };
