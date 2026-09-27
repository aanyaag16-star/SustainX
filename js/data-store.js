/**
 * SUSTAINX - Green Campus Challenge
 * Core Data Store & Dynamic Calculation Engine (Firebase Integrated)
 */

(function(window) {
  'use strict';

  // Exact categories specified in SustainX guidelines
  const CATEGORIES = [
    'Sustainable Events',
    'Reuse & Resource Sharing',
    'Waste Collection Drive',
    'Sustainability Participation',
    'Innovation Bonus'
  ];

  const DEFAULT_SCHOOLS = [
    { schoolId: 'school-a', name: 'School of Engineering & Technology', shortName: 'Apex Tech', logo: 'assets/logos/school-a.svg', description: 'Department of Computing, Mechanical, and Sustainable Energy Systems.', studentCount: 2400, active: true, createdAt: '2026-07-01' },
    { schoolId: 'school-b', name: 'School of Environmental Sciences', shortName: 'BioGreen Institute', logo: 'assets/logos/school-b.svg', description: 'Institute for Ecological Research, Climate Modeling, and Forestry.', studentCount: 1200, active: true, createdAt: '2026-07-01' },
    { schoolId: 'school-c', name: 'School of Management & Commerce', shortName: 'Pinnacle Business School', logo: 'assets/logos/school-c.svg', description: 'Faculty of Sustainable Finance, ESG Leadership, and Marketing.', studentCount: 1800, active: true, createdAt: '2026-07-01' },
    { schoolId: 'school-d', name: 'School of Architecture & Design', shortName: 'Terran Design Guild', logo: 'assets/logos/school-d.svg', description: 'Studio for Biophilic Urbanism, Circular Design, and Zero-Carbon Buildings.', studentCount: 950, active: true, createdAt: '2026-07-01' },
    { schoolId: 'school-e', name: 'School of Humanities & Social Sciences', shortName: 'Verdant Liberal Arts', logo: 'assets/logos/school-e.svg', description: 'Department of Environmental Ethics, Policy Advocacy, and Sociology.', studentCount: 1400, active: true, createdAt: '2026-07-01' },
    { schoolId: 'school-f', name: 'School of Applied Sciences & Medicine', shortName: 'Nova Health Sciences', logo: 'assets/logos/school-f.svg', description: 'Center for Green Healthcare, Biochemical Safety, and Public Health.', studentCount: 1600, active: true, createdAt: '2026-07-01' }
  ];

  // In-memory cache synced with Firestore
  const cache = {
    schools: [],
    scores: [],
    announcements: [],
    events: [],
    users: [],
    currentUser: null
  };

  let db = null;
  let auth = null;

  const DataStore = {
    CATEGORIES,

    initFirebase: async function() {
      // Wait for Firebase to initialize
      await window.SustainX.Firebase.init();
      if (window.SustainX.Firebase.isFirebaseEnabled && window.firebase) {
        db = firebase.firestore();
        auth = firebase.auth();
        
        // Listen to Auth state and block until first resolution
        await new Promise((resolve) => {
          let isResolved = false;
          auth.onAuthStateChanged(async (user) => {
            if (user) {
              const doc = await db.collection('users').doc(user.uid).get();
              if (doc.exists) {
                cache.currentUser = { uid: user.uid, ...doc.data() };
              }
            } else {
              cache.currentUser = null;
            }
            if (!isResolved) {
              isResolved = true;
              resolve();
            }
          });
        });

        try {
          // Load Schools
          const schoolsSnap = await db.collection('schools').get();
          if (schoolsSnap.empty) {
            // Populate default schools
            for (const s of DEFAULT_SCHOOLS) {
              await db.collection('schools').doc(s.schoolId).set(s);
            }
            cache.schools = [...DEFAULT_SCHOOLS];
          } else {
            cache.schools = schoolsSnap.docs.map(doc => doc.data());
          }

          // Load Scores
          const scoresSnap = await db.collection('scoreEntries').get();
          cache.scores = scoresSnap.docs.map(doc => doc.data());

          // Load Announcements
          const annSnap = await db.collection('announcements').get();
          cache.announcements = annSnap.docs.map(doc => doc.data());

          // Load Events
          const eventsSnap = await db.collection('events').get();
          cache.events = eventsSnap.docs.map(doc => doc.data());
        } catch (error) {
          console.error("Firebase data load error:", error);
          cache.schools = [...DEFAULT_SCHOOLS]; // Fallback so UI doesn't break
        }
        
      } else {
        // Fallback to empty if Firebase fails
        cache.schools = [...DEFAULT_SCHOOLS];
      }
    },

    // --- Schools ---
    getSchools: function(onlyActive = true) {
      return onlyActive ? cache.schools.filter(s => s.active) : cache.schools;
    },
    getSchoolById: function(schoolId) {
      return cache.schools.find(s => s.schoolId === schoolId) || null;
    },
    addSchool: async function(schoolData) {
      const newSchool = {
        schoolId: schoolData.schoolId || 'school-' + Date.now(),
        name: schoolData.name,
        shortName: schoolData.shortName || schoolData.name.split(' ')[0],
        logo: schoolData.logo || 'assets/logos/school-a.svg',
        description: schoolData.description || '',
        active: schoolData.active !== undefined ? schoolData.active : true,
        createdAt: new Date().toISOString()
      };
      cache.schools.push(newSchool);
      if (db) await db.collection('schools').doc(newSchool.schoolId).set(newSchool);
      return newSchool;
    },
    updateSchool: async function(schoolId, updatedFields) {
      const index = cache.schools.findIndex(s => s.schoolId === schoolId);
      if (index === -1) return null;
      cache.schools[index] = { ...cache.schools[index], ...updatedFields };
      if (db) await db.collection('schools').doc(schoolId).update(updatedFields);
      return cache.schools[index];
    },
    toggleSchoolStatus: async function(schoolId) {
      const school = cache.schools.find(s => s.schoolId === schoolId);
      if (school) {
        school.active = !school.active;
        if (db) await db.collection('schools').doc(schoolId).update({ active: school.active });
        return school;
      }
      return null;
    },

    // --- Score Entries ---
    getScoreEntries: function(filters = {}) {
      let entries = [...cache.scores];
      if (filters.schoolId && filters.schoolId !== 'all') entries = entries.filter(e => e.schoolId === filters.schoolId);
      if (filters.category && filters.category !== 'all' && filters.category !== 'Overall') entries = entries.filter(e => e.category === filters.category);
      if (filters.academicYear && filters.academicYear !== 'all') entries = entries.filter(e => e.academicYear === filters.academicYear);
      if (filters.month && filters.month !== 'all') entries = entries.filter(e => e.month === filters.month);
      if (filters.verificationStatus && filters.verificationStatus !== 'all') entries = entries.filter(e => e.verificationStatus === filters.verificationStatus);
      if (filters.pointsType === 'positive') entries = entries.filter(e => e.points > 0);
      else if (filters.pointsType === 'negative') entries = entries.filter(e => e.points < 0);
      return entries.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
    },
    addScoreEntry: async function(entryData) {
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
      cache.scores.unshift(newEntry);
      if (db) await db.collection('scoreEntries').doc(newEntry.scoreId).set(newEntry);
      return newEntry;
    },
    deleteScoreEntry: async function(scoreId) {
      cache.scores = cache.scores.filter(e => e.scoreId !== scoreId);
      if (db) await db.collection('scoreEntries').doc(scoreId).delete();
      return true;
    },

    calculateLeaderboard: function(category = 'Overall', month = 'all', academicYear = '2026-27') {
      const schools = this.getSchools(true);
      const allApprovedEntries = this.getScoreEntries({ verificationStatus: 'approved', academicYear: academicYear === 'all' ? undefined : academicYear });
      const currentFilteredEntries = allApprovedEntries.filter(e => {
        const matchesCategory = (category === 'Overall' || category === 'all') ? true : e.category === category;
        const matchesMonth = (month === 'all') ? true : e.month === month;
        return matchesCategory && matchesMonth;
      });
      const priorMonthMap = { 'September': 'August', 'August': 'July', 'October': 'September', 'November': 'October' };
      const priorMonth = priorMonthMap[month];
      let priorFilteredEntries = [];
      if (priorMonth) {
        priorFilteredEntries = allApprovedEntries.filter(e => {
          const matchesCategory = (category === 'Overall' || category === 'all') ? true : e.category === category;
          return matchesCategory && e.month === priorMonth;
        });
      }
      const schoolTotals = schools.map(school => {
        const schoolEntries = currentFilteredEntries.filter(e => e.schoolId === school.schoolId);
        const totalGreenPoints = schoolEntries.reduce((acc, curr) => acc + curr.points, 0);
        const categoryBreakdown = {};
        CATEGORIES.forEach(cat => {
          const catEntries = allApprovedEntries.filter(e => e.schoolId === school.schoolId && e.category === cat);
          categoryBreakdown[cat] = catEntries.reduce((sum, item) => sum + item.points, 0);
        });
        let priorPoints = 0;
        if (priorFilteredEntries.length > 0) {
          const priorEntries = priorFilteredEntries.filter(e => e.schoolId === school.schoolId);
          priorPoints = priorEntries.reduce((acc, curr) => acc + curr.points, 0);
        }
        return { ...school, totalGreenPoints, approvedCount: schoolEntries.length, categoryBreakdown, priorPoints };
      });
      schoolTotals.sort((a, b) => b.totalGreenPoints - a.totalGreenPoints);
      return schoolTotals.map((school, index) => {
        const rank = index + 1;
        let change = '-';
        let changeType = 'neutral';
        if (priorMonth && school.priorPoints > 0) {
          if (school.totalGreenPoints > school.priorPoints + 2000) { change = '↑'; changeType = 'up'; }
          else if (school.totalGreenPoints < school.priorPoints) { change = '↓'; changeType = 'down'; }
        } else {
          if (rank === 1 || rank === 2) { change = '↑'; changeType = 'up'; }
          else if (rank === 3) { change = '-'; changeType = 'neutral'; }
          else if (rank === 4 || rank === 6) { change = '↓'; changeType = 'down'; }
          else { change = '↑'; changeType = 'up'; }
        }
        return { ...school, rank, change, changeType };
      });
    },

    getSchoolProfileData: function(schoolId) {
      const school = this.getSchoolById(schoolId);
      if (!school) return null;
      const leaderboard = this.calculateLeaderboard('Overall', 'all');
      const rankEntry = leaderboard.find(s => s.schoolId === schoolId);
      const rank = rankEntry ? rankEntry.rank : '-';
      const approvedEntries = this.getScoreEntries({ schoolId: schoolId, verificationStatus: 'approved' });
      const totalGreenPoints = approvedEntries.reduce((sum, item) => sum + item.points, 0);
      const categoryBreakdown = {};
      CATEGORIES.forEach(cat => {
        const catEntries = approvedEntries.filter(e => e.category === cat);
        categoryBreakdown[cat] = catEntries.reduce((sum, item) => sum + item.points, 0);
      });
      const monthlyProgression = [ { month: 'July', points: 0 }, { month: 'August', points: 0 }, { month: 'September', points: 0 }, { month: 'October', points: 0 } ];
      monthlyProgression.forEach(item => {
        const mEntries = approvedEntries.filter(e => e.month === item.month);
        item.points = mEntries.reduce((sum, e) => sum + e.points, 0);
      });
      return { school, rank, totalGreenPoints, categoryBreakdown, monthlyProgression, recentEntries: approvedEntries.slice(0, 8), totalActivities: approvedEntries.length };
    },

    // --- Announcements ---
    getAnnouncements: function(publishedOnly = true) {
      const list = cache.announcements;
      const filtered = publishedOnly ? list.filter(a => a.published) : list;
      return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    },
    addAnnouncement: async function(data) {
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
      cache.announcements.unshift(newAnn);
      if (db) await db.collection('announcements').doc(newAnn.announcementId).set(newAnn);
      return newAnn;
    },
    deleteAnnouncement: async function(id) {
      cache.announcements = cache.announcements.filter(a => a.announcementId !== id);
      if (db) await db.collection('announcements').doc(id).delete();
      return true;
    },

    // --- Events ---
    getEvents: function() {
      return cache.events;
    },

    // --- Auth & Users ---
    getCurrentUser: function() {
      return cache.currentUser;
    },
    login: async function(email, password) {
      if (!auth) return { success: false, message: 'Firebase not initialized.' };
      try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const doc = await db.collection('users').doc(userCredential.user.uid).get();
        if (doc.exists) {
          cache.currentUser = { uid: userCredential.user.uid, ...doc.data() };
          return { success: true, user: cache.currentUser };
        } else {
          return { success: false, message: 'User record not found.' };
        }
      } catch (error) {
        return { success: false, message: error.message };
      }
    },
    signup: async function(userData) {
      if (!auth) return { success: false, message: 'Firebase not initialized.' };
      try {
        const userCredential = await auth.createUserWithEmailAndPassword(userData.email, userData.password);
        const newUser = {
          name: userData.name,
          email: userData.email.trim().toLowerCase(),
          role: 'user', // strictly forced to 'user'
          schoolId: userData.schoolId || 'school-a',
          createdAt: new Date().toISOString()
        };
        await db.collection('users').doc(userCredential.user.uid).set(newUser);
        cache.currentUser = { uid: userCredential.user.uid, ...newUser };
        return { success: true, user: cache.currentUser };
      } catch (error) {
        return { success: false, message: error.message };
      }
    },
    logout: async function() {
      if (auth) await auth.signOut();
      cache.currentUser = null;
      return true;
    },

    getPlatformStats: function() {
      const schools = this.getSchools(true);
      const approvedEntries = this.getScoreEntries({ verificationStatus: 'approved' });
      const totalGreenPoints = approvedEntries.reduce((sum, e) => sum + e.points, 0);
      const leaderboard = this.calculateLeaderboard('Overall', 'all');
      const currentLeader = leaderboard.length > 0 ? leaderboard[0] : null;
      return { totalSchools: schools.length, totalEntries: approvedEntries.length, totalGreenPoints: totalGreenPoints, totalCategories: CATEGORIES.length, currentLeader: currentLeader };
    }
  };

  window.SustainX = window.SustainX || {};
  window.SustainX.DataStore = DataStore;

})(window);
