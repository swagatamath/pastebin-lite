# Pastebin-project

Pastebin-Project is a lightweight Pastebin-like application that allows users to create text pastes and share them via a unique URL. Each paste can optionally expire after a certain time (TTL) or after a limited number of views.

The application is built using **Node.js and Express**, deployed as a **serverless application on Vercel**, and uses **PostgreSQL (Neon)** as a persistent storage layer.

---

## How to run locally

### Prerequisites
- Node.js (v18+)
- A PostgreSQL database (Neon recommended)

### Steps
1. Clone the repository
```bash
git clone <your-repo-url>
cd pastebin-lite
Install dependencies

npm install
Create a .env file

DATABASE_URL=postgresql://<user>:<password>@<host>/<db>?sslmode=require
TEST_MODE=0
Start the server

npm start
The app will run at:

http://localhost:3000