const express = require('express');
const Click = require('../models/Click');
const socketIo = require('socket.io');
const router = express.Router();
const amazonUrl= 'https://www.amazon.com';
const walmartUrl= 'https://www.walmart.com';

// Track click and redirect user
router.post('/track-click', async (req, res) => {
  try {
    const { linkUrl } = req.body;
    
    // Validate link URL
    if (!linkUrl || ![amazonUrl, walmartUrl].includes(linkUrl)) { 
      return res.status(400).json({ error: 'Invalid Link URL Provided' });
    }

    // Create click record
    const click = new Click({
      linkUrl,
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip || req.connection.remoteAddress
    });

    await click.save();

    // Emit real-time update to dashboard clients
    const io = socketIo.get('socketio');
    if (io) {
      io.emit('newClick', {
        linkUrl,
        timestamp: click.timestamp,
        total: await Click.countDocuments()
      });
    }

    // redirect user to target URL
    res.redirect(linkUrl);

  } catch (error) {
    console.error('Error tracking clicks:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// get click statistics
router.get('/stats', async (req, res) => {
  try {
    const amazonClicks = await Click.countDocuments({ linkUrl: amazonUrl });
    const walmartClicks = await Click.countDocuments({ linkUrl: walmartUrl });
    const totalClicks = await Click.countDocuments();

    res.json({
      amazon: amazonClicks,
      walmart: walmartClicks,
      total: totalClicks
    });

  } catch (error) {
    console.error('Error getting click statistics:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;