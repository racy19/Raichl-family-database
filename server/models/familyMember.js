const mongoose = require('mongoose');

const familyMemberSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    surname: {
        type: String,
        required: true,
    },
    maidenName: {
        type: String,
        required: false,
    },
    gender: {
        type: String,
        required: true,
    },
    birthDate: {
        type: Date,
        required: false,
    },
    deathDate: {
        type: Date,
        required: false,
    },
    children: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'familyMember',
    }],
    bio: {
        type: String,
        required: false,
    },
});

// create a model from the schema
const familyMember = mongoose.model('familyMember', familyMemberSchema);

// export the model
module.exports = familyMember;