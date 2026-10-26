import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  jwtSecret: process.env.JWT_SECRET || 'city-hospital-pune-secure-jwt-secret-2026',
  jwtExpiresIn: '7d',
  geminiApiKey: process.env.GEMINI_API_KEY || process.env.AI_API_KEY || '',
  isDemoMode: true,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  hospitalName: 'City Hospital Pune',
  emergencyHelplineIndia: '112',
  hospitalEmergencyDesk: '+91 20 2567 8900',
};
