const sendEmail = require('../utils/sendEmail');
 
const sendCustomEmail = async (req, res, next) => {
  const { email, subject, message } = req.body;

  try {
    await sendEmail({
      email,
      subject,
      message,
    });

    res.status(200).json({ success: true, data: 'Email sent' });
  } catch (error) {
    next(error);  
  }
};

module.exports = { sendCustomEmail };