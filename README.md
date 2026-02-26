# CodeBazaar Backend

Production-ready Node.js + Express backend for the CodeBazaar project marketplace.

## Repository Layout

```txt
codebazaar-backend/
  backend/
    src/
      config/
      controllers/
      models/
      routes/
      middlewares/
      services/
      utils/
      app.js
    tests/
      unit/
    postman/
      CodeBazaar.postman_collection.json
    .env.example
    Dockerfile
    render.yaml
    package.json
    server.js
```

## MVC Architecture Rules Followed

- Routes only do middleware + validation + controller delegation.
- Controllers are thin and call services.
- Services contain business logic and DB access.
- Config is loaded only from environment variables.

## ER Diagram (Text Explanation)

- `User (1) -> (N) Project` via `Project.uploadedBy`
- `User (1) -> (N) Purchase` via `Purchase.buyerId`
- `Project (1) -> (N) Purchase` via `Purchase.projectId`
- `User (1) -> (N) Review` via `Review.userId`
- `Project (1) -> (N) Review` via `Review.projectId`

Revenue for creators is derived from purchases associated with projects they uploaded.

## Environment Variables

See [backend/.env.example](backend/.env.example).

- `NODE_ENV`
- `PORT`
- `MONGODB_URI` (MongoDB Atlas)
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CORS_ORIGIN`
- `RATE_LIMIT_WINDOW_MS`
- `RATE_LIMIT_MAX`
- `REDIS_URL`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `UPLOAD_DIR`
- `BASE_URL`

## Local Setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Swagger docs: `http://localhost:5000/api/docs`

## Security

- Helmet
- CORS
- Rate limiting
- NoSQL sanitization (`express-mongo-sanitize`)
- XSS sanitization (`xss-clean`)
- JWT auth with expiration
- Role-based access control
- Input validation with `express-validator`

## Deployment

### Render (Backend)

1. Push this repository to GitHub.
2. Create a Render Web Service.
3. Set root directory to `backend`.
4. Build command: `npm install`
5. Start command: `npm start`
6. Add all environment variables from `.env.example`.

Docker build command:

```bash
docker build -t codebazaar-backend ./backend
docker run -p 5000:5000 --env-file backend/.env codebazaar-backend
```

## Git Flow Branches

Create these branches:

- `main`
- `dev`
- `feature/auth`
- `feature/projects`
- `feature/payment`

Commit style:

- `feat:`
- `fix:`
- `refactor:`
