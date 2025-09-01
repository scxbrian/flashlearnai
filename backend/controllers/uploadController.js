import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';
import User from '../models/User.js';
import { generateFlashcardsFromContent, generateQuizFromContent, generateNarrationFromContent } from '../services/aiService.js';
import { logger } from '../config/logger.js';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif',
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'audio/mpeg',
    'audio/wav',
    'audio/mp4'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Please upload supported formats.'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB
  }
});

export const processFiles = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const { processingType = 'flashcards' } = req.body;
    const user = await User.findById(req.user.id);
    const uploadedFiles = req.files;
    let results = [];
    let totalItems = 0;

    // Process each uploaded file
    for (const file of uploadedFiles) {
      try {
        // Extract text content based on file type
        const content = await extractContentFromFile(file);
        
        let processedData;
        
        switch (processingType) {
          case 'flashcards':
            processedData = await generateFlashcardsFromContent(content, file.originalname);
            
            // Save flashcards to database
            const savedFlashcards = await Flashcard.insertMany(
              processedData.map(card => ({
                ...card,
                userId: req.user.id,
                sourceDocument: {
                  filename: file.filename,
                  originalName: file.originalname,
                  uploadDate: new Date()
                }
              }))
            );
            
            // Update user's monthly usage
            user.subscription.usage.cardsUsed += savedFlashcards.length;
            totalItems += savedFlashcards.length;
            
            results.push({
              type: 'flashcards',
              filename: file.originalname,
              count: savedFlashcards.length,
              data: processedData
            });
            break;
            
          case 'quiz':
            processedData = await generateQuizFromContent(content, file.originalname);
            
            // Save quiz to database
            const quiz = new Quiz({
              userId: req.user.id,
              title: `Quiz from ${file.originalname}`,
              category: detectCategory(file.originalname),
              questions: processedData,
            });
            
            await quiz.save();
            totalItems += processedData.length;
            
            results.push({
              type: 'quiz',
              filename: file.originalname,
              count: processedData.length,
              data: processedData,
              quizId: quiz._id
            });
            break;
            
          case 'narration':
            processedData = await generateNarrationFromContent(content, file.originalname);
            totalItems += 1;
            
            results.push({
              type: 'narration',
              filename: file.originalname,
              count: 1,
              data: processedData
            });
            break;
            
          default:
            throw new Error('Invalid processing type');
        }

        logger.info(`Processed ${file.originalname} for ${processingType}`);
      } catch (fileError) {
        logger.error(`Error processing file ${file.originalname}:`, fileError);
        results.push({
          type: 'error',
          filename: file.originalname,
          error: fileError.message
        });
      }
    }

    // Save user stats
    await user.save();

    res.status(200).json({
      success: true,
      message: `Files processed successfully for ${processingType}`,
      data: {
        processingType,
        filesProcessed: uploadedFiles.length,
        totalGenerated: totalItems,
        results
      }
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to extract content from different file types
const extractContentFromFile = async (file) => {
  const ext = path.extname(file.originalname).toLowerCase();
  console.log(`Extracting content from ${file.originalname} (${ext})`);
  
  try {
    switch (ext) {
      case '.txt':
        const textContent = fs.readFileSync(file.path, 'utf8');
        console.log(`Extracted ${textContent.length} characters from text file`);
        return textContent;
      
      case '.pdf':
        // In production, use pdf-parse library
        // For demo, return sample content based on filename
        const pdfContent = generateSampleContent(file.originalname);
        console.log(`Generated sample PDF content for ${file.originalname}`);
        return pdfContent;
      
      case '.docx':
        // In production, use mammoth library
        const docxContent = generateSampleContent(file.originalname);
        console.log(`Generated sample DOCX content for ${file.originalname}`);
        return docxContent;
      
      default:
        const defaultContent = generateSampleContent(file.originalname);
        console.log(`Generated default content for ${file.originalname}`);
        return defaultContent;
    }
  } catch (error) {
    console.error(`Error extracting content from ${file.originalname}:`, error);
    logger.error(`Error extracting content from ${file.originalname}:`, error);
    return generateSampleContent(file.originalname);
  }
};

const generateSampleContent = (filename) => {
  const name = filename.toLowerCase();
  
  if (name.includes('bio')) {
    return `
      Cell Biology Fundamentals
      
      The cell is the basic unit of life. All living organisms are composed of one or more cells.
      
      Key Organelles:
      - Nucleus: Contains DNA and controls cell activities
      - Mitochondria: Powerhouse of the cell, produces ATP through cellular respiration
      - Ribosomes: Sites of protein synthesis
      - Endoplasmic Reticulum: Network for protein and lipid synthesis
      - Golgi Apparatus: Modifies and packages proteins from the ER
      - Lysosomes: Digest waste materials and break down worn-out organelles
      
      Cell Membrane: Selectively permeable barrier that controls what enters and exits the cell.
      
      Photosynthesis: Process by which plants convert light energy into chemical energy.
      Formula: 6CO2 + 6H2O + light energy → C6H12O6 + 6O2
      
      Cellular Respiration: Process that breaks down glucose to produce ATP.
      Formula: C6H12O6 + 6O2 → 6CO2 + 6H2O + ATP
      
      DNA Structure: Double helix composed of nucleotides (A, T, G, C)
      RNA Function: Carries genetic information from DNA to ribosomes
    `;
  } else if (name.includes('chem')) {
    return `
      Chemistry Fundamentals
      
      Atomic Structure:
      - Protons: Positive charge, located in nucleus, determine atomic number
      - Neutrons: No charge, located in nucleus, contribute to atomic mass
      - Electrons: Negative charge, orbit the nucleus in energy levels
      
      Chemical Bonds:
      - Ionic Bonds: Transfer of electrons between metal and non-metal atoms
      - Covalent Bonds: Sharing of electrons between non-metal atoms
      - Hydrogen Bonds: Weak attraction between polar molecules
      
      pH Scale: Measures acidity/alkalinity from 0-14
      - pH 7: Neutral (pure water at 25°C)
      - pH < 7: Acidic solutions
      - pH > 7: Basic/Alkaline solutions
      
      Periodic Table Elements:
      - Hydrogen (H): Atomic number 1, lightest element
      - Carbon (C): Atomic number 6, basis of organic chemistry
      - Oxygen (O): Atomic number 8, essential for combustion
      - Gold (Au): From Latin "aurum", atomic number 79
      
      Chemical Reactions: Reactants → Products
      Conservation of Mass: Matter cannot be created or destroyed
    `;
  } else if (name.includes('phys')) {
    return `
      Physics Fundamentals
      
      Newton's Laws of Motion:
      1. First Law (Inertia): An object at rest stays at rest, an object in motion stays in motion unless acted upon by an external force
      2. Second Law: F = ma (Force equals mass times acceleration)
      3. Third Law: For every action, there is an equal and opposite reaction
      
      Energy Types:
      - Kinetic Energy: KE = ½mv² (energy of motion)
      - Potential Energy: PE = mgh (stored energy due to position)
      - Conservation of Energy: Energy cannot be created or destroyed, only transformed
      
      Important Constants:
      - Speed of light in vacuum: c = 3 × 10⁸ m/s
      - Acceleration due to gravity: g = 9.8 m/s²
      - Planck's constant: h = 6.626 × 10⁻³⁴ J·s
      
      Wave Properties:
      - Frequency (f): Number of waves per second (Hz)
      - Wavelength (λ): Distance between wave peaks
      - Wave equation: v = fλ (velocity = frequency × wavelength)
      
      Electricity:
      - Ohm's Law: V = IR (Voltage = Current × Resistance)
      - Power: P = VI (Power = Voltage × Current)
    `;
  } else if (name.includes('math')) {
    return `
      Mathematics Fundamentals
      
      Calculus:
      - Derivative of x²: d/dx(x²) = 2x
      - Integral of 2x: ∫2x dx = x² + C
      - Chain rule: d/dx[f(g(x))] = f'(g(x)) × g'(x)
      - Product rule: d/dx[f(x)g(x)] = f'(x)g(x) + f(x)g'(x)
      
      Algebra:
      - Quadratic formula: x = (-b ± √(b² - 4ac)) / 2a
      - Factoring: ax² + bx + c = a(x - r₁)(x - r₂)
      - Slope-intercept form: y = mx + b
      
      Geometry:
      - Area of circle: A = πr²
      - Circumference of circle: C = 2πr
      - Pythagorean theorem: a² + b² = c²
      - Volume of sphere: V = (4/3)πr³
      
      Important Constants:
      - π (pi): 3.14159265359...
      - e (Euler's number): 2.71828182846...
      - Golden ratio (φ): 1.61803398875...
    `;
  } else if (name.includes('hist')) {
    return `
      World History Timeline
      
      Ancient History:
      - 3100 BCE: Egyptian civilization begins with first pharaohs
      - 776 BCE: First Olympic Games held in ancient Greece
      - 44 BCE: Julius Caesar assassinated in Roman Senate
      - 476 CE: Fall of Western Roman Empire
      
      Modern History:
      - 1776: American Declaration of Independence signed
      - 1789-1797: George Washington serves as first US President
      - 1861-1865: American Civil War fought over slavery
      - 1914-1918: World War I devastates Europe
      
      20th Century Events:
      - 1945: World War II ends with Japan's surrender
      - 1969: Apollo 11 achieves first moon landing
      - 1989: Berlin Wall falls, Cold War ends
      - 1991: Soviet Union dissolves into independent republics
      
      Cultural Developments:
      - Renaissance: Revival of art and learning in Europe
      - Industrial Revolution: Mechanization transforms society
      - Information Age: Digital technology reshapes communication
    `;
  } else {
    return `
      Educational Content Analysis
      
      This document contains valuable educational material that can be transformed into interactive learning experiences.
      
      Content Structure:
      - Main concepts and key definitions
      - Supporting examples and explanations
      - Important facts and figures
      - Relationships between ideas
      
      Learning Objectives:
      - Understand fundamental principles
      - Apply concepts to real-world situations
      - Analyze relationships between topics
      - Synthesize information for deeper comprehension
      
      Study Strategies:
      - Active recall through flashcards
      - Self-testing with quizzes
      - Spaced repetition for long-term retention
      - Multi-modal learning with audio narration
    `;
  }
};

const detectCategory = (filename) => {
  const name = filename.toLowerCase();
  if (name.includes('bio')) return 'biology';
  if (name.includes('chem')) return 'chemistry';
  if (name.includes('phys')) return 'physics';
  if (name.includes('math')) return 'mathematics';
  if (name.includes('hist')) return 'history';
  return 'general';
};

export const getUploadHistory = async (req, res, next) => {
  try {
    const flashcards = await Flashcard.aggregate([
      { $match: { userId: req.user.id } },
      {
        $group: {
          _id: '$sourceDocument.originalName',
          count: { $sum: 1 },
          uploadDate: { $first: '$sourceDocument.uploadDate' },
          filename: { $first: '$sourceDocument.filename' },
          category: { $first: '$category' }
        }
      },
      { $sort: { uploadDate: -1 } },
      { $limit: 20 }
    ]);

    const quizzes = await Quiz.aggregate([
      { $match: { userId: req.user.id } },
      {
        $group: {
          _id: '$sourceDocument.originalName',
          count: { $sum: 1 },
          uploadDate: { $first: '$sourceDocument.uploadDate' },
          filename: { $first: '$sourceDocument.filename' },
          category: { $first: '$category' }
        }
      },
      { $sort: { uploadDate: -1 } },
      { $limit: 20 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        flashcards,
        quizzes
      }
    });
  } catch (error) {
    next(error);
  }
};