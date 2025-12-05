# ChatGPT Prompts for Resume Generator

Use these prompts with **ChatGPT Premium** to generate resume JSON for free (no API costs).

---

## 📋 Prompt 1: Extract Resume Data from Text

**Instructions:**
1. Copy the prompt below
2. Paste into ChatGPT
3. Add your resume text at the end
4. Copy the JSON output
5. Paste into the app's "Import JSON" box

**Prompt:**

```
You are a resume data extraction expert. Extract structured information from the resume text below.

CRITICAL: Output ONLY valid JSON. No explanations, no markdown, just pure JSON.

Schema:
{
  "personal_info": {
    "name": "Full Name",
    "email": "email@example.com",
    "phone": "+1234567890",
    "linkedin": "linkedin.com/in/username (optional)",
    "github": "github.com/username (optional)",
    "location": "City, State (optional)"
  },
  "summary": "Professional summary paragraph (optional)",
  "experience": [
    {
      "company": "Company Name",
      "role": "Job Title",
      "duration": "Jan 2020 - Present",
      "location": "City, State (optional)",
      "bullets": [
        "Achievement bullet 1 with metrics",
        "Achievement bullet 2 with impact",
        "Achievement bullet 3"
      ]
    }
  ],
  "education": [
    {
      "institution": "University Name",
      "degree": "Degree and Major",
      "year": "2020",
      "gpa": "3.8 (optional)"
    }
  ],
  "skills": ["Skill1", "Skill2", "Skill3"],
  "projects": [
    {
      "name": "Project Name",
      "description": "Brief description",
      "technologies": ["Tech1", "Tech2"],
      "link": "github.com/project (optional)"
    }
  ],
  "certifications": ["Certification 1", "Certification 2"]
}

Rules:
- Extract all information accurately
- For experience bullets, focus on achievements with metrics
- If a field is missing, omit it or use null
- Preserve technical terms exactly as written
- Format dates consistently as "Mon YYYY - Mon YYYY" or "Mon YYYY - Present"

Resume Text:
[PASTE YOUR RESUME TEXT HERE]
```

---

## 🎯 Prompt 2: Optimize Resume for Job Description

**Instructions:**
1. First, use Prompt 1 to get your current resume JSON
2. Copy the prompt below
3. Paste your resume JSON and target job description
4. Copy the optimized JSON output
5. Paste into the app

**Prompt:**

```
You are an expert resume writer specializing in ATS optimization.

CRITICAL: Output ONLY valid JSON. No explanations, no markdown, just pure JSON.

Task: Rewrite the resume bullets to align with the job description while maintaining 100% truthfulness.

Rules:
1. Keep all factual information unchanged (companies, dates, degrees, locations)
2. Rewrite bullets using STAR method (Situation, Task, Action, Result)
3. Incorporate keywords from job description naturally
4. Emphasize relevant experience and skills
5. Use action verbs from the job description
6. Quantify achievements with metrics where possible
7. Keep bullets concise (1-2 lines max)
8. DO NOT fabricate experience, skills, or technologies
9. DO NOT change dates or company names
10. Output the SAME JSON schema, just with optimized content

Current Resume JSON:
[PASTE YOUR RESUME JSON FROM PROMPT 1 HERE]

Target Job Description:
[PASTE THE JOB DESCRIPTION HERE]

Output optimized resume JSON:
```

---

## 💡 Tips for Best Results

1. **Be Specific**: Include all details from your resume
2. **Check Output**: Always validate the JSON in the app before generating PDF
3. **Iterate**: You can run the optimization prompt multiple times with different job descriptions
4. **Save Outputs**: Keep your JSON outputs for different job applications
5. **Manual Edits**: After importing, you can still edit the form before generating PDF

---

## 🆚 Manual vs Auto Mode

| Feature | Manual Mode (Free) | Auto Mode (Costs $) |
|---------|-------------------|---------------------|
| Cost | $0 (uses your ChatGPT Premium) | ~$0.01-0.05 per resume |
| Speed | ~2 minutes (copy-paste) | ~30 seconds (automatic) |
| Control | Full control over AI output | Automated |
| Quality | Same (uses GPT-4) | Same (uses GPT-4) |
| Best For | Cost-conscious users | Speed and convenience |

---

## 🔧 Troubleshooting

**"Invalid JSON" error:**
- Make sure you copied ONLY the JSON (no extra text)
- Check for missing commas or brackets
- Try asking ChatGPT to "fix the JSON syntax"

**Missing fields:**
- Add them manually in the form after import
- Or ask ChatGPT to regenerate with specific fields

**Wrong format:**
- Make sure you used the exact prompt template
- Remind ChatGPT: "Output ONLY valid JSON, no explanations"
