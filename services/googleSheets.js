const { google } = require('googleapis');

async function saveToGoogleSheets(leadData) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

    const values = [[
      leadData.timestamp,
      leadData.email,
      leadData.phone,
      leadData.practiceName,
      leadData.location,
      leadData.conversation
    ]];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Leads!A:F',
      valueInputOption: 'USER_ENTERED',
      resource: { values }
    });

    console.log('✅ Lead saved to Google Sheets:', leadData.email);
    return true;

  } catch (error) {
    console.error('❌ Google Sheets error:', error);
    throw error;
  }
}

module.exports = { saveToGoogleSheets };
