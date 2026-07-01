import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.model.js';
import Goal from './models/Goal.model.js';
import Notification from './models/Notification.model.js';
import Report from './models/Report.model.js';
import Settings from './models/Settings.model.js';
import Support from './models/Support.model.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📡 Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Goal.deleteMany({});
    await Notification.deleteMany({});
    await Report.deleteMany({});
    await Settings.deleteMany({});
    await Support.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create Users
    const usersData = [
      {
        name: 'System Admin',
        email: 'admin@internpulse.com',
        password: 'admin123',
        role: 'admin',
        avatar: 'https://ui-avatars.com/api/?name=System+Admin',
        department: 'Operations',
        cohort: 'Cohort 1',
        isPasswordChanged: true,
        isOnboarded: true,
        isActive: true
      },
      {
        name: 'Sarah Manager',
        email: 'manager@internpulse.com',
        password: 'manager123',
        role: 'manager',
        avatar: 'https://ui-avatars.com/api/?name=Sarah+Manager',
        department: 'Engineering',
        cohort: 'Cohort 1',
        isPasswordChanged: true,
        isOnboarded: true,
        isActive: true
      },
      {
        name: 'James Intern',
        email: 'intern@internpulse.com',
        password: 'intern1234',
        role: 'intern',
        avatar: 'https://ui-avatars.com/api/?name=James+Intern',
        department: 'Engineering',
        cohort: 'Cohort 1',
        isPasswordChanged: true,
        isOnboarded: true,
        isActive: true
      }
    ];

    const users = [];
    for (const u of usersData) {
      const user = await User.create(u);
      users.push(user);
    }
    console.log('✅ Users seeded');

    const admin = users[0];
    const manager = users[1];
    const intern = users[2];

    // Create Goals
    const goalsData = [
      {
        title: 'Complete Onboarding Course',
        description: 'Finish all modules in the company onboarding platform including compliance and security training.',
        assignedTo: [intern._id],
        createdBy: manager._id,
        status: 'In-Progress',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        points: 50,
        week: 1,
        createdAt: new Date()
      },
      {
        title: 'Build Authentication Module',
        description: 'Implement JWT based authentication for the new dashboard application.',
        assignedTo: [intern._id],
        createdBy: manager._id,
        status: 'Pending',
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        points: 100,
        week: 2,
        createdAt: new Date()
      }
    ];

    const goals = await Goal.insertMany(goalsData);
    console.log('✅ Goals seeded');

    // Create Notifications
    const notificationsData = [
      {
        recipient: intern._id,
        type: 'goal_assigned',
        message: 'You have been assigned a new goal: Complete Onboarding Course.',
        isRead: false,
        createdAt: new Date()
      },
      {
        recipient: manager._id,
        type: 'report_submitted',
        message: 'James Intern has submitted their weekly report.',
        isRead: true,
        createdAt: new Date()
      }
    ];

    await Notification.insertMany(notificationsData);
    console.log('✅ Notifications seeded');

    // Create Reports
    const reportsData = [
      {
        intern: intern._id,
        goal: goals[0]._id,
        content: 'I have started the onboarding course and completed the first two modules regarding compliance.',
        highlights: 'Learned a lot about the company culture and values.',
        blockers: 'Access to the security training module is currently denied, waiting for IT to resolve.',
        nextWeekPlan: 'Complete the rest of the onboarding and start setting up the development environment.',
        aiSummary: 'The intern is progressing well with onboarding but is currently blocked on the security module due to IT access issues.',
        status: 'Submitted',
        score: 85,
        managerFeedback: 'Good progress! I will follow up with IT regarding your access.',
        submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        reviewedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ];

    await Report.insertMany(reportsData);
    console.log('✅ Reports seeded');

    // Create Settings
    const settingsData = [
      {
        settingType: 'theme',
        primary: '#7c3aed',
        primaryHover: '#6d28d9',
        accent: '#10b981',
        danger: '#ef4444',
        warning: '#f59e0b',
        success: '#10b981',
        light: {
          bgBase: '#f8fafc',
          bgSurface: '#ffffff',
          bgSurface2: '#f1f5f9',
          bgSurface3: '#e2e8f0',
          cardBg: '#ffffff',
          inputBg: '#ffffff',
          inputBorder: '#e2e8f0',
          borderColor: 'rgba(0, 0, 0, 0.08)',
          textPrimary: '#0f172a',
          textSecondary: '#334155',
          textMuted: '#64748b',
          textInvert: '#ffffff'
        },
        dark: {
          bgBase: '#020617',
          bgSurface: '#0f172a',
          bgSurface2: '#1e293b',
          bgSurface3: '#334155',
          cardBg: '#0f172a',
          inputBg: '#0f172a',
          inputBorder: '#1e293b',
          borderColor: 'rgba(255, 255, 255, 0.08)',
          textPrimary: '#f8fafc',
          textSecondary: '#cbd5e1',
          textMuted: '#64748b',
          textInvert: '#020617'
        },
        updatedAt: new Date()
      }
    ];

    await Settings.insertMany(settingsData);
    console.log('✅ Settings seeded');

    // Create Support Tickets
    const supportData = [
      {
        subject: 'Cannot access internal wiki',
        message: 'When I try to login to the internal wiki, it says my account does not exist.',
        submittedBy: intern._id,
        category: 'technical',
        status: 'in-progress',
        priority: 'high',
        responses: [
          {
            respondedBy: admin._id,
            message: 'We are looking into this. It seems there was a sync issue with Active Directory.',
            createdAt: new Date()
          }
        ],
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      }
    ];

    await Support.insertMany(supportData);
    console.log('✅ Support tickets seeded');

    console.log('✅ Seeding Complete!');
    console.log('-------------------');
    console.log('Admin login: admin@internpulse.com / admin123');
    console.log('Manager login: manager@internpulse.com / manager123');
    console.log('Intern login: intern@internpulse.com / intern1234');
    console.log('-------------------');

    process.exit();
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
