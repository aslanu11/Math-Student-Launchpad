# Launchpad Finance Pathway Tracker

**Offline UCAS & Degree Apprenticeship Application Tracker**  
For students applying to Finance, Accounting, Economics, Maths, Statistics, Data Science, and Actuarial Science pathways.

---

## Repository Description

An offline-first local web application that helps students plan, track, and manage UCAS applications and degree apprenticeships in one structured place.  
Runs entirely from a local HTML file with no backend, no accounts, and no internet required.

---

## Key Features

- UCAS course tracker (up to 5 choices)
- Degree apprenticeship application pipeline (kanban-style)
- Personal statement editor with version history
- Entry test and preparation tracker
- Supercurricular planning and reflection system
- Documents and evidence reference manager
- Links and resources organiser
- Deadline tracking
- Progress indicators (UCAS, apprenticeships, portfolio, overall)
- Light and dark mode
- Autosave plus export/import backups
- Fully offline (localStorage)

---

## Intended Audience

- Year 12–13 students
- UCAS applicants
- Degree apprenticeship applicants
- Students targeting:
  - Finance
  - Accounting
  - Economics
  - Mathematics
  - Statistics
  - Data Science
  - Actuarial Science

---

## Getting Started

1. Clone or download this repository
2. Open the project folder
3. Double-click `index.html` to open it in your browser

No setup, no dependencies, no server required.

---

## Project Structure

launchpad-finance-pathway-tracker/
│
├── index.html
└── assets/
├── css/
│ └── style.css
└── js/
└── app.js


Note: Folder and file names are case-sensitive on Linux/macOS.

---

## Data Storage and Safety

- All data is stored locally using browser `localStorage`
- Nothing is uploaded or shared
- Data remains on the current computer/browser only

### Saving Options

- Automatic autosave (enabled by default)
- Manual Save button
- Export backup to JSON
- Import backup from JSON

### Recommended Practice

Export a backup regularly (e.g. monthly or before major edits).

---

## Application Sections

### Dashboard

The main overview page.

- Visual progress indicators:
  - UCAS readiness
  - Apprenticeship readiness
  - Portfolio/supercurricular readiness
  - Overall readiness
- Upcoming deadlines
- Quick-add actions

Use this page frequently to stay oriented.

---

### UCAS Tracker

Track up to five UCAS choices.

For each choice:
- University and course
- Course code
- Entry requirements
- Admissions tests
- Interview notes
- Links (course page, open days)
- Free-form notes

Includes a comparison table to review all choices side-by-side.

---

### Degree Apprenticeships

Visual application pipeline with stages:
- Researching
- Applied
- Online tests
- Interviews / Assessment Centre
- Offer
- Rejected

Each role includes:
- Requirements
- Preparation notes
- Deadlines
- Application links

---

### Personal Statement

Writing and version control workspace.

- Main personal statement editor
- Live word count and draft indicator
- Saved versions (v1, v2, final, etc.)
- Paragraph bank for:
  - Supercurriculars
  - Work experience
  - Projects
  - Reflections
- Evidence links per paragraph

Recommended reflection structure:

---

### Entry Tests and Preparation

Track:
- Registration deadlines
- Test dates
- Topics and weak areas
- Practice scores with notes

Suitable for:
- University admissions tests
- Apprenticeship online assessments
- Numerical and mathematical tests

---

### Supercurricular Planner

Plan and track:
- Projects
- Competitions
- MOOCs
- Reading
- Virtual work experience

Includes:
- Step-by-step checklists
- Reflection notes
- Evidence links
- Built-in idea library tailored to relevant subjects

---

### Documents and Evidence

Store references to:
- Certificates
- CV versions
- Project write-ups
- Work experience letters

Supports:
- Google Drive links
- Local file paths

---

### Links and Resources

Save and categorise:
- Course pages
- Apprenticeship portals
- Test preparation resources
- Research material

---

### Deadlines

Track all important dates:
- UCAS deadlines
- Apprenticeship deadlines
- Test registrations
- Open days

Includes completion tracking.

---

### Settings and Backup

- Profile information
- Important links (LinkedIn, GitHub, Drive)
- Light/dark theme
- Autosave toggle
- Export and import backups
- Full reset (with confirmation)

---

## Suggested Usage Routine

**Weekly**
- Review the dashboard
- Update deadlines
- Log application or preparation progress

**Monthly**
- Export a backup
- Review readiness indicators
- Adjust priorities

---

## Technical Notes

- Plain HTML, CSS, and JavaScript
- No frameworks or dependencies
- No backend
- Offline-first by design
- Compatible with GitHub Pages (with manual backups)

---

## License

MIT License  
Free to use, modify, and distribute.

---

## Final Note

This tool is designed to provide structure and clarity, not pressure.  
Consistent use is far more important than filling everything perfectly.
