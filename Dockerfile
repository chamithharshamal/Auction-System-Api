# Build stage
FROM maven:3.8.4-openjdk-17-slim AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Run stage
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Expose the port (Railway will set the PORT env var)
EXPOSE 8080

# Run the app
ENTRYPOINT ["java", "-jar", "app.jar"]
