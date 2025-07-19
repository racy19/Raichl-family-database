const express = require('express');
const mongoose = require('mongoose');
const Joi = require('joi');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

dotenv.config();

const FamilyMember = require('./models/familyMember');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// --- základní middleware ---
// app.use(cors());
app.use(express.json());

// // --- cesty k build složce (CRA) ---
// const buildPath = path.join(__dirname, '../client/build');
// console.log('Serving React build from:', buildPath);

// // statické soubory z React buildu
// app.use(express.static(buildPath));

// CORS – v DEV povol localhost:3000
if (process.env.NODE_ENV !== 'production') {
    console.log('CORS enabled for development');
    app.use(cors({ origin: 'http://localhost:3000' }));
  }
  
  // Pouze v produkci servíruj React build
  if (process.env.NODE_ENV === 'production') {
    const buildPath = path.join(__dirname, '../client/build');
    console.log('Serving React build from:', buildPath);
    app.use(express.static(buildPath));
  }

// statické uploaded soubory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- debug logging všech requestů ---
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// --- Mongoose ---
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// --- VALIDACE ---
const validateFamilyMember = (familyMember) => {
  const FamilyMemberSchema = Joi.object({
    name: Joi.string().min(2).required().messages({
      'string.base': 'jméno musí být řetězec',
      'string.min': 'jméno musí mít alespoň 2 znaky',
      'any.required': 'jméno je povinné',
    }),
    surname: Joi.string().min(2).required().messages({
      'string.base': 'přímení musí být řetězec',
      'string.min': 'příjmení musí mít alespoň 2 znaky',
      'any.required': 'příjmení je povinné',
    }),
    maidenName: Joi.string().optional(),
    gender: Joi.string().required().messages({ 'any.required': 'pohlaví je povinné' }),
    birthDate: Joi.date().optional(),
    deathDate: Joi.date().optional(),
    partner: Joi.string().optional(),
    children: Joi.array().items(Joi.string()).optional(),
    bio: Joi.string().optional(),
    profilePhoto: Joi.string().optional(),
  });

  const { error, value } = FamilyMemberSchema.validate(familyMember);
  if (error) {
    return { valid: false, messages: error.details.map((d) => d.message) };
  }
  return { valid: true, value };
};

// --- Multer pro upload fotek ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const name = (req.body.name || 'neznamy').replace(/\s+/g, '-').toLowerCase();
    const surname = (req.body.surname || 'neznamy').replace(/\s+/g, '-').toLowerCase();
    const uniqueSuffix = Date.now();
    const extension = path.extname(file.originalname);
    cb(null, `${name}-${surname}-${uniqueSuffix}${extension}`);
  },
});
const upload = multer({ storage });

// --- API ROUTY ---

// test DB
app.get('/api/testdb', async (req, res) => {
  try {
    const members = await FamilyMember.find();
    res.json(members);
  } catch (err) {
    console.error('Error fetching data:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// seznam členů
app.get('/api/clenove', async (req, res) => {
  console.log('>> API: GET /api/clenove');
  try {
    const familyMembers = await FamilyMember.find();
    res.status(200).json(familyMembers);
  } catch (err) {
    console.error('Error fetching family members:', err);
    res.status(500).send('Error fetching family members');
  }
});

// detail
app.get('/api/clenove/:id', async (req, res) => {
  console.log('>> API: GET /api/clenove/:id', req.params.id);
  const { id } = req.params;
  try {
    const familyMember = await FamilyMember.findById(id);
    if (!familyMember) {
      return res.status(404).send('Family member not found');
    }

    const children = await FamilyMember.find({ _id: { $in: familyMember.children } });
    const mother = await FamilyMember.findOne({ children: familyMember._id, gender: 'F' });
    const father = await FamilyMember.findOne({ children: familyMember._id, gender: 'M' });

    let partner = null;
    if (familyMember.partner) {
      partner = await FamilyMember.findById(familyMember.partner);
    }
    if (!partner) {
      partner = await FamilyMember.findOne({ partner: familyMember._id });
    }

    let siblings = [];
    if (mother && mother.children.length > 1) {
      siblings = await FamilyMember.find({ _id: { $in: mother.children, $ne: id } });
    }
    if (father && father.children.length > 1) {
      const fatherSiblings = await FamilyMember.find({ _id: { $in: father.children, $ne: id } });
      siblings = [...siblings, ...fatherSiblings];
    }
    // dedupe
    siblings = [...new Set(siblings.map((s) => s._id.toString()))].map((sid) =>
      siblings.find((s) => s._id.toString() === sid)
    );

    res.status(200).json({ familyMember, children, mother, father, partner, siblings });
  } catch (err) {
    console.error('Error fetching family member', err);
    res.status(500).send('Error fetching family member');
  }
});

// create
app.post('/api/clenove', async (req, res) => {
  const { name, surname, maidenName, gender, partner, birthDate, deathDate, children, bio, profilePhoto } = req.body;
  const validation = validateFamilyMember({ name, surname, maidenName, gender, partner, birthDate, deathDate, children, bio, profilePhoto });

  if (!validation.valid) {
    return res.status(400).json({ errors: validation.messages });
  }

  try {
    const newFamilyMember = new FamilyMember(validation.value);
    await newFamilyMember.save();
    res.status(201).json({ message: 'Family member created successfully', _id: newFamilyMember._id });
  } catch (err) {
    console.error('Error saving family member', err);
    res.status(500).send('Error saving family member');
  }
});

// upload fotky
app.post('/api/upload', upload.single('profilePhoto'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.status(200).json({ filePath: `/uploads/${req.file.filename}` });
});

// update
app.put('/api/clenove/:id', async (req, res) => {
  const { id } = req.params;
  const { name, surname, maidenName, gender, partner, birthDate, deathDate, children, bio, profilePhoto } = req.body;

  try {
    const updatedFamilyMember = await FamilyMember.findByIdAndUpdate(
      id,
      { name, surname, maidenName, gender, partner, birthDate, deathDate, children, bio, profilePhoto },
      { new: true }
    );
    if (!updatedFamilyMember) return res.status(404).send('Family member not found');
    res.status(200).json({ updatedFamilyMember, _id: updatedFamilyMember._id });
  } catch (err) {
    console.error('Error updating family member', err);
    res.status(500).send('Error updating family member');
  }
});

// delete
app.delete('/api/clenove/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedFamilyMember = await FamilyMember.findById(id);
    if (!deletedFamilyMember) return res.status(404).send('Family member not found');

    // cleanup partner & children refs
    await FamilyMember.updateMany({ partner: id }, { $unset: { partner: 1 } });
    await FamilyMember.updateMany({ children: id }, { $pull: { children: id } });
    await FamilyMember.findByIdAndDelete(id);

    res.status(200).send('Family member deleted successfully');
  } catch (err) {
    console.error('Error deleting family member', err);
    res.status(500).send('Error deleting family member');
  }
});

// --- SPA FALLBACK (musí být POSLEDNÍ a BEZ podmínky) ---
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

// --- Start server ---
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
