const express = require('express');
const router = express.Router();
const { saveToGoogleSheets } = require('../services/googleSheets');

// POST /api/leads
router.post('/', async (req, res) => {
  try {
    const { 
      email, 
      phone, 
      practiceName, 
      location,
      conversation 
    } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const leadData = {
      email,
      phone: phone || '',
      practiceName: practiceName || '',
      location: location || '',
      conversation: conversation || '',
      timestamp: new Date().toISOString()
    };

    // Save to Google Sheets
    await saveToGoogleSheets(leadData);

    // TODO: Send email notification to andrew@amunet.ai

    res.json({ 
      success: true, 
      message: 'Lead saved successfully'
    });

  } catch (error) {
    console.error('Lead save error:', error);
    res.status(500).json({ 
      error: 'Failed to save lead',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
