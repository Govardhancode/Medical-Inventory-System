\# 🏥 Medical Inventory \& Billing Management System



A full-stack medical inventory and billing management application designed to help pharmacies and medical organizations efficiently manage medicines, inventory, suppliers, customers, billing, reports, and user authentication.



\## 🚀 Project Overview



The \*\*Medical Inventory \& Billing Management System\*\* is a web application built using \*\*React, Spring Boot, and MySQL\*\*.



The system provides a centralized platform for managing medical inventory and billing operations while reducing manual work and improving data accuracy.



\## ✨ Key Features



\### 🔐 Authentication \& User Management



\* User registration and login

\* Secure authentication

\* Password reset functionality

\* User profile management

\* Role-based access control



\### 📊 Dashboard



\* Inventory overview

\* Medicine statistics

\* Stock information

\* Business activity summary

\* Real-time dashboard data



\### 💊 Medicine \& Inventory Management



\* Add, update, and delete medicines

\* Manage medicine stock

\* Track available quantities

\* Monitor inventory levels

\* Identify low-stock medicines



\### 👥 Customer Management



\* Add and manage customers

\* Update customer information

\* View customer records

\* Maintain customer-related billing information



\### 🚚 Supplier Management



\* Add and manage suppliers

\* Maintain supplier information

\* Track supplier-related inventory data



\### 🧾 Billing Management



\* Create customer bills

\* Add multiple medicines to a bill

\* Calculate billing totals

\* Maintain billing history

\* Generate PDF invoices



\### 📈 Reports



\* View inventory reports

\* View billing information

\* Analyze system data

\* Generate useful reports for management



\### 🤖 AI Chat Assistant



\* Integrated AI chat functionality

\* Allows users to interact with an AI assistant

\* Provides assistance related to the application



\### 🔑 Password Reset



\* Password reset functionality

\* Reset-password workflow

\* Token-based password reset support



\---



\## 🛠️ Technologies Used



\### Frontend



\* React.js

\* JavaScript

\* HTML5

\* CSS3

\* Vite

\* Fetch/API integration



\### Backend



\* Java

\* Spring Boot

\* Spring Data JPA

\* Spring Security

\* REST APIs

\* Maven



\### Database



\* MySQL



\### Additional Technologies



\* Git

\* GitHub

\* REST API

\* JSON

\* ReportLab/PDF generation

\* AI API integration



\---



\## 🏗️ Project Architecture



The application follows a \*\*full-stack client-server architecture\*\*.



```text

\&#x20;                   ┌──────────────────────┐

\&#x20;                   │      React.js        │

\&#x20;                   │      Frontend        │

\&#x20;                   └──────────┬───────────┘

\&#x20;                              │

\&#x20;                              │ REST API

\&#x20;                              ▼

\&#x20;                   ┌──────────────────────┐

\&#x20;                   │     Spring Boot      │

\&#x20;                   │       Backend        │

\&#x20;                   └──────────┬───────────┘

\&#x20;                              │

\&#x20;                              │ JPA / Hibernate

\&#x20;                              ▼

\&#x20;                   ┌──────────────────────┐

\&#x20;                   │        MySQL         │

\&#x20;                   │       Database       │

\&#x20;                   └──────────────────────┘

```



\---



\## 📁 Project Structure



```text

Medical-Inventory-System/

│

├── backend/

│   ├── src/

│   │   ├── main/

│   │   │   ├── java/

│   │   │   │   └── com/

│   │   │   │       └── medical/

│   │   │   │           └── inventory/

│   │   │   │               ├── auth/

│   │   │   │               ├── config/

│   │   │   │               ├── controller/

│   │   │   │               ├── dashboard/

│   │   │   │               ├── dto/

│   │   │   │               ├── entity/

│   │   │   │               ├── repository/

│   │   │   │               └── service/

│   │   │   │

│   │   │   └── resources/

│   │   │       └── application.properties

│   │   │

│   │   └── test/

│   │

│   ├── pom.xml

│   ├── mvnw

│   └── mvnw.cmd

│

├── frontend/

│   ├── public/

│   ├── src/

│   │   ├── assets/

│   │   ├── components/

│   │   ├── services/

│   │   ├── App.jsx

│   │   ├── App.css

│   │   └── main.jsx

│   │

│   ├── package.json

│   ├── package-lock.json

│   └── vite.config.js

│

└── .gitignore

```



\---



\## ⚙️ Prerequisites



Before running the project, make sure the following are installed:



\* Java JDK

\* Maven

\* Node.js

\* npm

\* MySQL

\* Git



\---



\## 🗄️ Database Setup



Create the MySQL database:



```sql

CREATE DATABASE medical\\\_inventory;

```



Update the database configuration in:



```text

backend/src/main/resources/application.properties

```



Configure your MySQL username, password, and database connection according to your local environment.



> \\\*\\\*Important:\\\*\\\* Do not upload real database passwords, API keys, or other secrets to GitHub.



\---



\## ▶️ Running the Backend



Open PowerShell or Command Prompt:



```powershell

cd backend

```



Run the Spring Boot application:



```powershell

.\\\\mvnw.cmd spring-boot:run

```



The backend will start on the configured Spring Boot port.



\---



\## ▶️ Running the Frontend



Open another terminal:



```powershell

cd frontend

```



Install dependencies:



```powershell

npm install

```



Start the development server:



```powershell

npm run dev

```



Vite will provide the local frontend URL in the terminal.



\---



\## 🔗 Frontend–Backend Communication



The React frontend communicates with the Spring Boot backend through REST APIs.



```text

React UI

\&#x20;  │

\&#x20;  ▼

REST API Request

\&#x20;  │

\&#x20;  ▼

Spring Boot Controller

\&#x20;  │

\&#x20;  ▼

Service Layer

\&#x20;  │

\&#x20;  ▼

Repository Layer

\&#x20;  │

\&#x20;  ▼

MySQL Database

```



The backend processes the request and returns JSON responses to the frontend.



\---



\## 🔒 Security



The project includes authentication and security-related functionality using Spring Boot and Spring Security.



Sensitive configuration such as:



\* Database passwords

\* API keys

\* Secret tokens

\* Environment-specific credentials



should be stored using environment variables or secure configuration rather than being committed to GitHub.



\---



\## 🧪 Testing



The backend contains Spring Boot test configuration and test classes.



Backend tests can be executed using:



```powershell

cd backend

.\\\\mvnw.cmd test

```



\---



\## 📌 Current Status



\*\*Project Status: ✅ Completed Development Version\*\*



The major application features have been implemented and tested locally.



\### Implemented



\* ✅ Authentication

\* ✅ User registration

\* ✅ Password reset

\* ✅ Dashboard

\* ✅ Medicine management

\* ✅ Inventory management

\* ✅ Customer management

\* ✅ Supplier management

\* ✅ Billing

\* ✅ Billing history

\* ✅ PDF invoice generation

\* ✅ Reports

\* ✅ AI chat assistant

\* ✅ React frontend

\* ✅ Spring Boot REST backend

\* ✅ MySQL database integration



\---



\## 🔮 Future Enhancements



Possible future improvements include:



\* Cloud deployment

\* Online hosting

\* Advanced analytics

\* Inventory forecasting

\* Automated stock notifications

\* Email notifications

\* Improved AI-based inventory recommendations

\* Advanced role and permission management

\* Automated CI/CD pipeline

\* Docker containerization

\* Production database configuration



\---



\## 👨‍💻 Author



\*\*Govardhan V\*\*



Information Science Engineering Student

Interested in Software Development, Web Development, and Full-Stack Engineering.



\---



\## ⭐ Repository



GitHub:



\*\*Medical-Inventory-System\*\*



Built using:



\*\*React + Spring Boot + MySQL\*\*



\---



\## 📄 License



This project is developed for educational, portfolio, and demonstration purposes.

