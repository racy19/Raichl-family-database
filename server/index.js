const express = require('express');
const mongoose = require('mongoose');
const Joi = require('joi');
const dotenv = require('dotenv');
dotenv.config();

const FamilyMember = require('./models/familyMember');

const app = express();
const PORT = 5000;

// middleware to parse json data
app.use(express.json());
// cross-origin resource sharing middleware
const cors = require('cors');
app.use(cors());

// validate the request body for a new family member with Joi
const validateFamilyMember = (familyMember) => {
    const FamilyMemberSchema = Joi.object({
        name: Joi.string().min(2).required().messages({
            'string.base': 'jméno musí být řetězec',
            'string.min': 'jméno musí mít alespoň 2 znaky',
            'any.required': 'jméno je povinné'
        }),
        surname: Joi.string().min(2).required().messages({
            'string.base': 'přímení musí být řetězec',
            'string.min': 'příjmení musí mít alespoň 2 znaky',
            'any.required': 'příjmení je povinné'
        }),
        maidenName: Joi.string().optional(),
        birthDate: Joi.date().optional(),
        deathDate: Joi.date().optional(),
        children: Joi.array().items(Joi.string()).optional(),
        bio: Joi.string().optional(),
    });
    const { error, value } = FamilyMemberSchema.validate(familyMember);
    if (error) {
        const errorMessages = error.details.map(detail => detail.message);
        return { valid: false, messages: errorMessages };
    }
    return { valid: true, value };
}

app.get('/clenove', async (req, res) => {
    try {
        const familyMembers = await FamilyMember.find();
        res.status(200).json(familyMembers);
    } 
    catch (err) {
        res.status(500).send('Error fetching family members');
    }
});

app.get('/clenove/:id', async (req, res) => {
    const { id } = req.params; 
    try {
        const familyMember = await FamilyMember.findById(id);

        if (!familyMember) {
            return res.status(404).send('Family member not found');
        }
        res.status(200).json(familyMember);
    } 
    catch (err) {
        res.status(500).send('Error fetching family member');
    }
});

app.post('/clenove', async (req, res) => {
    const { name, surname, maidenName, birthDate, deathDate, children, bio } = req.body;
    const validation = validateFamilyMember({ name, surname, maidenName, birthDate, deathDate, children, bio });

    if (!validation.valid) {
        return res.status(400).json({ errors: validation.messages });
    }

    try {
        const newFamilyMember = new FamilyMember(validation.value);
        await newFamilyMember.save();
        res.status(201).send('Family member created successfully');
    } 
    catch (err) {
        res.status(500).send('Error saving family member');
    }
});

app.put('/clenove/:id', async (req, res) => {
    const { id } = req.params;
    const { name, surname, maidenName, birthDate, deathDate, children, bio } = req.body;

    try {
        const updatedFamilyMember = await FamilyMember.findByIdAndUpdate(id, {
            name, surname, maidenName, birthDate, deathDate, children, bio
        }, { new: true });

        if (!updatedFamilyMember) {
            return res.status(404).send('Family member not found');
        }

        res.status(200).json(updatedFamilyMember);
    } 
    catch (err) {
        res.status(500).send('Error updating family member');
    }
});

app.delete('/clenove/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedFamilyMember = await FamilyMember.findByIdAndDelete(id);

        if (!deletedFamilyMember) {
            return res.status(404).send('Family member not found');
        }
        res.status(200).send('Family member deleted successfully');
    } 
    catch (err) {
        res.status(500).send('Error deleting family member');
    }
});


// start the server listening http requests on the specified port
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// connect to the database
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Successfully connected to MongoDB');
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err);
    });