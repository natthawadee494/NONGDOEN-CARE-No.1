# NSW CARE — Stable deployment setup

## 1. Google Apps Script
Use `apps-script/Code.gs` with the Google Sheet:

`https://docs.google.com/spreadsheets/d/1wbf2S3Dlop3yPOQwuwtknXy_lleuWa7nvIUxS9OD6hs/edit`

The script stores the full app state and also normalizes:
- Users
- Students
- Assignments
- Submissions
- Attendance
- Subjects
- LineChats

Deploy the Apps Script as a Web App and keep the `/exec` URL unchanged in the frontend.

## 2. Passwords
Teacher login now uses email + password.

Existing accounts need a password once. In Apps Script, run:

`setPasswordForEmail('teacher@nsw.ac.th', 'YOUR_PASSWORD')`

The password is stored as SHA-256 in the Users sheet. The website does not expose PasswordHash through getUsers.

The browser login form uses standard username/current-password autocomplete so the browser/password manager can remember credentials without the site storing a plaintext password.

## 3. Vercel environment variables
Set these in Project Settings -> Environment Variables for Production (and Preview if testing):

- `APPS_SCRIPT_URL` = the deployed Apps Script /exec URL
- `LINE_CHANNEL_ACCESS_TOKEN` = LINE Messaging API channel access token
- `LINE_CHANNEL_SECRET` = LINE Messaging API channel secret

Redeploy after changing environment variables.

## 4. LINE webhook
Set the LINE Messaging API webhook URL to:

`https://nongdoen-care-no-1.vercel.app/api/line-webhook`

Enable webhooks and allow the LINE Official Account to join group chats.

After the OA is added to a target group, send a message in that group. The webhook records the chat in the `LineChats` sheet. The website can then list that chat and send a push message to it.

## 5. LINE messages
The NONGDOEN CARE LINE window now supports:
- selecting a connected LINE chat
- editing the generated message before sending
- saving a local message template
- copying the message
- opening LINE manually
- sending directly through LINE Messaging API

The LINE access token is kept server-side in Vercel and is never placed in the browser bundle.

## 6. Vercel
GitHub pushes are connected to Vercel, so pushes to the production branch create deployments automatically. After environment variables are added, redeploy once so the new server functions receive them.
