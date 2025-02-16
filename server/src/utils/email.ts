import nodemailer from 'nodemailer';

const ADMIN_EMAIL = 'jeffreycolonel212@gmail.com';
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD // Gmail App Password
  }
});

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

  // Send both emails
  await Promise.all([
    transporter.sendMail(customerMailOptions),
    transporter.sendMail(adminMailOptions)
  ]);
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

  // Send both emails
  await Promise.all([
    transporter.sendMail(customerMailOptions),
    transporter.sendMail(adminMailOptions)
  ]);
}; 