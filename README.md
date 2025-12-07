# 🎯 AI Resume Generator - Quick Start

**Skip Docker - Run Locally in 2 Minutes!**

## 🚀 Fastest Way to Run

### Step 1: Install Tectonic (One-time)

**macOS:**
```bash
brew install tectonic
```

**Linux:**
```bash
curl --proto '=https' --tlsv1.2 -fsSL https://drop-sh.fullyjustified.net | sh
```

**Windows:**
```bash
# Download from: https://github.com/tectonic-typesetting/tectonic/releases
```

### Step 2: Run Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend running at: **http://localhost:8000**

### Step 3: Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend running at: **http://localhost:3000**

## ✅ That's It!

Open **http://localhost:3000** in your browser.

---

## 💰 Manual Mode (FREE - No API Key)

1. Click **"Manual Mode"**
2. Download ChatGPT prompts
3. Paste your resume into ChatGPT Premium
4. Copy JSON output
5. Paste into app
6. Generate PDF!

## 🤖 Auto Mode (Requires OpenAI API)

1. Click **"Auto Mode"**
2. Enter your OpenAI API key (stored locally in browser)
3. Upload LinkedIn PDF
4. Generate PDF!

---

## 🐛 Troubleshooting

**"Tectonic not found":**
```bash
# macOS
brew install tectonic

# Check it's installed
tectonic --version
```

**"Module not found" errors:**
```bash
cd backend
pip install -r requirements.txt

cd ../frontend
npm install
```

**Port already in use:**
```bash
# Backend on different port
uvicorn main:app --port 8001

# Frontend on different port  
npm run dev -- --port 3001
```

---

## 📁 Project Structure

```
resume-generator/
├── backend/          # Python FastAPI
│   ├── main.py
│   ├── services/
│   └── templates/    # LaTeX templates
└── frontend/         # React TypeScript
    └── src/
```

## 🎨 Features

- ✅ **Manual Mode** - FREE with ChatGPT Premium
- ✅ **Auto Mode** - Automatic with OpenAI API
- ✅ **ATS-Friendly Templates** - Professional & Modern
- ✅ **Live PDF Preview** - See changes instantly
- ✅ **Local API Key Storage** - Secure, never sent to servers

---

## 💡 Why Skip Docker?

Tectonic has complex Rust dependencies that cause Docker build issues. Running locally is:
- ✅ **Faster** - No build time
- ✅ **Simpler** - Just install & run
- ✅ **Easier to debug** - Direct access to logs

You can always add Docker later once everything works!


Resume DSL Example:

@NAME Your Name
@EMAIL your.email@example.com
@PHONE +1 (123) 456-7890
@LINKEDIN linkedin.com/in/yourprofile
@GITHUB github.com/yourusername
@LOCATION City, State

@Professional Summary
Experienced professional with expertise in cloud platforms, databases, and automation.

@Technical Skills
- **Cloud Platforms:** AWS, Azure, GCP
- **Programming:** Python, SQL, JavaScript
- **Databases:** PostgreSQL, MySQL, Redis

@Professional Experience

@JOB Transamerica | Database Reliability Engineer | July 2023 - Present | San Jose, CA
- Built and maintained PostgreSQL databases with **99.99% uptime**
- Reduced infrastructure costs by **70%**
- Published @LINK[database scaling article](https://medium.com/@user/db-scaling) with **10K+ views**

@Education

@JOB Wilmington University | Bachelor of Science in Computer Science | 2019 - 2023 | Wilmington, DE
- GPA: **3.8/4.0**
- Dean's List all semesters