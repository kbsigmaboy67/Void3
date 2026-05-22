/**
 * VOID 3 CIPHER - PRACTICAL EXAMPLES & TEST CASES
 * 
 * These examples demonstrate how to use the cipher in real-world scenarios
 */

// ============================================================
// EXAMPLE 1: Basic HTML Form Interface
// ============================================================

const BASIC_FORM_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Void 3 Cipher - Web UI</title>
<style>
* { box-sizing: border-box; }
body {
  font-family: 'Monaco', 'Courier New', monospace;
  background: linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 100%);
  color: #e0e0e0;
  margin: 0;
  padding: 20px;
  min-height: 100vh;
}
.container {
  max-width: 800px;
  margin: 0 auto;
}
h1 {
  color: #00d9ff;
  text-align: center;
  text-shadow: 0 0 10px rgba(0, 217, 255, 0.5);
}
.form-group {
  margin-bottom: 20px;
}
label {
  display: block;
  color: #00d9ff;
  margin-bottom: 8px;
  font-weight: bold;
  text-transform: uppercase;
  font-size: 0.9em;
  letter-spacing: 1px;
}
input, textarea, select {
  width: 100%;
  padding: 12px;
  background: #1a1a2e;
  border: 1px solid #00d9ff;
  color: #00ff88;
  border-radius: 4px;
  font-family: 'Monaco', monospace;
  font-size: 1em;
}
textarea {
  resize: vertical;
  min-height: 120px;
  font-size: 0.9em;
}
input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: #00ffff;
  box-shadow: 0 0 10px rgba(0, 217, 255, 0.4);
}
.button-group {
  display: flex;
  gap: 10px;
  margin-top: 30px;
}
button {
  flex: 1;
  padding: 14px;
  background: #00d9ff;
  color: #0a0a14;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.3s;
  font-family: 'Monaco', monospace;
}
button:hover {
  background: #00ffff;
  box-shadow: 0 0 20px rgba(0, 217, 255, 0.6);
}
button:active {
  transform: scale(0.98);
}
.result {
  margin-top: 30px;
  padding: 20px;
  background: rgba(0, 217, 255, 0.1);
  border: 1px solid #00d9ff;
  border-radius: 4px;
  display: none;
}
.result.show {
  display: block;
  animation: slideIn 0.3s ease-out;
}
.result h3 {
  color: #00d9ff;
  margin-top: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.result-text {
  background: #0a0a14;
  padding: 15px;
  border-radius: 4px;
  word-break: break-all;
  color: #00ff88;
  font-size: 0.9em;
  max-height: 200px;
  overflow-y: auto;
  line-height: 1.6;
}
.result-text::-webkit-scrollbar {
  width: 6px;
}
.result-text::-webkit-scrollbar-thumb {
  background: #00d9ff;
  border-radius: 3px;
}
.status {
  margin-top: 20px;
  padding: 12px;
  border-radius: 4px;
  text-align: center;
  display: none;
}
.status.show {
  display: block;
}
.status.success {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
  border: 1px solid #4caf50;
}
.status.error {
  background: rgba(255, 107, 107, 0.2);
  color: #ff6b6b;
  border: 1px solid #ff6b6b;
}
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
</head>
<body>
<div class="container">
  <h1>◆ VOID 3 CIPHER ◆</h1>
  
  <div class="form-group">
    <label for="operation">Operation</label>
    <select id="operation">
      <option value="encrypt">🔒 Encrypt</option>
      <option value="decrypt">🔓 Decrypt</option>
    </select>
  </div>

  <div class="form-group">
    <label for="key">Encryption Key</label>
    <input type="password" id="key" placeholder="Enter a strong key" value="mySecretKey123">
  </div>

  <div class="form-group">
    <label for="data">Data</label>
    <textarea id="data" placeholder="Enter text to encrypt/decrypt">Hello World</textarea>
  </div>

  <div class="form-group">
    <label for="settings">Settings (optional)</label>
    <input type="text" id="settings" placeholder="void3 or void3,5,customseed" value="void3">
  </div>

  <div class="button-group">
    <button onclick="processData()">Process</button>
    <button onclick="copyResult()" style="background: #4caf50;">Copy Result</button>
  </div>

  <div class="status" id="status"></div>

  <div class="result" id="result">
    <h3>Result</h3>
    <div class="result-text" id="resultText"></div>
  </div>
</div>

<script>
async function processData() {
  const operation = document.getElementById('operation').value;
  const key = document.getElementById('key').value;
  const data = document.getElementById('data').value;
  const settings = document.getElementById('settings').value || 'void3';
  const status = document.getElementById('status');

  if (!key || !data) {
    showStatus('Please fill in all fields', 'error');
    return;
  }

  try {
    showStatus('Processing...', 'success');
    
    // Build URL with data in hash for safety
    const baseUrl = window.location.origin;
    const url = new URL(\`\${baseUrl}/\${operation}/\${encodeURIComponent(key)}/\${encodeURIComponent(settings)}\`);
    url.hash = encodeURIComponent(data);

    const response = await fetch(url.href);
    
    if (!response.ok) {
      throw new Error(\`HTTP \${response.status}\`);
    }

    const html = await response.text();
    
    // Extract result from HTML
    const match = html.match(/id="resultText">([^<]+)<\\/div>/);
    if (match) {
      const result = match[1].replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
      document.getElementById('resultText').innerText = result;
      document.getElementById('result').classList.add('show');
      showStatus('✓ Success', 'success');
    } else {
      throw new Error('Could not extract result from response');
    }
  } catch (error) {
    showStatus(\`✗ Error: \${error.message}\`, 'error');
  }
}

function copyResult() {
  const text = document.getElementById('resultText').innerText;
  if (!text) {
    showStatus('No result to copy', 'error');
    return;
  }
  
  navigator.clipboard.writeText(text).then(() => {
    showStatus('✓ Copied to clipboard', 'success');
  }).catch(() => {
    showStatus('✗ Failed to copy', 'error');
  });
}

function showStatus(message, type) {
  const status = document.getElementById('status');
  status.innerText = message;
  status.className = \`status show \${type}\`;
  
  if (type === 'success' && message !== 'Processing...') {
    setTimeout(() => status.classList.remove('show'), 3000);
  }
}

// Test on load
document.addEventListener('DOMContentLoaded', () => {
  console.log('Void 3 Cipher UI Ready');
});
</script>
</body>
</html>
`;

// ============================================================
// EXAMPLE 2: JavaScript API Usage
// ============================================================

const JAVASCRIPT_API_EXAMPLES = `
/**
 * Use the Void 3 Cipher API from JavaScript
 */

// Configuration
const CIPHER_API = 'https://your-project.pages.dev';
const DEFAULT_KEY = 'mySecretKey123';

/**
 * Encrypt text using the API
 * @param {string} plaintext - Text to encrypt
 * @param {string} key - Encryption key
 * @param {string} settings - Settings (default: 'void3')
 * @returns {Promise<string>} - Encrypted text
 */
async function encrypt(plaintext, key = DEFAULT_KEY, settings = 'void3') {
  const url = new URL(\`\${CIPHER_API}/encrypt/\${encodeURIComponent(key)}/\${encodeURIComponent(settings)}\`);
  url.hash = encodeURIComponent(plaintext);

  const response = await fetch(url.href);
  if (!response.ok) throw new Error(\`Encryption failed: \${response.status}\`);
  
  const html = await response.text();
  const match = html.match(/id="resultText">([^<]+)<\\/div>/);
  
  if (!match) throw new Error('Could not extract encrypted result');
  return decodeHtml(match[1]);
}

/**
 * Decrypt text using the API
 * @param {string} ciphertext - Text to decrypt
 * @param {string} key - Decryption key
 * @param {string} settings - Settings (default: 'void3')
 * @returns {Promise<string>} - Decrypted text
 */
async function decrypt(ciphertext, key = DEFAULT_KEY, settings = 'void3') {
  const url = new URL(\`\${CIPHER_API}/decrypt/\${encodeURIComponent(key)}/\${encodeURIComponent(settings)}\`);
  url.hash = encodeURIComponent(ciphertext);

  const response = await fetch(url.href);
  if (!response.ok) throw new Error(\`Decryption failed: \${response.status}\`);
  
  const html = await response.text();
  const match = html.match(/id="resultText">([^<]+)<\\/div>/);
  
  if (!match) throw new Error('Could not extract decrypted result');
  return decodeHtml(match[1]);
}

/**
 * Decode HTML entities
 */
function decodeHtml(html) {
  const map = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#039;': "'",
  };
  return html.replace(/&[^;]+;/g, (entity) => map[entity] || entity);
}

/**
 * Round-trip test: encrypt then decrypt
 */
async function testRoundTrip(text, key) {
  console.log('Original:', text);
  
  const encrypted = await encrypt(text, key);
  console.log('Encrypted:', encrypted);
  
  const decrypted = await decrypt(encrypted, key);
  console.log('Decrypted:', decrypted);
  
  const success = text === decrypted;
  console.log('Round-trip:', success ? '✓ PASS' : '✗ FAIL');
  
  return success;
}

// USAGE EXAMPLES:

// Example 1: Simple encrypt
encrypt('Hello World', 'secret123').then(result => {
  console.log('Encrypted:', result);
});

// Example 2: Encrypt and decrypt
(async () => {
  const encrypted = await encrypt('Test message');
  console.log('Encrypted:', encrypted);
  
  const decrypted = await decrypt(encrypted);
  console.log('Decrypted:', decrypted);
})();

// Example 3: Test round-trip
testRoundTrip('The quick brown fox jumps over the lazy dog', 'mykey');

// Example 4: Batch encryption
(async () => {
  const texts = ['Message 1', 'Message 2', 'Message 3'];
  const encrypted = await Promise.all(
    texts.map(text => encrypt(text, 'batchkey'))
  );
  console.log('All encrypted:', encrypted);
})();

// Example 5: Error handling
(async () => {
  try {
    const result = await encrypt('test', 'key');
    console.log('Success:', result);
  } catch (error) {
    console.error('Error:', error.message);
  }
})();
`;

// ============================================================
// EXAMPLE 3: Node.js / Fetch API Usage
// ============================================================

const NODEJS_EXAMPLE = `
/**
 * Node.js / Server-side usage of Void 3 Cipher
 */

// Using node-fetch or built-in fetch (Node 18+)
import fetch from 'node-fetch';

const CIPHER_API = 'https://your-project.pages.dev';

async function encryptText(plaintext, key, settings = 'void3') {
  const url = new URL(\`\${CIPHER_API}/encrypt/\${encodeURIComponent(key)}/\${encodeURIComponent(settings)}\`);
  url.hash = encodeURIComponent(plaintext);

  const response = await fetch(url.href);
  if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
  
  const html = await response.text();
  const match = html.match(/id="resultText">([^<]+)<\\/div>/);
  
  if (!match) throw new Error('Could not extract result');
  return decodeHtmlEntities(match[1]);
}

async function decryptText(ciphertext, key, settings = 'void3') {
  const url = new URL(\`\${CIPHER_API}/decrypt/\${encodeURIComponent(key)}/\${encodeURIComponent(settings)}\`);
  url.hash = encodeURIComponent(ciphertext);

  const response = await fetch(url.href);
  if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
  
  const html = await response.text();
  const match = html.match(/id="resultText">([^<]+)<\\/div>/);
  
  if (!match) throw new Error('Could not extract result');
  return decodeHtmlEntities(match[1]);
}

function decodeHtmlEntities(html) {
  return html
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}

// TEST USAGE:

(async () => {
  try {
    // Test 1: Basic encryption
    const encrypted = await encryptText('Hello from Node.js', 'nodekey');
    console.log('Encrypted:', encrypted);

    // Test 2: Decrypt
    const decrypted = await decryptText(encrypted, 'nodekey');
    console.log('Decrypted:', decrypted);

    // Test 3: Round-trip validation
    const testText = 'The quick brown fox';
    const enc = await encryptText(testText, 'test123');
    const dec = await decryptText(enc, 'test123');
    
    console.log('Original:', testText);
    console.log('Round-trip match:', testText === dec);

  } catch (error) {
    console.error('Error:', error.message);
  }
})();

// EXPRESS.JS INTEGRATION EXAMPLE:

import express from 'express';

const app = express();
app.use(express.json());

// POST endpoint to encrypt data
app.post('/api/encrypt', async (req, res) => {
  try {
    const { plaintext, key } = req.body;
    
    if (!plaintext || !key) {
      return res.status(400).json({ error: 'Missing plaintext or key' });
    }

    const encrypted = await encryptText(plaintext, key);
    res.json({ encrypted, key_length: key.length });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST endpoint to decrypt data
app.post('/api/decrypt', async (req, res) => {
  try {
    const { ciphertext, key } = req.body;
    
    if (!ciphertext || !key) {
      return res.status(400).json({ error: 'Missing ciphertext or key' });
    }

    const decrypted = await decryptText(ciphertext, key);
    res.json({ decrypted });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server running on :3000');
});

// USAGE:
// curl -X POST http://localhost:3000/api/encrypt \\
//   -H 'Content-Type: application/json' \\
//   -d '{
//     "plaintext": "secret message",
//     "key": "mykey123"
//   }'
`;

// ============================================================
// EXAMPLE 4: Test Suite
// ============================================================

const TEST_SUITE = `
/**
 * Comprehensive test suite for Void 3 Cipher
 * 
 * Run with: node test-cipher.js
 */

const CIPHER_API = 'https://your-project.pages.dev';
let testCount = 0;
let passCount = 0;
let failCount = 0;

async function assert(name, condition, expected, actual) {
  testCount++;
  if (condition) {
    passCount++;
    console.log(\`✓ \${name}\`);
  } else {
    failCount++;
    console.log(\`✗ \${name}\`);
    console.log(\`  Expected: \${expected}\`);
    console.log(\`  Actual:   \${actual}\`);
  }
}

async function encrypt(text, key = 'test') {
  const url = new URL(\`\${CIPHER_API}/encrypt/\${encodeURIComponent(key)}/void3\`);
  url.hash = encodeURIComponent(text);
  
  const response = await fetch(url.href);
  const html = await response.text();
  const match = html.match(/id="resultText">([^<]+)<\\/div>/);
  return match ? decodeHtml(match[1]) : null;
}

async function decrypt(text, key = 'test') {
  const url = new URL(\`\${CIPHER_API}/decrypt/\${encodeURIComponent(key)}/void3\`);
  url.hash = encodeURIComponent(text);
  
  const response = await fetch(url.href);
  const html = await response.text();
  const match = html.match(/id="resultText">([^<]+)<\\/div>/);
  return match ? decodeHtml(match[1]) : null;
}

function decodeHtml(html) {
  return html
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}

async function runTests() {
  console.log('🧪 Void 3 Cipher Test Suite\\n');

  // Test 1: Basic encryption
  console.log('Test Set 1: Basic Encryption');
  const enc1 = await encrypt('hello');
  await assert(
    'Encrypt "hello"',
    enc1 !== null && enc1 !== 'hello',
    'encrypted string',
    enc1
  );

  // Test 2: Round-trip (encrypt -> decrypt)
  console.log('\\nTest Set 2: Round-trip');
  const text = 'test message';
  const encrypted = await encrypt(text);
  const decrypted = await decrypt(encrypted);
  await assert(
    'Round-trip preserves data',
    text === decrypted,
    text,
    decrypted
  );

  // Test 3: Different keys produce different results
  console.log('\\nTest Set 3: Key Uniqueness');
  const enc_key1 = await encrypt('same', 'key1');
  const enc_key2 = await encrypt('same', 'key2');
  await assert(
    'Different keys produce different encryption',
    enc_key1 !== enc_key2,
    'different results',
    enc_key1 === enc_key2 ? 'same result' : 'different results'
  );

  // Test 4: Empty strings
  console.log('\\nTest Set 4: Edge Cases');
  const emptyEnc = await encrypt('', 'key');
  await assert(
    'Encrypt empty string',
    emptyEnc !== null,
    'encrypted result',
    emptyEnc
  );

  // Test 5: Long text
  console.log('\\nTest Set 5: Long Text');
  const longText = 'a'.repeat(1000);
  const longEnc = await encrypt(longText);
  const longDec = await decrypt(longEnc);
  await assert(
    'Long text round-trip',
    longText === longDec,
    'texts match',
    longText === longDec ? 'match' : 'no match'
  );

  // Test 6: Special characters
  console.log('\\nTest Set 6: Special Characters');
  const special = 'Hello! @#\$%';
  const specEnc = await encrypt(special);
  const specDec = await decrypt(specEnc);
  await assert(
    'Special characters preserved',
    special === specDec,
    special,
    specDec
  );

  // Test 7: Multiple spaces
  console.log('\\nTest Set 7: Whitespace');
  const spaces = 'hello  world   test';
  const spaceEnc = await encrypt(spaces);
  const spaceDec = await decrypt(spaceEnc);
  await assert(
    'Multiple spaces preserved',
    spaces === spaceDec,
    spaces,
    spaceDec
  );

  // Summary
  console.log(\`\\n${'='.repeat(50)}\`);
  console.log(\`Tests run: \${testCount}\`);
  console.log(\`✓ Passed: \${passCount}\`);
  console.log(\`✗ Failed: \${failCount}\`);
  console.log(\`Success rate: \${((passCount/testCount)*100).toFixed(1)}%\`);
  console.log(\`${'='.repeat(50)}\`);

  process.exit(failCount === 0 ? 0 : 1);
}

// Run tests
runTests().catch(error => {
  console.error('Test suite error:', error);
  process.exit(1);
});
`;

// ============================================================
// EXAMPLE 5: cURL Commands
// ============================================================

const CURL_EXAMPLES = `
# Void 3 Cipher - cURL Examples

# Replace with your actual Pages URL
CIPHER_URL="https://your-project.pages.dev"

# ============================================================
# BASIC OPERATIONS
# ============================================================

# 1. Simple encryption (path-based)
curl "${CIPHER_URL}/encrypt/mykey/void3/hello%20world"

# 2. Simple decryption
curl "${CIPHER_URL}/decrypt/mykey/void3/[encrypted-text]"

# 3. Encryption with hash (long data)
curl "${CIPHER_URL}/encrypt/mykey/void3#This%20is%20a%20longer%20message%20that%20exceeds%20normal%20URL%20limits"

# ============================================================
# SPECIAL CHARACTERS
# ============================================================

# 4. URL-encoded special characters
curl "${CIPHER_URL}/encrypt/my%40key%23/void3/test%20%24%25%5E"

# 5. Using @ symbol in key (URL encoded as %40)
curl "${CIPHER_URL}/encrypt/secret%40key/void3/data"

# ============================================================
# CUSTOM SETTINGS
# ============================================================

# 6. Custom seed
curl "${CIPHER_URL}/encrypt/key/void3,5,myseed123/hello"

# 7. Custom iterations (informational)
curl "${CIPHER_URL}/encrypt/key/void3,10/data"

# ============================================================
# EXTRACTING RESULTS
# ============================================================

# 8. Extract encrypted text and store in variable
ENCRYPTED=$(curl -s "${CIPHER_URL}/encrypt/key/void3/message" | grep -oP 'id="resultText">\K[^<]+')
echo "Encrypted: $ENCRYPTED"

# 9. Decrypt the result
curl "${CIPHER_URL}/decrypt/key/void3/${ENCRYPTED}"

# 10. Full round-trip in bash
encrypt_text() {
  local text="$1"
  local key="${2:-default}"
  local url="${CIPHER_URL}/encrypt/${key}/void3"
  curl -s "${url}#$(echo -n "$text" | jq -sRr @uri)" | grep -oP 'id="resultText">\K[^<]+'
}

decrypt_text() {
  local text="$1"
  local key="${2:-default}"
  local url="${CIPHER_URL}/decrypt/${key}/void3"
  curl -s "${url}#$(echo -n "$text" | jq -sRr @uri)" | grep -oP 'id="resultText">\K[^<]+'
}

# Usage
ORIGINAL="Hello World"
ENCRYPTED=$(encrypt_text "$ORIGINAL" "mykey")
DECRYPTED=$(decrypt_text "$ENCRYPTED" "mykey")

echo "Original: $ORIGINAL"
echo "Encrypted: $ENCRYPTED"
echo "Decrypted: $DECRYPTED"

# ============================================================
# BATCH OPERATIONS
# ============================================================

# 11. Encrypt multiple messages
for msg in "message1" "message2" "message3"; do
  curl -s "${CIPHER_URL}/encrypt/key/void3/${msg}"
done

# 12. Process file
FILE_CONTENT=$(cat myfile.txt)
ENCODED=$(echo -n "$FILE_CONTENT" | jq -sRr @uri)
curl "${CIPHER_URL}/encrypt/key/void3#${ENCODED}"

# ============================================================
# DEBUGGING
# ============================================================

# 13. Get full HTML response
curl -i "${CIPHER_URL}/encrypt/key/void3/test"

# 14. Save response to file
curl "${CIPHER_URL}/encrypt/key/void3/data" > result.html

# 15. Verbose output (see all headers)
curl -v "${CIPHER_URL}/encrypt/key/void3/data"

# ============================================================
# REAL-WORLD SCENARIOS
# ============================================================

# 16. Encrypt API credentials
API_CREDS="user:password"
curl "${CIPHER_URL}/encrypt/masterkey/void3#$(echo -n "$API_CREDS" | jq -sRr @uri)"

# 17. Encrypt and email result
encrypt_text() {
  curl -s "${CIPHER_URL}/encrypt/$1/void3#$(echo -n "$2" | jq -sRr @uri)" | grep -oP 'id="resultText">\K[^<]+'
}

ENCRYPTED=$(encrypt_text "sharekey" "confidential message")
echo "Encrypted message: $ENCRYPTED" | mail -s "Secure Message" recipient@example.com

# 18. Encrypt with timestamp in seed
SEED=$(date +%s)
curl "${CIPHER_URL}/encrypt/key/void3,5,${SEED}/message"

# 19. Chain encrypt (encrypt the result again)
ENC1=$(encrypt_text "key1" "secret")
ENC2=$(encrypt_text "key2" "$ENC1")
echo "Double encrypted: $ENC2"

# 20. Test performance
time curl "${CIPHER_URL}/encrypt/key/void3/$(head -c 10000 /dev/urandom | base64)"

# ============================================================
# TESTING HELPERS
# ============================================================

# 21. Round-trip test function
test_roundtrip() {
  local text="$1"
  local key="${2:-test}"
  
  local enc=$(curl -s "${CIPHER_URL}/encrypt/${key}/void3#$(echo -n "$text" | jq -sRr @uri)" | grep -oP 'id="resultText">\K[^<]+')
  local dec=$(curl -s "${CIPHER_URL}/decrypt/${key}/void3#$(echo -n "$enc" | jq -sRr @uri)" | grep -oP 'id="resultText">\K[^<]+')
  
  if [ "$text" = "$dec" ]; then
    echo "✓ PASS: '$text'"
    return 0
  else
    echo "✗ FAIL: Expected '$text', got '$dec'"
    return 1
  fi
}

# Run tests
test_roundtrip "hello"
test_roundtrip "test with spaces"
test_roundtrip "123!@#"
`;

// ============================================================
// Export all examples
// ============================================================

module.exports = {
  BASIC_FORM_HTML,
  JAVASCRIPT_API_EXAMPLES,
  NODEJS_EXAMPLE,
  TEST_SUITE,
  CURL_EXAMPLES,
};
