# Void 3 Cipher - Quick Reference Card

## 🎯 Quick Start

```bash
# Encrypt text
https://your-project.pages.dev/encrypt/mykey/void3/hello

# Decrypt text
https://your-project.pages.dev/decrypt/mykey/void3/encrypted_result

# Long data (use hash)
https://your-project.pages.dev/encrypt/mykey/void3#very_long_text_here
```

## 📋 URL Format Cheat Sheet

| Use Case | URL Format |
|----------|-----------|
| Basic encrypt | `/encrypt/KEY/void3/DATA` |
| Basic decrypt | `/decrypt/KEY/void3/DATA` |
| Long encrypt | `/encrypt/KEY/void3#DATA` |
| Custom seed | `/encrypt/KEY/void3,5,seed/DATA` |

## 🔤 Character Support

```
Primary: a-z A-Z 0-9 (62 chars)
Other characters: preserved as-is (!, @, #, spaces, etc.)
```

## 🛠️ Common Operations

### JavaScript (Browser)

```javascript
// Quick encrypt
const encrypted = await fetch(
  `https://api.example.com/encrypt/key/void3#${encodeURIComponent(text)}`
).then(r => r.text());

// Extract result
const result = encrypted.match(/id="resultText">([^<]+)</)[1];
```

### Node.js

```javascript
const fetch = require('node-fetch');

async function encrypt(text, key) {
  const url = new URL('https://api.example.com/encrypt/' + key + '/void3');
  url.hash = encodeURIComponent(text);
  const html = await (await fetch(url)).text();
  return html.match(/id="resultText">([^<]+)</)[1];
}
```

### cURL

```bash
# Encrypt
curl "https://api.example.com/encrypt/mykey/void3/mydata"

# Decrypt
curl "https://api.example.com/decrypt/mykey/void3/encrypted_result"

# With special chars
curl "https://api.example.com/encrypt/key/void3/hello%20world%21"
```

## ⚠️ Important Notes

❌ **DON'T:**
- Use for security-critical data
- Put passwords/secrets in URLs
- Forget to URL-encode special characters
- Use path-based for data > 2000 chars

✅ **DO:**
- Use hash (#) for long data
- URL-encode your inputs
- Test round-trip encryption
- Use HTTPS always

## 🔑 Key Management

```
Key Requirements:
✓ Any UTF-8 string
✓ Case-sensitive
✓ Minimum 1 character (recommend 6+)
✓ Can include special characters (but URL-encode them)

Example keys:
- "secret123" → /encrypt/secret123/void3/...
- "my@key#1" → /encrypt/my%40key%231/void3/...
```

## 🎲 Settings Options

```
Format: algorithm[,iterations[,seed]]

Examples:
void3              (default)
void3,5            (with iterations)
void3,5,customseed (with custom seed)

Note: iterations and seed are for future expansion
Currently only algorithm matters
```

## 📊 Encryption Properties

```
Deterministic:  Same input + key + time = same output (within 1 second)
Contextual:     Shift depends on surrounding characters
Temporal:       Changes with milliseconds, date, time
Positional:     Different positions encrypt differently
NOT SECURE:     Use for obfuscation only, not cryptography
```

## 🐛 Error Messages

| Error | Meaning | Fix |
|-------|---------|-----|
| "Invalid URL format" | Missing parameters | Add `/KEY/SETTINGS` |
| "No data provided" | Empty data field | Add data to URL path or hash |
| "Operation must be encrypt or decrypt" | Wrong operation | Use `encrypt` or `decrypt` |
| "Only void3 algorithm is supported" | Wrong algorithm | Use `void3` |

## 📏 Size Limits

| Item | Limit | Notes |
|------|-------|-------|
| Text data | ~2000 chars (path) | Use hash for more |
| Hash data | ~100,000 chars | Depends on browser |
| Key length | No limit | Use 6-32 chars recommended |
| URL length | 2000 chars (typical) | Use hash-based for longer |

## 🚀 Performance

```
Encryption speed: ~1ms per 100 characters
Network latency:  ~50ms edge (typically)
Total time:       ~100-200ms typical request

Factors affecting speed:
- Text length
- Server location
- Network conditions
- Browser cache
```

## 🔐 Security Reminder

```
Void 3 is NOT cryptographically secure.

Use for:
✓ Obfuscation
✓ Simple data hiding
✓ Fun experiments
✓ Puzzle/game mechanics

Do NOT use for:
✗ Passwords
✗ Credit cards
✗ Sensitive personal info
✗ Classified data
```

## 📱 URL Encoding Quick Reference

```
Space:     %20
!:         %21
@:         %40
#:         %23 (in path only)
$:         %24
%:         %25
&:         %26
':         %27
(:         %28
):         %29
+:         %2B
,          %2C
/:         %2F
?:         %3F
=:         %3D

JavaScript: encodeURIComponent(str)
```

## 💡 Tips & Tricks

### Tip 1: Test Locally
```javascript
// Before deploying, test in browser console
fetch('https://example.pages.dev/encrypt/test/void3/hello')
  .then(r => r.text())
  .then(html => console.log(html))
```

### Tip 2: Bulk Encryption
```javascript
// Encrypt multiple items
const items = ['text1', 'text2', 'text3'];
const encrypted = await Promise.all(
  items.map(t => encryptAPI(t, 'key'))
);
```

### Tip 3: Verify Encryption
```javascript
// Ensure round-trip works
const plaintext = 'secret';
const encrypted = await encryptAPI(plaintext, 'key');
const decrypted = await decryptAPI(encrypted, 'key');
console.assert(plaintext === decrypted);
```

### Tip 4: Cache Results
```javascript
// Cache encrypted values in localStorage
const cache = {};
async function encryptCached(text, key) {
  const cacheKey = text + key;
  if (!cache[cacheKey]) {
    cache[cacheKey] = await encryptAPI(text, key);
  }
  return cache[cacheKey];
}
```

## 🔄 Common Workflows

### Workflow 1: Encrypt User Input

```javascript
const input = document.getElementById('input').value;
const key = document.getElementById('key').value;

const encrypted = await encrypt(input, key);
document.getElementById('output').value = encrypted;
```

### Workflow 2: Decrypt from URL Parameter

```javascript
const params = new URLSearchParams(location.search);
const encrypted = params.get('data');
const key = 'known-key';

const decrypted = await decrypt(encrypted, key);
console.log(decrypted);
```

### Workflow 3: API Integration

```javascript
// Send encrypted data to backend
const encrypted = await encrypt(sensitiveData, apiKey);
const response = await fetch('/api/store', {
  method: 'POST',
  body: JSON.stringify({ encrypted })
});
```

## 📞 Quick Troubleshooting

**Q: Getting 404?**
A: Ensure `functions/_middleware.js` exists and Cloudflare rebuilt

**Q: Data not matching after decrypt?**
A: Verify same key used and check for URL encoding issues

**Q: URL too long?**
A: Use hash-based approach: `/encrypt/key/void3#data`

**Q: Special characters lost?**
A: Use URL encoding with `encodeURIComponent()`

**Q: Need faster responses?**
A: Results are edge-cached, no further optimization needed

## 🎓 Algorithm Overview

The Void 3 cipher uses a **polyalphabetic substitution** with dynamic shifting:

```
Shift factors:
1. Word length         (varies by word)
2. Base key hash       (consistent per key)
3. Global index        (changes per character)
4. Position in word    (changes per position)
5. Context length      (depends on surrounding)
6. Time (milliseconds) (sub-second precision)
7. Date components     (day, month variation)
8. Character value     (input-dependent)

Result: Each character gets unique shift value
```

## 📚 Learning Resources

- **Setup Guide:** SETUP_GUIDE.md
- **Examples:** EXAMPLES.js
- **Deployment:** DEPLOYMENT.md
- **Full Docs:** README.md

---

**Keep this card handy for quick API reference!**

*Void 3 Signature Cipher - Obfuscation Layer for Cloudflare Pages*
