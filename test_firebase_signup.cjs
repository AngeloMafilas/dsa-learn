const fs = require('fs');

const configStr = fs.readFileSync('firebase-applet-config.json', 'utf8');
const config = JSON.parse(configStr);

async function testSignup() {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${config.apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test' + Date.now() + '@example.com',
      password: 'password123',
      returnSecureToken: true
    })
  });
  
  const data = await res.json();
  console.log('Signup result:', JSON.stringify(data, null, 2));
}

testSignup();
