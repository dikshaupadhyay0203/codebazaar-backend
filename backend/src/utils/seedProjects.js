const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Project = require('../models/Project');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const DB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/codebazaar';
const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
const UPLOAD_DIR_NAME = process.env.UPLOAD_DIR || 'uploads';
const UPLOAD_DIR = path.join(__dirname, '../../', UPLOAD_DIR_NAME);

const TECH_STACKS = [
    ['MERN', 'React', 'Node.js'],
    ['Next.js', 'TypeScript', 'MongoDB'],
    ['React', 'Express', 'JWT'],
    ['Node.js', 'Redis', 'Docker'],
    ['Vue', 'Node.js', 'MongoDB'],
    ['Angular', 'NestJS', 'MongoDB'],
    ['React Native', 'Express', 'Cloudinary'],
    ['Python', 'FastAPI', 'MongoDB']
];

const CATEGORIES = ['Web App', 'SaaS', 'Ecommerce', 'AI Tool', 'Dev Tool', 'Portfolio', 'Education', 'Finance'];

const ensureUploads = () => {
    if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
};

const createZipPlaceholders = (count) => {
    const files = [];

    for (let i = 1; i <= count; i += 1) {
        const fileName = `seeded-project-${i}.zip`;
        const absolutePath = path.join(UPLOAD_DIR, fileName);

        if (!fs.existsSync(absolutePath)) {
            fs.writeFileSync(
                absolutePath,
                `CodeBazaar seeded project archive placeholder #${i}\nGenerated: ${new Date().toISOString()}\n`,
                'utf8'
            );
        }

        files.push(fileName);
    }

    return files;
};

const buildSeedProjects = (creatorId, files) => {
    const projects = [];

    for (let i = 1; i <= files.length; i += 1) {
        const techStack = TECH_STACKS[(i - 1) % TECH_STACKS.length];
        const category = CATEGORIES[(i - 1) % CATEGORIES.length];

        projects.push({
            title: `CodeBazaar Starter Project ${i}`,
            description: `Production-ready ${category} template with ${techStack.join(', ')}. Includes auth, dashboard, payments, and scalable architecture.`,
            price: 199 + i * 25,
            techStack,
            category,
            uploadedBy: creatorId,
            fileUrl: `${BASE_URL}/uploads/${files[i - 1]}`,
            imageUrl: '',
            status: 'approved'
        });
    }

    return projects;
};

const run = async () => {
    await mongoose.connect(DB_URI);

    const creatorEmail = 'seed.creator@codebazaar.local';
    let creator = await User.findOne({ email: creatorEmail });

    if (!creator) {
        creator = await User.create({
            name: 'Seed Creator',
            email: creatorEmail,
            password: await bcrypt.hash('SeedCreator@123', 12),
            role: 'creator',
            avatar: ''
        });
    }

    ensureUploads();
    const files = createZipPlaceholders(40);
    const projects = buildSeedProjects(creator._id, files);

    const bulkOps = projects.map((project) => ({
        updateOne: {
            filter: { title: project.title },
            update: { $setOnInsert: project },
            upsert: true
        }
    }));

    const result = await Project.bulkWrite(bulkOps, { ordered: false });
    const totalApproved = await Project.countDocuments({ status: 'approved' });

    console.log('Seed complete');
    console.log(`Creator account: ${creatorEmail} / SeedCreator@123`);
    console.log(`Inserted projects: ${result.upsertedCount || 0}`);
    console.log(`Total approved projects: ${totalApproved}`);

    await mongoose.disconnect();
};

run().catch(async (error) => {
    console.error('Seed failed:', error.message);
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
    process.exit(1);
});
