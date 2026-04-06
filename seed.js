const mongoose = require('mongoose');
require('dotenv').config();

const Module = require('./models/Module');
const Opportunity = require('./models/Opportunity');
const PracticeResource = require('./models/PracticeResource');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/civichernaija';

const seedDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        await Module.deleteMany({});
        await Opportunity.deleteMany({});
        await PracticeResource.deleteMany({});

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

        // Seed Practice Resources
        await PracticeResource.insertMany([
            {
                resourceType: 'simulation',
                simulationScenario: 'Your local government has N10 million remaining in the budget. The community needs a new borehole for clean water and repairs to the primary school roof. You can only fund one project fully right now. What do you do?',
                simulationContext: 'You are a passionate young leader who has just been elected as a local government councilor. This is your first budget decision.',
                simulationOptions: [
                    {
                        id: 'borehole-now',
                        title: 'Fund the borehole now',
                        description: 'Prioritize immediate access to clean water, then plan school repairs in the next budget cycle.'
                    },
                    {
                        id: 'school-roof-now',
                        title: 'Repair the school roof now',
                        description: 'Protect the learning environment first, then launch a short fundraising campaign for water infrastructure.'
                    },
                    {
                        id: 'hybrid-phased',
                        title: 'Negotiate a phased hybrid plan',
                        description: 'Do urgent temporary roof fixes and begin borehole groundwork while seeking state support for completion.'
                    }
                ],
                simulationEvaluationCriteria: 'Consider problem-solving approach, feasibility for Nigerian context, trade-off analysis, and civic responsibility.',
                difficulty: 'intermediate',
                category: 'budget-allocation',
                description: 'Budget allocation simulation for local government resources',
                isActive: true
            },
            {
                resourceType: 'debateTopic',
                debateTopic: 'Should Nigeria adopt a parliamentary system of government instead of presidential?',
                debateContext: 'Nigeria has operated under a presidential system with significant executive power concentrated in the president. Some argue a parliamentary system would improve representation and reduce executive overreach.',
                debateEvaluationCriteria: 'Assess argument structure, evidence usage, understanding of governance systems, and persuasiveness.',
                debateTimeLimit: 120,
                difficulty: 'advanced',
                category: 'governance',
                description: 'Debate on Nigeria\'s governance structure',
                isActive: true
            },
            {
                resourceType: 'debateTopic',
                debateTopic: 'Should civic education be mandatory in all secondary schools?',
                debateContext: 'Many Nigerian secondary schools lack comprehensive civic education. Some argue it should be mandatory to build informed citizens. Others say curriculum is already crowded.',
                debateEvaluationCriteria: 'Evaluate argument clarity, practical considerations, and understanding of educational systems.',
                debateTimeLimit: 120,
                difficulty: 'intermediate',
                category: 'education',
                description: 'Debate on civic education requirements',
                isActive: true
            },
            {
                resourceType: 'debateTopic',
                debateTopic: 'Should local governments reserve leadership seats for women and youth?',
                debateContext: 'Women and youth remain significantly underrepresented in Nigerian political leadership. Some argue for reserved seats to ensure inclusion. Others argue merit should be the only criterion.',
                debateEvaluationCriteria: 'Assess understanding of inequality, pragmatic arguments, and civic principles.',
                debateTimeLimit: 120,
                difficulty: 'intermediate',
                category: 'gender-equality',
                description: 'Debate on representation and affirmative action',
                isActive: true
            },
            {
                resourceType: 'policyGuidance',
                policyGuidanceTitle: 'Policy Drafting Framework',
                policyGuidanceContent: 'A good policy proposal should: (1) Clearly define the problem being addressed, (2) Explain why existing solutions are insufficient, (3) Propose specific, measurable solutions, (4) Identify who will be affected and how, (5) Consider implementation timeline and resources needed, (6) Address potential challenges and risks. Remember that policies should be evidence-based, inclusive, and realistic for the Nigerian context.',
                policyCriteria: 'Evaluate clarity of problem statement, practicality of proposal, consideration of stakeholders, feasibility in Nigerian context.',
                difficulty: 'intermediate',
                category: 'policy-writing',
                description: 'Guidance framework for policy proposal writing',
                isActive: true
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
