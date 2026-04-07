# CV-ANALYZER

A Dynamic CV Analyzer built with Spring Boot (Java 21) and React (Vite + TypeScript), utilizing Google's Gemini Pro AI to analyze and provide insights on resumes. 

## Tech Stack

**Backend:**
- Spring Boot 3 (Java 21)
- PostgreSQL
- Spring AI (Google Gemini 1.5 Pro)
- JWT Authentication & OAuth2 (Google Login)
- Maven

**Frontend:**
- React 19
- Vite
- TypeScript
- Tailwind CSS
- Zustand (State Management)
- Framer Motion (Animations)

## Prerequisites

Before you begin, ensure you have the following installed:
- [Java 21](https://jdk.java.net/21/)
- [Node.js](https://nodejs.org/en/) (v18 or higher recommended)
- [PostgreSQL](https://www.postgresql.org/)
- A Google Cloud Platform account with GenAI / Gemini API enabled.
- A Google Cloud OAuth 2.0 Web Application client configured for login.

## Setup Instructions

### 1. Database Setup
Create a PostgreSQL database named `est` (or update the `.env` connection URL).
Default configuration expects PostgreSQL running on `localhost:5432`.

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a `.env` file in the `backend` directory with the following variables:
   ```env
   # Server Configuration
   SERVER_PORT=8080
   
   # External URLs (Used for CORS and OAuth Callbacks)
   CORS_ALLOWED_ORIGINS=http://localhost:5173
   FRONTEND_URL=http://localhost:5173

   # Database Configuration
   SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/est
   SPRING_DATASOURCE_USERNAME=your_db_username
   SPRING_DATASOURCE_PASSWORD=your_db_password
   
   # JWT Configuration
   JWT_SECRET=YourSuperStrongJWTSecretKeyThatIsDefinitelyMoreThan32Bytes12345
   JWT_ACCESS_EXPIRATION=3600000
   JWT_REFRESH_EXPIRATION=604800000
   
   # Google OAuth2 Login
   GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-your_google_client_secret
   
   # Google Gemini AI Configuration
   SPRING_AI_PROJECT_ID=your-google-cloud-project-id
   SPRING_AI_LOCATION=us-central1
   SPRING_AI_MODEL=gemini-1.5-pro
   ```
3. Run the backend server using Maven:
   ```bash
   ./mvnw spring-boot:run
   ```
   *(On Windows, use `mvnw.cmd spring-boot:run`)*


### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend` directory with the following variables:
   ```env
   VITE_API_URL=http://localhost:8080/api
   VITE_API_BASE_URL=http://localhost:8080
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```

## Running the App
Once everything is set up and running:
- **Frontend** runs on: `http://localhost:5173` (default Vite port)
- **Backend API** runs on: `http://localhost:8080`

Open your browser and navigate to the frontend URL to start using the CV Analyzer!
