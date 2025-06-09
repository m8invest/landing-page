const mongoose = require('mongoose');

const QuestionAnswerSchema = new mongoose.Schema({
    number: {
        type: Number,
        required: true
    },
    question: {
        type: String,
        required: true
    },
    answer: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    }
});

const WaitlistEntrySchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    questions: [QuestionAnswerSchema],
    submittedAt: {
        type: Date,
        default: Date.now
    },
    ipAddress: String,
    userAgent: String
});

module.exports = mongoose.model('WaitlistEntry', WaitlistEntrySchema);