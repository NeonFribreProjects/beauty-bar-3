import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html
    });
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email error:', error);
    throw error;
  }
};

export const sendBookingConfirmation = async (
  to: string,
  bookingDetails: {
    customerName: string;
    date: string;
    startTime: string;
    serviceName: string;
  }
) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Booking Confirmation - Medina Esthetique',
    html: `
      <h1>Booking Confirmation</h1>
      <p>Dear ${bookingDetails.customerName},</p>
      <p>Your booking has been confirmed for:</p>
      <ul>
        <li>Service: ${bookingDetails.serviceName}</li>
        <li>Date: ${bookingDetails.date}</li>
        <li>Time: ${bookingDetails.startTime}</li>
      </ul>
      <p>Thank you for choosing Medina Esthetique!</p>
    `
  };

  return transporter.sendMail(mailOptions);
}; 
