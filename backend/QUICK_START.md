# 🚀 Quick Start Guide - Cloudinary Configuration

## TL;DR

### To Run Without Cloudinary (Default)
```bash
mvn spring-boot:run
# ✅ Application starts successfully
# ❌ Image upload endpoint unavailable
```

### To Run With Cloudinary
```bash
# 1. Set environment variables
export CLOUDINARY_CLOUD_NAME=your_value
export CLOUDINARY_API_KEY=your_value
export CLOUDINARY_API_SECRET=your_value

# 2. Enable in application-dev.yml
# Change: enabled: false → enabled: true

# 3. Run
mvn spring-boot:run
# ✅ Application starts
# ✅ Image upload endpoint available
```

---

## How to Get Cloudinary Credentials

1. **Sign up**: https://cloudinary.com/users/register/free
2. **Get credentials** from Dashboard → Settings → API Keys
3. **Copy**:
   - Cloud Name
   - API Key
   - API Secret

---

## Environment Variables

### What to Set
```bash
export CLOUDINARY_CLOUD_NAME=xxxxx
export CLOUDINARY_API_KEY=xxxxx
export CLOUDINARY_API_SECRET=xxxxx
```

### How to Set (Persistent in macOS)
```bash
# Add to ~/.zshrc or ~/.bash_profile
echo 'export CLOUDINARY_CLOUD_NAME=xxxxx' >> ~/.zshrc
echo 'export CLOUDINARY_API_KEY=xxxxx' >> ~/.zshrc
echo 'export CLOUDINARY_API_SECRET=xxxxx' >> ~/.zshrc

# Reload
source ~/.zshrc
```

---

## Configuration Files

### For Development
Edit: `/src/main/resources/application-dev.yml`
```yaml
cloudinary:
  enabled: false  # Set to true to enable
  cloud-name: ${CLOUDINARY_CLOUD_NAME:}
  api-key: ${CLOUDINARY_API_KEY:}
  api-secret: ${CLOUDINARY_API_SECRET:}
```

### For Production
Set environment variables in your deployment platform:
- Render: Settings → Environment
- AWS: Environment Variables in Lambda/ECS
- Docker: ENV in Dockerfile or docker-compose

---

## Testing

### Verify Configuration
```bash
# Check environment variables are set
echo $CLOUDINARY_CLOUD_NAME
echo $CLOUDINARY_API_KEY
echo $CLOUDINARY_API_SECRET
```

### Start Application
```bash
mvn spring-boot:run
# Should start without errors
```

### Test Image Upload (When Enabled)
```bash
curl -X POST http://localhost:8080/api/students/{student-id}/profile-image \
  -F "file=@/path/to/image.jpg"

# Response (if successful):
# {
#   "id": "...",
#   "profileImageUrl": "https://res.cloudinary.com/..."
# }
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Image upload service is unavailable" | Set `enabled: true` in YAML + set env vars |
| "Cloudinary configuration is incomplete" | All 3 env vars must be set if enabled |
| Application won't start | Ensure `enabled: false` if no credentials |
| Image upload returns 500 error | Check file is valid image and < 2MB |

---

## Files Modified

✅ `CloudinaryConfig.java` - Made bean conditional
✅ `ImageService.java` - Made service conditional
✅ `StudentController.java` - Made dependency optional
✅ `application-dev.yml` - Added configuration
✅ `application-prod.yml` - Added configuration

---

## Key Endpoints

### Image Upload
```
POST /api/students/{id}/profile-image
Content-Type: multipart/form-data
Body: file=<image_file>

✅ Status 200: Successful
❌ Status 500: Cloudinary not configured or file invalid
```

### Get Student
```
GET /api/students/{id}

Response includes:
{
  "id": "...",
  "name": "...",
  "profileImageUrl": "https://..." (if available)
}
```

---

## Notes

- ✅ Application starts without Cloudinary
- ✅ Image upload feature disabled when Cloudinary is not configured
- ✅ No breaking changes to existing functionality
- ✅ Can toggle feature based on environment
- ⚠️ Keep API secret secure - don't commit to git

---

**For detailed information, see:**
- `CLOUDINARY_FIX_COMPLETE.md` - Comprehensive guide
- `FIX_STATUS_CHECKLIST.md` - Complete verification

**Last Updated**: June 2, 2026

