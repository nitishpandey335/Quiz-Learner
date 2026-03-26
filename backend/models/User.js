const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String, required: true, minlength: 6 },
        role: { type: String, enum: ['admin', 'teacher', 'student'], default: 'student' },
        avatar: { type: String, default: '' },
        isActive: { type: Boolean, default: true },
        studentClass: { type: String, default: '' }, // e.g. "Class 10", "Class 12", "College 1st Year"
        collegeCourse: { type: String, default: '' }, // e.g. "B.Tech", "BCA", "MBA"
    },
    { timestamps: true }
);

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
