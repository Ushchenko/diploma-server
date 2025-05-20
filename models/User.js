import mongoose from 'mongoose';

export const UserSchema = mongoose.Schema({
	login: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
	},
	passwordHash: {
		type: String,
		required: true,
	}, 
    avatarUrl: String,
}, {
	timestamps: true,
})

export default mongoose.model("User", UserSchema);