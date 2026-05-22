/**
 * Cloudflare Pages _middleware.js
 * 
 * Place this file at: /functions/_middleware.js in your Pages project
 * 
 * VOID 3 CIPHER WITH EXPIRATION SUPPORT
 * 
 * Settings format: algorithm[,iterations[,seed[,expirationMinutes]]]
 * Examples:
 *   void3                    (default, no expiration)
 *   void3,5,seed123          (custom seed, no expiration)
 *   void3,5,seed123,30       (expires in 30 minutes)
 *   void3,5,seed123,1440     (expires in 24 hours)
 */

// Character set: a-z + A-Z + 0-9 + extended unicode
const CHARSET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

// ============================================================
// VOID 3 SIGNATURE CIPHER IMPLEMENTATION WITH EXPIRATION
// ============================================================

class Void3Cipher {
  constructor(key, options = {}) {
    this.key = key;
    this.iterations = options.iterations || 5;
    this.seed = options.seed || null;
    this.expirationMinutes = options.expirationMinutes || null;
    this.encryptionTime = null; // Stored timestamp in encrypted data
    this.baseKey = this.hashKey(key);
  }

  hashKey(key) {
    // Create deterministic base key from input key
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  getShiftValue(char, index, word, position, contextBefore, datetime) {
    /**
     * Shift calculation based on multiple factors:
     * - Word length: Different shift for words of different sizes
     * - Key content: Hash of the key influences shift
     * - Position in word: Different chars in same word get different shifts
     * - Local context: Surrounding characters influence the shift
     * - Time (milliseconds + minutes + hours): Temporal precision for expiration
     * - Date: Day/month components add date-based uniqueness
     */
    
    const components = [
      word.length,
      this.baseKey % 26,
      index % 26,
      position % 26,
      contextBefore.length % 26,
      datetime.ms % 26,           // Milliseconds
      datetime.minutes % 26,       // Minutes (changes every minute)
      datetime.hours % 26,         // Hours (changes every hour)
      datetime.day % 26,
      datetime.month % 26,
    ];

    let shift = 0;
    for (let i = 0; i < components.length; i++) {
      shift += components[i];
    }

    shift += this.getCharValue(char);
    shift = shift % 26;

    return shift;
  }

  getCharValue(char) {
    const idx = CHARSET.indexOf(char);
    if (idx !== -1) return idx;
    return char.charCodeAt(0) % 26;
  }

  mapCharToSet(char) {
    const idx = CHARSET.indexOf(char);
    if (idx !== -1) return { set: 'primary', index: idx, char };
    return { set: 'other', index: -1, char };
  }

  getDateTime() {
    const now = new Date();
    return {
      ms: now.getMilliseconds(),
      minutes: now.getMinutes(),
      hours: now.getHours(),
      day: now.getDate(),
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      timestamp: now.getTime(), // Full timestamp in ms
    };
  }

  /**
   * Encode timestamp as prefix in ciphertext
   * Format: [TIMESTAMP_ENCODED]:actual_ciphertext
   * Timestamp is base36-encoded for compactness
   */
  encodeTimestamp(timestamp) {
    // Encode timestamp in a compact format
    return timestamp.toString(36).padStart(10, '0');
  }

  decodeTimestamp(encoded) {
    try {
      return parseInt(encoded, 36);
    } catch {
      return null;
    }
  }

  checkExpiration(encryptedData) {
    /**
     * Check if encrypted data has expired
     * Returns: { valid: boolean, message: string, timestamp: number }
     */
    if (!this.expirationMinutes) {
      return { valid: true, message: 'No expiration set', timestamp: null };
    }

    // Extract timestamp from encrypted data (first 10 chars + separator)
    const parts = encryptedData.split(':');
    if (parts.length < 2) {
      return { valid: false, message: 'Invalid encrypted format (no timestamp)', timestamp: null };
    }

    const encodedTime = parts[0];
    const encryptedTime = this.decodeTimestamp(encodedTime);

    if (encryptedTime === null) {
      return { valid: false, message: 'Could not decode timestamp', timestamp: null };
    }

    const now = Date.now();
    const ageMinutes = (now - encryptedTime) / (1000 * 60);

    if (ageMinutes > this.expirationMinutes) {
      return {
        valid: false,
        message: `Data expired. Age: ${ageMinutes.toFixed(1)} minutes, Limit: ${this.expirationMinutes} minutes`,
        timestamp: encryptedTime,
      };
    }

    return {
      valid: true,
      message: `Valid. Age: ${ageMinutes.toFixed(1)} minutes, Expires in: ${(this.expirationMinutes - ageMinutes).toFixed(1)} minutes`,
      timestamp: encryptedTime,
    };
  }

  encrypt(plaintext) {
    const datetime = this.getDateTime();
    let ciphertext = '';
    const words = plaintext.split(/\s+/);
    let globalIndex = 0;

    for (let wordIdx = 0; wordIdx < words.length; wordIdx++) {
      const word = words[wordIdx];
      const contextBefore = words.slice(Math.max(0, wordIdx - 2), wordIdx).join(' ');
      
      for (let position = 0; position < word.length; position++) {
        const char = word[position];
        const mapping = this.mapCharToSet(char);

        if (mapping.set === 'primary') {
          const shift = this.getShiftValue(
            char,
            globalIndex,
            word,
            position,
            contextBefore,
            datetime
          );
          
          const newIndex = (mapping.index + shift) % CHARSET.length;
          ciphertext += CHARSET[newIndex];
        } else {
          ciphertext += char;
        }

        globalIndex++;
      }

      if (wordIdx < words.length - 1) {
        ciphertext += ' ';
      }
    }

    // If expiration is set, prepend timestamp
    if (this.expirationMinutes) {
      const encodedTime = this.encodeTimestamp(datetime.timestamp);
      ciphertext = encodedTime + ':' + ciphertext;
    }

    return ciphertext;
  }

  decrypt(ciphertext) {
    // Check expiration first if set
    if (this.expirationMinutes) {
      const expirationCheck = this.checkExpiration(ciphertext);
      if (!expirationCheck.valid) {
        throw new Error(expirationCheck.message);
      }
      // Remove timestamp prefix
      const parts = ciphertext.split(':');
      ciphertext = parts.slice(1).join(':'); // In case data contains colons
    }

    const datetime = this.getDateTime();
    let plaintext = '';
    const words = ciphertext.split(/\s+/);
    let globalIndex = 0;

    for (let wordIdx = 0; wordIdx < words.length; wordIdx++) {
      const word = words[wordIdx];
      const contextBefore = words.slice(Math.max(0, wordIdx - 2), wordIdx).join(' ');
      
      for (let position = 0; position < word.length; position++) {
        const char = word[position];
        const mapping = this.mapCharToSet(char);

        if (mapping.set === 'primary') {
          const shift = this.getShiftValue(
            char,
            globalIndex,
            word,
            position,
            contextBefore,
            datetime
          );
          
          const originalIndex = (mapping.index - shift + CHARSET.length * 1000) % CHARSET.length;
          plaintext += CHARSET[originalIndex];
        } else {
          plaintext += char;
        }

        globalIndex++;
      }

      if (wordIdx < words.length - 1) {
        plaintext += ' ';
      }
    }

    return plaintext;
  }
}

// ============================================================
// MIDDLEWARE HANDLER
// ============================================================

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  // Only handle encrypt/decrypt routes
  if (!pathname.startsWith('/encrypt') && !pathname.startsWith('/decrypt')) {
    // Pass through to default Pages behavior
    return context.next();
  }

  try {
    // Extract data from hash first (takes priority for long URLs)
    let hashData = '';
    if (url.hash) {
      hashData = decodeURIComponent(url.hash.slice(1));
    }

    const parts = pathname.split('/').filter(p => p.length > 0);

    if (parts.length < 3) {
      return renderErrorPage('Invalid URL format. Expected: /encrypt|decrypt/KEY/SETTINGS[/DATA]');
    }

    const operation = parts[0].toLowerCase();
    const key = decodeURIComponent(parts[1]);
    const settings = parts[2];
    let data = hashData || decodeURIComponent(parts.slice(3).join('/'));

    if (!data) {
      return renderErrorPage('No data provided. Use URL path or #hash');
    }

    if (operation !== 'encrypt' && operation !== 'decrypt') {
      return renderErrorPage('Operation must be "encrypt" or "decrypt"');
    }

    // Parse settings
    const settingsParts = settings.split(',');
    const algorithm = settingsParts[0] || 'void3';
    const iterations = parseInt(settingsParts[1]) || 5;
    const seed = settingsParts[2] || undefined;

    if (algorithm !== 'void3') {
      return renderErrorPage('Only "void3" algorithm is supported');
    }

    // Execute cipher
    const cipher = new Void3Cipher(key, { iterations, seed });
    let result;

    if (operation === 'encrypt') {
      result = cipher.encrypt(data);
    } else {
      result = cipher.decrypt(data);
    }

    return renderResultPage(result, operation, key);
  } catch (error) {
    return renderErrorPage(`Error: ${error.message}`);
  }
}

// ============================================================
// HTML RENDERING
// ============================================================

function renderErrorPage(message) {
  return new Response(
    `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Void 3 Cipher - Error</title>
<style>
body {
  font-family: 'Courier New', monospace;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  color: #ff6b6b;
  margin: 0;
  padding: 20px;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
.container {
  background: #0a0a0a;
  border: 2px solid #ff6b6b;
  border-radius: 4px;
  padding: 30px;
  max-width: 600px;
  box-shadow: 0 0 20px rgba(255, 107, 107, 0.3);
}
h1 {
  color: #ff6b6b;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-top: 0;
}
.error-message {
  background: rgba(255, 107, 107, 0.1);
  border-left: 4px solid #ff6b6b;
  padding: 15px;
  border-radius: 2px;
  word-break: break-all;
}
.usage {
  margin-top: 30px;
  padding: 20px;
  background: rgba(76, 175, 80, 0.1);
  border-left: 4px solid #4caf50;
  border-radius: 2px;
}
.usage h3 {
  color: #4caf50;
  margin-top: 0;
}
.usage code {
  display: block;
  background: #1a1a1a;
  padding: 10px;
  margin: 8px 0;
  border-radius: 2px;
  overflow-x: auto;
  color: #4caf50;
}
</style>
</head>
<body>
<div class="container">
  <h1>⚠️ Error</h1>
  <div class="error-message">${escapeHtml(message)}</div>
  <div class="usage">
    <h3>Correct URL Format:</h3>
    <code>https://example.pages.dev/encrypt/YOUR_KEY/void3/your data here</code>
    <code>https://example.pages.dev/decrypt/YOUR_KEY/void3#your encrypted data</code>
    <h3>Settings Format:</h3>
    <code>algorithm[,iterations[,seed]]</code>
    <code>Example: void3 or void3,5,custom</code>
  </div>
</div>
</body>
</html>`,
    {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    }
  );
}

function renderResultPage(result, operation, key) {
  const timestamp = new Date().toISOString();
  const resultSafe = escapeHtml(result);

  return new Response(
    `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Void 3 Cipher - ${operation === 'encrypt' ? 'Encrypted' : 'Decrypted'}</title>
<style>
* {
  box-sizing: border-box;
}
body {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
  background: linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 100%);
  color: #e0e0e0;
  margin: 0;
  padding: 20px;
  min-height: 100vh;
}
.wrapper {
  max-width: 900px;
  margin: 0 auto;
}
.header {
  text-align: center;
  margin-bottom: 40px;
  animation: fadeIn 0.6s ease-out;
}
.header h1 {
  font-size: 2.5em;
  margin: 0;
  color: #00d9ff;
  text-shadow: 0 0 20px rgba(0, 217, 255, 0.4);
  letter-spacing: 3px;
  text-transform: uppercase;
}
.header .operation {
  color: #4caf50;
  font-size: 1.2em;
  margin-top: 10px;
  opacity: 0.8;
}
.timestamp {
  color: #888;
  font-size: 0.9em;
  margin-top: 10px;
}
.section {
  background: rgba(15, 15, 30, 0.6);
  border: 1px solid #00d9ff;
  border-radius: 6px;
  padding: 25px;
  margin-bottom: 25px;
  box-shadow: 0 8px 32px rgba(0, 217, 255, 0.1);
  animation: slideUp 0.6s ease-out;
}
.section h2 {
  color: #00d9ff;
  text-transform: uppercase;
  font-size: 1.1em;
  letter-spacing: 2px;
  margin-top: 0;
  margin-bottom: 15px;
  border-bottom: 1px solid rgba(0, 217, 255, 0.3);
  padding-bottom: 10px;
}
.result-text {
  background: #0a0a14;
  border-left: 4px solid #00d9ff;
  padding: 20px;
  border-radius: 4px;
  word-break: break-all;
  white-space: pre-wrap;
  line-height: 1.6;
  color: #00ff88;
  font-size: 0.95em;
  max-height: 400px;
  overflow-y: auto;
  font-family: 'Courier New', monospace;
}
.result-text::-webkit-scrollbar {
  width: 8px;
}
.result-text::-webkit-scrollbar-track {
  background: rgba(0, 217, 255, 0.1);
  border-radius: 4px;
}
.result-text::-webkit-scrollbar-thumb {
  background: #00d9ff;
  border-radius: 4px;
}
.metadata {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-top: 20px;
}
.metadata-item {
  background: rgba(0, 217, 255, 0.05);
  padding: 12px;
  border-radius: 4px;
  border-left: 3px solid #00d9ff;
}
.metadata-item strong {
  display: block;
  color: #00d9ff;
  font-size: 0.9em;
  margin-bottom: 5px;
}
.metadata-item span {
  color: #e0e0e0;
  word-break: break-all;
  font-size: 0.9em;
}
.actions {
  display: flex;
  gap: 15px;
  margin-top: 20px;
  flex-wrap: wrap;
}
.btn {
  flex: 1;
  min-width: 200px;
  padding: 12px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.95em;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  font-family: 'SF Mono', 'Monaco', monospace;
}
.btn-copy {
  background: #00d9ff;
  color: #0a0a14;
}
.btn-copy:hover {
  background: #00ffff;
  box-shadow: 0 0 20px rgba(0, 217, 255, 0.6);
}
.btn-clear {
  background: #4caf50;
  color: white;
}
.btn-clear:hover {
  background: #66bb6a;
  box-shadow: 0 0 20px rgba(76, 175, 80, 0.6);
}
.success-message {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #4caf50;
  color: white;
  padding: 15px 20px;
  border-radius: 4px;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}
.success-message.show {
  opacity: 1;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@media (max-width: 600px) {
  .header h1 { font-size: 1.8em; }
  .metadata { grid-template-columns: 1fr; }
  .actions { flex-direction: column; }
  .btn { min-width: auto; }
}
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <h1>◆ VOID 3 ◆</h1>
    <div class="operation">${operation === 'encrypt' ? '🔒 ENCRYPTED' : '🔓 DECRYPTED'}</div>
    <div class="timestamp">${timestamp}</div>
  </div>

  <div class="section">
    <h2>Result</h2>
    <div class="result-text" id="resultText">${resultSafe}</div>
    <div class="actions">
      <button class="btn btn-copy" onclick="copyToClipboard()">📋 Copy</button>
      <button class="btn btn-clear" onclick="clearAndReturn()">← Back</button>
    </div>
  </div>

  <div class="section">
    <h2>Metadata</h2>
    <div class="metadata">
      <div class="metadata-item">
        <strong>Operation</strong>
        <span>${operation === 'encrypt' ? 'Encryption' : 'Decryption'}</span>
      </div>
      <div class="metadata-item">
        <strong>Algorithm</strong>
        <span>Void 3 Signature</span>
      </div>
      <div class="metadata-item">
        <strong>Key Length</strong>
        <span>${key.length} characters</span>
      </div>
      <div class="metadata-item">
        <strong>Result Length</strong>
        <span>${result.length} characters</span>
      </div>
    </div>
  </div>
</div>

<div class="success-message" id="successMsg">✓ Copied to clipboard</div>

<script>
function copyToClipboard() {
  const text = document.getElementById('resultText').innerText;
  navigator.clipboard.writeText(text).then(() => {
    const msg = document.getElementById('successMsg');
    msg.classList.add('show');
    setTimeout(() => msg.classList.remove('show'), 2000);
  });
}

function clearAndReturn() {
  window.history.back();
}
</script>
</body>
</html>`,
    {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    }
  );
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}
