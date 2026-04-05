const mongoose = require('mongoose');
require('dotenv').config();

const Module = require('./models/Module');
const Opportunity = require('./models/Opportunity');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/civichernaija';

const seedDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        await Module.deleteMany({});
        await Opportunity.deleteMany({});

        await Module.insertMany([
            {
                title: 'Introduction to Nigerian Government',
                description: 'Learn the basics of the Executive, Legislative, and Judiciary arms.',
                content: 'Nigeria operates a federal system of government with three tiers: Federal, State, and Local governments. The structure is based on the separation of powers among the Executive, Legislature, and Judiciary to ensure checks and balances.',
                videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                quiz: [
                    {
                        question: 'How many tiers of government does Nigeria have?',
                        options: ['Two', 'Three', 'Four'],
                        correctAnswerIndex: 1
                    }
                ],
                simulationPrompt: 'You are a local government chairperson. Your community complains about bad roads but your budget is small. Write a short proposal on how you will prioritize spending.'
            },
            {
                title: 'How Elections Work',
                description: 'Understand the voting process and how INEC conducts elections.',
                content: 'Elections in Nigeria are conducted by the Independent National Electoral Commission (INEC). Citizens above 18 years can register to get their Permanent Voter Card (PVC) and participate in voting.',
                quiz: [
                    {
                        question: 'Which body conducts elections in Nigeria?',
                        options: ['EFCC', 'INEC', 'NNPC'],
                        correctAnswerIndex: 1
                    }
                ],
                simulationPrompt: 'You are an election observer. You notice a disruption at a polling unit. What are the immediate steps you should take to report it?'
            }
        ]);

        await Opportunity.insertMany([
            {
                title: 'Youth Policy Internship',
                description: 'A 3-month internship learning policy drafting in Abuja.',
                type: 'Internship',
                location: 'Abuja (Hybrid)',
                applyLink: '#'
            },
            {
                title: 'Community Sensitization Volunteer',
                description: 'Help educate young women on their voting rights in your local community.',
                type: 'Volunteer',
                location: 'Lagos',
                applyLink: '#'
            }
        ]);

        console.log('Database seeded successfully!');
        process.exit(0);

    } catch(err) {
        console.error(err);
        process.exit(1);
    }
}

seedDB();
