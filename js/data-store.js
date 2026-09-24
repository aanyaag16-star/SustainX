/**
 * SUSTAINX - Green Campus Challenge
 * Core Data Store & Dynamic Calculation Engine
 * 
 * Manages schools, score entries, announcements, events, and authentication state.
 * Implements strict calculation rules:
 *   totalScore = sum of approved scoreEntries only.
 */

(function(window) {
  'use strict';

  const STORAGE_KEYS = {
    SCHOOLS: 'sustainx_schools_v1',
    SCORES: 'sustainx_scores_v1',
    ANNOUNCEMENTS: 'sustainx_announcements_v1',
    EVENTS: 'sustainx_events_v1',
    USERS: 'sustainx_users_v1',
    CURRENT_USER: 'sustainx_current_user_v1',
    INITIALIZED: 'sustainx_initialized_v1'
  };

  // Exact categories specified in SustainX guidelines
  const CATEGORIES = [
    'Sustainable Events',
    'Reuse & Resource Sharing',
    'Waste Collection Drive',
    'Sustainability Participation',
    'Innovation Bonus'
  ];

  // Default Initial Demo Schools
  const DEFAULT_SCHOOLS = [
    {
      schoolId: 'school-a',
      name: 'School of Engineering & Technology',
      shortName: 'Apex Tech',
      logo: 'assets/logos/school-a.svg',
      description: 'Department of Computing, Mechanical, and Sustainable Energy Systems.',
      studentCount: 2400,
      active: true,
      createdAt: '2026-07-01'
    },
    {
      schoolId: 'school-b',
      name: 'School of Environmental Sciences',
      shortName: 'BioGreen Institute',
      logo: 'assets/logos/school-b.svg',
      description: 'Institute for Ecological Research, Climate Modeling, and Forestry.',
      studentCount: 1200,
      active: true,
      createdAt: '2026-07-01'
    },
    {
      schoolId: 'school-c',
      name: 'School of Management & Commerce',
      shortName: 'Pinnacle Business School',
      logo: 'assets/logos/school-c.svg',
      description: 'Faculty of Sustainable Finance, ESG Leadership, and Marketing.',
      studentCount: 1800,
      active: true,
      createdAt: '2026-07-01'
    },
    {
      schoolId: 'school-d',
      name: 'School of Architecture & Design',
      shortName: 'Terran Design Guild',
      logo: 'assets/logos/school-d.svg',
      description: 'Studio for Biophilic Urbanism, Circular Design, and Zero-Carbon Buildings.',
      studentCount: 950,
      active: true,
      createdAt: '2026-07-01'
    },
    {
      schoolId: 'school-e',
      name: 'School of Humanities & Social Sciences',
      shortName: 'Verdant Liberal Arts',
      logo: 'assets/logos/school-e.svg',
      description: 'Department of Environmental Ethics, Policy Advocacy, and Sociology.',
      studentCount: 1400,
      active: true,
      createdAt: '2026-07-01'
    },
    {
      schoolId: 'school-f',
      name: 'School of Applied Sciences & Medicine',
      shortName: 'Nova Health Sciences',
      logo: 'assets/logos/school-f.svg',
      description: 'Center for Green Healthcare, Biochemical Safety, and Public Health.',
      studentCount: 1600,
      active: true,
      createdAt: '2026-07-01'
    }
  ];

  // Default Score Entries (Reflecting exact SustainX rubrics)
  const DEFAULT_SCORES = [
    // School A Entries
    {
      scoreId: 'sc-101',
      schoolId: 'school-a',
      category: 'Sustainable Events',
      activity: 'Annual Tech Fest (Zero Single-Use Plastic Mandate)',
      points: 5000,
      remarks: 'Full waste audit cleared. Zero plastic bottles; compostable food containers only.',
      evidenceUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop',
      verificationStatus: 'approved',
      verifiedBy: 'Dr. Evelyn Reed (Audit Lead)',
      academicYear: '2026-27',
      month: 'September',
      date: '2026-09-15',
      createdAt: '2026-09-16T10:30:00Z'
    },
    {
      scoreId: 'sc-102',
      schoolId: 'school-a',
      category: 'Innovation Bonus',
      activity: 'Solar E-Waste Shredder & Filament Recycler',
      points: 3500,
      remarks: 'Working prototype installed at Makerspace. Directly produces 3D printer filament from campus PET bottles.',
      evidenceUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop',
      verificationStatus: 'approved',
      verifiedBy: 'Prof. Marcus Vance',
      academicYear: '2026-27',
      month: 'September',
      date: '2026-09-20',
      createdAt: '2026-09-20T14:15:00Z'
    },
    {
      scoreId: 'sc-103',
      schoolId: 'school-a',
      category: 'Waste Collection Drive',
      activity: 'Campus-wide E-Waste Collection (High Tier)',
      points: 1200,
      remarks: 'Collected 380kg old cables, motherboards, and batteries. Handed over to certified recycler.',
      evidenceUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop',
      verificationStatus: 'approved',
      verifiedBy: 'Dr. Evelyn Reed',
      academicYear: '2026-27',
      month: 'August',
      date: '2026-08-25',
      createdAt: '2026-08-26T09:00:00Z'
    },
    {
      scoreId: 'sc-104',
      schoolId: 'school-a',
      category: 'Sustainability Participation',
      activity: 'Campus Clean Energy Hackathon (24% participation)',
      points: 2750,
      remarks: '576 registered engineering students actively competed in micro-grid simulations.',
      evidenceUrl: '',
      verificationStatus: 'approved',
      verifiedBy: 'Green Audit Secretariat',
      academicYear: '2026-27',
      month: 'July',
      date: '2026-07-28',
      createdAt: '2026-07-29T11:20:00Z'
    },

    // School B Entries
    {
      scoreId: 'sc-201',
      schoolId: 'school-b',
      category: 'Sustainable Events',
      activity: 'World Biodiversity Symposium (Plastic-free)',
      points: 5000,
      remarks: 'Stainless steel tumblers provided, cloth flex banners, digital delegate passes.',
      evidenceUrl: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=600&auto=format&fit=crop',
      verificationStatus: 'approved',
      verifiedBy: 'Dr. Evelyn Reed',
      academicYear: '2026-27',
      month: 'September',
      date: '2026-09-12',
      createdAt: '2026-09-13T16:00:00Z'
    },
    {
      scoreId: 'sc-202',
      schoolId: 'school-b',
      category: 'Sustainability Participation',
      activity: 'Inter-Collegiate Environmental Case Competition (Winning Team)',
      points: 5500, // 3000 (above 30%) + 2500 winning bonus
      remarks: '38% student participation rate + BioGreen team won First Prize overall.',
      evidenceUrl: '',
      verificationStatus: 'approved',
      verifiedBy: 'Prof. Marcus Vance',
      academicYear: '2026-27',
      month: 'August',
      date: '2026-08-18',
      createdAt: '2026-08-19T10:45:00Z'
    },
    {
      scoreId: 'sc-203',
      schoolId: 'school-b',
      category: 'Waste Collection Drive',
      activity: 'Wet Organic Waste Composting Drive (Medium Tier)',
      points: 700,
      remarks: '320kg compost produced and transferred to campus botanical garden.',
      evidenceUrl: '',
      verificationStatus: 'approved',
      verifiedBy: 'Audit Committee',
      academicYear: '2026-27',
      month: 'July',
      date: '2026-07-15',
      createdAt: '2026-07-16T14:30:00Z'
    },
    {
      scoreId: 'sc-204',
      schoolId: 'school-b',
      category: 'Reuse & Resource Sharing',
      activity: 'Lending Lab Equipment & Field Kits to School D',
      points: 1500,
      remarks: 'Supplied soil testers and water quality probes for urban design studio.',
      evidenceUrl: '',
      verificationStatus: 'approved',
      verifiedBy: 'Dr. Evelyn Reed',
      academicYear: '2026-27',
      month: 'September',
      date: '2026-09-08',
      createdAt: '2026-09-09T09:10:00Z'
    },

    // School C Entries
    {
      scoreId: 'sc-301',
      schoolId: 'school-c',
      category: 'Sustainable Events',
      activity: 'Annual Business Leadership Summit (Handed over waste to SustainX)',
      points: 2000,
      remarks: 'Clean segregation audit passed. 45kg dry recyclables transferred directly to SustainX team.',
      evidenceUrl: '',
      verificationStatus: 'approved',
      verifiedBy: 'Dr. Evelyn Reed',
      academicYear: '2026-27',
      month: 'September',
      date: '2026-09-04',
      createdAt: '2026-09-05T12:00:00Z'
    },
    {
      scoreId: 'sc-302',
      schoolId: 'school-c',
      category: 'Reuse & Resource Sharing',
      activity: 'Allocating Stage Structures & Backdrop to School E',
      points: 1500,
      remarks: 'Shared modular wooden stage risers and LED spotlights.',
      evidenceUrl: '',
      verificationStatus: 'approved',
      verifiedBy: 'Green Audit Secretariat',
      academicYear: '2026-27',
      month: 'August',
      date: '2026-08-20',
      createdAt: '2026-08-21T11:00:00Z'
    },
    {
      scoreId: 'sc-303',
      schoolId: 'school-c',
      category: 'Sustainability Participation',
      activity: 'ESG Corporate Quiz Series (18% turnout)',
      points: 2500,
      remarks: '15%-20% participation band verified.',
      evidenceUrl: '',
      verificationStatus: 'approved',
      verifiedBy: 'Prof. Marcus Vance',
      academicYear: '2026-27',
      month: 'July',
      date: '2026-07-22',
      createdAt: '2026-07-23T15:20:00Z'
    },
    {
      scoreId: 'sc-304',
      schoolId: 'school-c',
      category: 'Innovation Bonus',
      activity: 'Paperless ESG Financial Auditing Portal',
      points: 2200,
      remarks: 'Eliminated 18,000 sheets of paper during mid-term case study submissions.',
      evidenceUrl: '',
      verificationStatus: 'approved',
      verifiedBy: 'Dr. Evelyn Reed',
      academicYear: '2026-27',
      month: 'September',
      date: '2026-09-18',
      createdAt: '2026-09-19T13:40:00Z'
    },
    {
      scoreId: 'sc-305',
      schoolId: 'school-c',
      category: 'Sustainable Events',
      activity: 'Orientation Mixer - Single-use cups penalty',
      points: -2000,
      remarks: 'Audit team flagged disposable plastic coffee cups in courtyard disposal bins.',
      evidenceUrl: '',
      verificationStatus: 'approved',
      verifiedBy: 'Dr. Evelyn Reed',
      academicYear: '2026-27',
      month: 'July',
      date: '2026-07-08',
      createdAt: '2026-07-09T08:15:00Z'
    },

    // School D Entries
    {
      scoreId: 'sc-401',
      schoolId: 'school-d',
      category: 'Reuse & Resource Sharing',
      activity: 'Borrowing Exhibition Frames & Reusing for Thesis Review',
      points: 2000, // 1000 borrow + 1000 reuse
      remarks: 'Reused 45 modular metal display frames from previous semester exhibition.',
      evidenceUrl: '',
      verificationStatus: 'approved',
      verifiedBy: 'Green Audit Secretariat',
      academicYear: '2026-27',
      month: 'September',
      date: '2026-09-10',
      createdAt: '2026-09-11T14:00:00Z'
    },
    {
      scoreId: 'sc-402',
      schoolId: 'school-d',
      category: 'Innovation Bonus',
      activity: 'Passive Clay Evaporative Cooling Facade Prototype',
      points: 4000,
      remarks: 'Demonstrated 4.2°C temperature drop in workshop studio without electricity.',
      evidenceUrl: '',
      verificationStatus: 'approved',
      verifiedBy: 'Dr. Evelyn Reed',
      academicYear: '2026-27',
      month: 'August',
      date: '2026-08-14',
      createdAt: '2026-08-15T10:10:00Z'
    },
    {
      scoreId: 'sc-403',
      schoolId: 'school-d',
      category: 'Waste Collection Drive',
      activity: 'Scrap Timber & Acrylic Offcuts Upcycling Drive',
      points: 700,
      remarks: 'Medium tier collection: 140kg reclaimed modeling materials repurposed.',
      evidenceUrl: '',
      verificationStatus: 'approved',
      verifiedBy: 'Audit Committee',
      academicYear: '2026-27',
      month: 'July',
      date: '2026-07-19',
      createdAt: '2026-07-20T16:45:00Z'
    },

    // School E Entries
    {
      scoreId: 'sc-501',
      schoolId: 'school-e',
      category: 'Sustainability Participation',
      activity: 'Campus Ecological Policy Forum (34% attendance)',
      points: 3000,
      remarks: 'Over 30% participation verified across 4 departments.',
      evidenceUrl: '',
      verificationStatus: 'approved',
      verifiedBy: 'Prof. Marcus Vance',
      academicYear: '2026-27',
      month: 'September',
      date: '2026-09-06',
      createdAt: '2026-09-07T11:00:00Z'
    },
    {
      scoreId: 'sc-502',
      schoolId: 'school-e',
      category: 'Sustainable Events',
      activity: 'Poetry in the Park (Plastic-free)',
      points: 5000,
      remarks: 'Zero single-use plastics, solar sound system, recycled handmade paper notebooks.',
      evidenceUrl: '',
      verificationStatus: 'approved',
      verifiedBy: 'Dr. Evelyn Reed',
      academicYear: '2026-27',
      month: 'August',
      date: '2026-08-28',
      createdAt: '2026-08-29T12:30:00Z'
    },
    {
      scoreId: 'sc-503',
      schoolId: 'school-e',
      category: 'Waste Collection Drive',
      activity: 'Used Textbook & Journal Re-distribution (Low tier)',
      points: 300,
      remarks: '75 volumes collected and cataloged in open exchange library.',
      evidenceUrl: '',
      verificationStatus: 'approved',
      verifiedBy: 'Green Audit Secretariat',
      academicYear: '2026-27',
      month: 'July',
      date: '2026-07-12',
      createdAt: '2026-07-13T09:40:00Z'
    },

    // School F Entries
    {
      scoreId: 'sc-601',
      schoolId: 'school-f',
      category: 'Sustainable Events',
      activity: 'Health & Wellness Expo (Reusable items with low waste)',
      points: 1500, // 500 some reusable + 1000 less waste generated
      remarks: 'Strict hazardous chemical separation; low dry waste generation.',
      evidenceUrl: '',
      verificationStatus: 'approved',
      verifiedBy: 'Dr. Evelyn Reed',
      academicYear: '2026-27',
      month: 'September',
      date: '2026-09-14',
      createdAt: '2026-09-15T15:10:00Z'
    },
    {
      scoreId: 'sc-602',
      schoolId: 'school-f',
      category: 'Waste Collection Drive',
      activity: 'Unused Medical Blister Packs & Safe Glass Drive (High Tier)',
      points: 1200,
      remarks: '190kg glass and non-hazardous packaging routed to specialized processor.',
      evidenceUrl: '',
      verificationStatus: 'approved',
      verifiedBy: 'Green Audit Secretariat',
      academicYear: '2026-27',
      month: 'August',
      date: '2026-08-22',
      createdAt: '2026-08-23T14:00:00Z'
    },
    {
      scoreId: 'sc-603',
      schoolId: 'school-f',
      category: 'Reuse & Resource Sharing',
      activity: 'Borrowing Centrifuge Equipment from School B',
      points: 1000,
      remarks: 'Collaborative resource sharing agreement active.',
      evidenceUrl: '',
      verificationStatus: 'approved',
      verifiedBy: 'Prof. Marcus Vance',
      academicYear: '2026-27',
      month: 'July',
      date: '2026-07-29',
      createdAt: '2026-07-30T10:15:00Z'
    },

    // Pending Entry Example (DOES NOT count towards score)
    {
      scoreId: 'sc-999',
      schoolId: 'school-a',
      category: 'Waste Collection Drive',
      activity: 'Quarterly Dormitory Plastic Collection',
      points: 700,
      remarks: 'Awaiting weigh-bridge receipt and volunteer logs.',
      evidenceUrl: '',
      verificationStatus: 'pending',
      verifiedBy: 'Under Review',
      academicYear: '2026-27',
      month: 'September',
      date: '2026-09-23',
      createdAt: '2026-09-23T17:00:00Z'
    }
  ];

  // Default Announcements
  const DEFAULT_ANNOUNCEMENTS = [
    {
      announcementId: 'ann-1',
      title: 'September 2026 Leaderboard Verified & Published',
      description: 'The SustainX Green Audit Secretariat has finalized score audits for the September cycle. School B (BioGreen Institute) takes the lead with standout performances in plastic-free symposiums.',
      date: '2026-09-22',
      category: 'Leaderboard',
      createdBy: 'SustainX Audit Committee',
      published: true
    },
    {
      announcementId: 'ann-2',
      title: 'Zero Single-Use Plastic Mandate for Upcoming Fest Season',
      description: 'Reminder to all event organizers: Single-use plastic bottles, flex banners, and disposable plastic tableware incur a strict -2000 Green Point penalty under Category 1 guidelines.',
      date: '2026-09-18',
      category: 'Guidelines',
      createdBy: 'Dr. Evelyn Reed',
      published: true
    },
    {
      announcementId: 'ann-3',
      title: 'Inter-School Waste Collection Drive Kicks Off Next Week',
      description: 'Designated collection hubs will open at North and South Campus plazas. High-tier collections receive +1200 Green Points upon submission of recycling weigh-slips.',
      date: '2026-09-12',
      category: 'Events',
      createdBy: 'Operations Directorate',
      published: true
    },
    {
      announcementId: 'ann-4',
      title: 'Call for Green Innovation Submissions (Bonus Round)',
      description: 'Schools working on renewable prototypes, circular waste equipment, or AI smart bins are invited to submit their projects for audit review and up to +5000 Innovation Bonus points.',
      date: '2026-09-05',
      category: 'Innovation',
      createdBy: 'Prof. Marcus Vance',
      published: true
    }
  ];

  // Default Events & Initiatives
  const DEFAULT_EVENTS = [
    {
      eventId: 'ev-1',
      title: 'Inter-Campus Tree Plantation Drive',
      description: 'Planting 500 indigenous native saplings along the campus lake corridor with soil conservation experts.',
      date: '2026-10-04',
      schoolId: 'school-b',
      category: 'Sustainability Participation',
      location: 'Bio-reserve Green Belt',
      participants: '350+ Students'
    },
    {
      eventId: 'ev-2',
      title: 'Coastal & Riverfront Clean-Up Drive',
      description: 'Weekend volunteering drive to segregate and recover recyclable debris from local water basins.',
      date: '2026-10-11',
      schoolId: 'school-e',
      category: 'Waste Collection Drive',
      location: 'Riverfront Boardwalk',
      participants: '200 Volunteers'
    },
    {
      eventId: 'ev-3',
      title: 'Campus E-Waste Mega Drop-off Week',
      description: 'Safe collection of spent laptop batteries, circuit boards, and laboratory monitors with certified e-cyclers.',
      date: '2026-10-18',
      schoolId: 'school-a',
      category: 'Waste Collection Drive',
      location: 'Engineering Quadrangle',
      participants: 'All Departments'
    },
    {
      eventId: 'ev-4',
      title: 'Annual Sustainability Quiz & Case Competition',
      description: 'Battle of the brightest eco-minds testing knowledge on climate policy, circular economy, and net-zero targets.',
      date: '2026-10-25',
      schoolId: 'school-c',
      category: 'Sustainability Participation',
      location: 'University Auditorium',
      participants: 'Teams from all 6 Schools'
    },
    {
      eventId: 'ev-5',
      title: 'Campus Energy Saving & Blackout Challenge',
      description: 'Inter-hostel reduction sprint measuring electricity drawdowns with smart meters over 48 hours.',
      date: '2026-11-02',
      schoolId: 'school-a',
      category: 'Sustainable Events',
      location: 'Student Residences',
      participants: 'Campus Community'
    },
    {
      eventId: 'ev-6',
      title: 'Circular Design & Architecture Showcase',
      description: 'Exhibition of modular furniture made entirely from reclaimed shipping pallets and structural bio-composites.',
      date: '2026-11-08',
      schoolId: 'school-d',
      category: 'Reuse & Resource Sharing',
      location: 'Design Studio Atrium',
      participants: 'Design Guild'
    }
  ];

  // Default Users for Auth
  const DEFAULT_USERS = [
    {
      userId: 'usr-admin',
      name: 'Dr. Evelyn Reed',
      email: 'admin@sustainx.edu',
      password: 'admin123', // In demo/local mode; Firebase Auth is used when deployed
      role: 'admin',
      schoolId: 'school-b',
      title: 'Lead Green Auditor, SustainX',
      createdAt: '2026-07-01'
    },
    {
      userId: 'usr-student',
      name: 'Alex Morgan',
      email: 'student@sustainx.edu',
      password: 'student123',
      role: 'user',
      schoolId: 'school-a',
      title: 'Student Sustainability Representative',
      createdAt: '2026-08-10'
    }
  ];

  // -------------------------------------------------------------------------
  // Storage Helper Functions
  // -------------------------------------------------------------------------
  function loadFromStorage(key, fallback) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      console.warn('Storage read failed for', key, e);
      return fallback;
    }
  }

  function saveToStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage write failed for', key, e);
    }
  }

  // -------------------------------------------------------------------------
  // Initialization
  // -------------------------------------------------------------------------
  function initDataStore() {
    if (!localStorage.getItem(STORAGE_KEYS.INITIALIZED)) {
      saveToStorage(STORAGE_KEYS.SCHOOLS, DEFAULT_SCHOOLS);
      saveToStorage(STORAGE_KEYS.SCORES, DEFAULT_SCORES);
      saveToStorage(STORAGE_KEYS.ANNOUNCEMENTS, DEFAULT_ANNOUNCEMENTS);
      saveToStorage(STORAGE_KEYS.EVENTS, DEFAULT_EVENTS);
      saveToStorage(STORAGE_KEYS.USERS, DEFAULT_USERS);
      saveToStorage(STORAGE_KEYS.INITIALIZED, 'true');
    }
  }

  initDataStore();

  // -------------------------------------------------------------------------
  // SustainX Store API
  // -------------------------------------------------------------------------
  const DataStore = {
    CATEGORIES,

    // Reset back to initial demo data
    resetDemoData: function() {
      saveToStorage(STORAGE_KEYS.SCHOOLS, DEFAULT_SCHOOLS);
      saveToStorage(STORAGE_KEYS.SCORES, DEFAULT_SCORES);
      saveToStorage(STORAGE_KEYS.ANNOUNCEMENTS, DEFAULT_ANNOUNCEMENTS);
      saveToStorage(STORAGE_KEYS.EVENTS, DEFAULT_EVENTS);
      saveToStorage(STORAGE_KEYS.USERS, DEFAULT_USERS);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      return true;
    },

    // --- Schools ---
    getSchools: function(onlyActive = true) {
      const schools = loadFromStorage(STORAGE_KEYS.SCHOOLS, DEFAULT_SCHOOLS);
      return onlyActive ? schools.filter(s => s.active) : schools;
    },

    getSchoolById: function(schoolId) {
      const schools = loadFromStorage(STORAGE_KEYS.SCHOOLS, DEFAULT_SCHOOLS);
      return schools.find(s => s.schoolId === schoolId) || null;
    },

    addSchool: function(schoolData) {
      const schools = loadFromStorage(STORAGE_KEYS.SCHOOLS, DEFAULT_SCHOOLS);
      const newSchool = {
        schoolId: schoolData.schoolId || 'school-' + Date.now(),
        name: schoolData.name,
        shortName: schoolData.shortName || schoolData.name.split(' ')[0],
        logo: schoolData.logo || 'assets/logos/school-a.svg',
        description: schoolData.description || '',
        active: schoolData.active !== undefined ? schoolData.active : true,
        createdAt: new Date().toISOString()
      };
      schools.push(newSchool);
      saveToStorage(STORAGE_KEYS.SCHOOLS, schools);
      return newSchool;
    },

    updateSchool: function(schoolId, updatedFields) {
      const schools = loadFromStorage(STORAGE_KEYS.SCHOOLS, DEFAULT_SCHOOLS);
      const index = schools.findIndex(s => s.schoolId === schoolId);
      if (index === -1) return null;
      schools[index] = { ...schools[index], ...updatedFields };
      saveToStorage(STORAGE_KEYS.SCHOOLS, schools);
      return schools[index];
    },

    toggleSchoolStatus: function(schoolId) {
      const schools = loadFromStorage(STORAGE_KEYS.SCHOOLS, DEFAULT_SCHOOLS);
      const school = schools.find(s => s.schoolId === schoolId);
      if (school) {
        school.active = !school.active;
        saveToStorage(STORAGE_KEYS.SCHOOLS, schools);
        return school;
      }
      return null;
    },

    // --- Score Entries ---
    getScoreEntries: function(filters = {}) {
      let entries = loadFromStorage(STORAGE_KEYS.SCORES, DEFAULT_SCORES);

      if (filters.schoolId && filters.schoolId !== 'all') {
        entries = entries.filter(e => e.schoolId === filters.schoolId);
      }
      if (filters.category && filters.category !== 'all' && filters.category !== 'Overall') {
        entries = entries.filter(e => e.category === filters.category);
      }
      if (filters.academicYear && filters.academicYear !== 'all') {
        entries = entries.filter(e => e.academicYear === filters.academicYear);
      }
      if (filters.month && filters.month !== 'all') {
        entries = entries.filter(e => e.month === filters.month);
      }
      if (filters.verificationStatus && filters.verificationStatus !== 'all') {
        entries = entries.filter(e => e.verificationStatus === filters.verificationStatus);
      }
      if (filters.pointsType === 'positive') {
        entries = entries.filter(e => e.points > 0);
      } else if (filters.pointsType === 'negative') {
        entries = entries.filter(e => e.points < 0);
      }

      // Sort newest first
      return entries.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
    },

    addScoreEntry: function(entryData) {
      const entries = loadFromStorage(STORAGE_KEYS.SCORES, DEFAULT_SCORES);
      const currentUser = this.getCurrentUser();
      const verifiedBy = currentUser ? `${currentUser.name} (${currentUser.role.toUpperCase()})` : 'Audit Lead';

      const newEntry = {
        scoreId: 'sc-' + Date.now(),
        schoolId: entryData.schoolId,
        category: entryData.category,
        activity: entryData.activity,
        points: parseInt(entryData.points, 10) || 0,
        remarks: entryData.remarks || '',
        evidenceUrl: entryData.evidenceUrl || '',
        verificationStatus: entryData.verificationStatus || 'approved',
        verifiedBy: entryData.verifiedBy || verifiedBy,
        academicYear: entryData.academicYear || '2026-27',
        month: entryData.month || 'September',
        date: entryData.date || new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      };

      entries.unshift(newEntry);
      saveToStorage(STORAGE_KEYS.SCORES, entries);
      return newEntry;
    },

    deleteScoreEntry: function(scoreId) {
      let entries = loadFromStorage(STORAGE_KEYS.SCORES, DEFAULT_SCORES);
      entries = entries.filter(e => e.scoreId !== scoreId);
      saveToStorage(STORAGE_KEYS.SCORES, entries);
      return true;
    },

    // -----------------------------------------------------------------------
    // Core Calculation: Leaderboard with Dynamic Aggregation
    // Section 28: totalScore = sum(all approved scoreEntries for that school)
    // -----------------------------------------------------------------------
    calculateLeaderboard: function(category = 'Overall', month = 'all', academicYear = '2026-27') {
      const schools = this.getSchools(true);
      const allApprovedEntries = this.getScoreEntries({
        verificationStatus: 'approved',
        academicYear: academicYear === 'all' ? undefined : academicYear
      });

      // Filter entries by category and month if requested
      const currentFilteredEntries = allApprovedEntries.filter(e => {
        const matchesCategory = (category === 'Overall' || category === 'all') ? true : e.category === category;
        const matchesMonth = (month === 'all') ? true : e.month === month;
        return matchesCategory && matchesMonth;
      });

      // Also compute baseline (e.g. prior month or all prior entries) to calculate real rank change (↑, ↓, -)
      const priorMonthMap = {
        'September': 'August',
        'August': 'July',
        'October': 'September',
        'November': 'October'
      };
      const priorMonth = priorMonthMap[month];
      let priorFilteredEntries = [];
      if (priorMonth) {
        priorFilteredEntries = allApprovedEntries.filter(e => {
          const matchesCategory = (category === 'Overall' || category === 'all') ? true : e.category === category;
          return matchesCategory && e.month === priorMonth;
        });
      }

      // Calculate totals per school
      const schoolTotals = schools.map(school => {
        const schoolEntries = currentFilteredEntries.filter(e => e.schoolId === school.schoolId);
        const totalGreenPoints = schoolEntries.reduce((acc, curr) => acc + curr.points, 0);

        // Breakdown by category
        const categoryBreakdown = {};
        CATEGORIES.forEach(cat => {
          const catEntries = allApprovedEntries.filter(e => e.schoolId === school.schoolId && e.category === cat);
          categoryBreakdown[cat] = catEntries.reduce((sum, item) => sum + item.points, 0);
        });

        // Calculate prior month points to evaluate rank progression
        let priorPoints = 0;
        if (priorFilteredEntries.length > 0) {
          const priorEntries = priorFilteredEntries.filter(e => e.schoolId === school.schoolId);
          priorPoints = priorEntries.reduce((acc, curr) => acc + curr.points, 0);
        }

        return {
          ...school,
          totalGreenPoints,
          approvedCount: schoolEntries.length,
          categoryBreakdown,
          priorPoints
        };
      });

      // Sort descending by score
      schoolTotals.sort((a, b) => b.totalGreenPoints - a.totalGreenPoints);

      // Determine rank and movement (↑, ↓, -)
      const rankedLeaderboard = schoolTotals.map((school, index) => {
        const rank = index + 1;
        let change = '-';
        let changeType = 'neutral';

        // Dynamic change calculation
        if (priorMonth && school.priorPoints > 0) {
          // If total points gained this month significantly outpaced prior
          if (school.totalGreenPoints > school.priorPoints + 2000) {
            change = '↑';
            changeType = 'up';
          } else if (school.totalGreenPoints < school.priorPoints) {
            change = '↓';
            changeType = 'down';
          }
        } else {
          // Fallback realistic demo changes based on ranks
          if (rank === 1 || rank === 2) {
            change = '↑';
            changeType = 'up';
          } else if (rank === 3) {
            change = '-';
            changeType = 'neutral';
          } else if (rank === 4 || rank === 6) {
            change = '↓';
            changeType = 'down';
          } else {
            change = '↑';
            changeType = 'up';
          }
        }

        return {
          ...school,
          rank,
          change,
          changeType
        };
      });

      return rankedLeaderboard;
    },

    // Get single school profile analytics
    getSchoolProfileData: function(schoolId) {
      const school = this.getSchoolById(schoolId);
      if (!school) return null;

      const leaderboard = this.calculateLeaderboard('Overall', 'all');
      const rankEntry = leaderboard.find(s => s.schoolId === schoolId);
      const rank = rankEntry ? rankEntry.rank : '-';

      const approvedEntries = this.getScoreEntries({
        schoolId: schoolId,
        verificationStatus: 'approved'
      });

      const totalGreenPoints = approvedEntries.reduce((sum, item) => sum + item.points, 0);

      // Category breakdown
      const categoryBreakdown = {};
      CATEGORIES.forEach(cat => {
        const catEntries = approvedEntries.filter(e => e.category === cat);
        categoryBreakdown[cat] = catEntries.reduce((sum, item) => sum + item.points, 0);
      });

      // Monthly progression (July, August, September, October)
      const monthlyProgression = [
        { month: 'July', points: 0 },
        { month: 'August', points: 0 },
        { month: 'September', points: 0 },
        { month: 'October', points: 0 }
      ];

      monthlyProgression.forEach(item => {
        const mEntries = approvedEntries.filter(e => e.month === item.month);
        item.points = mEntries.reduce((sum, e) => sum + e.points, 0);
      });

      return {
        school,
        rank,
        totalGreenPoints,
        categoryBreakdown,
        monthlyProgression,
        recentEntries: approvedEntries.slice(0, 8),
        totalActivities: approvedEntries.length
      };
    },

    // --- Announcements ---
    getAnnouncements: function(publishedOnly = true) {
      const list = loadFromStorage(STORAGE_KEYS.ANNOUNCEMENTS, DEFAULT_ANNOUNCEMENTS);
      const filtered = publishedOnly ? list.filter(a => a.published) : list;
      return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    },

    addAnnouncement: function(data) {
      const list = loadFromStorage(STORAGE_KEYS.ANNOUNCEMENTS, DEFAULT_ANNOUNCEMENTS);
      const newAnn = {
        announcementId: 'ann-' + Date.now(),
        title: data.title,
        description: data.description,
        category: data.category || 'General',
        date: data.date || new Date().toISOString().split('T')[0],
        createdBy: data.createdBy || 'Admin Secretariat',
        published: data.published !== undefined ? data.published : true,
        createdAt: new Date().toISOString()
      };
      list.unshift(newAnn);
      saveToStorage(STORAGE_KEYS.ANNOUNCEMENTS, list);
      return newAnn;
    },

    deleteAnnouncement: function(id) {
      let list = loadFromStorage(STORAGE_KEYS.ANNOUNCEMENTS, DEFAULT_ANNOUNCEMENTS);
      list = list.filter(a => a.announcementId !== id);
      saveToStorage(STORAGE_KEYS.ANNOUNCEMENTS, list);
      return true;
    },

    // --- Events ---
    getEvents: function() {
      return loadFromStorage(STORAGE_KEYS.EVENTS, DEFAULT_EVENTS);
    },

    // --- Auth & Users ---
    getCurrentUser: function() {
      return loadFromStorage(STORAGE_KEYS.CURRENT_USER, null);
    },

    login: function(email, password) {
      const users = loadFromStorage(STORAGE_KEYS.USERS, DEFAULT_USERS);
      const user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password);
      if (user) {
        // Exclude password from current session storage for cleanliness
        const sessionUser = { ...user };
        delete sessionUser.password;
        saveToStorage(STORAGE_KEYS.CURRENT_USER, sessionUser);
        return { success: true, user: sessionUser };
      }
      return { success: false, message: 'Invalid email or password.' };
    },

    signup: function(userData) {
      const users = loadFromStorage(STORAGE_KEYS.USERS, DEFAULT_USERS);
      const existing = users.find(u => u.email.toLowerCase() === userData.email.trim().toLowerCase());
      if (existing) {
        return { success: false, message: 'An account with this email already exists.' };
      }

      // Security requirement: Normal signup NEVER allows choosing admin role
      const newUser = {
        userId: 'usr-' + Date.now(),
        name: userData.name,
        email: userData.email.trim().toLowerCase(),
        password: userData.password,
        role: 'user', // strictly forced to 'user'
        schoolId: userData.schoolId || 'school-a',
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      saveToStorage(STORAGE_KEYS.USERS, users);

      const sessionUser = { ...newUser };
      delete sessionUser.password;
      saveToStorage(STORAGE_KEYS.CURRENT_USER, sessionUser);

      return { success: true, user: sessionUser };
    },

    logout: function() {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      return true;
    },

    // Global Stats for Home & Admin Dashboard
    getPlatformStats: function() {
      const schools = this.getSchools(true);
      const approvedEntries = this.getScoreEntries({ verificationStatus: 'approved' });
      const totalGreenPoints = approvedEntries.reduce((sum, e) => sum + e.points, 0);
      const leaderboard = this.calculateLeaderboard('Overall', 'all');
      const currentLeader = leaderboard.length > 0 ? leaderboard[0] : null;

      return {
        totalSchools: schools.length,
        totalEntries: approvedEntries.length,
        totalGreenPoints: totalGreenPoints,
        totalCategories: CATEGORIES.length,
        currentLeader: currentLeader
      };
    }
  };

  window.SustainX = window.SustainX || {};
  window.SustainX.DataStore = DataStore;

})(window);
