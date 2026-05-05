# 🌍 Travel Itinerary Planner Web App

A full-stack web application that allows users to create, manage, and visualize travel itineraries with a modern, responsive interface and structured XML-based data rendering.

---

## 🚀 Live Repository

🔗 GitHub: [View Project Repository](https://github.com/search?type=code&utm_source=chatgpt.com)

---

## ✨ Features

### 🔐 User Authentication

* Secure **JWT-based login & signup**
* Password hashing using **bcrypt**
* Protected routes with authentication middleware

---

### 🧭 Itinerary Management

* Create, edit, and delete itineraries
* Add:

  * Destinations
  * Travel dates
  * Activities
  * Notes
* Drag-and-drop activity reordering *(if implemented)*

---

### 📄 XML + XSLT Integration

* Store itineraries in **XML format**
* Transform XML into styled HTML using **XSLT**
* Export & import itinerary data as XML files

---

### 📊 Dashboard

* View all itineraries in one place
* Filter by:

  * Destination
  * Date
  * Tags

---

### 🎨 UI/UX

* Responsive design (mobile + desktop)
* Smooth animations using:

  * Intersection Observer / Framer Motion / GSAP
* Clean, minimal interface inspired by modern travel apps

---

## 🧱 Tech Stack

### Frontend

* React (Hooks + Context API)
* HTML5, CSS3, JavaScript (ES6+)

### Backend

* Node.js
* Express.js

### Database

* MongoDB (Mongoose ODM)

### Data Layer

* XML
* XSLT

---

## 🏗️ Architecture

This project follows a **clean MVC architecture**:

```
Backend:
├── Models        → MongoDB schemas
├── Controllers   → Business logic
├── Routes        → API endpoints
├── Middleware    → Auth & error handling
├── Services      → XML processing
```

* Separation of concerns
* Modular and scalable design
* RESTful API structure

---

## 📂 Project Structure

```
project-root/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   └── utils/
│
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── context/
│   ├── services/
│   └── styles/
```

---

## ⚙️ Setup Instructions

### 1️⃣ Clone Repository

```bash
git clone https://github.com/anshulrajeshgupta9f17/webdev-project123.git
cd webdev-project123
```

---

### 2️⃣ Install Dependencies

#### Backend

```bash
cd backend
npm install
```

#### Frontend

```bash
cd frontend
npm install
```

---

### 3️⃣ Environment Variables

Create a `.env` file in backend:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
```

---

### 4️⃣ Run the Application

#### Backend

```bash
npm run dev
```

#### Frontend

```bash
npm start
```

---

## 🔗 API Endpoints

### Auth Routes

* `POST /api/auth/register`
* `POST /api/auth/login`

### Itinerary Routes

* `GET /api/itineraries`
* `POST /api/itineraries`
* `GET /api/itineraries/:id`
* `PUT /api/itineraries/:id`
* `DELETE /api/itineraries/:id`

---

## 📌 Key Design Decisions

* **XML for itinerary storage** → flexible & structured data representation
* **XSLT transformations** → dynamic rendering of itineraries
* **JWT authentication** → stateless and scalable
* **Modular backend structure** → production-ready codebase
* **Reusable React components** → maintainable frontend

---

## 🚀 Future Enhancements

* 🗺️ Map integration (Google Maps / Leaflet)
* 🤖 AI-based itinerary suggestions
* 📄 Export itinerary as PDF
* 👥 Collaborative trip planning

---

## 🛡️ Error Handling & Validation

* Centralized error middleware
* Input validation for all endpoints
* Secure authentication checks

---

## 👨‍💻 Author

**Anshul Gupta**

* GitHub: https://github.com/anshulrajeshgupta9f17

---

## ⭐ Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Submit a pull request

---

## 📜 License

This project is licensed under the MIT License.

---

## 💡 Note

This project is designed to reflect **real-world full-stack architecture**, focusing on clean code, scalability, and practical implementation of modern web technologies.
