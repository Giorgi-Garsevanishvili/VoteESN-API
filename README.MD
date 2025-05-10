
# 📮 VoteESN API

This is the backend service for **VoteESN**, a secure, section-based digital voting platform built for Erasmus Student Network (ESN) sections and NGOs.

---

## 💡 Features

- 🔐 JWT-based user and voter authentication
- 🧑‍⚖️ Role-based access control (Admin / Voter)
- 🗳️ Election creation with one-time token generation
- 📧 Token delivery via email and QR code
- 🌐 Optional IP-based voter restrictions
- 🏷️ Automatic section assignment
- 🛡️ Email alerts on sensitive actions (logins, token reveals, etc.)
- 📚 Swagger UI for API documentation

---

## 🧑‍💼 User Roles

| Role   | Access Scope                                             |
|--------|----------------------------------------------------------|
| Admin  | Full access to `/api/v1/admin` for managing users, tokens, and elections |
| Voter  | Limited access to `/api/v1/user` for casting votes and viewing elections |

---

## 🛠️ Tech Stack

- **Backend:** Node.js + Express
- **Database:** MongoDB Atlas (via Mongoose)
- **Security:** JWT, Helmet, Rate Limiter, XSS-clean, CORS
- **Utilities:** Nodemailer, QR code generator
- **Docs:** Swagger (OpenAPI) 

## 📂 Folder Structure

📁 VOTEESN-API/
 ├── 📁 controlers/                  # All controller logic for handling API requests
 │   ├── 📁 admin/                   # Admin-specific controller functions (e.g., user management, elections)
 │   ├── 📄 auth.js                  # Handles authentication (login, token creation...)
 │   ├── 📄 settings-controler.js    # Manages global or section-level settings
 │   └── 📄 voter.js                 # Logic related to voter actions (casting vote, viewing elections)
 ├── 📁 db/                          # MongoDB connection setup
 ├── 📁 errors/                      # Custom error classes and handling helpers
 ├── 📁 middlewares/                 # Authentication, authorization, rate limiting, validation, etc.
 ├── 📁 models/                      # Mongoose schemas for users, elections, tokens, etc.
 ├── 📁 routes/                      # Route definitions for admin, voter, and auth
 ├── 📁 utils/                       # Utility functions (email notifications)
 ├── 📄 app.js                       # Main entry point, Express app setup
 └── 📄 .env                         # Environment variables (not committed to version control)




---

## 📄 API Documentation

You can test and explore the API using Swagger UI:  
🔗 [https://voteesn-api.onrender.com/](https://voteesn-api.onrender.com/)

---

## 🚀 Deployment Info

- **Backend:** Hosted on Render
- **Database:** MongoDB Atlas
- **Frontend:** Hosted on Netlify
- **CORS:** Enabled for frontend domain
- **Rate Limiting:** 500 requests / 15 minutes

---

## 📦 Local Setup

```bash
git clone https://github.com/Giorgi-Garsevanishvili/VoteESN-API.git
cd VoteESN-API
npm install
npm run start


## 📧 Email & Security

Emails sent on login/token reveal, etc.
QR codes generated for token voting
Optional IP restrictions per election
Only admin of a section can manage their voters


📄 License
This project is under a custom proprietary license.
You may not copy, modify, or distribute any part of this software without explicit written permission.

For permissions, contact George.Garsevanidi@gmail.com.
See the LICENSE file for full details.

Developed & maintained by @Giorgi-Garsevanishvili