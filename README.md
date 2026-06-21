# ResumeAI — AI-Powered Resume Builder

ResumeAI is an intelligent, full-stack application designed to analyze, optimize, and generate resumes using AI. By comparing your resume to any job description, it provides intelligent scoring and tailored recommendations to help you land your dream job.

## Features

- **AI-Powered Analysis**: Receive intelligent feedback on how well your resume matches a given job description.
- **Optimization Suggestions**: Actionable insights to improve your resume's impact.
- **Dynamic Scoring**: Quantifiable metrics to track your resume's strength.
- **Modern UI**: A sleek, responsive frontend built with React, TypeScript, and Vite.
- **Robust Backend**: Powered by Python for quick and reliable AI inference.

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Modern UI Styling

### Backend
- Python
- SQLite (`resume_builder.db`)
- Environment variable configuration (`.env`)

## Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.9+)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repository-url>
   cd resume-builder
   ```

2. **Backend Setup:**
   ```bash
   cd api
   # Set up a virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   # Install dependencies
   pip install -e . # or whatever package manager you prefer for pyproject.toml
   # Set up your environment variables
   cp .env.example .env
   # Run the backend (Example: FastAPI)
   # uvicorn src.main:app --reload
   ```

3. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## SEO Configuration

The application is built with search engine optimization in mind. Appropriate meta descriptions, keywords, and OpenGraph tags are included in the frontend to ensure good visibility on Google and other search platforms.
