# UniGPA

UniGPA is a modern university GPA management and tracking system designed to help students calculate, monitor, and analyze their academic performance efficiently. The platform provides an intuitive interface for entering course results, computing GPA automatically, and visualizing academic progress over time.

UniGPA is built with a modern full-stack architecture using Next.js on the frontend and Express.js on the backend, backed by a MySQL relational database.

---

## Overview

UniGPA allows students to:

* Calculate semester GPA automatically
* Track cumulative GPA (CGPA)
* Manage course records
* View performance history
* Maintain secure user authentication
* Access a responsive, user-friendly interface

The system separates frontend and backend concerns to ensure scalability, maintainability, and performance.

---

## Tech Stack

### Frontend

* Next.js
* Shadcn UI
* Phosphor Icons
* Tailwind CSS (via Shadcn)

### Backend

* Express.js
* RESTful API architecture

### Database

* MySQL

---

## Architecture

UniGPA follows a client-server architecture:

* The Next.js frontend handles UI rendering and user interaction.
* The Express.js backend exposes REST APIs for authentication, GPA calculation, and course management.
* MySQL stores user accounts, course data, grades, and GPA records.

Frontend and backend communicate via HTTP requests using JSON payloads.

---

## Features

### 1. User Authentication

* Secure user registration and login
* Session or token-based authentication
* Protected routes

### 2. Course Management

* Add new courses
* Edit existing courses
* Delete courses
* Assign credits and grades

### 3. GPA Calculation

* Automatic semester GPA calculation
* Cumulative GPA tracking
* Real-time recalculation when grades are updated

### 4. Academic History

* View past semesters
* Track GPA progression
* Organized semester-wise course breakdown

### 5. Clean UI/UX

* Responsive design
* Accessible components using Shadcn UI
* Consistent iconography with Phosphor Icons

---

## Folder Structure (Example)

```
unigpa/
│
├── client/                 # Next.js frontend
│   ├── components/
│   ├── pages/ or app/
│   ├── lib/
│   └── styles/
│
├── server/                 # Express.js backend
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   └── config/
│
└── database/
    └── schema.sql
```

---

## Installation

### Prerequisites

* Node.js (v18 or higher recommended)
* MySQL Server
* npm or yarn

---

### 1. Clone the Repository

```
git clone https://github.com/yourusername/unigpa.git
cd unigpa
```

---

### 2. Setup Backend

```
cd server
npm install
```

Create a `.env` file:

```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=unigpa
JWT_SECRET=your_secret_key
```

Run the server:

```
npm run dev
```

---

### 3. Setup Frontend

```
cd client
npm install
npm run dev
```

Frontend will run on:

```
http://localhost:3000
```

Backend will run on:

```
http://localhost:5000
```

---

## Database Schema (Basic Example)

### Users Table

* id
* name
* email
* password_hash
* created_at

### Courses Table

* id
* user_id
* semester
* course_code
* course_name
* credits
* grade
* created_at

---

## GPA Calculation Logic

GPA is calculated using the standard weighted formula:

```
GPA = (Σ (grade_point × credits)) / (Σ credits)
```

Grade points are mapped according to the university grading scale.

---

## API Endpoints (Sample)

### Authentication

* POST /api/auth/register
* POST /api/auth/login

### Courses

* GET /api/courses
* POST /api/courses
* PUT /api/courses/:id
* DELETE /api/courses/:id

### GPA

* GET /api/gpa/semester
* GET /api/gpa/cumulative

---

## Security Considerations

* Passwords are hashed before storage
* Environment variables protect sensitive credentials
* Input validation prevents malformed data
* Proper error handling and HTTP status codes

---

## Future Improvements

* Role-based access control (Admin / Student)
* GPA analytics dashboard with charts
* Export transcript as PDF
* Multi-university grading system support
* Performance insights and predictions

---

## Contributing

Contributions are welcome. Please fork the repository and submit a pull request with clear documentation of your changes.

---

## License

This project is licensed under the MIT License.

---

If you would like, I can also generate:

* A more academic/project-report styled README (for university submission)
* A minimal open-source GitHub style README
* A more technical enterprise-grade README
* Or one tailored specifically for your university context
