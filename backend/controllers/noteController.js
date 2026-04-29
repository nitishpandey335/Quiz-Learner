const Note = require('../models/Note');
const User = require('../models/User');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const getModel = () => genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// GET /api/notes  — student gets notes for their class
const getNotesForStudent = async (req, res) => {
    try {
        const student = await User.findById(req.user._id);
        if (!student.studentClass)
            return res.status(400).json({ message: 'Pehle apni class set karo' });

        const notes = await Note.find({
            targetClass: student.studentClass,
            isPublished: true,
        })
            .populate('teacherId', 'name')
            .sort({ createdAt: -1 });

        res.json({ notes, studentClass: student.studentClass });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/notes/teacher  — teacher sees their own notes
const getTeacherNotes = async (req, res) => {
    try {
        const notes = await Note.find({ teacherId: req.user._id })
            .populate('teacherId', 'name email')
            .sort({ createdAt: -1 });
        res.json(notes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST /api/notes  — teacher creates note
const createNote = async (req, res) => {
    try {
        const note = await Note.create({ ...req.body, teacherId: req.user._id });
        res.status(201).json(note);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// DELETE /api/notes/:id
const deleteNote = async (req, res) => {
    try {
        await Note.findOneAndDelete({ _id: req.params.id, teacherId: req.user._id });
        res.json({ message: 'Note deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PUT /api/users/set-class  — student sets their class
const setStudentClass = async (req, res) => {
    try {
        const { studentClass, collegeCourse } = req.body;
        const updateData = { studentClass };
        if (collegeCourse !== undefined) updateData.collegeCourse = collegeCourse;
        const user = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true }
        ).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST /api/notes/ai-generate  — AI generates note content
const aiGenerateNote = async (req, res) => {
    try {
        const { subject, topic, targetClass } = req.body;

        const prompt = `Create concise study notes for ${targetClass} students on the topic: "${topic}" (Subject: ${subject}).

Format:
## ${topic}

### Key Concepts
- Point 1
- Point 2
- Point 3

### Important Formulas / Facts
- ...

### Summary
2-3 lines summary.

Keep it simple, clear, and appropriate for ${targetClass} level. Max 300 words.`;

        const model = getModel();
        const result = await model.generateContent(prompt);
        const content = result.response.text().trim();
        res.json({ content });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST /api/notes/upload-pdf — teacher uploads PDF note
const uploadPDF = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No PDF file uploaded' });
        const { title, subject, targetClass, tags } = req.body;
        if (!title || !subject || !targetClass)
            return res.status(400).json({ message: 'Title, subject and class are required' });

        const pdfUrl = `/uploads/${req.file.filename}`;
        const note = await Note.create({
            title,
            subject,
            targetClass,
            section: req.body.section || '',
            teacherId: req.user._id,
            content: '',
            pdfUrl,
            pdfName: req.file.originalname,
            tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        });
        res.status(201).json(note);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { getNotesForStudent, getTeacherNotes, createNote, deleteNote, setStudentClass, aiGenerateNote, uploadPDF };
