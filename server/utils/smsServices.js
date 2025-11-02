const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID || 'your-account-sid',
  process.env.TWILIO_AUTH_TOKEN || 'your-auth-token'
);

const sendSMS = async (to, message) => {
  try {
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER || '+1234567890',
      to: to
    });

    console.log('SMS sent successfully:', result.sid);
    return true;
  } catch (error) {
    console.error('SMS sending error:', error);
    // For development, log the message instead of actually sending
    if (process.env.NODE_ENV === 'development') {
      console.log(`DEV - SMS to ${to}: ${message}`);
      return true;
    }
    return false;
  }
};

module.exports = sendSMS;