# BQ App
## 🎯 Project Objective
A Node + Express + Front-end rendering React with Hooks  + Mongo web app that helps users prepare for behavioral interviews (“BQ”) by practicing common questions across professional tracks (e.g., PM, consulting). Users can log in, get a random interview question, type their answer, and compare it with a suggested answer to self-evaluate.

## 📥 Installation & Usage
```bash
# Clone the repo
git clone https://github.com/zhuoyumiao/BQapp.git
cd BQapp

# Create a .env file in the root directory:
PORT=3000
MONGODB_URI=<your Mongo connection string>
DB_NAME=<your db name>

# If dependencies exist (optional)
npm install
npm run start:server

# If dependencies exist (optional)
npm install
npm run start:client
```
---

---

## ⚙️ Tech Requirements
- HTML5, CSS3, JavaScript, Node, Express, Mongo, React
- Node.js >= 20
- ESLint + Prettier for code linting and formatting
- Git + GitHub for version control and hosting

---

## 📸 Demo

## 👩‍💻 Author & Link
Author: Zhuoyu Miao & Muchen Qi

---

## 📚 Reference to the Class
This project was created as part of the **CS5610 Web Development** course at Northeastern University. https://johnguerra.co/classes/webDevelopment_online_fall_2025/

---

## 📝 Resources:
Website Link: 
Design document: [DesignDocument]().    
Link of video demonstration: 
Demonstration slide:  

---
## 🤖 AI usage
Used ChatGPT to help create useHashRoute.js. Used the GPT-5 and prompt "create useHashRoute file for frontend react app".

---
## Database records
There are (100question+100*4answers) + (20user*25attempt) + 20users = 1020 records in total
![Database Screenshot1]()

---
## CRUD operations
User(Muchen Qi) and Question(Zhuoyu Miao) have CRUD operations supported.

---
## Instructions to use 
![Instructions Screenshot1]()

## React Components (using hooks)
Questions.jsx, QuestionDetail.jsx, AttemptDetail.jsx...