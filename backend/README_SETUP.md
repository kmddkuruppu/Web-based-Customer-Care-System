# Customer Care Backend – Setup

This source set is designed to match the uploaded React frontend exactly.

## Important
- Base package: `lk.sliit.backend`
- Backend port: `8010`
- Frontend URL: `http://localhost:5173`
- API base URL: `http://localhost:8010/api`
- MySQL URL: `jdbc:mysql://localhost:1024/client_db`

## Copy into your existing Spring Boot project
Do not create another project if you already have the project created.
1. Replace your `pom.xml` with the supplied `pom.xml` (or add the missing Security, Validation and JWT dependencies).
2. Replace/update `src/main/resources/application.properties`.
3. Under `src/main/java/lk/sliit/backend/`, create the packages and files supplied here.
4. Make sure your main class is `lk.sliit.backend.BackendApplication` or change every package prefix consistently if your current root package is different.
5. Make sure MySQL is running on port `1024`, username `root`, password `1234`.
6. Run Maven reload, then run `BackendApplication`.

## Demo accounts
All seeded demo accounts use password: `Password@123`

- Admin: `admin@care.com`
- Agent: `agent@care.com`
- Senior Agent: `senior@care.com`
- Supervisor: `supervisor@care.com`
- Manager: `manager@care.com`
- Customer: `customer@care.com`

## Main frontend-compatible endpoints
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET/POST/PUT/DELETE /api/categories`
- `GET/POST/PUT /api/tickets`
- `GET /api/tickets/my`
- `GET /api/tickets/{id}`
- `PATCH /api/tickets/{id}/status`
- `PATCH /api/tickets/{id}/assign`
- `PATCH /api/tickets/{id}/priority`
- `PATCH /api/tickets/{id}/escalate`
- `PATCH /api/tickets/{id}/resolve`
- `PATCH /api/tickets/{id}/close`
- `PATCH /api/tickets/{id}/archive`
- `GET/POST /api/tickets/{id}/responses`
- `POST /api/tickets/{id}/notes`
- `POST /api/tickets/{id}/feedback`
- `GET/POST/PUT /api/users`
- `PATCH /api/users/{id}/status`
- `GET /api/reports/dashboard`
- `GET /api/notifications`
- `PATCH /api/notifications/{id}/read`
