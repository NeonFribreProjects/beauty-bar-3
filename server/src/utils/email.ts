import nodemailer from 'nodemailer';

const ADMIN_EMAIL = 'jeffreycolonel212@gmail.com';

// Create reusable transporter with better configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  },
  tls: {
    rejectUnauthorized: false,
    ciphers: 'SSLv3'
  }
});

// Verify connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP Connection Error:', error);
  } else {
    console.log('SMTP Server is ready to send emails');
  }
});

// Helper function to send email with retries
const sendMailWithRetry = async (mailOptions: any, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return info;
    } catch (error) {
      console.error(`Email attempt ${attempt} failed:`, error);
      if (attempt === retries) throw error;
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
};

export const sendBookingConfirmation = async ({
  customerEmail,
  customerName,
  serviceName,
  date,
  startTime,
  endTime,
  customerPhone
}: {
  customerEmail: string;
  customerName: string;
  serviceName: string;
  date: string;
  startTime: string;
  endTime: string;
  customerPhone: string;
}) => {
  // Customer email
  const customerMailOptions = {
    from: process.env.EMAIL_USER,
    to: customerEmail,
    subject: 'Booking Confirmation - Medina Esthetique',
    html: `
      <h1>Booking Confirmation</h1>
      <p>Dear ${customerName},</p>
      <p>Your appointment has been confirmed:</p>
      <ul>
        <li>Service: ${serviceName}</li>
        <li>Date: ${date}</li>
        <li>Time: ${startTime} - ${endTime}</li>
      </ul>
      <p>Thank you for choosing Medina Esthetique!</p>
    `
  };

  // Admin notification email
  const adminMailOptions = {
    from: process.env.EMAIL_USER,
    to: ADMIN_EMAIL,
    subject: `New Booking - ${serviceName}`,
    html: `
      <h1>New Booking Received</h1>
      <h2>Booking Details:</h2>
      <ul>
        <li>Service: ${serviceName}</li>
        <li>Date: ${date}</li>
        <li>Time: ${startTime} - ${endTime}</li>
      </ul>
      <h2>Customer Details:</h2>
      <ul>
        <li>Name: ${customerName}</li>
        <li>Email: ${customerEmail}</li>
        <li>Phone: ${customerPhone}</li>
      </ul>
    `
  };

  // Send both emails with retry
  try {
    await Promise.all([
      sendMailWithRetry(customerMailOptions),
      sendMailWithRetry(adminMailOptions)
    ]);
    console.log('All confirmation emails sent successfully');
  } catch (error) {
    console.error('Failed to send confirmation emails:', error);
    throw error;
  }
};

export const sendBookingStatusUpdate = async ({
  customerEmail,
  customerName,
  serviceName,
  date,
  startTime,
  endTime,
  status
}: {
  customerEmail: string;
  customerName: string;
  serviceName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'confirmed' | 'cancelled';
}) => {
  // Customer email content
  const customerMailOptions = {
    from: process.env.EMAIL_USER,
    to: customerEmail,
    subject: `Booking ${status.charAt(0).toUpperCase() + status.slice(1)} - Medina Esthetique`,
    html: status === 'confirmed' ? `
      <h1>Booking Confirmed</h1>
      <p>Dear ${customerName},</p>
      <p>Your booking has been confirmed and payment of 20 CAD has been received:</p>
      <ul>
        <li>Service: ${serviceName}</li>
        <li>Date: ${date}</li>
        <li>Time: ${startTime} - ${endTime}</li>
      </ul>
      <p>Thank you for choosing Medina Esthetique!</p>
    ` : `
      <h1>Booking Cancelled</h1>
      <p>Dear ${customerName},</p>
      <p>Your booking has been cancelled:</p>
      <ul>
        <li>Service: ${serviceName}</li>
        <li>Date: ${date}</li>
        <li>Time: ${startTime} - ${endTime}</li>
      </ul>
      <p>We apologize for any inconvenience.</p>
    `
  };

  // Admin notification
  const adminMailOptions = {
    from: process.env.EMAIL_USER,
    to: ADMIN_EMAIL,
    subject: `Booking ${status} - ${serviceName}`,
    html: `
      <h1>Booking ${status}</h1>
      <h2>Booking Details:</h2>
      <ul>
        <li>Service: ${serviceName}</li>
        <li>Date: ${date}</li>
        <li>Time: ${startTime} - ${endTime}</li>
        <li>Status: ${status}</li>
      </ul>
      <h2>Customer Details:</h2>
      <ul>
        <li>Name: ${customerName}</li>
        <li>Email: ${customerEmail}</li>
      </ul>
    `
  };

  // Send both emails with retry
  try {
    await Promise.all([
      sendMailWithRetry(customerMailOptions),
      sendMailWithRetry(adminMailOptions)
    ]);
    console.log('All status update emails sent successfully');
  } catch (error) {
    console.error('Failed to send status update emails:', error);
    throw error;
  }
}; 
