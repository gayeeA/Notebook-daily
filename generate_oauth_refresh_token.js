const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const readline = require('readline');

const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/spreadsheets',
];

const CREDENTIALS_PATH = path.join(process.cwd(), 'oauth_client_secret.json');
const TOKEN_PATH = path.join(process.cwd(), 'oauth_refresh_token.json');

async function main() {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    console.error(`Missing ${CREDENTIALS_PATH}. Create an OAuth client ID JSON and save it there.`);
    process.exit(1);
  }

  const content = fs.readFileSync(CREDENTIALS_PATH, 'utf-8');
  const credentials = JSON.parse(content).installed || JSON.parse(content).web;
  const { client_id, client_secret, redirect_uris } = credentials;

  if (!client_id || !client_secret || !redirect_uris || redirect_uris.length === 0) {
    console.error('Invalid OAuth client secret JSON format.');
    process.exit(1);
  }

  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });

  console.log('Authorize this app by visiting this url:');
  console.log(authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Enter the code from that page here: ', async (code) => {
    rl.close();
    try {
      const { tokens } = await oAuth2Client.getToken(code.trim());
      if (!tokens.refresh_token) {
        console.error('No refresh token returned. Try re-running with prompt=consent.');
        process.exit(1);
      }

      fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
      console.log(`Refresh token saved to ${TOKEN_PATH}`);
      console.log('Use these values in your .env:');
      console.log(`GOOGLE_OAUTH_CLIENT_ID=${client_id}`);
      console.log(`GOOGLE_OAUTH_CLIENT_SECRET=${client_secret}`);
      console.log(`GOOGLE_OAUTH_REFRESH_TOKEN=${tokens.refresh_token}`);
    } catch (err) {
      console.error('Error while trying to retrieve access token', err.message || err);
      process.exit(1);
    }
  });
}

main();
