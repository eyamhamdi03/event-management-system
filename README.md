# Event Management System

## Description

A live event management platform where organizers can create online events with live discussions and interactions. This project is a student project developed as part of the Web Development and Communication Protocols course of third year ***Softwar Engineering***  Students at the ***National Institute of Applied Science and Technologies*** .

### Features

- **NestJS (REST API)**: Manages events, registrations, and users.
- **GraphQL**: Optimized queries to filter events by category, date, and more.
- **SSE (Server-Sent Events)**: Real-time notifications for event updates and registrations.
- **WebSockets**: Live discussion and Q&A sessions for interactive engagement.

### Technologies

- **Front-End**: React.js
- **Database**: PostgreSQL
- **Back-End**: NestJS

### Future Features

Additional features will be added later.

---

## Project Structure

The project is divided into two main directories:
- **`back-end`** : Contains the NestJS API responsible for managing business logic.
- **`front-end`** : Contains the user interface built with React for interaction with users.

---

## Prerequisites

Before starting, make sure you have the following tools installed on your machine:
- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- [Git](https://git-scm.com/)
- [PostgreSQL](https://www.postgresql.org/) (for the database)

---

## Cloning the Project

Clone the Git repository using the following command:

```bash
git clone https://github.com/INSAT-GL3/event-management-system.git
cd event-management-system
```

---

## Setting up the Back-End

1. Navigate to the back-end directory:

```bash
cd back-end
```

2. Install dependencies:

```bash

npm i dotenv
npm install
npx husky-init && npm install
npm install --save-dev lint-staged
npm install @types/jsonwebtoken                                                                   
npm install class-validator
npm install @nestjs/passport passport passport-local
npm install @nestjs/jwt passport-jwt
npm install --save-dev @types/passport-jwt
npm install @nestjs/config        
npm install bcrypt  
npm install nodemailer
npm install --save @nestjs/typeorm typeorm mysql
npm install class-transformer
npm i @ngneat/falso
npm install -D ts-node



```

3. ## Environment Configuration

1. Create a `.env` file in the root directory with these variables:

```plaintext
# Application
APP_PORT=3000
FRONTEND_URL=http://frontend-app.com

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=event_management_db

# Authentication
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_RESET_SECRET=your_reset_secret_here
JWT_VERIFY_SECRET=your_verify_secret_here
JWT_EXPIRATION=3600 # 1 hour in seconds

# Email Service
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password
EMAIL_FROM=no-reply@yourapp.com

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

```
4. Start the back-end server:

```bash
# In development mode
npm run start:dev

# In production mode
npm run start:prod
```

5. To run the tests for the APIs:

```bash
# Unit tests
npm run test

# End-to-end (e2e) tests
npm run test:e2e

# Test coverage
npm run test:cov
```

---

## Setting up the Front-End

1. Navigate to the front-end directory:

```bash
cd front-end
```

2. Install dependencies:

```bash
npm install
```

3. Start the front-end server:

```bash
# In development mode
npm start
```

This will start the React application in development mode, which you can view at [http://localhost:3000](http://localhost:3000).

4. To build for production:

```bash
# For production build
npm run build
```

---

## Deployment

This part will be developed soon.

---

## Authors

- Mayar Chaabani
- Moatez Souilem
- Nour Ayari
- Ahmed Amin Chabbah
- Eya Mhamdi

---

## License

This project is licensed under the [MIT License](https://github.com/nestjs/nest/blob/master/LICENSE).
