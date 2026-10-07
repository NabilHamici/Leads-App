const express = require('express');

const router = express.Router();

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Privacy Policy — Leads PoC</title>
<style>
  body { font: 16px/1.6 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
         margin: 0; padding: 40px 20px; background: #f8fafc; color: #0f172a; }
  main { max-width: 720px; margin: 0 auto; background: #fff;
         padding: 32px; border-radius: 12px; }
  h1 { font-size: 24px; margin-top: 0; }
  h2 { font-size: 17px; margin: 28px 0 8px; }
  p, li { color: #334155; }
  a { color: #4f46e5; }
</style>
</head>
<body>
<main>
<h1>Privacy Policy</h1>
<p><strong>Last updated: 7 October 2026.</strong></p>
<p>This is a proof of concept for receiving Meta Lead Ads submissions
over webhooks. It is not a commercial service.</p>

<h2>What we collect</h2>
<p>Only what you choose to type into the lead form: typically your full
name, email address, phone number and any other questions on the form.</p>

<h2>How we receive it</h2>
<p>When you submit an instant form on Facebook or Instagram, Meta sends
a notification to this service. We do not collect anything from you
directly and we do not use tracking cookies or analytics.</p>

<h2>Why we hold it</h2>
<p>Solely to demonstrate that the notification can be received and
displayed in real time. We do not contact you, sell your data, or share
it with anyone other than Meta, which already holds it under
<a href="https://www.facebook.com/privacy/policies/">Meta&rsquo;s own privacy policy</a>.</p>

<h2>Where it is stored, and for how long</h2>
<p>Submissions are held <strong>in memory on the server only</strong>.
Nothing is written to a database. The list is cleared every time the
server restarts, so retention is effectively the lifetime of the process.</p>

<h2>Your rights</h2>
<p>You may ask what is held about you and request its removal at any
time by contacting the address below.</p>

<h2>Contact</h2>
<p>privacy@example.com — replace this address before publishing.</p>
</main>
</body>
</html>`;

router.get('/privacy-policy', (req, res) => {
  res.type('html').send(html);
});

module.exports = router;