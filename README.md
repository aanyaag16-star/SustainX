# SUSTAINX – Green Campus Challenge 🌿🏆
> **Inter-School University Sustainability Competition Platform**

SUSTAINX is a modern, responsive web application built for colleges and universities to gamify and track sustainability performance across schools and academic departments. Participating schools earn **Green Points** based on verified eco-actions, circular resource sharing, and plastic-free campus events.

---

## 🌟 Key Features

### Public Portal (Students, Faculty, Public)
- **Dynamic Green Leaderboard (`/leaderboard.html`)**: Real-time rankings, top-3 animated podium (🥇 First, 🥈 Second, 🥉 Third), delta movement indicators (`↑`, `↓`, `-`), and filters for Academic Year, Month, and Scoring Category.
- **Participating Schools Directory (`/schools.html`)**: Search and filter participating faculties by Rank, Total Score, and Name.
- **School Profile & Analytics (`/school.html?id=...`)**:
  - Track-wise breakdown with animated progress bars
  - Canvas-rendered monthly score progression curve
  - Verified activity history log
  - Key campus achievements
- **Official Scoring Rules (`/categories.html`)**: Full rubrics, waste benchmarks, and participation percentage formulas across all 5 tracks.
- **Campus Initiatives & Events (`/events.html`)**: Tree plantation drives, beach/river cleanups, mega e-waste collections, quizzes, hackathons, and case competitions.
- **Audit Bulletins & Announcements (`/announcements.html`)**: Real-time notifications of verified audits and rule advisories.
- **About SustainX (`/about.html`)**: Competition bylaws, philosophy, and audit transparency.
- **User Authentication (`/login.html`, `/signup.html`)**: Registration and login for university students and faculty (strictly locked to role `"user"`).

### Admin Portal (`/admin/`)
- **Discrete & Secure Access (`/admin/login.html`)**: Role-based access requiring `role: "admin"`.
- **Command Center Dashboard (`/admin/dashboard.html`)**: Real-time KPI counters (Total Schools, Total Score Entries, Total Points, Current Leader) and quick review tables.
- **Update Scores (`/admin/scores.html`)**: Form with **instant rubric presets** (Plastic-free +5000, Plastic penalty -2000, Resource sharing +1500, High collection +1200, etc.), verification status options, and evidence upload links.
- **Manage Schools (`/admin/schools.html`)**: Add, edit, or deactivate schools without deleting historical audit entries.
- **Audit Score History (`/admin/history.html`)**: Filter by school, category, month, or awards vs penalties, with deletion capability.
- **Manage Announcements (`/admin/announcements.html`)**: Publish and manage broadcast notices.

---

## 📐 Scoring Formula & Integrity

In accordance with strict audit rules:
$$\text{Total Score} = \sum (\text{All approved scoreEntries for that school})$$
- Only entries with `verificationStatus = "approved"` contribute to the official standings.
- `pending` and `rejected` entries **never** alter the leaderboard.
- Total points are dynamically aggregated on the fly—never overwritten by arbitrary static values.

---

## 🎨 Visual Identity & Palette

| Token | Hex Code | Role |
| :--- | :--- | :--- |
| **Dark Forest Green** | `#164A35` | Primary brand accent, headings, admin sidebar |
| **Primary Green** | `#238B5A` | Buttons, call-to-actions, high-score indicators |
| **Light Green** | `#DFF3E5` | Badges, subtle highlight cards, pill backgrounds |
| **Cream** | `#F7F5EA` | Background canvas, warm aesthetic |
| **White** | `#FFFFFF` | Card backgrounds, crisp contrast |
| **Dark Text** | `#17231D` | High-contrast readable typography |
| **Gold** | `#D6A84F` | First place champion, trophies, achievements |

---

## ⚡ Instant Demo Credentials

For testing and demonstration, use the 1-click fill buttons or manually sign in with:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Auditor / Admin** | `admin@sustainx.edu` | `admin123` | Full admin console access (`/admin/dashboard.html`) |
| **Student** | `student@sustainx.edu` | `student123` | Public portal & school profile viewer |

*To reset the entire dataset back to default at any time, click **"Reset Demo Data"** on the admin topbar or use `SustainX.DataStore.resetDemoData()` in the browser console.*

---

## 🚀 Connecting to Firebase (Phase 2 Deployment)

1. Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/).
2. Enable **Authentication** with Email/Password sign-in.
3. Create a **Cloud Firestore** database.
4. Deploy the production security rules from `firestore.rules`:
   ```bash
   firebase deploy --only firestore:rules
   ```
5. Update your Firebase credentials in `js/firebase-config.js` and set:
   ```javascript
   const USE_FIREBASE = true;
   ```
6. Deploy to **Firebase Hosting**:
   ```bash
   firebase init hosting
   firebase deploy --only hosting
   ```

---

## 📂 Project Structure

```text
sustainx/
├── index.html                   # Home page with hero, floating leaves, stats, top 3 podium
├── login.html                   # User login
├── signup.html                  # Student/Faculty signup (role: "user")
├── leaderboard.html             # Leaderboard with podium, month/category filters
├── schools.html                 # Schools directory with search and sorting
├── school.html                  # School profile, Canvas line chart, category bars
├── categories.html              # Official SustainX scoring rubrics and benchmarks
├── events.html                  # Campus green events and initiatives
├── announcements.html           # Public announcements feed
├── about.html                   # About the competition and audit transparency
├── firestore.rules              # Production Cloud Firestore security rules
├── README.md                    # Project documentation
│
├── admin/
│   ├── login.html               # Admin login portal
│   ├── dashboard.html           # Admin command center & KPIs
│   ├── scores.html              # Update scores form with rubric presets
│   ├── schools.html             # Manage schools (add/edit/deactivate)
│   ├── history.html             # Audit history table with multi-filters
│   └── announcements.html       # Manage bulletins
│
├── css/
│   ├── style.css                # Design system tokens, components, forms, tables
│   ├── animations.css           # Floating leaves, podium glow, fade-ins
│   └── responsive.css           # Breakpoints (375px, 480px, 768px, 1024px, 1440px)
│
├── js/
│   ├── data-store.js            # Dynamic calculation engine and demo store
│   ├── firebase-config.js       # Firebase SDK connector & dual-mode bridge
│   ├── utils.js                 # Floating leaves, toast, modals, counters
│   ├── auth.js                  # Authentication logic and role redirects
│   ├── leaderboard.js           # Dynamic podium & rankings controller
│   ├── schools.js               # Schools search and sort
│   ├── scores.js                # Canvas line chart and category progression
│   ├── admin.js                 # Admin management controller
│   └── announcements.js         # Public announcements controller
│
└── assets/
    ├── icons/                   # leaf.svg, trophy.svg
    ├── images/                  # campus-hero.svg
    └── logos/                   # sustainx-logo.svg, school-a.svg to school-f.svg
```

---

## 🏆 SustainX Categories & Points Quick Reference

| Category | Primary Metric | Points Range |
| :--- | :--- | :--- |
| **1. Sustainable Events** | Plastic-free events, segregation | `+5000` (Plastic-Free) to `-2000` (Heavy Plastic Penalty) |
| **2. Reuse & Resource Sharing** | Inter-school gear lending | `+1500` (Lending), `+1000` (Borrowing/Reusing) |
| **3. Waste Collection Drive** | Audited collection tiers | `+1200` (High), `+700` (Medium), `+300` (Low), `-300` (Missed) |
| **4. Sustainability Participation** | Student turnout & quizzes | `+3000` (>30%), `+2500` (Winning Team Bonus) |
| **5. Innovation Bonus** | Practical prototypes | Audited discretionary award (Solar, Recycling machines, etc.) |

---

*SUSTAINX – Designed for academic excellence, environmental impact, and campus engagement.*
