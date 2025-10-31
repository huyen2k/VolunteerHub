# Base image với Java 17
FROM openjdk:24-jdk-slim

# Thư mục làm việc trong container
WORKDIR /app

# Copy file jar từ target/ vào container
#COPY target/*.jar app.jar
COPY . .

# Chạy ứng dụng
#ENTRYPOINT ["java", "-jar", "app.jar"]
CMD ["./mvnw", "spring-boot:run"]

