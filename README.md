# Hostel Havoc

A small hostel complaint management app. Students can file complaints, check their status, and upvote issues. Admins can manage complaints and users.

## Setup

Install the dependencies:

```bash
npm install
```

Create a `.env` file in the project folder with your PostgreSQL connection details:

```env
DATABASE_URL=your_postgres_connection_string
JWT_SECRET=some_secret_key
```

## Run

Start the API in one terminal:

```bash
npm run server
```

Start the frontend in another terminal:

```bash
npm run dev
```

The database tables are created automatically when the server starts.