const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    twoFactorEnabled: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: true, required: true },
    profilePicture: { type: String, default: null },
    pushToken: { type: String, default: null },
    notificationsEnabled: { type: Boolean, default: true },
    lastKnownLocation: {
        latitude: Number,
        longitude: Number,
        updatedAt: Date
    }
}, { timestamps: true });

userSchema.pre('save', async function () {

    if (!this.isModified('password')) {
        return;
    }

    try {

        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);

    } catch (error) {

        throw error;
    }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);