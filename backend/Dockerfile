# Build stage
FROM maven:3.9.4-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:17-jdk-jammy
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENV PORT=8080
ENV JWT_SECRET=M2M0YzhjMDVjZWFhNDEyNjgzMGU3YmVkZGZjZjQ5NDI1YTA0YzQwOTg5YzlmZjEyN2NkYzNlZmY0YTA2MWQ3ZQ==
CMD ["java", "-Dserver.port=${PORT}", "-Djwt.secret=${JWT_SECRET}", "-jar", "app.jar"]
