# API Testing Examples

## Using curl (Command Prompt)

### 1. Create a Short URL (Simple)
```bash
curl -X POST http://localhost:3000/api/shorten -H "Content-Type: application/json" -d "{\"originalUrl\":\"https://www.google.com\"}"
```

### 2. Create a Short URL with Custom Alias
```bash
curl -X POST http://localhost:3000/api/shorten -H "Content-Type: application/json" -d "{\"originalUrl\":\"https://www.github.com\",\"customAlias\":\"gh\"}"
```

### 3. Create a Short URL with Expiration
```bash
curl -X POST http://localhost:3000/api/shorten -H "Content-Type: application/json" -d "{\"originalUrl\":\"https://www.example.com\",\"expiresAt\":\"2025-12-31T23:59:00\"}"
```

### 4. Get All URLs
```bash
curl http://localhost:3000/api/urls
```

### 5. Get Analytics for a Short Code
```bash
curl http://localhost:3000/api/analytics/abc123
```

### 6. Get QR Code
```bash
curl http://localhost:3000/api/qr/abc123
```

### 7. Delete a URL
```bash
curl -X DELETE http://localhost:3000/api/urls/abc123
```

### 8. Test Redirect (opens in browser)
```
http://localhost:3000/abc123
```

## Using PowerShell

### 1. Create a Short URL
```powershell
$body = @{
    originalUrl = "https://www.google.com"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/shorten" -Method Post -Body $body -ContentType "application/json"
```

### 2. Get Analytics
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/analytics/abc123" -Method Get
```

## Using Postman

### Collection Setup

1. **Base URL:** `http://localhost:3000`

2. **Shorten URL Endpoint:**
   - Method: POST
   - URL: `{{baseUrl}}/api/shorten`
   - Headers: `Content-Type: application/json`
   - Body (JSON):
     ```json
     {
       "originalUrl": "https://www.example.com/very/long/url",
       "customAlias": "mylink",
       "expiresAt": "2025-12-31T23:59:00"
     }
     ```

3. **Get URLs Endpoint:**
   - Method: GET
   - URL: `{{baseUrl}}/api/urls?page=1&limit=10`

4. **Get Analytics Endpoint:**
   - Method: GET
   - URL: `{{baseUrl}}/api/analytics/:shortCode`
   - Params: `days=7`

5. **Generate QR Code Endpoint:**
   - Method: GET
   - URL: `{{baseUrl}}/api/qr/:shortCode`

6. **Delete URL Endpoint:**
   - Method: DELETE
   - URL: `{{baseUrl}}/api/urls/:shortCode`

## Testing Rate Limiting

Run this script to test rate limiting (should fail after 10 requests):

### PowerShell Script
```powershell
for ($i=1; $i -le 15; $i++) {
    Write-Host "Request $i"
    $body = @{
        originalUrl = "https://example.com/test$i"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3000/api/shorten" -Method Post -Body $body -ContentType "application/json"
        Write-Host "Success: $($response.data.shortUrl)" -ForegroundColor Green
    } catch {
        Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Start-Sleep -Milliseconds 100
}
```

## Expected Responses

### Success Response (201 Created)
```json
{
  "success": true,
  "data": {
    "originalUrl": "https://example.com",
    "shortUrl": "http://localhost:3000/abc123",
    "shortCode": "abc123",
    "expiresAt": null,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Error Response (400 Bad Request)
```json
{
  "error": "Invalid URL format. Must include http:// or https://"
}
```

### Rate Limit Response (429 Too Many Requests)
```json
{
  "error": "Too many requests from this IP, please try again later.",
  "retryAfter": "1 minute"
}
```

### Analytics Response (200 OK)
```json
{
  "success": true,
  "data": {
    "url": {
      "originalUrl": "https://example.com",
      "shortUrl": "http://localhost:3000/abc123",
      "shortCode": "abc123",
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "analytics": {
      "totalClicks": 150,
      "uniqueVisitors": 87,
      "clicksByDate": {
        "2024-01-15": 45,
        "2024-01-16": 62
      },
      "clicksByCountry": {
        "US": 90,
        "UK": 35
      },
      "recentClicks": [
        {
          "timestamp": "2024-01-16T14:30:00.000Z",
          "country": "US",
          "city": "New York",
          "referrer": "Direct"
        }
      ]
    }
  }
}
```

## Testing Workflow

1. **Start the server:** `npm start`
2. **Create a few short URLs** using the POST endpoint
3. **Visit the short URLs** in your browser to generate clicks
4. **Check analytics** to see the tracked data
5. **Generate QR codes** and scan them with your phone
6. **Test rate limiting** by making rapid requests
7. **Test expiration** by creating a link that expires soon
8. **Test custom aliases** with different names
9. **Delete URLs** and verify they're no longer accessible

## Health Check

Test if server is running:
```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 1234.56
}
```
