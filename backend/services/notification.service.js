const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendAdminNotification = async (type, data) => {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
        console.warn("ADMIN_EMAIL not configured. Skipping email notification.");
        return;
    }

    let subject = "";
    let html = "";

    switch (type) {
        case 'NEW_APPOINTMENT':
            subject = `✅ New Appointment — ${data.id} | Sanjeevani AI`;
            html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
          <div style="background: #059669; padding: 24px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 22px;">🏥 New Appointment Booked</h1>
            <p style="color: #d1fae5; margin: 8px 0 0; font-size: 14px;">Sanjeevani AI — Admin Notification</p>
          </div>
          <div style="padding: 28px; background: #fff;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 10px 0; color: #6b7280; font-size: 13px; width: 40%;">🆔 Appointment ID</td><td style="padding: 10px 0; font-weight: bold; color: #111827; font-size: 13px; font-family: monospace;">${data.id}</td></tr>
              <tr style="background: #f9fafb;"><td style="padding: 10px; color: #6b7280; font-size: 13px;">👤 Patient Name</td><td style="padding: 10px; font-weight: bold; color: #111827; font-size: 13px;">${data.patient_name}</td></tr>
              <tr><td style="padding: 10px 0; color: #6b7280; font-size: 13px;">👨‍⚕️ Doctor</td><td style="padding: 10px 0; font-weight: bold; color: #111827; font-size: 13px;">${data.doctor_name}</td></tr>
              <tr style="background: #f9fafb;"><td style="padding: 10px; color: #6b7280; font-size: 13px;">🏥 Specialization</td><td style="padding: 10px; font-weight: bold; color: #111827; font-size: 13px;">${data.specialty || 'N/A'}</td></tr>
              <tr><td style="padding: 10px 0; color: #6b7280; font-size: 13px;">📅 Date</td><td style="padding: 10px 0; font-weight: bold; color: #111827; font-size: 13px;">${data.date}</td></tr>
              <tr style="background: #f9fafb;"><td style="padding: 10px; color: #6b7280; font-size: 13px;">⏰ Time</td><td style="padding: 10px; font-weight: bold; color: #111827; font-size: 13px;">${data.time}</td></tr>
            </table>
          </div>
          <div style="padding: 16px 28px; background: #f9fafb; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; text-align: center;">
            Manage this in the <strong>Sanjeevani AI Admin Dashboard</strong>
          </div>
        </div>
      `;
            break;

        case 'CANCEL_APPOINTMENT':
            subject = `❌ Appointment Cancelled — ${data.id} | Sanjeevani AI`;
            html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
          <div style="background: #dc2626; padding: 24px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 22px;">❌ Appointment Cancelled</h1>
            <p style="color: #fee2e2; margin: 8px 0 0; font-size: 14px;">Sanjeevani AI — Admin Notification</p>
          </div>
          <div style="padding: 28px; background: #fff;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 10px 0; color: #6b7280; font-size: 13px; width: 40%;">🆔 Appointment ID</td><td style="padding: 10px 0; font-weight: bold; color: #111827; font-size: 13px; font-family: monospace;">${data.id}</td></tr>
              <tr style="background: #f9fafb;"><td style="padding: 10px; color: #6b7280; font-size: 13px;">👤 Patient Name</td><td style="padding: 10px; font-weight: bold; color: #111827; font-size: 13px;">${data.patient_name}</td></tr>
              <tr><td style="padding: 10px 0; color: #6b7280; font-size: 13px;">👨‍⚕️ Doctor</td><td style="padding: 10px 0; font-weight: bold; color: #111827; font-size: 13px;">${data.doctor_name}</td></tr>
              <tr style="background: #f9fafb;"><td style="padding: 10px; color: #6b7280; font-size: 13px;">🏥 Specialization</td><td style="padding: 10px; font-weight: bold; color: #111827; font-size: 13px;">${data.specialty || 'N/A'}</td></tr>
              <tr><td style="padding: 10px 0; color: #6b7280; font-size: 13px;">📅 Date</td><td style="padding: 10px 0; font-weight: bold; color: #111827; font-size: 13px;">${data.date}</td></tr>
              <tr style="background: #f9fafb;"><td style="padding: 10px; color: #6b7280; font-size: 13px;">⏰ Time</td><td style="padding: 10px; font-weight: bold; color: #111827; font-size: 13px;">${data.time}</td></tr>
            </table>
          </div>
          <div style="padding: 16px 28px; background: #f9fafb; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; text-align: center;">
            This slot is now <strong>available</strong> for new bookings.
          </div>
        </div>
      `;
            break;

        default:
            subject = "Sanjeevani AI - System Notification";
            html = `<p>${JSON.stringify(data)}</p>`;
    }

    try {
        await transporter.sendMail({
            from: `"Sanjeevani AI" <${process.env.EMAIL_USER}>`,
            to: adminEmail,
            subject: subject,
            html: html,
        });
        console.log(`Notification email sent for ${type}`);
    } catch (error) {
        console.error("Error sending notification email:", error);
    }
};

module.exports = {
    sendAdminNotification
};
