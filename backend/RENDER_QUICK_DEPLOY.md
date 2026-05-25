# Quick Deployment Checklist for Render

## Pre-Deployment Checklist ✅

- [x] JWT secret is base64 encoded
- [x] Dockerfile is configured correctly
- [x] application.properties supports environment variables
- [x] JwtUtil.java has proper error handling
- [x] Application builds successfully

## Render Deployment Steps

### 1. Push Code to GitHub
```bash
git add .
git commit -m "Fix: JWT configuration for Render deployment"
git push origin main
```

### 2. Create/Update Render Service

1. Go to https://dashboard.render.com
2. Create a new "Web Service" or update existing
3. Connect your GitHub repository
4. Configure the following:

**Build & Deploy:**
- Build Command: `cd backend && ./mvnw clean package -DskipTests`
- Start Command: `java -jar /app/target/backend-0.0.1-SNAPSHOT.jar`

**Environment Variables:**
```
JWT_SECRET=M2M0YzhjMDVjZWFhNDEyNjgzMGU3YmVkZGZjZjQ5NDI1YTA0YzQwOTg5YzlmZjEyN2NkYzNlZmY0YTA2MWQ3ZQ==
PORT=8080
SPRING_PROFILES_ACTIVE=prod
```

**Advanced Settings:**
- Docker: Use Dockerfile in `backend` directory
- OR Classic: Use Maven build command above

### 3. Verify Deployment

After deployment completes:

1. Check the deployed app health:
   ```
   curl https://your-app.onrender.com/actuator/health
   ```

2. Check logs in Render Dashboard for:
   ```
   JWT key initialized successfully
   ```

3. Test JWT authentication endpoint:
   ```
   curl -X POST https://your-app.onrender.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"user@example.com","password":"password"}'
   ```

## Troubleshooting

### Issue: "Failed to initialize JWT key"
**Solution:** Ensure JWT_SECRET is set in Render environment variables

### Issue: "Port binding error"
**Solution:** Render automatically sets PORT env var. Ensure server.port=${PORT:8080} in application.properties

### Issue: "Application context failed to load"
**Solution:** Check logs for missing database configuration. Ensure PostgreSQL connection string is configured.

## Important Notes

⚠️ **Security Warning:**
- The JWT secret shown in this document is for development/testing only
- For production, generate a new, secure JWT secret
- Never commit secrets to version control
- Use Render's environment variable management for sensitive data

✅ **Recommended Configuration:**
```
JWT_SECRET_PROD=<your-generated-secret>
DATABASE_URL=<postgresql-connection-string>
SPRING_PROFILES_ACTIVE=prod
```

## Performance Optimization (Optional)

For better performance on Render, add to pom.xml:
```xml
<plugin>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-maven-plugin</artifactId>
    <configuration>
        <excludes>
            <exclude>
                <groupId>org.projectlombok</groupId>
                <artifactId>lombok</artifactId>
            </exclude>
        </excludes>
    </configuration>
</plugin>
```

---

**Last Updated:** May 25, 2026
**Status:** Ready for Deployment

