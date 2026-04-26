FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder

WORKDIR /app

COPY pom.xml ./pom.xml
COPY .mvn .mvn
COPY mvnw .

RUN chmod +x mvnw
RUN ./mvnw -q -DskipTests dependency:go-offline

COPY src ./src

RUN ./mvnw -q -DskipTests clean package

FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

RUN addgroup -S spring && adduser -S spring -G spring

COPY --from=builder /app/target/*.jar app.jar

USER spring:spring

EXPOSE 8080

ENTRYPOINT ["java", \
  "-XX:+UseSerialGC", \
  "-XX:MaxRAMPercentage=70", \
  "-XX:InitialRAMPercentage=30", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", \
  "/app/app.jar"]
