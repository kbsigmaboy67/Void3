# Void 3 Cipher - Deployment & Project Structure

## 📁 Project Structure

```
your-cloudflare-pages-repo/
│
├── functions/
│   └── _middleware.js          ← 🔑 MAIN WORKER FILE
│
├── public/                      (optional)
│   ├── index.html              ← Landing page (if desired)
│   ├── css/
│   └── js/
│
├── .gitignore
├── package.json                (optional, for scripts)
└── README.md
```

## 🚀 Step-by-Step Deployment Guide

### Step 1: Create Repository

```bash
# Create new repo or use existing one
git init
git remote add origin https://github.com/YOUR_USERNAME/cipher-repo.git
```

### Step 2: Create Functions Directory

```bash
mkdir -p functions
```

### Step 3: Add _middleware.js

Copy the `_middleware.js` file to `functions/_middleware.js`:

```bash
cp _middleware.js functions/
```

### Step 4: Create Optional Landing Page

```html
<!-- public/index.html (optional) -->
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Void 3 Cipher - API</title>
<style>
  body {
    font-family: monospace;
    background: linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 100%);
    color: #00d9ff;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    margin: 0;
  }
  .container {
    max-width: 600px;
    padding: 40px;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 8px;
    border: 1px solid #00d9ff;
    text-align: center;
  }
  h1 {
    font-size: 3em;
    margin: 0 0 20px;
    text-shadow: 0 0 20px rgba(0, 217, 255, 0.5);
  }
  .code {
    background: #0a0a14;
    padding: 20px;
    border-radius: 4px;
    margin: 20px 0;
    text-align: left;
    overflow-x: auto;
  }
  .code code {
    display: block;
    margin: 5px 0;
    color: #00ff88;
  }
</style>
</head>
<body>
<div class="container">
  <h1>◆ VOID 3 ◆</h1>
  <p>Encryption/Decryption API</p>
  
  <div class="code">
    <code>GET /encrypt/KEY/SETTINGS/DATA</code>
    <code>GET /decrypt/KEY/SETTINGS/DATA</code>
    <code>GET /encrypt/KEY/SETTINGS#DATA</code>
  </div>
  
  <p>Try: <code>/encrypt/test/void3/hello</code></p>
</div>
</body>
</html>
```

### Step 5: Commit and Push

```bash
git add .
git commit -m "Add Void 3 Cipher worker"
git push origin main
```

### Step 6: Connect to Cloudflare Pages

1. **Log in to Cloudflare Dashboard**
   - Navigate to Pages (left sidebar)
   - Click "Create a project"

2. **Connect Git Account**
   - Select your Git provider (GitHub, GitLab, etc.)
   - Authorize Cloudflare
   - Select your repository

3. **Configure Build Settings**
   - Framework preset: None
   - Build command: (leave empty if no build)
   - Build output directory: public (or leave empty)

4. **Deploy**
   - Click "Save and Deploy"
   - Wait for build to complete
   - Access via `https://your-project.pages.dev`

### Step 7: Verify Deployment

```bash
# Test basic encryption
curl "https://your-project.pages.dev/encrypt/test/void3/hello"

# Should return HTML page with encrypted result
```

## ⚙️ Configuration

### Environment Variables (Optional)

If you want to add authentication or rate limiting:

**In Cloudflare Dashboard:**
1. Go to Pages > Settings
2. Environment variables
3. Add variables:
   - `REQUIRE_AUTH=false` (set to true to require password)
   - `AUTH_TOKEN=your_secret_token`
   - `RATE_LIMIT=1000` (requests per minute)

**In _middleware.js:**
```javascript
export async function onRequest(context) {
  // Access env vars
  const requireAuth = context.env.REQUIRE_AUTH === 'true';
  
  if (requireAuth) {
    const token = context.request.headers.get('Authorization');
    if (token !== `Bearer ${context.env.AUTH_TOKEN}`) {
      return new Response('Unauthorized', { status: 401 });
    }
  }
  
  // ... rest of handler
}
```

### Custom Domain

1. **In Cloudflare Dashboard:**
   - Pages > your-project > Custom domains
   - Add domain (must be in same Cloudflare account)
   - Configure DNS records

2. **Access via custom domain:**
   ```
   https://cipher.yourdomain.com/encrypt/key/void3/data
   ```

## 📊 Production Checklist

### Before Going Live

- [ ] **Security Review**
  - [ ] Understand that Void 3 is obfuscation, not cryptography
  - [ ] Never put sensitive keys/passwords in URLs
  - [ ] Use HTTPS always (Cloudflare provides free SSL)
  - [ ] Consider adding authentication for public APIs

- [ ] **Performance**
  - [ ] Test with large payloads (100KB+)
  - [ ] Monitor Cloudflare Analytics
  - [ ] Set up alerts for high error rates

- [ ] **Testing**
  - [ ] Test round-trip encryption/decryption
  - [ ] Test with special characters
  - [ ] Test long URLs using hash approach
  - [ ] Test in different browsers
  - [ ] Test on mobile devices

- [ ] **Documentation**
  - [ ] Document your API endpoints
  - [ ] Provide example requests
  - [ ] Create README with setup instructions
  - [ ] Add inline code comments

- [ ] **Monitoring**
  - [ ] Enable Cloudflare Analytics
  - [ ] Set up error rate monitoring
  - [ ] Monitor worker CPU time
  - [ ] Check for any abuse patterns

### After Deployment

- [ ] Monitor error rates
- [ ] Check Cloudflare Analytics dashboard
- [ ] Review Pages build logs weekly
- [ ] Update documentation based on feedback
- [ ] Plan for future enhancements

## 🔍 Testing Checklist

### Unit Tests

```bash
# Test basic encryption
curl "https://your-project.pages.dev/encrypt/key/void3/test"

# Test basic decryption
curl "https://your-project.pages.dev/decrypt/key/void3/[encrypted]"

# Test with spaces
curl "https://your-project.pages.dev/encrypt/key/void3/hello%20world"

# Test with special characters
curl "https://your-project.pages.dev/encrypt/key/void3/test%21%40%23%24"

# Test long data (hash-based)
curl "https://your-project.pages.dev/encrypt/key/void3#very%20long%20text%20here..."
```

### Integration Tests

```bash
# Test round-trip (encrypt then decrypt)
ENCRYPTED=$(curl -s "https://your-project.pages.dev/encrypt/testkey/void3/hello" | grep -oP 'id="resultText">\K[^<]+')
DECRYPTED=$(curl -s "https://your-project.pages.dev/decrypt/testkey/void3/${ENCRYPTED}" | grep -oP 'id="resultText">\K[^<]+')
[ "$DECRYPTED" = "hello" ] && echo "✓ PASS" || echo "✗ FAIL"
```

### Performance Tests

```bash
# Test with 10KB of data
time curl "https://your-project.pages.dev/encrypt/key/void3#$(head -c 10000 /dev/urandom | base64)"

# Monitor response time in browser DevTools
# Should be < 100ms for typical payloads
```

## 🐛 Troubleshooting

### Build Fails

**Problem:** "Build failed" message in Cloudflare

**Solution:**
1. Check build logs in Cloudflare dashboard
2. Ensure `functions/_middleware.js` exists
3. Verify correct directory structure
4. Check for syntax errors in JavaScript
5. Rebuild project manually

### 404 on `/encrypt` endpoint

**Problem:** Getting 404 when accessing `/encrypt/...`

**Solution:**
1. Ensure `_middleware.js` is in `functions/` directory (not root)
2. Commit and push changes
3. Wait for Pages to rebuild
4. Check that build completed successfully
5. Clear browser cache

### URL encoding issues

**Problem:** Special characters not working

**Solution:**
1. Always URL-encode data: `encodeURIComponent(text)`
2. For spaces: use `%20` not `+`
3. For hashes: use `url.hash = encodeURIComponent(data)`
4. Test with online URL encoder

### Long URLs failing

**Problem:** Getting truncated or failed requests

**Solution:**
1. Use hash-based approach: `/path#data`
2. Ensure hash is properly URL-encoded
3. Keep path portion < 2000 chars
4. Data in hash can be much longer

## 📈 Monitoring & Analytics

### Cloudflare Dashboard

1. **Pages Analytics:**
   - View requests by endpoint
   - Monitor response times
   - Check error rates
   - See bandwidth usage

2. **Setting Up Alerts:**
   - Go to Notifications
   - Create alert for high error rate
   - Alert on worker CPU time > threshold

### Custom Logging

To add custom logging to your worker:

```javascript
// In onRequest handler
export async function onRequest(context) {
  const startTime = Date.now();
  
  try {
    // ... process request
    const duration = Date.now() - startTime;
    
    // Log to Cloudflare
    console.log(`[${context.request.url}] ${duration}ms`);
    
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}
```

View logs in Cloudflare dashboard under Pages > your-project > Logs

## 🔐 Security Best Practices

### API Protection

```javascript
// Add rate limiting
const rateLimit = (ip) => {
  // Implement rate limiting logic
  // e.g., max 100 requests per minute per IP
};

// Add authentication (optional)
const requireApiKey = (request) => {
  const apiKey = request.headers.get('X-API-Key');
  return apiKey === process.env.API_KEY;
};
```

### Input Validation

```javascript
// Validate inputs
if (data.length > 1000000) {
  return renderErrorPage('Data exceeds maximum size');
}

if (key.length < 3) {
  return renderErrorPage('Key must be at least 3 characters');
}
```

### CORS (if needed)

```javascript
// Add CORS headers
return new Response(html, {
  headers: {
    'Content-Type': 'text/html; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST',
  }
});
```

## 📞 Support & Maintenance

### Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| 404 errors | Worker not deployed | Rebuild in Cloudflare |
| Slow responses | Large payloads | Check worker CPU time |
| Encryption fails | Invalid key format | Ensure UTF-8 encoding |
| URLs too long | Exceeding browser limit | Use hash-based approach |

### Getting Help

1. **Cloudflare Docs:** https://developers.cloudflare.com/pages/
2. **GitHub Issues:** Open issue in your repository
3. **Community Forums:** Cloudflare Community
4. **Twitter:** @Cloudflare

## 🎯 Future Enhancements

Potential improvements:

- [ ] Add additional cipher algorithms
- [ ] Implement rate limiting
- [ ] Add authentication/API keys
- [ ] Support file uploads
- [ ] Add batch encryption endpoint
- [ ] Create CLI tool
- [ ] Add metrics dashboard
- [ ] Support POST requests
- [ ] Add encryption key rotation
- [ ] Implement database storage

---

**Deployment completed! Your Void 3 Cipher is now live on Cloudflare Pages.**

Access your API at: `https://your-project.pages.dev/encrypt/key/void3/data`
