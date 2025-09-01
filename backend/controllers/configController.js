import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { logger } from '../config/logger.js';

export const saveApiKeys = async (req, res, next) => {
  try {
    const { instasendPublic, instasendSecret } = req.body;
    
    // Read existing .env file
    const envPath = path.join(process.cwd(), '.env');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Update or add API keys
    const updateEnvVar = (content, key, value) => {
      if (!value) return content;
      
      const regex = new RegExp(`^${key}=.*$`, 'm');
      const newLine = `${key}=${value}`;
      
      if (regex.test(content)) {
        return content.replace(regex, newLine);
      } else {
        return content + (content.endsWith('\n') ? '' : '\n') + newLine + '\n';
      }
    };
    
    if (instasendPublic) {
      envContent = updateEnvVar(envContent, 'INSTASEND_PUBLIC_KEY', instasendPublic);
    }
    if (instasendSecret) {
      envContent = updateEnvVar(envContent, 'INSTASEND_SECRET_KEY', instasendSecret);
    }
    
    // Write updated .env file
    fs.writeFileSync(envPath, envContent);
    
    // Update process.env for immediate use
    if (instasendPublic) process.env.INSTASEND_PUBLIC_KEY = instasendPublic;
    if (instasendSecret) process.env.INSTASEND_SECRET_KEY = instasendSecret;
    
    logger.info(`API keys updated by user: ${req.user.email}`);
    
    res.status(200).json({
      success: true,
      message: 'API keys saved successfully'
    });
  } catch (error) {
    logger.error('Error saving API keys:', error);
    next(error);
  }
};

export const testInstasendConnection = async (req, res, next) => {
  try {
    // Use environment variables instead of request body
    const publicKey = process.env.INSTASEND_PUBLIC_KEY;
    const secretKey = process.env.INSTASEND_SECRET_KEY;
    
    if (!publicKey || !secretKey) {
      return res.status(400).json({
        success: false,
        message: 'Instasend API keys not configured in environment'
      });
    }
    
    console.log('🧪 Testing Instasend connection...');
    console.log('🔑 Using Public Key:', publicKey.substring(0, 20) + '...');
    
    // Test Instasend API connection by fetching collection accounts
    const response = await axios.get('https://payment.intasend.com/api/v1/checkout/', {
      headers: {
        'X-IntaSend-Public-API-Key': publicKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 15000
    });
    
    console.log('✅ Instasend test successful:', response.status);
    
    if (response.status === 200) {
      res.status(200).json({
        success: true,
        message: 'Instasend connection successful',
        data: {
          status: 'connected',
          environment: 'live'
        }
      });
    } else {
      throw new Error('Invalid response from Instasend');
    }
  } catch (error) {
    console.error('❌ Instasend test failed:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    logger.error('Instasend test error:', error.response?.data || error.message);
    res.status(400).json({
      success: false,
      message: 'Instasend connection failed',
      error: error.response?.data || error.message
    });
  }
};
