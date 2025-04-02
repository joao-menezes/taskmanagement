# Task Management Backend

## Description
This is a backend for a Task Management system built with Node.js, Express, TypeScript, and Sequelize (ORM for database). The system provides user authentication, task management with role-based permissions, and a robust logging system.

## Key Features

### User Authentication
- Registration and login with JWT (JSON Web Tokens)
- Rate limiting for brute force protection
- Password hashing with bcrypt

### User Management
- User CRUD operations
- Different access levels (Admin, Manager, Editor, Viewer)
- Data validation

### Task Management
- Task CRUD operations
- Task assignment/reassignment between users
- Different task statuses (pending, new, completed, abandon)
- Role-based permissions

### Infrastructure
- Winston logging (separate files for info/error + console)
- Centralized error handling
- Database connection with automatic retry
- Environment variable configuration

## Technologies Used
- **Language:** TypeScript
- **Framework:** Express.js
- **ORM:** Sequelize
- **Database:** MySQL (configurable via `.env`)
- **Authentication:** JWT
- **Logging:** Winston

### Other Libraries:
- `bcrypt` (password hashing)
- `cors` (Cross-Origin Resource Sharing)
- `dotenv` (environment variables management)
- `express-rate-limit` (brute force protection)
- `http-status-codes` (standardized HTTP codes)

## Project Structure

```plaintext
src/
├── config/         # Database configurations
├── controller/     # Endpoint logic
├── interface/      # TypeScript interfaces
├── middleware/     # Middlewares (authentication, rate limiting)
├── model/         # Sequelize models
├── repository/     # Data access layer
├── routes/         # Route definitions
├── services/       # Business logic
├── shared/         # Shared utilities
│   ├── errors/     # Custom errors
│   ├── utils/      # Utilities (logger, enums)
└── server.ts       # Application entry point
```
## Environment Setup

### Install dependencies:
```bash
npm install
```

### Create a .env file in the project root with the following variables:
DB_NAME=database_name
DB_USER=username
DB_PASSWORD=password
DB_HOST=localhost
DB_DIALECT=mysql
PORT=3000
JWT_SECRET=your_jwt_secret
NODE_ENV=development

### Run database migrations:
```bash
npm run db:create
npm run db:migrate:dev
```
### Start the server:
```bash
npm start
```

## API Documentation (Swagger)
This project includes interactive API documentation using Swagger.
### 📌 Access the Swagger Documentation:
```
http://localhost:3000/api-docs
```
Once the server is running, open the URL above in your browser to view the API documentation.

## 📄 How is Swagger configured?
The API documentation is automatically generated using swagger-jsdoc and swagger-ui-express.
The Swagger specification is maintained in the project’s OpenAPI configuration file.

To modify or add new API endpoints, update the Swagger documentation in the codebase accordingly.

## Main Endpoints

### Authentication
- `POST /account/auth/register` - Register new user
- `POST /account/auth/login` - User login

### Users
- `GET /api/users` - List all users (**Admin/Manager only**)
- `GET /api/users/:userId` - Get user details
- `PUT /api/users/:userId` - Update user
- `DELETE /api/users/:userId` - Delete user

### Tasks
- `GET /api/tasks` - List tasks (filtered by role)
- `GET /api/tasks/:taskId` - Get task details
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:taskId` - Update task
- `DELETE /api/tasks/:taskId/:ownerId` - Delete task

### Health Check
- `GET /api/health-check` - Check server status

---

## Data Models

### User
| Field          | Type   | Description                              |
|---------------|--------|------------------------------------------|
| `userId`      | UUID   | Unique identifier                        |
| `username`    | String | Username                                 |
| `password`    | String | Hashed password                         |
| `email`       | String | Unique email                             |
| `tasksConcluded` | Integer | Number of concluded tasks           |
| `role`        | Integer | Enum: Admin, Manager, Editor, Viewer    |
| `userTasksList` | JSON  | Array of tasks                          |

### Task
| Field        | Type   | Description                               |
|-------------|--------|-------------------------------------------|
| `taskId`    | UUID   | Unique identifier                         |
| `ownerId`   | UUID   | References User                           |
| `title`     | String | Task title                                |
| `description` | String | Task description                        |
| `status`    | Integer | Enum: pending, new, completed, abandon   |

---

## Roles and Permissions

### Admin:
✅ Full access to all resources  
✅ Can create/edit/delete any task or user  

### Manager:
✅ Can create/edit/delete any task  
🚫 Limited user access  

### Editor:
✅ Can create/edit only their own tasks  
🚫 Read-only access to other tasks  

### Viewer:
✅ Read-only access to tasks  
🚫 Cannot create/edit tasks  

---

## Error Handling
The system uses a centralized set of errors with appropriate HTTP codes and standardized messages. Main handled errors include:

- **Authentication/Authorization Errors** (`401`, `403`)
- **Resource Not Found** (`404`)
- **Data Validation Errors** (`400`)
- **Conflicts** (`409`, e.g., email already exists)
- **Internal Server Errors** (`500`)

---

## Logging
The system logs to three destinations:

- 📄 `info.log` file for informational messages  
- ⚠️ `error.log` file for errors  
- 🖥️ Console (development only)  

Each log entry includes **timestamp**, **severity level**, and **context (source file)**.

---

## Future Improvements
- ✅ Add unit and integration tests
- ✅ Implement Swagger/OpenAPI documentation
- ✅ Add notification system
- ✅ Implement queues for async operations
- ✅ Add file upload support for tasks
- ✅ Implement task commenting system
- ✅ Add pagination and filters for listings
