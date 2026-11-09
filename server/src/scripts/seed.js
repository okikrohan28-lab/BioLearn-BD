const mongoose = require('mongoose');
const env = require('../config/env');
const Admin = require('../models/Admin');
const Paper = require('../models/Paper');
const Chapter = require('../models/Chapter');
const Topic = require('../models/Topic');

const seedDatabase = async () => {
  try {
    // 1. Seed Superadmin if not exists
    const adminEmail = 'admin@biolearnbd.com';
    let admin = await Admin.findOne({ email: adminEmail });
    if (!admin) {
      const password_hash = await Admin.hashPassword('Admin@123456');
      admin = await Admin.create({
        name: 'System Administrator',
        email: adminEmail,
        role: 'superadmin',
        password_hash,
      });
      console.log(`✅ Default admin created: ${adminEmail} / Admin@123456`);
    } else {
      console.log(`ℹ️ Admin already exists: ${adminEmail}`);
    }

    // 2. Check if papers already exist
    const paperCount = await Paper.countDocuments();
    if (paperCount === 0) {
      console.log('Seeding initial Biology syllabus...');

      // Paper 1: Botany
      const paper1 = await Paper.create({
        title: 'Biology 1st Paper (Botany)',
        subject: 'Biology',
        access_level: 'free',
        status: 'published',
        description: 'HSC Biology First Paper covering Plant Biology and Cytology.',
      });

      // Paper 1 Chapters
      const ch1_1 = await Chapter.create({
        paper_id: paper1._id,
        chapter_no: 1,
        title: 'Cell and Its Structure (কোষ ও এর গঠন)',
        description: 'Study of cellular components, organelles, and functions.',
        status: 'published',
      });

      const ch1_2 = await Chapter.create({
        paper_id: paper1._id,
        chapter_no: 2,
        title: 'Cell Division (কোষ বিভাজন)',
        description: 'Mitosis, Meiosis and their biological significance.',
        status: 'published',
      });

      // Paper 1 Topics
      await Topic.create([
        {
          chapter_id: ch1_1._id,
          topic_no: 1,
          title: 'Cell Wall & Plasma Membrane (কোষ প্রাচীর ও প্লাজমা মেমব্রেন)',
          description: 'Structure of Fluid Mosaic Model and cell wall composition.',
          status: 'published',
        },
        {
          chapter_id: ch1_1._id,
          topic_no: 2,
          title: 'Nucleus and Chromosomes (নিউক্লিয়াস ও ক্রোমোজোম)',
          description: 'Detailed morphology of the nucleus and nuclear material.',
          status: 'published',
        },
        {
          chapter_id: ch1_2._id,
          topic_no: 1,
          title: 'Stages of Mitosis (মাইটোসিস বিভাজনের পর্যায়সমূহ)',
          description: 'Prophase, Metaphase, Anaphase, Telophase.',
          status: 'published',
        },
      ]);

      // Paper 2: Zoology
      const paper2 = await Paper.create({
        title: 'Biology 2nd Paper (Zoology)',
        subject: 'Biology',
        access_level: 'free',
        status: 'published',
        description: 'HSC Biology Second Paper covering Animal Diversity and Human Physiology.',
      });

      // Paper 2 Chapters
      const ch2_1 = await Chapter.create({
        paper_id: paper2._id,
        chapter_no: 1,
        title: 'Animal Diversity and Classification (প্রাণীর বিভিন্নতা ও শ্রেণিবিন্যাস)',
        description: 'Phyla of Kingdom Animalia and taxonomic criteria.',
        status: 'published',
      });

      await Topic.create([
        {
          chapter_id: ch2_1._id,
          topic_no: 1,
          title: 'Major Phyla of Non-Chordates (নন-কর্ডাটার প্রধান পর্বসমূহ)',
          description: 'Porifera, Cnidaria, Platyhelminthes, etc.',
          status: 'published',
        },
        {
          chapter_id: ch2_1._id,
          topic_no: 2,
          title: 'Phylum Chordata (কর্ডাটা পর্ব)',
          description: 'Diagnostic characteristics and subphyla.',
          status: 'published',
        },
      ]);

      console.log('✅ Biology syllabus seeded successfully!');
    }
  } catch (error) {
    console.error('Seeding error:', error.message);
  }
};

// If run directly from CLI (npm run seed)
if (require.main === module) {
  (async () => {
    try {
      if (!env.MONGODB_URI) {
        console.error('MONGODB_URI not found.');
        process.exit(1);
      }
      await mongoose.connect(env.MONGODB_URI);
      console.log('Connected to MongoDB Atlas for manual seeding.');
      await seedDatabase();
      console.log('Manual seeding completed.');
      process.exit(0);
    } catch (err) {
      console.error('Manual seed failed:', err.message);
      process.exit(1);
    }
  })();
}

module.exports = seedDatabase;
