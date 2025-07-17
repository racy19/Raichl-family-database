const express = require('express');
const mongoose = require('mongoose');
const Joi = require('joi');
const dotenv = require('dotenv');
dotenv.config();
const multer = require('multer');
const path = require('path');

const FamilyMember = require('./models/familyMember');

const app = express();
const MONGO_URI = process.env.MONGO_URI;
const URL = process.env.URL || 'http://localhost';
const PORT = process.env.PORT || 5000;

// middleware to parse json data
app.use(express.json());
// cross-origin resource sharing middleware
const cors = require('cors');
app.use(cors());
// middleware to serve static files from the build folder
app.use(express.static(path.join(__dirname, "build")));
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"));
  });
// serve static files from the uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// connect to the database
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

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
        gender: Joi.string().required().messages({ 'any.required': 'pohlaví je povinné' }),
        birthDate: Joi.date().optional(),
        deathDate: Joi.date().optional(),
        partner: Joi.string().optional(),
        children: Joi.array().items(Joi.string()).optional(),
        bio: Joi.string().optional(),
        profilePhoto: Joi.string().optional()
    });
    const { error, value } = FamilyMemberSchema.validate(familyMember);
    if (error) {
        const errorMessages = error.details.map(detail => detail.message);
        return { valid: false, messages: errorMessages };
    }
    return { valid: true, value };
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const name = req.body.name.replace(/\s+/g, '-').toLowerCase(); // Odstraní mezery a převede na malá písmena
        const surname = req.body.surname.replace(/\s+/g, '-').toLowerCase(); // Stejný proces pro příjmení
        const uniqueSuffix = Date.now(); // Generování unikátní části názvu
    
        // Sestavení názvu souboru ve formátu jmeno-prijmeni-unikatni.jpg
        const extension = path.extname(file.originalname); // Přípona souboru
        cb(null, `${name}-${surname}-${uniqueSuffix}${extension}`);    },
});
const upload = multer({ storage });

app.use((req, res, next) => {
    console.log(`Request received: ${req.method} ${req.url}`);
    next();
});

// test route to check if the server is running and database connection is working
app.get('/testdb', async (req, res) => {
    try {
      const members = await FamilyMember.find();
      res.json(members);
    } catch (err) {
      console.error('Error fetching data:', err);
      res.status(500).json({ error: 'Database error' });
    }
  });

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
        const children = await FamilyMember.find({
            _id: { $in: familyMember.children }
        });
        const mother = await FamilyMember.findOne({
            children: new mongoose.Types.ObjectId(id),
            gender: 'F'
        });
        const father = await FamilyMember.findOne({
            children: new mongoose.Types.ObjectId(id),
            gender: 'M'
        });
        let partner = null;
        if (familyMember.partner) {
            partner = await FamilyMember.findById(familyMember.partner);
        }
        if (!partner) {
            partner = await FamilyMember.findOne({
                partner: new mongoose.Types.ObjectId(id)
            });
        }
        let siblings = [];

        if (mother && mother.children.length > 1) {
            siblings = await FamilyMember.find({
                _id: { $in: mother.children, $ne: id }
            });
        }

        if (father && father.children.length > 1) {
            const fatherSiblings = await FamilyMember.find({
                _id: { $in: father.children, $ne: id }
            });
            siblings = [...siblings, ...fatherSiblings];
        }
        // remove duplicates from the siblings array
        siblings = [...new Set(siblings.map(sibling => sibling._id.toString()))]
            .map(id => siblings.find(sibling => sibling._id.toString() === id));

        if (!familyMember) {
            return res.status(404).send('Family member not found');
        }
        res.status(200).json({ familyMember, children, mother, father, partner, siblings });
    }
    catch (err) {
        res.status(500).send('Error fetching family member' + err);
    }
});

app.post('/clenove', async (req, res) => {
    const { name, surname, maidenName, gender, partner, birthDate, deathDate, children, bio, profilePhoto } = req.body;
    const validation = validateFamilyMember({ name, surname, maidenName, gender, partner, birthDate, deathDate, children, bio, profilePhoto });

    if (!validation.valid) {
        return res.status(400).json({ errors: validation.messages });
    }

    try {
        const newFamilyMember = new FamilyMember(validation.value);
        await newFamilyMember.save();
        res.status(201).json({
            message: 'Family member created successfully',
            _id: newFamilyMember._id
        });
    }
    catch (err) {
        res.status(500).send('Error saving family member');
    }
});

app.post('/upload', upload.single('profilePhoto'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    const filePath = `/uploads/${req.file.filename}`;
    res.status(200).json({ filePath });
});

app.put('/clenove/:id', async (req, res) => {
    const { id } = req.params;
    const { name, surname, maidenName, gender, partner, birthDate, deathDate, children, bio, profilePhoto } = req.body;

    try {
        const updatedFamilyMember = await FamilyMember.findByIdAndUpdate(id, {
            name, surname, maidenName, gender, partner, birthDate, deathDate, children, bio, profilePhoto
        }, { new: true });

        if (!updatedFamilyMember) {
            return res.status(404).send('Family member not found');
        }

        res.status(200).json({
            updatedFamilyMember: updatedFamilyMember,
            _id: updatedFamilyMember._id
        });
    }
    catch (err) {
        res.status(500).send('Error updating family member');
    }
});

app.delete('/clenove/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedFamilyMember = await FamilyMember.findById(id);

        if (!deletedFamilyMember) {
            return res.status(404).send('Family member not found');
        }
        // remove the partner and children references
        await FamilyMember.updateMany(
            { partner: id },
            { $unset: { partner: 1 } }
        );
        await FamilyMember.updateMany(
            { children: id },
            { $pull: { children: id } }
        );

        await FamilyMember.findByIdAndDelete(id);
        res.status(200).send('Family member deleted successfully');
    }
    catch (err) {
        res.status(500).send('Error deleting family member');
    }
});