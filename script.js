/* ==================================================================
 * STUDENT PORTAL (Front-End Only Simulation)
 * ==================================================================
 * 0. App Initialization & Auth
 * 1. Mock Data & LocalStorage
 * 2. UI Module (Navigation, Modals, Toasts, Themes, etc.)
 * 3. Dashboard Module
 * 4. Academics Module (Grades, GPA, Exam Permit, E-Classroom)
 * 5. Finance Module
 * 6. Clearance Module
 * 7. Registration (Enrollment/Reg. Form) Module
 * 8. Profile Module
 * 9. Document Request Module
 * 10. Notifications Module (NEW)
 * 11. Calendar Module
 * 12. Other Modules (Library, Announcements, Chatbot)
 * 13. Smart Features (Reminders, Timer, Easter Egg)
 * 14. Accessibility
 * 15. Kickstart App
 * ================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // (Global libraries, assumed to be loaded from CDN)
    const ChartJS = window.Chart;
    const jsPDF = window.jspdf.jsPDF;
    const html2canvas = window.html2canvas;

    const App = {
        // --- App State ---
        data: {}, // Holds all student data
        charts: {}, // To store chart instances for updates
        pageHistory: ['dashboard'], // For Back Button
        pomodoro: {
            timerId: null,
            minutes: 25,
            seconds: 0,
            isRunning: false,
        },
        konamiCode: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'],
        konamiIndex: 0,

        // ==================================================================
        // 0. APP AUTHENTICATION & INITIALIZATION
        // ==================================================================
        checkAuthentication() {
            // Check both session (tab) and local (remember me) storage
            if (localStorage.getItem('portalSessionActive') === 'true' ||
                sessionStorage.getItem('portalSessionActive') === 'true') {

                // Show the portal (fromLogin = false, so no splash)
                this.showPortal(false);
                // Init all portal modules
                this.init();
            } else {
                // Show the login screen
                this.showLogin();
            }
        },

        showLogin() {
            // Ensure portal elements are hidden
            document.getElementById('splash-screen')?.classList.add('hidden');
            document.querySelector('.portal-container')?.classList.add('hidden');
            document.getElementById('chatbot-container')?.classList.add('hidden');

            // Show login screen
            const loginScreen = document.getElementById('login-screen');
            if (loginScreen) {
                loginScreen.classList.remove('hidden');
            }

            // Add login listener
            const loginForm = document.getElementById('login-form');
            if (loginForm) {
                // Add listener for login submission
                loginForm.addEventListener('submit', this.handleLogin.bind(this));
            }
             // Add listener for "Forgot Password"
            const forgotLink = document.querySelector('.forgot-password');
            if (forgotLink) {
                forgotLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    UI.showToast("Forgot Password feature is not implemented in this demo.", "info");
                });
            }
        },

        handleLogin(e) {
            e.preventDefault();
            const studentId = document.getElementById('student-id').value;
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('remember-me').checked;
            const errorMsg = document.getElementById('login-error');
            const loginBtn = document.getElementById('login-btn');

            // Disable button
            loginBtn.disabled = true;
            loginBtn.querySelector('span').textContent = 'Logging in...';

            // --- Hardcoded Login Check ---
            // (Using the default student ID from mock data: 2025-00001)
            // (Using a simple demo password: "password")

            // Simulate network delay
            setTimeout(() => {
                if (studentId === '2025-00001' && password === 'password') {
                    // --- Success ---
                    if (rememberMe) {
                        localStorage.setItem('portalSessionActive', 'true');
                    }
                    sessionStorage.setItem('portalSessionActive', 'true'); // Save for session anyway

                    this.showPortal(true); // true = from login, so show splash
                    this.init(); // Init the portal app

                } else {
                    // --- Failure ---
                    if (errorMsg) {
                        errorMsg.textContent = 'Invalid Student ID or Password.';
                        errorMsg.classList.remove('hidden');
                    }
                    // Add shake animation to login box
                    document.getElementById('login-box')?.classList.add('shake');
                    setTimeout(() => {
                        document.getElementById('login-box')?.classList.remove('shake');
                    }, 500);

                    // Re-enable button
                    loginBtn.disabled = false;
                    loginBtn.querySelector('span').textContent = 'Login';
                }
            }, 500); // 0.5 second delay
        },

        handleLogout() {
            UI.showConfirmation("Are you sure you want to logout?", "You will be returned to the login screen.", () => {
                localStorage.removeItem('portalSessionActive');
                sessionStorage.removeItem('portalSessionActive');
                // Don't reset data, just log out
                UI.showToast("Logging out...", "info");
                setTimeout(() => location.reload(), 500); // Reload to reset state
            });
        },

        showPortal(fromLogin = false) {
            const splash = document.getElementById('splash-screen');
            const portal = document.querySelector('.portal-container');
            const chatbot = document.getElementById('chatbot-container');
            const login = document.getElementById('login-screen');

            if (login) login.classList.add('hidden');

            if (fromLogin && splash) {
                // If logging in, show the splash screen first
                splash.classList.remove('hidden');
            }

            // Un-hide the main portal elements
            if (portal) portal.classList.remove('hidden');
            if (chatbot) chatbot.classList.remove('hidden');
        },

        init() {
            // 1. Load Data
            Data.init();
            this.data = Data.get();

            // 2. Init UI Components
            UI.init(); // This will now set up the *new* logout listener
            UI.initTheme();
            UI.updateLiveDateTime();
            setInterval(UI.updateLiveDateTime, 1000); // Update time every second

            // 3. Load Modules (Ensure correct order if dependencies exist)
            Dashboard.init();
            Academics.init();
            Finance.init();
            Clearance.init();
            Registration.init();
            Profile.init();
            Documents.init();
            Announcements.init();
            Library.init();
            Chatbot.init();
            Notifications.init(); // <<<--- ADDED HERE
            Calendar.init();
            SmartFeatures.init();
            Accessibility.init();

             // Ensure initial page load also shows the correct back button state and content
             UI.navigateToPage(App.pageHistory[App.pageHistory.length - 1], false);

            // 4. Final step: Hide splash screen (if it was shown)
            const splash = document.getElementById('splash-screen');
            if (splash && !splash.classList.contains('hidden')) {
                // Only run splash logic if it's visible (i.e., fromLogin was true)
                setTimeout(() => {
                    splash.style.opacity = '0';
                    setTimeout(() => {
                        splash.classList.add('hidden');
                    }, 500);
                }, 1000);
            } else if (splash) {
                // If splash is hidden (e.g., "Remember Me" was on), just hide it completely.
                splash.classList.add('hidden');
            }


            // 5. Show tutorial on first visit (only if logged in)
            if (!localStorage.getItem('portalVisited')) {
                UI.showTutorial();
                localStorage.setItem('portalVisited', 'true');
            }
        },
    };

    // ==================================================================
    // 1. MOCK DATA & LOCALSTORAGE
    // ==================================================================
    const Data = {
        // Default data structure
        defaultData: {
            profile: {
                name: "Juan Dela Cruz",
                id: "2025-00001",
                course: "BS in Information Technology",
                year: "2nd Year",
                term: "1st Semester, SY 2025-2026",
                status: "Regular",
                email: "juan.delacruz@school.edu",
                contact: "0917-123-4567",
                photo: "https://i.pravatar.cc/150",
                birthday: "2004-10-25", // For birthday greeting
            },
            subjects: [
                { code: "ITP101", name: "Intro to Programming", instructor: "Dr. A. Reyes", units: 3, schedule: "MWF 9-10AM" },
                { code: "WEBDEVT", name: "Web Development", instructor: "Prof. M. Santos", units: 3, schedule: "TTH 1-2:30PM" },
                { code: "DATASTRU", name: "Data Structures", instructor: "Dr. L. Gomez", units: 3, schedule: "MWF 11-12PM" },
                { code: "PHILO101", name: "Philosophy of Man", instructor: "Prof. R. David", units: 2, schedule: "TTH 10-11AM" },
                { code: "PE3", name: "Physical Education 3", instructor: "Mr. J. Basa", units: 2, schedule: "SAT 8-10AM" },
            ],
            grades: [
                { code: "ITP101", midterm: 90, final: 92, overall: 91, equivalent: 1.50 },
                { code: "WEBDEVT", midterm: 88, final: 94, overall: 91, equivalent: 1.50 },
                { code: "DATASTRU", midterm: 85, final: 88, overall: 87, equivalent: 1.75 },
                { code: "PHILO101", midterm: 95, final: 96, overall: 96, equivalent: 1.00 },
                { code: "PE3", midterm: 92, final: 92, overall: 92, equivalent: 1.25 },
            ],
            examSchedule: [
                { subject: "ITP101", date: "2025-10-22", time: "9:00 AM - 11:00 AM", room: "RM 301" },
                { subject: "WEBDEVT", date: "2025-10-21", time: "1:00 PM - 3:00 PM", room: "Lab 5" },
                { subject: "DATASTRU", date: "2025-10-23", time: "11:00 AM - 1:00 PM", room: "RM 302" },
                { subject: "PHILO101", date: "2025-10-24", time: "10:00 AM - 12:00 PM", room: "RM 210" },
                { subject: "PE3", date: "2025-10-25", time: "8:00 AM - 10:00 AM", room: "Gym" },
            ],
            attendance: [
                { subject: "ITP101", percentage: 95 },
                { subject: "WEBDEVT", percentage: 100 },
                { subject: "DATASTRU", percentage: 90 },
                { subject: "PHILO101", percentage: 100 },
                { subject: "PE3", percentage: 98 },
            ],
            finance: {
                total: 25000.00,
                balance: 5000.00,
                promissoryPending: false,
                breakdown: [
                    { name: "Tuition Fee", amount: 18000.00 },
                    { name: "Lab Fee", amount: 3000.00 },
                    { name: "Misc. Fees", amount: 4000.00 },
                    { name: "Discount", amount: -0.00 },
                ],
                history: [
                    { date: "2025-08-15", ref: "DP-12345", desc: "Downpayment", amount: 10000.00, status: "Paid" },
                    { date: "2025-09-15", ref: "PAY-67890", desc: "Midterm Payment", amount: 10000.00, status: "Paid" },
                ],
            },
            clearance: {
                "Accounting": "Pending",
                "Registrar": "Cleared",
                "Library": "Pending",
                "Medical": "Cleared",
                "Department": "Cleared",
            },
            registration: {
                enrolled: true,
                newStudentData: {
                    semester: "1st Semester",
                    course: "BSIT",
                    subjects: []
                }
            },
            documents: {
                requests: [
                    { ref: "DR-20251015-0001", doc: "Certificate of Enrollment", date: "2025-10-15", payment: "Paid", status: "Ready for Pickup", total: 75.00, copies: 1 }
                ],
                pendingRequest: null
            },
            announcements: [
                { id: 1, tag: "Academic", title: "Final Exam Schedule Posted", date: "Oct 18, 2025", content: "The final examination schedule for the 1st Semester is now available under 'Academics' > 'Exam Schedule'. Please check yours accordingly." },
                { id: 2, tag: "Finance", title: "Payment Deadline for Finals", date: "Oct 17, 2025", content: "The deadline for full payment of tuition to be eligible for the final exams is on October 20, 2025. Please settle your balances to avoid inconvenience." },
                { id: 3, tag: "General", title: "University Day Celebration", date: "Oct 16, 2025", content: "Join us for the 50th University Day on October 30! No classes will be held. Events include a parade, talent show, and fireworks display." },
            ],
            library: [
                { title: "Clean Code by Robert C. Martin", borrowed: "2025-10-01", due: "2025-10-15", fine: 50.00 },
                { title: "Data Structures and Algorithms", borrowed: "2025-10-10", due: "2025-10-24", fine: 0.00 },
            ],
            // <<<--- ADDED NOTIFICATIONS ARRAY --->>>
            notifications: [
                { id: 3, message: "Payment deadline for Finals is approaching.", time: "2025-10-17T10:30:00", unread: true, linkPage: "finance" },
                { id: 2, message: "New Announcement: University Day Celebration.", time: "2025-10-16T14:00:00", unread: true, linkPage: "announcements" },
                { id: 1, message: "Your document request DR-20251015-0001 is ready for pickup.", time: "2025-10-15T09:00:00", unread: false, linkPage: "documents" }
            ]
        },

        init() {
            let currentData = localStorage.getItem('studentPortalData');
            if (!currentData) {
                console.log('Initializing LocalStorage with default data...');
                this.save(this.defaultData);
            } else {
                try {
                    let parsedData = JSON.parse(currentData);
                    // Ensure essential nested objects exist
                    parsedData.finance = parsedData.finance || {};
                    parsedData.profile = parsedData.profile || {};
                    parsedData.registration = parsedData.registration || {};
                    parsedData.documents = parsedData.documents || {};
                    parsedData.documents.requests = parsedData.documents.requests || [];
                    parsedData.subjects = parsedData.subjects || [];
                    parsedData.grades = parsedData.grades || [];
                    parsedData.attendance = parsedData.attendance || [];
                    parsedData.library = parsedData.library || [];
                    parsedData.announcements = parsedData.announcements || [];
                    parsedData.examSchedule = parsedData.examSchedule || [];
                    parsedData.notifications = parsedData.notifications || []; // <<<--- ADDED THIS CHECK

                    // Check for promissoryPending specifically
                    if (parsedData.finance.promissoryPending === undefined) {
                        console.log('Adding missing promissoryPending key...');
                        parsedData.finance.promissoryPending = false;
                    }
                    // Remove assignments if migrating from old version
                    if (parsedData.assignments) {
                        console.log('Removing obsolete assignments data...');
                        delete parsedData.assignments;
                    }

                    this.save(parsedData); // Save potentially updated structure
                } catch (e) {
                     console.error("Error parsing/updating LocalStorage data on init: ", e);
                     this.save(this.defaultData); // Reset on error
                }
            }
        },

        get() {
            try {
                return JSON.parse(localStorage.getItem('studentPortalData')) || this.defaultData;
            } catch (e) {
                console.error("Error parsing LocalStorage data on get: ", e);
                this.save(this.defaultData);
                return this.defaultData;
            }
        },

        save(data) {
            try {
                localStorage.setItem('studentPortalData', JSON.stringify(data));
                App.data = data;
            } catch (e) {
                console.error("Error saving to LocalStorage: ", e);
                UI.showToast("Error saving data. Storage might be full.", "error");
            }
        },

        update(path, value) {
            let currentData = this.get();
            let keys = path.split('.');
            let obj = currentData;
            for (let i = 0; i < keys.length - 1; i++) {
                if (!obj[keys[i]]) obj[keys[i]] = {};
                obj = obj[keys[i]];
            }
            obj[keys[keys.length - 1]] = value;
            this.save(currentData);
        },

        reset() {
            // This function is no longer called by logout,
            // but can be used for a hard reset if needed.
            localStorage.removeItem('studentPortalData');
            localStorage.removeItem('portalSessionActive');
            sessionStorage.removeItem('portalSessionActive');
            localStorage.removeItem('portalVisited');
            location.reload();
        }
    };

    // ==================================================================
    // 2. UI MODULE (Navigation, Modals, Toasts, Themes, etc.)
    // ==================================================================
    const UI = {
        init() {
            // Global navigation listener
            document.body.addEventListener('click', this.handleNavigation);

            // Sidebar Toggle (Req #4)
            document.getElementById('sidebar-toggle').addEventListener('click', this.toggleSidebar);

            // Theme & Dark Mode
            document.getElementById('dark-mode-toggle').addEventListener('click', this.toggleDarkMode);
            document.getElementById('theme-selector').addEventListener('change', this.changeTheme);

            // Modals & Overlays
            document.getElementById('close-tutorial').addEventListener('click', this.closeTutorial);
            document.getElementById('modal-cancel-btn').addEventListener('click', () => this.hideModal());

            // Logout (now handled by App.handleLogout)
            document.getElementById('logout-btn').addEventListener('click', App.handleLogout);

            // Focus Mode
            document.getElementById('focus-mode-toggle').addEventListener('click', this.toggleFocusMode);

            // Back Button
            document.getElementById('back-btn').addEventListener('click', this.navigateBack);
        },

        handleNavigation(e) {
            const link = e.target.closest('.nav-link');
            if (link) {
                e.preventDefault();
                const pageId = link.dataset.page;
                const isActive = link.closest('.sidebar-menu') && link.classList.contains('active');
                if (pageId && !isActive) {
                    UI.navigateToPage(pageId);
                }
            }
        },

        navigateBack() {
            if (App.pageHistory.length > 1) {
                App.pageHistory.pop();
                const lastPageId = App.pageHistory[App.pageHistory.length - 1];
                UI.navigateToPage(lastPageId, false);
            } else {
                UI.navigateToPage('dashboard', false);
            }
        },

        navigateToPage(pageId, pushToHistory = true) {
            document.querySelectorAll('.page-content').forEach(page => {
                page.classList.remove('active');
            });
            document.querySelectorAll('.sidebar-menu .nav-link').forEach(link => {
                link.classList.remove('active');
            });

            const targetPage = document.getElementById(`page-${pageId}`);
            if (targetPage) {
                targetPage.classList.add('active');
            } else {
                console.error(`Page with ID 'page-${pageId}' not found.`);
                pageId = 'dashboard'; // Fallback
                document.getElementById('page-dashboard').classList.add('active');
                pushToHistory = true; // Force push dashboard if fallback
            }

            let title = 'Dashboard';
            const targetLink = document.querySelector(`.sidebar-menu .nav-link[data-page="${pageId}"]`);
            if (targetLink) {
                targetLink.classList.add('active');
                title = targetLink.querySelector('span') ? targetLink.querySelector('span').textContent.trim() : pageId;
            } else if (pageId === 'profile') {
                title = 'Profile';
            }
            document.getElementById('page-title').textContent = title;

            if (pushToHistory && App.pageHistory[App.pageHistory.length - 1] !== pageId) {
                App.pageHistory.push(pageId);
            }
             document.getElementById('back-btn').style.display = (App.pageHistory.length <= 1) ? 'none' : 'inline-block'; // Use length <= 1

            if (window.innerWidth <= 1024) {
                 // Close sidebar only if it's currently open (Req #4 fix)
                 if (document.body.classList.contains('sidebar-open')) {
                     this.toggleSidebar(); // Use the toggle function
                 }
            }

            if (pageId === 'registration') {
                Registration.loadView();
            }
             if (pageId === 'academics') {
                 // Load data for the default/first tab when navigating to academics
                 const firstTab = document.querySelector('#page-academics .tab-link')?.dataset.tab;
                 if (firstTab) Academics.loadTabData(firstTab);
                 // Ensure first tab is visually active if none are
                 const activeTab = document.querySelector('#page-academics .tab-link.active');
                 if (!activeTab && firstTab) {
                     document.querySelector('#page-academics .tab-link')?.classList.add('active');
                     document.getElementById(firstTab)?.classList.add('active');
                 }
            }
            if (pageId === 'calendar') {
                Calendar.loadCalendar();
            }
        },

        // FIXED (Req #4): Correct toggle function
        toggleSidebar() {
            const body = document.body;
             // On desktop, this might trigger focus mode instead if needed
             if (window.innerWidth > 1024) {
                // Optionally link this to focus mode if desired
                // this.toggleFocusMode();
                return; // Prevent body class toggle on desktop
             }

            // Toggle class for mobile/tablet sidebar visibility
            body.classList.toggle('sidebar-open');
             // Update aria-expanded or similar attributes if needed for accessibility
        },

        toggleFocusMode() {
            const container = document.querySelector('.portal-container');
            if (!container) return;
            const isFocused = container.classList.toggle('focus-mode');
            const icon = document.querySelector('#focus-mode-toggle i');

            if (icon) {
                 icon.className = isFocused ? 'fa-solid fa-arrows-right-to-line' : 'fa-solid fa-arrows-left-right-to-line';
            }
            UI.showToast(isFocused ? "Focus Mode On" : "Focus Mode Off", "info");

            setTimeout(() => {
                Object.values(App.charts).forEach(chart => {
                    if (chart && typeof chart.resize === 'function') {
                        chart.resize();
                    }
                });
            }, 400);
        },

        updateLiveDateTime() {
            const now = new Date();
            const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            const timeOptions = { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true };
            const dateEl = document.getElementById('live-date');
            const timeEl = document.getElementById('live-time');
            if (dateEl) dateEl.textContent = now.toLocaleDateString('en-US', dateOptions);
            if (timeEl) timeEl.textContent = now.toLocaleTimeString('en-US', timeOptions);
        },

        initTheme() {
            const savedTheme = localStorage.getItem('portalTheme') || 'blue';
            const savedMode = localStorage.getItem('portalMode') || 'light';
            document.body.setAttribute('data-theme', savedTheme);
            document.getElementById('theme-selector').value = savedTheme;
            if (savedMode === 'dark') {
                document.body.classList.add('dark-mode');
                document.getElementById('dark-mode-toggle').innerHTML = '<i class="fa-solid fa-sun"></i>';
            }
        },

        toggleDarkMode() {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('portalMode', isDark ? 'dark' : 'light');
            document.getElementById('dark-mode-toggle').innerHTML = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
            Dashboard.loadCharts();
            Academics.loadGrades(); // Reload grades to potentially update chart colors
             // Reload attendance chart if it exists and needs color update
             // Note: Attendance chart moved to dashboard pie chart now
        },

        changeTheme(e) {
            const theme = e.target.value;
            document.body.setAttribute('data-theme', theme);
            localStorage.setItem('portalTheme', theme);
            Dashboard.loadCharts();
            Academics.loadGrades();
             // Reload attendance chart if it exists and needs color update
        },

        showTutorial() {
            document.getElementById('tutorial-overlay').classList.remove('hidden');
        },
        closeTutorial() {
            document.getElementById('tutorial-overlay').classList.add('hidden');
        },

        showToast(message, type = 'info') {
            const container = document.getElementById('toast-container');
             if (!container) return; // Exit if container not found
            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            const icons = { success: 'fa-solid fa-check-circle', error: 'fa-solid fa-exclamation-circle', info: 'fa-solid fa-info-circle' };
            toast.innerHTML = `<i class="${icons[type]}"></i> ${message}`;
            container.appendChild(toast);
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(100%)';
                setTimeout(() => toast.remove(), 500);
            }, 3000);
        },

       showConfirmation(title, message, onConfirm) {
            const modal = document.getElementById('confirmation-modal');
            const titleEl = document.getElementById('modal-title');
            const messageEl = document.getElementById('modal-message');
            const confirmBtn = document.getElementById('modal-confirm-btn');
            const cancelBtn = document.getElementById('modal-cancel-btn');

             if (!modal || !titleEl || !messageEl || !confirmBtn || !cancelBtn) return; // Exit if elements missing

            titleEl.textContent = title;
            messageEl.innerHTML = message;

            // Use AbortController for cleaner listener removal
            const controller = new AbortController();
            const signal = controller.signal;

            confirmBtn.addEventListener('click', () => {
                onConfirm();
                this.hideModal();
                controller.abort(); // Remove both listeners
            }, { signal });

            cancelBtn.addEventListener('click', () => {
                this.hideModal();
                controller.abort(); // Remove both listeners
            }, { signal });

             // Reset button text
             confirmBtn.textContent = 'Confirm';
             cancelBtn.textContent = 'Cancel';

             modal.classList.remove('hidden');
        },


        hideModal() {
            document.getElementById('confirmation-modal')?.classList.add('hidden'); // Optional chaining
        },

        renderList(container, data, templateFn, emptyMessage = 'No data to display.') {
            if (!container) return;
            container.innerHTML = '';
            if (!data || data.length === 0) {
                if (container.tagName === 'TBODY') {
                    const colspan = container.closest('table')?.querySelector('thead tr')?.childElementCount || 1;
                    container.innerHTML = `<tr><td colspan="${colspan}" style="text-align:center;">${emptyMessage}</td></tr>`;
                } else {
                    container.innerHTML = `<p style="text-align:center; padding: 20px; color: var(--text-color-secondary);">${emptyMessage}</p>`;
                }
            } else {
                data.forEach(item => {
                    container.innerHTML += templateFn(item);
                });
            }
        },

        printElementPDF(elementId, pdfName) {
            const element = document.getElementById(elementId);
            if (!element) {
                console.error(`Element with ID ${elementId} not found for PDF generation.`);
                UI.showToast("Error generating PDF: Element not found.", "error");
                return;
            };

            UI.showToast("Generating PDF...", "info");

            html2canvas(element, { scale: 2, useCORS: true }).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const pdfWidth = 595.28; // A4 width pt
                const pdfHeight = 841.89; // A4 height pt
                const margin = 40;
                const contentWidth = pdfWidth - (margin * 2);
                const contentHeight = pdfHeight - (margin * 2);
                const canvasWidth = canvas.width;
                const canvasHeight = canvas.height;
                const canvasRatio = canvasHeight / canvasWidth;
                let finalPdfWidth = canvasWidth * 0.75; // px to pt
                let finalPdfHeight = canvasHeight * 0.75;
                if (finalPdfWidth > contentWidth) {
                    finalPdfWidth = contentWidth;
                    finalPdfHeight = finalPdfWidth * canvasRatio;
                }
                if (finalPdfHeight > contentHeight) {
                    finalPdfHeight = contentHeight;
                    finalPdfWidth = finalPdfHeight / canvasRatio;
                }
                const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
                const xOffset = margin + (contentWidth - finalPdfWidth) / 2;
                const yOffset = margin; // Start from top margin
                pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalPdfWidth, finalPdfHeight);
                pdf.save(`${pdfName}.pdf`);
                UI.showToast("Download complete!", "success");
            }).catch(error => {
                 console.error("Error generating PDF with html2canvas:", error);
                 UI.showToast("Error generating PDF.", "error");
            });
        }
    };

    // ==================================================================
    // 3. DASHBOARD MODULE
    // ==================================================================
    const Dashboard = {
        init() {
            this.loadWelcome();
            this.loadStats();
            this.loadTicker();
            this.loadCharts();
        },

        loadWelcome() {
             const { name, id, photo } = App.data.profile;
             const welcomeEl = document.getElementById('welcome-message');
             const sidebarNameEl = document.getElementById('sidebar-name');
             const sidebarIdEl = document.getElementById('sidebar-id');
             const sidebarAvatarEl = document.getElementById('sidebar-avatar');
             const headerAvatarEl = document.getElementById('header-avatar');

             if (welcomeEl) welcomeEl.textContent = `Welcome, ${name.split(' ')[0]}!`;
             if (sidebarNameEl) sidebarNameEl.textContent = name;
             if (sidebarIdEl) sidebarIdEl.textContent = id;
             if (sidebarAvatarEl) sidebarAvatarEl.src = photo;
             if (headerAvatarEl) headerAvatarEl.src = photo;
        },

        loadStats() {
            // Subjects
             const statSubjectsEl = document.getElementById('stat-subjects');
             if (statSubjectsEl) statSubjectsEl.textContent = App.data.subjects.length;

            // GPA & Standing
            const { gpa, standing } = Academics.calculateGpa(false); // Get GPA without render
             const dashGpaEl = document.getElementById('dash-stat-gpa');
             const dashStandingEl = document.getElementById('dash-stat-standing');
             if (dashGpaEl) dashGpaEl.textContent = gpa.toFixed(2);
             if (dashStandingEl) dashStandingEl.textContent = standing;

            // Fees
            const balance = App.data.finance.balance;
            const balanceEl = document.getElementById('dash-balance-amount');
             if (balanceEl) {
                 balanceEl.textContent = `₱${balance.toFixed(2)}`;
                 balanceEl.classList.toggle('paid', balance <= 0);
             }

            // Clearance
            const { cleared, total } = Clearance.getClearanceStatus();
            const clearanceEl = document.getElementById('stat-clearance');
            const clearanceCard = document.getElementById('stat-clearance-card');
             if (clearanceEl) clearanceEl.textContent = `${cleared}/${total}`;
             if (clearanceCard) {
                 clearanceCard.classList.toggle('cleared', cleared === total);
                 clearanceCard.classList.toggle('pending', cleared !== total);
             }

            // Exam Permit
            const isPermitReady = Academics.checkPermitReady(false); // Check without render
            const permitEl = document.getElementById('stat-permit');
            const permitCard = document.getElementById('stat-permit-card');
             if (permitEl) permitEl.textContent = isPermitReady ? "Ready" : "Pending";
             if (permitCard) {
                 permitCard.classList.toggle('approved', isPermitReady);
                 permitCard.classList.toggle('pending', !isPermitReady);
             }
        },

        loadTicker() {
            const tickerContent = document.getElementById('ticker-content');
            if (!tickerContent) return;
            let html = '';
            (App.data.announcements || []).forEach(ann => {
                html += `<span><strong>[${ann.tag}]</strong> ${ann.title}</span>`;
            });
             if (html) {
                 tickerContent.innerHTML = html + html;
             } else {
                 tickerContent.innerHTML = '<span>No announcements available.</span>';
             }
        },

        // FIXED (Req #5): Attendance Chart to Pie
        loadCharts() {
            const isDark = document.body.classList.contains('dark-mode');
            const textColor = isDark ? '#e0e0e0' : '#333';

            // Attendance Summary (Pie Chart)
            const attendance = App.data.attendance || [];
            let perfect = 0;
            let good = 0;
            let atRisk = 0;
            attendance.forEach(a => {
                if (a.percentage === 100) perfect++;
                else if (a.percentage >= 85) good++;
                else atRisk++;
            });

            const attendanceData = {
                labels: [`Perfect (100%) - ${perfect}`, `Good (85%+) - ${good}`, `At Risk (<85%) - ${atRisk}`],
                datasets: [{
                    label: 'Attendance Summary',
                    data: [perfect, good, atRisk],
                     backgroundColor: [
                         '#28a745', // Green for Perfect
                         '#007bff', // Blue for Good
                         '#dc3545'  // Red for At Risk
                     ],
                     hoverOffset: 4
                }]
            };

            this.renderChart('dashboard-attendance-chart', 'pie', attendanceData, { // Changed type to 'pie'
                plugins: {
                     legend: {
                         position: 'bottom', // Move legend to bottom for pie
                         labels: { color: textColor }
                     },
                     tooltip: {
                         callbacks: {
                             label: function(context) {
                                 let label = context.label || '';
                                 if (label) {
                                     label += ': ';
                                 }
                                 if (context.parsed !== null) {
                                     label += context.parsed + ' subject(s)';
                                 }
                                 return label;
                             }
                         }
                     }
                 }
            });
        },

        renderChart(canvasId, type, data, options = {}) {
            const ctx = document.getElementById(canvasId);
            if (!ctx) {
                console.warn(`Canvas element with ID '${canvasId}' not found.`);
                return;
            }

            if (App.charts[canvasId] && typeof App.charts[canvasId].destroy === 'function') {
                try {
                    App.charts[canvasId].destroy();
                    delete App.charts[canvasId];
                } catch (e) { console.error(`Error destroying chart ${canvasId}:`, e); }
            }

            try {
                App.charts[canvasId] = new ChartJS(ctx.getContext('2d'), {
                    type: type,
                    data: data,
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        animation: { duration: 0 },
                        ...options
                    }
                });
             } catch (error) { console.error(`Error creating chart '${canvasId}':`, error); }
        }
    };

    // ==================================================================
    // 4. ACADEMICS MODULE (Grades, GPA, Exam Permit, E-Classroom)
    // ==================================================================
    const Academics = {
        countdownInterval: null,

        init() {
            this.loadTabs();
             // Initial content loads triggered by UI.navigateToPage or tab clicks

             const calcGpaBtn = document.getElementById('calculate-gpa-btn');
             const printGradesBtn = document.getElementById('print-grades-btn');
             const printScheduleBtn = document.getElementById('print-schedule-btn');
             const evalForm = document.getElementById('evaluation-form');

             if (calcGpaBtn) calcGpaBtn.addEventListener('click', () => { this.calculateGpa(true); UI.showToast(`GPA Calculated: ${App.data.calculatedGPA?.toFixed(3) ?? 'N/A'}`, "success"); }); // Show toast on button click only
             if (printGradesBtn) printGradesBtn.addEventListener('click', () => this.printGrades());
             if (printScheduleBtn) printScheduleBtn.addEventListener('click', () => this.printSchedule());
             if (evalForm) evalForm.addEventListener('submit', this.submitEvaluation.bind(this));

            const academicsPage = document.getElementById('page-academics');
            if(academicsPage){
                academicsPage.addEventListener('click', (e) => {
                    if (e.target.closest('#print-permit-btn')) this.printPermit();
                    if (e.target.closest('.star-rating i')) this.handleStarRating(e.target);
                    if (e.target.closest('#request-promissory-btn')) this.requestPromissoryNote(e.target);
                    if (e.target.closest('.eclassroom-course-card a')) {
                         e.preventDefault();
                         UI.showToast("Opening course page...", "info");
                    }
                     // Removed assignment upload listener (Req #3)
                });
            }
        },

        loadTabs() {
            const academicsPage = document.getElementById('page-academics');
            const tabsContainer = academicsPage?.querySelector('.tabs');
            if (!tabsContainer) return;

            tabsContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('tab-link') && !e.target.classList.contains('active')) { // Check not active
                    const targetTab = e.target.dataset.tab;
                    tabsContainer.querySelectorAll('.tab-link').forEach(t => t.classList.remove('active'));
                    academicsPage.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                    e.target.classList.add('active');
                    const targetContent = document.getElementById(targetTab);
                    if (targetContent) {
                        targetContent.classList.add('active');
                        this.loadTabData(targetTab); // Load data for the activated tab
                    } else {
                        console.error(`Tab content with ID ${targetTab} not found.`);
                    }
                }
            });
        },

        loadTabData(tabId) {
            switch(tabId) {
                case 'tab-grades':
                    this.loadSubjects();
                    this.loadGrades(); // Also recalculates GPA display
                    break;
                case 'tab-schedule':
                    this.loadExamSchedule();
                    break;
                case 'tab-permit':
                    this.checkExamPermitStatus(true);
                    break;
                case 'tab-attendance':
                    this.loadAttendance();
                    break;
                case 'tab-eclassroom':
                    this.loadEClassroom();
                    break;
                // case 'tab-assignments': // Removed (Req #3)
                //    this.loadAssignments();
                //    break;
                 case 'tab-evaluation':
                    this.loadEvaluationForm();
                    break;
            }
        },

        loadSubjects() {
            UI.renderList(
                document.getElementById('subjects-list-body'),
                App.data.subjects,
                (s) => `
                    <tr>
                        <td>${s.code ?? 'N/A'}</td>
                        <td>${s.name ?? 'N/A'}</td>
                        <td>${s.instructor ?? 'TBA'}</td>
                        <td>${s.units ?? 0}</td>
                    </tr>
                `,
                "No subjects enrolled."
            );
        },

       // FIXED (Req #6): Grade Distribution to Pie Chart
        loadGrades() {
            const mergedData = App.data.grades.map(grade => {
                const subject = App.data.subjects.find(s => s.code === grade.code);
                return subject ? { ...subject, ...grade } : null;
            }).filter(item => item !== null);

            UI.renderList(
                document.getElementById('grades-table-body'),
                mergedData,
                (m) => `
                    <tr>
                        <td>${m.name}</td>
                        <td>${m.midterm ?? 'N/A'}</td>
                        <td>${m.final ?? 'N/A'}</td>
                        <td>${m.overall ?? 'N/A'}</td>
                        <td><strong>${m.equivalent?.toFixed(2) ?? 'N/A'}</strong></td>
                    </tr>
                `,
                "Grades are not yet available."
            );

            // Recalculate and display GPA
            const { gpa, standing } = this.calculateGpa(true); // Render GPA info in its card
             App.data.calculatedGPA = gpa; // Store for toast message if needed

            // Load Grade Distribution Pie Chart
             const gradeChartCanvas = document.getElementById('academics-grade-chart');
             if (gradeChartCanvas && mergedData.length > 0) {
                 const isDark = document.body.classList.contains('dark-mode');
                 const textColor = isDark ? '#e0e0e0' : '#333';

                 // Categorize grades for the pie chart
                 const gradeDist = {
                     '1.00 - 1.75': 0,
                     '1.76 - 2.50': 0,
                     '2.51 - 3.00': 0,
                     'Below 3.00': 0, // Includes 5.0 or INC
                     'No Grade': 0
                 };
                 mergedData.forEach(g => {
                     const eq = g.equivalent;
                     if (eq >= 1.0 && eq <= 1.75) gradeDist['1.00 - 1.75']++;
                     else if (eq >= 1.76 && eq <= 2.50) gradeDist['1.76 - 2.50']++;
                     else if (eq >= 2.51 && eq <= 3.00) gradeDist['2.51 - 3.00']++;
                     else if (eq > 3.00) gradeDist['Below 3.00']++;
                     else gradeDist['No Grade']++;
                 });

                 // Filter out categories with 0 count for cleaner chart
                 const chartLabels = Object.keys(gradeDist).filter(key => gradeDist[key] > 0);
                 const chartData = chartLabels.map(key => gradeDist[key]);

                 Dashboard.renderChart('academics-grade-chart', 'pie', { // Changed type to 'pie'
                     labels: chartLabels,
                     datasets: [{
                         label: 'Grade Distribution',
                         data: chartData,
                         backgroundColor: [ // Assign colors based on typical performance
                             '#28a745', // Excellent (1.00-1.75)
                             '#007bff', // Good (1.76-2.50)
                             '#ffc107', // Fair (2.51-3.00)
                             '#dc3545', // Poor/Fail (Below 3.00)
                             '#6c757d'  // No Grade
                         ].slice(0, chartLabels.length), // Only use needed colors
                         hoverOffset: 4
                     }]
                 }, {
                     plugins: {
                         legend: {
                             position: 'bottom',
                             labels: { color: textColor }
                         },
                         tooltip: {
                             callbacks: {
                                 label: function(context) {
                                     let label = context.label || '';
                                     if (label) label += ': ';
                                     if (context.parsed !== null) {
                                          const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                                          const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
                                          label += `${context.parsed} subject(s) (${percentage}%)`;
                                     }
                                     return label;
                                 }
                             }
                         }
                     }
                 });
             } else if (gradeChartCanvas) {
                 // Clear or hide chart if no data
                const ctx = gradeChartCanvas.getContext('2d');
                ctx.clearRect(0, 0, gradeChartCanvas.width, gradeChartCanvas.height);
                 if (App.charts['academics-grade-chart']) {
                     App.charts['academics-grade-chart'].destroy();
                     delete App.charts['academics-grade-chart'];
                 }
             }
        },


        calculateGpa(render = true) {
             let totalUnits = 0;
             let totalGradePoints = 0;
             let gradeCount = 0;

             (App.data.grades || []).forEach(grade => {
                 const subject = (App.data.subjects || []).find(s => s.code === grade.code);
                 if (subject && typeof grade.equivalent === 'number' && grade.equivalent >= 1.0 && grade.equivalent <= 5.0) {
                     totalUnits += subject.units;
                     totalGradePoints += grade.equivalent * subject.units;
                     gradeCount++;
                 }
             });

             const gpa = (totalUnits > 0 && gradeCount > 0) ? totalGradePoints / totalUnits : 0;

             let standing = "---";
             if (gpa > 0) {
                 standing = "Good Standing";
                 if (gpa === 1.00) standing = "President's Lister (Perfect)";
                 else if (gpa <= 1.20) standing = "President's Lister";
                 else if (gpa <= 1.75) standing = "Dean's Lister";
                 else if (gpa >= 3.01) standing = "Probation";
             }

             if (render) {
                 const gpaUnitsEl = document.getElementById('gpa-total-units');
                 const gpaResultEl = document.getElementById('gpa-result');
                 const gpaStandingEl = document.getElementById('gpa-standing');
                 if (gpaUnitsEl) gpaUnitsEl.textContent = totalUnits;
                 if (gpaResultEl) gpaResultEl.textContent = gpa.toFixed(3);
                 if (gpaStandingEl) gpaStandingEl.textContent = standing;
             }

             return { gpa, standing };
        },

        loadExamSchedule() {
            const schedule = (App.data.examSchedule || []).sort((a, b) => new Date(a.date) - new Date(b.date));
            const today = new Date().setHours(0,0,0,0);
            let nextExamFound = false;

            UI.renderList(
                document.getElementById('exam-schedule-body'),
                schedule,
                (exam) => {
                    let rowClass = '';
                    const examDate = new Date(exam.date).setHours(0,0,0,0);
                    if (!nextExamFound && examDate >= today) {
                        rowClass = 'highlight-next-exam';
                        nextExamFound = true;
                    }
                    return `
                        <tr${rowClass ? ' class="' + rowClass + '"' : ''}>
                            <td>${exam.subject ?? 'N/A'}</td>
                            <td>${exam.date ? new Date(exam.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : 'N/A'}</td>
                            <td>${exam.time ?? 'TBA'}</td>
                            <td>${exam.room ?? 'TBA'}</td>
                        </tr>
                    `;
                },
                "Exam schedule not yet available."
            );
            if (!document.getElementById('highlight-style')) {
                 const style = document.createElement('style');
                 style.id = 'highlight-style';
                 style.innerHTML = `.highlight-next-exam td { background-color: var(--accent-color); font-weight: 600; }`;
                 document.head.appendChild(style);
            }
        },

        // --- Exam Permit ---

        checkPermitReady(render = false) {
             const financeOK = App.data.finance.balance <= 0;
             const clearance = App.data.clearance;
             const clearanceOK = clearance && Object.values(clearance).every(status => status === 'Cleared');
             const isReady = financeOK && clearanceOK;

             if (render) {
                 const financeMsg = document.getElementById('finance-permit-message');
                 if (financeMsg) {
                     financeMsg.classList.remove('hidden');
                     financeMsg.innerHTML = isReady ? `✅ <strong>Exam Permit Ready!</strong> Your balance is cleared.` : `🔴 <strong>Exam Permit Pending.</strong> You have an outstanding balance.`;
                     financeMsg.className = `message-box ${isReady ? 'success' : 'error'} visible`;
                 }
                 const clearanceMsg = document.getElementById('clearance-permit-message');
                 if (clearanceMsg) {
                     clearanceMsg.classList.remove('hidden');
                     clearanceMsg.innerHTML = isReady ? `✅ <strong>Exam Permit Ready!</strong> All requirements are cleared.` : `🔴 <strong>Exam Permit Pending.</strong> Please wait for all departments to clear you.`;
                     clearanceMsg.className = `message-box ${isReady ? 'success' : 'error'} visible`;
                 }
             }
             return isReady;
        },

       checkExamPermitStatus(render = true) {
            const financeOK = App.data.finance.balance <= 0;
            const clearance = App.data.clearance;
            const clearanceOK = clearance && Object.values(clearance).every(status => status === 'Cleared');
            const isReady = financeOK && clearanceOK;

            if (render) {
                const container = document.getElementById('exam-permit-container');
                const controls = document.getElementById('exam-permit-controls');
                if (container && controls) {
                    container.innerHTML = isReady ? this.generatePermitHTML() : this.generatePendingHTML();
                    controls.classList.toggle('hidden', !isReady);
                    if (isReady && !sessionStorage.getItem('permitReminderShown')) {
                        UI.showToast("Your Exam Permit is ready. You must present this before exams.", "success");
                        sessionStorage.setItem('permitReminderShown', 'true');
                    }
                }
            }

             // Update dashboard stats only if dashboard elements exist
             const dashGpaEl = document.getElementById('dash-stat-gpa');
             if (dashGpaEl) Dashboard.loadStats();
        },

        generatePermitHTML() { /* ... unchanged ... */
            const { name, id, course, term } = App.data.profile;
            const today = new Date();
            const permitNum = `PERMIT-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
            const subjectsHTML = (App.data.subjects || []).map(s => `<li>${s.code} - ${s.name}</li>`).join('');
            return `
                <div class="exam-permit" id="permit-print-area">
                    <div class="permit-header">
                        <h3>Official Examination Permit</h3>
                        <p>${term ?? 'Current Term'}</p>
                    </div>
                    <div class="permit-status approved">
                        <h2><i class="fa-solid fa-check-circle"></i> 🟢 APPROVED</h2>
                        <p>This permit is valid for the Final Examinations.</p>
                    </div>
                    <div class="permit-details">
                        <p><strong>Permit No:</strong> ${permitNum}</p>
                        <p><strong>Student ID:</strong> ${id ?? 'N/A'}</p>
                        <p><strong>Name:</strong> ${name ?? 'N/A'}</p>
                        <p><strong>Course:</strong> ${course ?? 'N/A'}</p>
                    </div>
                    <h4>Allowed Subjects:</h4>
                    <ul class="permit-subjects" style="list-style-position: inside; padding-left: 10px;">
                        ${subjectsHTML || '<li>No subjects found</li>'}
                    </ul>
                    <div class="permit-footer">
                        <div>
                            <p><em>This is a system-generated permit.</em></p>
                            <p><em>Reminder: You must present this permit before exams.</em></p>
                        </div>
                        <div class="signature">
                            <img src="signature-sim.png" alt="Registrar Signature" class="sim-signature">
                            <p><strong>Registrar's Office</strong></p>
                        </div>
                    </div>
                </div>`;
        },

        generatePendingHTML() { /* ... unchanged ... */
            let requirements = [];
            const hasBalance = App.data.finance.balance > 0;
            if (hasBalance) requirements.push(`Outstanding Balance: ₱${App.data.finance.balance.toFixed(2)}`);
            const clearance = App.data.clearance;
            if (clearance) {
                for (const [dept, status] of Object.entries(clearance)) {
                    if (status === 'Pending') requirements.push(`${dept} Hold`);
                }
            }
            const reqHTML = requirements.length > 0
                ? requirements.map(r => `<li>${r}</li>`).join('')
                : '<li>All requirements met, awaiting balance clearance.</li>';
            let promissoryHTML = '';
            if (hasBalance) {
                if (App.data.finance.promissoryPending) {
                    promissoryHTML = `<div class="promissory-note-section"><hr style="border-style: dashed;"><h5><i class="fa-solid fa-clock"></i> Promissory Note Pending</h5><p>Your request is being reviewed by the Accounting department.</p></div>`;
                } else {
                    promissoryHTML = `<div class="promissory-note-section"><hr style="border-style: dashed;"><h5>Unable to Pay Full Balance?</h5><p>You can request a <strong>Promissory Note</strong> to potentially be allowed to take the exams. This is subject to approval.</p><button id="request-promissory-btn" class="btn btn-secondary">Request Promissory Note</button></div>`;
                }
            }
            return `<div class="exam-permit"><div class="permit-header"><h3>Examination Permit Status</h3><p>${App.data.profile.term ?? 'Current Term'}</p></div><div class="permit-status pending"><h2><i class="fa-solid fa-times-circle"></i> 🔴 PENDING REQUIREMENTS</h2><p>Please settle the following to generate your exam permit:</p><ul style="list-style-position: inside; padding-left: 10px;">${reqHTML}</ul></div>${promissoryHTML}</div>`;
        },


       requestPromissoryNote(button) { /* ... unchanged ... */
           if (App.data.finance.balance <= 0) {
               UI.showToast("Your balance is clear. You don't need a promissory note.", "info");
               return;
           }
           UI.showConfirmation(
               "Request Promissory Note",
               "Submit a request for payment consideration? Approval is not guaranteed.",
               () => {
                   Data.update('finance.promissoryPending', true);
                   this.checkExamPermitStatus(true); // Re-render immediately
                   UI.showToast("Promissory Note request submitted.", "success");
               }
           );
       },

        // --- Other Academic Features ---

        loadAttendance() { /* ... unchanged ... */
            const attendance = App.data.attendance || [];
             UI.renderList(
                 document.getElementById('attendance-table-body'),
                 attendance,
                 (a) => `
                     <tr>
                         <td>${a.subject ?? 'N/A'}</td>
                         <td>${a.percentage ?? 'N/A'}%</td>
                         <td><span class="${(a.percentage ?? 100) < 85 ? 'status-pending' : 'status-cleared'}">
                             ${(a.percentage ?? 100) < 85 ? 'At Risk' : 'Good'}
                         </span></td>
                     </tr>
                 `,
                 "Attendance data not yet available."
             );
        },

        loadEClassroom() { /* ... unchanged ... */
             const container = document.getElementById('eclassroom-courses');
             UI.renderList(
                 container,
                 App.data.subjects,
                 (subject) => `
                    <div class="eclassroom-course-card">
                         <h5>${subject.code ?? 'N/A'} - ${subject.name ?? 'N/A'}</h5>
                         <p>${subject.instructor ?? 'TBA'}</p>
                         <a href="#" target="_blank">Go to Course <i class="fa-solid fa-external-link"></i></a>
                    </div>
                 `,
                 "You are not enrolled in any courses this term."
             )
        },

        // Assignments functions removed (Req #3)

       loadEvaluationForm() { /* ... unchanged ... */
            const select = document.getElementById('eval-professor');
            if (!select) return;
            select.innerHTML = '<option value="">-- Select Professor --</option>';
            const instructors = [...new Set((App.data.subjects || []).map(s => s.instructor).filter(Boolean))]; // Filter out undefined/null
            instructors.forEach(inst => select.innerHTML += `<option value="${inst}">${inst}</option>`);
            document.querySelectorAll('.star-rating i').forEach(star => { star.classList.remove('fa-solid'); star.classList.add('fa-regular'); });
            const ratingInput = document.getElementById('eval-rating'); if (ratingInput) ratingInput.value = "0";
            const commentsInput = document.getElementById('eval-comments'); if (commentsInput) commentsInput.value = "";
        },

        handleStarRating(targetStar) { /* ... unchanged ... */
            const rating = targetStar.dataset.value;
             const ratingInput = document.getElementById('eval-rating'); if(ratingInput) ratingInput.value = rating;
            const stars = targetStar.parentElement.querySelectorAll('i');
            stars.forEach(star => {
                star.classList.toggle('fa-solid', star.dataset.value <= rating);
                star.classList.toggle('fa-regular', star.dataset.value > rating);
            });
        },

       submitEvaluation(e) { /* ... unchanged ... */
            e.preventDefault();
            const rating = document.getElementById('eval-rating')?.value;
            const professor = document.getElementById('eval-professor')?.value;
            if (!professor) { UI.showToast("Please select a professor.", "error"); return; }
            if (rating === "0" || !rating) { UI.showToast("Please select a star rating.", "error"); return; }
            UI.showConfirmation("Submit Feedback", "Are you sure?", () => {
                UI.showToast("Thank you for your feedback!", "success");
                const evalForm = document.getElementById('evaluation-form'); if(evalForm) evalForm.reset();
                this.loadEvaluationForm(); // Reset visuals
            });
        },

        // --- Print Functions ---
        printGrades() { UI.printElementPDF('grades-print-area', `Grades_${App.data.profile.id}`); },
        printSchedule() { UI.printElementPDF('schedule-print-area', `ExamSchedule_${App.data.profile.id}`); },
        printPermit() { UI.printElementPDF('permit-print-area', `ExamPermit_${App.data.profile.id}`); }
    };

    // ==================================================================
    // 5. FINANCE MODULE
    // ==================================================================
    const Finance = { /* ... unchanged from previous version ... */
        init() {
            this.loadTabs();
            this.loadBalance(); // Load balance initially
            const paymentForm = document.getElementById('payment-form');
            const uploadBtn = document.getElementById('upload-receipt-btn');
            if (paymentForm) paymentForm.addEventListener('submit', this.simulatePayment.bind(this));
            if (uploadBtn) uploadBtn.addEventListener('click', this.simulateUpload.bind(this));
        },
        loadTabs() {
            const financePage = document.getElementById('page-finance');
            const tabsContainer = financePage?.querySelector('.tabs'); if (!tabsContainer) return;
            tabsContainer.addEventListener('click', (e) => {
                 if (e.target.classList.contains('tab-link') && !e.target.classList.contains('active')) {
                    const targetTab = e.target.dataset.tab;
                    tabsContainer.querySelectorAll('.tab-link').forEach(t => t.classList.remove('active'));
                    financePage.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                    e.target.classList.add('active');
                    const targetContent = document.getElementById(targetTab);
                     if (targetContent) { targetContent.classList.add('active');
                         if (targetTab === 'tab-balance') this.loadBalance();
                         if (targetTab === 'tab-history') this.loadHistory();
                         if (targetTab === 'tab-assessment') this.loadAssessment(); } } }); },
        loadBalance() {
             const { total = 0, balance = 0, breakdown = [] } = App.data.finance || {};
             const container = document.getElementById('fees-breakdown-list'); if (!container) return;
             container.innerHTML = '';
             breakdown.forEach(item => container.innerHTML += `<li><span>${item.name}</span><span>₱${item.amount?.toFixed(2) ?? '0.00'}</span></li>`);
             container.innerHTML += `<li class="total"><span>Total Fees</span><span>₱${total.toFixed(2)}</span></li>`;
             const paid = total - balance; const progress = total > 0 ? (paid / total) * 100 : (balance <= 0 ? 100 : 0);
             const progressBar = document.getElementById('payment-progress-bar'); if (progressBar) progressBar.value = progress;
             const balanceDisplay = document.getElementById('payment-balance'); if (balanceDisplay) balanceDisplay.textContent = `₱${balance.toFixed(2)}`;
             const paymentAmountInput = document.getElementById('payment-amount'); if (paymentAmountInput) paymentAmountInput.value = balance > 0 ? balance.toFixed(2) : '';
             Academics.checkPermitReady(true); },
        loadHistory() { UI.renderList( document.getElementById('payment-history-body'), (App.data.finance.history || []), (p) => `<tr><td>${p.date}</td><td>${p.ref}</td><td>${p.desc}</td><td>₱${p.amount?.toFixed(2) ?? '0.00'}</td><td><span class="status-paid">${p.status}</span></td></tr>`, "No payment history." ); },
        loadAssessment() { const fees = [ { name: "Tuition Fee (Est. 18 units)", amount: 18000.00 }, { name: "Lab Fee (Computer)", amount: 3000.00 }, { name: "Misc. Fees (Library, ID, etc.)", amount: 4000.00 }, { name: "Total Estimated Fees", amount: 25000.00 }, ]; const container = document.getElementById('assessment-body'); if (!container) return; container.innerHTML = ''; fees.forEach(fee => container.innerHTML += `<tr><td>${fee.name}</td><td><strong>₱${fee.amount?.toFixed(2) ?? '0.00'}</strong></td></tr>`); },
        simulatePayment(e) { e.preventDefault(); const amountInput = document.getElementById('payment-amount'); const amount = parseFloat(amountInput.value); const currentBalance = App.data.finance.balance; if (isNaN(amount) || amount <= 0) { UI.showToast("Please enter a valid amount.", "error"); return; } if (currentBalance <= 0) { UI.showToast("Your balance is already cleared.", "info"); return; } UI.showConfirmation("Confirm Payment", `Proceed with payment of ₱${amount.toFixed(2)}?`, () => { let newBalance = currentBalance - amount; if (newBalance < 0) newBalance = 0; const historyEntry = { date: new Date().toISOString().slice(0, 10), ref: `PAY-${Math.floor(10000 + Math.random() * 90000)}`, desc: "Online Payment", amount: amount, status: "Paid" }; let currentData = Data.get(); currentData.finance.balance = newBalance; currentData.finance.history.push(historyEntry); Data.save(currentData); this.loadBalance(); if (document.getElementById('tab-history')?.classList.contains('active')) this.loadHistory(); Dashboard.loadStats(); UI.showToast("Payment successful!", "success"); amountInput.value = newBalance > 0 ? newBalance.toFixed(2) : ''; }); },
        simulateUpload(e) { const refInput = document.getElementById('receipt-ref'); const fileInput = document.getElementById('receipt-file'); const ref = refInput.value; const file = fileInput.files[0]; if (!ref || !file) { UI.showToast("Please provide a reference number and select a file.", "error"); return; } UI.showToast(`Validating receipt ${ref}...`, "info"); setTimeout(() => { const isValid = Math.random() > 0.5; if (isValid) { UI.showConfirmation("Receipt Valid", `Ref: ${ref}<br>Status: VALID.<br><br>Do you want to post this payment (amount will be estimated for demo)?`, () => { UI.showToast("Payment posted (demo).", "success"); refInput.value = ''; fileInput.value = ''; }); } else { UI.showConfirmation("Receipt Invalid", `Ref: ${ref}<br>Status: INVALID.<br><br>Reference number not found or already used.`, () => {}); } }, 2000); }
    };


    // ==================================================================
    // 6. CLEARANCE MODULE
    // ==================================================================
    const Clearance = { /* ... unchanged from previous version ... */
        init() { this.loadClearance(); const simBtn = document.getElementById('simulate-clearance-btn'); if (simBtn) simBtn.addEventListener('click', this.simulateAllClear.bind(this)); },
        getClearanceStatus() { const clearance = App.data.clearance; if (!clearance) return { cleared: 0, total: 0 }; const total = Object.keys(clearance).length; const cleared = Object.values(clearance).filter(s => s === 'Cleared').length; return { cleared, total }; },
        loadClearance() { const { cleared, total } = this.getClearanceStatus(); const progress = total > 0 ? (cleared / total) * 100 : 0; const progressBar = document.getElementById('clearance-progress-bar'); const progressText = document.getElementById('clearance-progress-text'); const list = document.getElementById('clearance-list'); if(progressBar) progressBar.value = progress; if(progressText) progressText.textContent = `${cleared} / ${total} Cleared`; if (list) { list.innerHTML = ''; if (total > 0 && App.data.clearance) { for (const [dept, status] of Object.entries(App.data.clearance)) { const isCleared = status === 'Cleared'; list.innerHTML += `<li><span><i class="${isCleared ? 'fa-solid fa-check-circle' : 'fa-solid fa-clock'}" style="color: ${isCleared ? '#28a745' : '#fd7e14'}; margin-right: 8px;"></i>${dept}</span><span class="status ${isCleared ? 'status-cleared' : 'status-pending'}">${status}</span></li>`; } } else { list.innerHTML = '<p style="text-align: center; color: var(--text-color-secondary);">No clearance requirements found.</p>'; } } Academics.checkPermitReady(true); },
        simulateAllClear() { UI.showConfirmation("Clear All Holds", "Mark all clearance requirements as 'Cleared'? (Demo Only)", () => { let data = Data.get(); let changed = false; if (!data.clearance) data.clearance = {}; Object.keys(data.clearance).forEach(dept => { if (data.clearance[dept] !== 'Cleared') { data.clearance[dept] = 'Cleared'; changed = true; } }); if (changed) { Data.save(data); this.loadClearance(); Dashboard.loadStats(); Academics.checkExamPermitStatus(true); UI.showToast("All departments cleared!", "success"); } else { UI.showToast("All departments are already cleared.", "info"); } }); }
    };


    // ==================================================================
    // 7. REGISTRATION (ENROLLMENT/REG. FORM) MODULE (MERGED)
    // ==================================================================
    const Registration = { /* ... unchanged from previous version ... */
        init() { const container = document.getElementById('registration-container'); if(container){ container.addEventListener('click', this.handleEvents.bind(this)); container.addEventListener('change', this.handleFormChanges.bind(this)); } },
        loadView() { const container = document.getElementById('registration-container'); if (!container) return; if (App.data.registration.enrolled) { container.innerHTML = this.existingStudentView(); this.loadFormDataIntoRegForm(); } else { container.innerHTML = this.newStudentView(); this.loadAutoSavedData(); } },
        loadFormDataIntoRegForm() { const nameEl = document.getElementById('regform-name'); if (!nameEl) return; const { name, id, course, year, status, term } = App.data.profile; const { subjects } = App.data; const { breakdown, total, balance } = App.data.finance; const setContent = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value ?? 'N/A'; }; setContent('regform-term', term); setContent('regform-name', name); setContent('regform-id', id); setContent('regform-course', `${course} - ${year}`); setContent('regform-status', status); let totalUnits = 0; const subjectsBody = document.getElementById('regform-subjects-body'); if (subjectsBody) { subjectsBody.innerHTML = ''; (subjects || []).forEach(s => { totalUnits += (s.units || 0); subjectsBody.innerHTML += `<tr><td>${s.code ?? 'N/A'}</td><td>${s.name ?? 'N/A'}</td><td>${s.schedule ?? 'TBA'}</td><td>${s.units ?? 0}</td></tr>`; }); subjectsBody.innerHTML += `<tr style="font-weight: 700;"><td colspan="3" style="text-align: right;">Total Units:</td><td>${totalUnits}</td></tr>`; } const feesList = document.getElementById('regform-fees-list'); if (feesList) { feesList.innerHTML = ''; (breakdown || []).forEach(fee => { feesList.innerHTML += `<li><span>${fee.name ?? 'Fee'}</span><span>₱${fee.amount?.toFixed(2) ?? '0.00'}</span></li>`; }); feesList.innerHTML += `<li class="total"><span>Total Fees:</span><span>₱${total?.toFixed(2) ?? '0.00'}</span></li><li><span>Balance:</span><span>₱${balance?.toFixed(2) ?? '0.00'}</span></li>`; } },
        existingStudentView() { return ` <div class="card"> <h4><i class="fa-solid fa-file-invoice"></i> Official Registration Form</h4> <p>This is your official Certificate of Registration for the current term.</p> <div class="registration-form print-area" id="regform-print-area"> <div class="regform-header"> <div> <h5>Your University Name</h5> <p>Office of the Registrar</p> <h3>CERTIFICATE OF REGISTRATION</h3> </div> <div class="regform-term" id="regform-term"></div> </div> <div class="regform-student-info"> <p><strong>STUDENT NAME:</strong> <span id="regform-name"></span></p> <p><strong>STUDENT ID:</strong> <span id="regform-id"></span></p> <p><strong>COURSE & YEAR:</strong> <span id="regform-course"></span></p> <p><strong>ACADEMIC STATUS:</strong> <span id="regform-status"></span></p> </div> <h5>ENROLLED SUBJECTS & SCHEDULE</h5> <table class="data-table"> <thead> <tr> <th>Code</th> <th>Subject Name</th> <th>Schedule</th> <th>Units</th> </tr> </thead> <tbody id="regform-subjects-body"></tbody> </table> <div class="regform-summary"> <div class="regform-fees"> <h5>FEES ASSESSMENT</h5> <ul id="regform-fees-list"></ul> </div> <div class="regform-registrar"> <p><em>Not valid without school seal.</em></p> <img src="signature-sim.png" alt="Simulated Signature" class="sim-signature"> <p><strong>University Registrar</strong></p> </div> </div> </div> <button id="print-regform-btn" class="btn btn-primary"><i class="fa-solid fa-print"></i> Print/Download Form</button> </div> `; },
        newStudentView() { const mockSubjects = [ { code: "NEW101", name: "New Student Orientation", units: 1, schedule: "TBA" }, { code: "CALC1", name: "Calculus 1", units: 3, schedule: "MWF 8-9AM" }, { code: "PHYS1", name: "Physics 1", units: 4, schedule: "TTH 10-12PM" }, { code: "ENG1", name: "English 1", units: 3, schedule: "MWF 10-11AM" }, ]; const subjectsHTML = mockSubjects.map(s => `<label><input type="checkbox" name="reg-subject" value="${s.code}" data-units="${s.units}"><strong>${s.code}</strong> - ${s.name} (${s.units} units) - <em>${s.schedule}</em></label>`).join(''); return ` <div class="card"> <h4><i class="fa-solid fa-id-card"></i> New Student Enrollment</h4> <div class="registration-steps"> <div id="reg-progress-bar"></div> <div class="step active" data-step="1"><div class="step-circle">1</div><p>Info</p></div> <div class="step" data-step="2"><div class="step-circle">2</div><p>Subjects</p></div> <div class="step" data-step="3"><div class="step-circle">3</div><p>Review</p></div> </div> <form id="reg-form"> <div class="reg-step-content active" data-step-content="1"> <div class="form-group"><label for="reg-semester">Semester</label><select id="reg-semester" name="semester" class="auto-save"><option value="1st Semester">1st Semester, SY 2025-2026</option><option value="2nd Semester">2nd Semester, SY 2025-2026</option></select></div> <div class="form-group"><label for="reg-course">Course</label><select id="reg-course" name="course" class="auto-save"><option value="BSIT">BS Information Technology</option><option value="BSCS">BS Computer Science</option><option value="BSECE">BS ECE</option></select></div> <button type="button" class="btn btn-primary" data-action="next-step" data-next="2">Next</button> </div> <div class="reg-step-content" data-step-content="2"> <h5>Select Subjects</h5><div class="subject-selection auto-save-group">${subjectsHTML}</div> <button type="button" class="btn btn-secondary" data-action="prev-step" data-prev="1">Back</button> <button type="button" class="btn btn-primary" data-action="next-step" data-next="3">Next</button> </div> <div class="reg-step-content" data-step-content="3"> <h5>Review Enrollment</h5><p><strong>Course:</strong> <span id="review-course"></span></p><p><strong>Semester:</strong> <span id="review-semester"></span></p><p><strong>Subjects:</strong></p><ul id="review-subjects" style="list-style-position: inside; padding-left: 10px;"></ul><hr><p><strong>Total Units:</strong> <span id="review-units">0</span></p><h4>Estimated Fees: <span id="review-fees">₱0.00</span></h4> <button type="button" class="btn btn-secondary" data-action="prev-step" data-prev="2">Back</button> <button type="submit" class="btn btn-primary" data-action="submit-reg">Submit for Approval</button> </div> </form> </div> `; },
        handleEvents(e) { const action = e.target.dataset.action; if (action === "next-step") { this.updateStep(e.target.dataset.next); if (e.target.dataset.next === "3") this.populateReview(); } if (action === "prev-step") this.updateStep(e.target.dataset.prev); if (action === "submit-reg") { e.preventDefault(); this.submitRegistration(); } if (e.target.id === 'print-regform-btn') this.printRegForm(); },
        printRegForm() { UI.printElementPDF('regform-print-area', `RegistrationForm_${App.data.profile.id}`); },
        updateStep(stepNum) { const num = parseInt(stepNum); const progressBar = document.getElementById('reg-progress-bar'); if(progressBar) progressBar.style.width = `${((num - 1) / 2) * 100}%`; document.querySelectorAll('.registration-steps .step').forEach(step => step.classList.toggle('active', parseInt(step.dataset.step) <= num)); document.querySelectorAll('.reg-step-content').forEach(content => content.classList.toggle('active', content.dataset.stepContent === stepNum)); },
        handleFormChanges(e) { if(App.data.registration.enrolled) return; const data = App.data.registration.newStudentData; if (e.target.matches('.auto-save')) data[e.target.name] = e.target.value; if (e.target.matches('input[name="reg-subject"]')) data.subjects = Array.from(document.querySelectorAll('input[name="reg-subject"]:checked')).map(el => el.value); Data.update('registration.newStudentData', data); },
        loadAutoSavedData() { const semesterEl = document.getElementById('reg-semester'); if(!semesterEl) return; const data = App.data.registration.newStudentData || { semester: '', course: '', subjects: [] }; semesterEl.value = data.semester || semesterEl.options[0].value; const courseEl = document.getElementById('reg-course'); if (courseEl) courseEl.value = data.course || courseEl.options[0].value; (data.subjects || []).forEach(code => { const check = document.querySelector(`input[name="reg-subject"][value="${code}"]`); if (check) check.checked = true; }); },
        populateReview() { const reviewCourseEl = document.getElementById('review-course'); if(!reviewCourseEl) return; const data = App.data.registration.newStudentData || { semester: '', course: '', subjects: [] }; reviewCourseEl.textContent = data.course || 'N/A'; document.getElementById('review-semester').textContent = data.semester || 'N/A'; let totalUnits = 0; const subjectsList = document.getElementById('review-subjects'); subjectsList.innerHTML = ''; document.querySelectorAll('input[name="reg-subject"]:checked').forEach(el => { const units = parseInt(el.dataset.units) || 0; totalUnits += units; const label = el.closest('label')?.textContent.trim() || `Unknown Subject (${el.value})`; subjectsList.innerHTML += `<li>${label}</li>`; }); const estimatedFees = 1500 * totalUnits + 5000; document.getElementById('review-units').textContent = totalUnits; document.getElementById('review-fees').textContent = `₱${estimatedFees.toFixed(2)}`; },
        submitRegistration() { UI.showConfirmation("Submit Enrollment", "Submit your enrollment for approval?", () => { UI.showToast("Enrollment submitted for approval!", "success"); Data.update('registration.enrolled', true); this.loadView(); }); }
    };


    // ==================================================================
    // 8. PROFILE MODULE (Renumbered)
    // ==================================================================
    const Profile = { /* ... unchanged from previous version ... */
        init() { this.loadProfile(); const profileForm = document.getElementById('profile-form'); const photoUpload = document.getElementById('profile-photo-upload'); const genAvatarBtn = document.getElementById('generate-avatar-btn'); if (profileForm) profileForm.addEventListener('submit', this.saveProfile.bind(this)); if (photoUpload) photoUpload.addEventListener('change', this.previewPhoto.bind(this)); if (genAvatarBtn) genAvatarBtn.addEventListener('click', this.generateAvatar.bind(this)); document.querySelectorAll('#profile-form input, #profile-form select').forEach(input => { if (input.type !== 'file' && !input.disabled) input.addEventListener('change', this.autoSave.bind(this)); }); },
        loadProfile() { const profileData = App.data.profile || {}; const setValue = (id, value) => { const el = document.getElementById(id); if (el) el.value = value ?? ""; }; const setSrc = (id, value) => { const el = document.getElementById(id); if (el) el.src = value || 'https://i.pravatar.cc/150'; }; setValue('profile-name', profileData.name); setValue('profile-id', profileData.id); setValue('profile-course', profileData.course); setValue('profile-year', profileData.year); setValue('profile-term', profileData.term); setValue('profile-status', profileData.status); setValue('profile-email', profileData.email); setValue('profile-contact', profileData.contact); setSrc('profile-photo-preview', profileData.photo); },
        autoSave(e) { const key = e.target.id.replace('profile-', ''); const value = e.target.value; Data.update(`profile.${key}`, value); UI.showToast("Change auto-saved.", "info"); if (key === 'name') Dashboard.loadWelcome(); if (key === 'photo') { const sidebarAvatarEl = document.getElementById('sidebar-avatar'); const headerAvatarEl = document.getElementById('header-avatar'); if (sidebarAvatarEl) sidebarAvatarEl.src = value; if (headerAvatarEl) headerAvatarEl.src = value; } },
        saveProfile(e) { e.preventDefault(); const nameInput = document.getElementById('profile-name'); const emailInput = document.getElementById('profile-email'); const contactInput = document.getElementById('profile-contact'); if (!nameInput.value || !emailInput.value || !contactInput.value) { UI.showToast("Please fill in Name, Email, and Contact.", "error"); return; } UI.showToast("Profile changes saved!", "success"); Dashboard.loadWelcome(); },
        previewPhoto(e) { const file = e.target.files[0]; const previewEl = document.getElementById('profile-photo-preview'); if (!previewEl) return; if (file) { if (!file.type.startsWith('image/')) { UI.showToast("Please select an image file.", "error"); e.target.value = ''; return; } if (file.size > 2 * 1024 * 1024) { UI.showToast("Image size should not exceed 2MB.", "error"); e.target.value = ''; return; } const reader = new FileReader(); reader.onload = (event) => { const imgUrl = event.target.result; previewEl.src = imgUrl; Data.update('profile.photo', imgUrl); const sidebarAvatarEl = document.getElementById('sidebar-avatar'); const headerAvatarEl = document.getElementById('header-avatar'); if (sidebarAvatarEl) sidebarAvatarEl.src = imgUrl; if (headerAvatarEl) headerAvatarEl.src = imgUrl; UI.showToast("Profile photo updated.", "success"); }; reader.onerror = (error) => { console.error("FileReader error:", error); UI.showToast("Error reading image file.", "error"); }; reader.readAsDataURL(file); } },
        generateAvatar() { const name = App.data.profile.name || 'Student'; const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'ST'; const themeColor = document.body.dataset.theme || 'blue'; const colors = { blue: '007bff', maroon: '800000', green: '28a745', purple: '6f42c1' }; const bgColor = colors[themeColor] || '007bff'; const newAvatarUrl = `https://ui-avatars.com/api/?name=${initials}&background=${bgColor}&color=fff&size=150&bold=true`; const previewEl = document.getElementById('profile-photo-preview'); if (previewEl) previewEl.src = newAvatarUrl; Data.update('profile.photo', newAvatarUrl); const sidebarAvatarEl = document.getElementById('sidebar-avatar'); const headerAvatarEl = document.getElementById('header-avatar'); if (sidebarAvatarEl) sidebarAvatarEl.src = newAvatarUrl; if (headerAvatarEl) headerAvatarEl.src = newAvatarUrl; UI.showToast("Avatar generated and saved.", "success"); }
    };


    // ==================================================================
    // 9. DOCUMENT REQUEST MODULE (Renumbered)
    // ==================================================================
    const Documents = {
        init() {
            this.loadTrackingTable();
            this.updateFormPricing();
            const docTypeEl = document.getElementById('doc-type');
            const docCopiesEl = document.getElementById('doc-copies');
            const docForm = document.getElementById('doc-request-form');
            const confirmPaymentBtn = document.getElementById('doc-confirm-payment-btn');
            const trackingBody = document.getElementById('doc-tracking-body');

            if (docTypeEl) docTypeEl.addEventListener('change', this.updateFormPricing.bind(this));
            if (docCopiesEl) docCopiesEl.addEventListener('input', this.updateFormPricing.bind(this));
            if (docForm) docForm.addEventListener('submit', this.prepareRequest.bind(this));
            if (confirmPaymentBtn) confirmPaymentBtn.addEventListener('click', this.simulatePayment.bind(this));
            if(trackingBody) trackingBody.addEventListener('click', (e) => {
                const viewButton = e.target.closest('.view-receipt-btn');
                if (viewButton && viewButton.dataset.ref) this.viewReceipt(viewButton.dataset.ref);
            });
        },

        loadTrackingTable() {
            UI.renderList(
                document.getElementById('doc-tracking-body'),
                (App.data.documents.requests || []),
                (r) => {
                    let s = 'status-pending', i = 'fa-solid fa-clock';
                    switch (r.status) {
                        case 'Ready for Pickup': s = 'status-processing'; i = 'fa-solid fa-box'; break;
                        case 'Payment Verified': s = 'status-info'; i = 'fa-solid fa-check'; break;
                        case 'Completed': s = 'status-cleared'; i = 'fa-solid fa-check-double'; break;
                    }
                    return `<tr><td>${r.ref ?? 'N/A'}</td><td>${r.doc ?? 'N/A'}</td><td>${r.date ?? 'N/A'}</td><td><span class="${r.payment === 'Paid' ? 'status-paid' : 'status-pending'}">${r.payment ?? 'Pending'}</span></td><td><span class="${s}"><i class="${i}" style="margin-right: 5px;"></i>${r.status ?? 'Unknown'}</span></td><td>${r.payment === 'Paid' ? `<button class="btn btn-small view-receipt-btn" data-ref="${r.ref}">View Receipt</button>` : '---'}</td></tr>`;
                },
                "No document requests found."
            );
        },

        updateFormPricing() {
            const docTypeEl = document.getElementById('doc-type');
            const copiesEl = document.getElementById('doc-copies');
            const docFeeEl = document.getElementById('doc-fee');
            const procFeeEl = document.getElementById('doc-processing-fee');
            const totalFeeEl = document.getElementById('doc-total-fee');

            if (!docTypeEl || !copiesEl || !docFeeEl || !procFeeEl || !totalFeeEl) return;

            const selectedOption = docTypeEl.options[docTypeEl.selectedIndex];
            const price = parseFloat(selectedOption?.dataset.price); // Will be NaN if no selection
            const copies = Math.max(1, parseInt(copiesEl.value) || 1);
            copiesEl.value = copies;

            const processingFee = 25.00;
            const docFee = (isNaN(price) ? 0 : price) * copies; // Handle NaN price
            const total = docFee + processingFee;

            docFeeEl.textContent = `₱${docFee.toFixed(2)}`;
            procFeeEl.textContent = `₱${processingFee.toFixed(2)}`;
            totalFeeEl.textContent = `₱${total.toFixed(2)}`;

            // *** FIX 1: Correctly save the total to Data ***
            Data.update('documents.pendingRequest._tempTotal', total);
        },

        prepareRequest(e) {
            e.preventDefault();
            const docTypeEl = document.getElementById('doc-type');
            const purposeInput = document.getElementById('doc-purpose');
            const dateInput = document.getElementById('doc-pickup-date');
            const copiesInput = document.getElementById('doc-copies');
            const confirmBtn = document.getElementById('doc-confirm-payment-btn');

            const docType = docTypeEl.value;
            if (!docType) {
                UI.showToast("Please select a document type.", "error");
                return;
            }
            if (!purposeInput.value.trim()) {
                UI.showToast("Please enter the purpose.", "error");
                purposeInput.focus();
                return;
            }
            if (!dateInput.value) {
                UI.showToast("Please select a pickup date.", "error");
                dateInput.focus();
                return;
            }

            const pickupDate = new Date(dateInput.value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (pickupDate < today) {
                UI.showToast("Pickup date must be today or later.", "error");
                dateInput.focus();
                return;
            }

            // *** FIX 2: Correctly read the total from Data ***
            let data = Data.get();
            const calculatedTotal = data.documents.pendingRequest?._tempTotal;

            // *** FIX 3: Add robust check for NaN/invalid total ***
            if (calculatedTotal === undefined || isNaN(calculatedTotal) || calculatedTotal <= 0) {
                console.error("Calculated total invalid:", calculatedTotal);
                UI.showToast("Error calculating total fee. Please select a document type first.", "error"); // Added clearer message
                return;
            }

            const pendingRequestData = {
                doc: docTypeEl.options[docTypeEl.selectedIndex].text,
                copies: copiesInput.value,
                purpose: purposeInput.value.trim(),
                pickupDate: dateInput.value,
                total: calculatedTotal
            };

            Data.update('documents.pendingRequest', pendingRequestData);

            UI.showToast("Request details saved. Proceed to payment.", "info");
            if (confirmBtn) confirmBtn.disabled = false;
        },

        simulatePayment() {
            const pendingRequest = Data.get().documents.pendingRequest;

            if (!pendingRequest || !pendingRequest.total) {
                UI.showToast("Please submit the request details first.", "error");
                document.getElementById('doc-confirm-payment-btn').disabled = true;
                return;
            }

            UI.showConfirmation(
                "Confirm Payment",
                `Proceed with payment of ₱${pendingRequest.total.toFixed(2)} for ${pendingRequest.doc}?`,
                () => {
                    const today = new Date();
                    const refNum = `DR-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

                    const newRequest = {
                        ref: refNum,
                        date: today.toISOString().slice(0, 10),
                        payment: "Paid",
                        status: "Payment Verified",
                        ...pendingRequest
                    };

                    let currentData = Data.get();
                    if (!currentData.documents.requests) currentData.documents.requests = [];
                    currentData.documents.requests.push(newRequest);
                    currentData.documents.pendingRequest = null; // Clear pending request
                    Data.save(currentData);

                    UI.showToast("Payment verified! Request is processing.", "success");

                    const docForm = document.getElementById('doc-request-form');
                    if (docForm) docForm.reset();

                    this.updateFormPricing(); // Reset form pricing
                    this.loadTrackingTable();

                    const confirmBtn = document.getElementById('doc-confirm-payment-btn');
                    if (confirmBtn) confirmBtn.disabled = true;

                    const fileInput = document.getElementById('doc-receipt-upload');
                    if (fileInput) fileInput.value = '';

                    this.viewReceipt(refNum, true); // Show receipt
                }
            );
        },

        viewReceipt(ref, isNew = false) {
            const request = (App.data.documents.requests || []).find(r => r.ref === ref);
            if (!request) {
                UI.showToast("Could not find receipt details.", "error");
                return;
            }

            const title = isNew ? "Payment Successful - Receipt" : "View Receipt";
            const message = `
                <p><strong>Student:</strong> ${App.data.profile.name ?? 'N/A'}</p>
                <p><strong>Ref. No:</strong> ${request.ref ?? 'N/A'}</p>
                <p><strong>Document:</strong> ${request.doc ?? 'N/A'} (x${request.copies ?? 'N/A'})</p>
                <p><strong>Amount Paid:</strong> ₱${request.total?.toFixed(2) ?? '0.00'}</p>
                <p><strong>Payment Status:</strong> ${request.payment ?? 'N/A'}</p>
                <p><strong>Request Status:</strong> ${request.status ?? 'N/A'}</p>
                <hr>
                <p>📣 <strong>Bring this receipt (or ref. no) when picking up your document.</strong></p>
            `;

            UI.showConfirmation(title, message, () => {
                UI.showToast("Printing receipt... (demo)", "info");
                // In a real app, you'd trigger a print function here.
            });

            const confirmBtn = document.getElementById('modal-confirm-btn');
            confirmBtn.textContent = "Print Receipt";
            const cancelBtn = document.getElementById('modal-cancel-btn');
            cancelBtn.textContent = "Close";
        }
    };

    // ==================================================================
// 10. NOTIFICATIONS MODULE (Renumbered & Corrected)
// ==================================================================
const Notifications = {
    init() {
        const bellBtn = document.getElementById('notification-bell-btn');
        const dropdown = document.getElementById('notification-dropdown');
        const markAllReadBtn = document.getElementById('mark-all-read-btn');
        const notificationList = document.getElementById('notification-list');

        if (bellBtn) {
            bellBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent click from immediately closing dropdown
                dropdown?.classList.toggle('hidden');
            });
        }

        if (markAllReadBtn) {
            markAllReadBtn.addEventListener('click', this.markAllRead.bind(this));
        }

        if (notificationList) {
            notificationList.addEventListener('click', (e) => {
                const listItem = e.target.closest('li[data-id]');
                if (listItem) {
                    const notificationId = parseInt(listItem.dataset.id);
                    const linkPage = listItem.dataset.link;
                    this.markAsRead(notificationId);
                    if (linkPage) {
                        UI.navigateToPage(linkPage);
                    }
                    // Close dropdown after click
                    dropdown?.classList.add('hidden');
                }
            });
        }

        // Close dropdown if clicking outside
        document.addEventListener('click', (e) => {
            if (!dropdown?.classList.contains('hidden') && !bellBtn?.contains(e.target) && !dropdown?.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });

        this.loadNotifications(); // Load initial notifications
        this.ensureNotificationsExist(); // Ensure the key exists in data
    },

    ensureNotificationsExist() {
        let currentData = Data.get();
        if (!currentData.notifications) {
            console.log("Initializing notifications array in data.");
            currentData.notifications = [];
            Data.save(currentData); // Save the updated structure
        } else if (!Array.isArray(currentData.notifications)) {
             console.error("Notifications data is not an array! Resetting.");
             currentData.notifications = [];
             Data.save(currentData);
        }
    },


    loadNotifications() {
        const listElement = document.getElementById('notification-list');
        if (!listElement) return;

        // Ensure notifications array exists and is an array
        this.ensureNotificationsExist();
        let notifications = Data.get().notifications || [];

        // Sort by time, newest first (handle potential invalid dates)
        notifications.sort((a, b) => {
             const dateA = new Date(a.time);
             const dateB = new Date(b.time);
             // If dates are invalid, treat them as equal (or place invalid ones last)
             if (isNaN(dateA.getTime())) return 1;
             if (isNaN(dateB.getTime())) return -1;
             return dateB - dateA; // Sort descending
        });

        if (notifications.length === 0) {
            listElement.innerHTML = '<li>No new notifications.</li>';
        } else {
            listElement.innerHTML = notifications.map(n => {
                 // ** Added safety checks **
                if (!n || typeof n !== 'object') {
                    console.error("Rendering invalid notification item:", n);
                    return '<li>Error: Invalid data</li>'; // Skip bad data
                }
                const message = n.message || "Notification message missing"; // Fallback message
                const timeAgo = this.formatTimeAgo(n.time); // Format time

                return `
                    <li class="${n.unread ? 'unread' : ''}" data-id="${n.id || 'unknown'}" data-link="${n.linkPage || ''}">
                        ${message}
                        <span class="notification-time">${timeAgo}</span>
                    </li>
                `;
            }).join('');
        }
        this.updateCount();
    },

    updateCount() {
        const countBadge = document.getElementById('notification-count');
        if (!countBadge) return;

        this.ensureNotificationsExist();
        const notifications = Data.get().notifications || [];
        const unreadCount = notifications.filter(n => n && n.unread).length; // Added check for n

        if (unreadCount > 0) {
            countBadge.textContent = unreadCount > 9 ? '9+' : unreadCount;
            countBadge.classList.remove('hidden');
        } else {
            countBadge.classList.add('hidden');
        }
    },

    addNotification(message, linkPage = null) {
        this.ensureNotificationsExist();
        let currentData = Data.get();
        let notifications = currentData.notifications || [];

        const newId = notifications.length > 0 ? Math.max(0, ...notifications.map(n => n.id || 0)) + 1 : 1; // Safer ID generation
        const newNotification = {
            id: newId,
            message: message,
            time: new Date().toISOString(),
            unread: true,
            linkPage: linkPage
        };

        notifications.unshift(newNotification); // Add to the beginning

        // Optional: Limit the number of stored notifications
        // if (notifications.length > 20) {
        //     notifications = notifications.slice(0, 20);
        // }

        currentData.notifications = notifications;
        Data.save(currentData);
        this.loadNotifications(); // Refresh UI
    },

    markAsRead(notificationId) {
        // Ensure notificationId is a number
        if (typeof notificationId !== 'number' || isNaN(notificationId)) {
             console.error("markAsRead called with invalid ID:", notificationId);
             return;
        }

        this.ensureNotificationsExist();
        let currentData = Data.get();
        let notifications = currentData.notifications || [];
        let changed = false;

        notifications = notifications.map(n => {
            if (n && n.id === notificationId && n.unread) { // Added check for n
                changed = true;
                return { ...n, unread: false };
            }
            return n;
        });

        if (changed) {
            currentData.notifications = notifications;
            Data.save(currentData);
            this.loadNotifications(); // Refresh UI
        }
    },

    markAllRead() {
        this.ensureNotificationsExist();
        let currentData = Data.get();
        let notifications = currentData.notifications || [];
        let changed = false;

        notifications = notifications.map(n => {
            if (n && n.unread) { // Added check for n
                changed = true;
                return { ...n, unread: false };
            }
            return n;
        });

        if (changed) {
            currentData.notifications = notifications;
            Data.save(currentData);
            this.loadNotifications(); // Refresh UI
            UI.showToast("All notifications marked as read.", "info");
        } else {
             UI.showToast("No unread notifications.", "info");
        }
    },

    // Helper function to format time (e.g., "5m ago", "2h ago", "Oct 21")
    formatTimeAgo(isoString) {
         // ** Added safety checks **
        if (!isoString) {
             console.warn("formatTimeAgo received invalid input:", isoString);
             return "Invalid Date";
        }
        const notificationDate = new Date(isoString);
         // Check if the date object is valid
        if (isNaN(notificationDate.getTime())) {
             console.warn("formatTimeAgo failed to parse date:", isoString);
             return "Invalid Date";
        }

        const now = new Date();
        const diffSeconds = Math.round((now - notificationDate) / 1000);
        const diffMinutes = Math.round(diffSeconds / 60);
        const diffHours = Math.round(diffMinutes / 60);
        const diffDays = Math.round(diffHours / 24);

        if (diffSeconds < 60) {
            return "Just now";
        } else if (diffMinutes < 60) {
            return `${diffMinutes}m ago`;
        } else if (diffHours < 24) {
            return `${diffHours}h ago`;
        } else if (diffDays === 1) {
            return "Yesterday";
        } else if (diffDays < 7) {
             return `${diffDays}d ago`;
        } else {
            return notificationDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    }
};


    // ==================================================================
    // 11. CALENDAR MODULE (Renumbered)
    // ==================================================================
    const Calendar = {
        currentYear: 2025, // Hardcoded for demo
        currentMonth: 9, // 0-indexed (9 = October), hardcoded for demo

        init() {
            // Future: Could add listeners for month navigation buttons here
            // Initial load is handled by UI.navigateToPage
        },

        loadCalendar() {
            const calendarGrid = document.getElementById('calendar-grid');
            const calendarTitle = document.querySelector('#page-calendar h4');
            if (!calendarGrid || !calendarTitle) {
                console.error("Calendar grid or title element not found.");
                return;
            }

            // --- Date Calculations (Hardcoded to Oct 2025 for demo) ---
            const year = this.currentYear;
            const month = this.currentMonth; // October

            const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            calendarTitle.innerHTML = `<i class="fa-solid fa-calendar-alt"></i> Academic Calendar - ${monthNames[month]} ${year}`;

            const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0=Sun, 1=Mon, ...
            const daysInMonth = new Date(year, month + 1, 0).getDate(); // Get last day of current month

            // --- Get Event Data ---
            const exams = App.data.examSchedule || []; //

            // --- Generate Calendar HTML ---
            let calendarHTML = `
                <div class="calendar-header">Sun</div>
                <div class="calendar-header">Mon</div>
                <div class="calendar-header">Tue</div>
                <div class="calendar-header">Wed</div>
                <div class="calendar-header">Thu</div>
                <div class="calendar-header">Fri</div>
                <div class="calendar-header">Sat</div>
            `;

            // Add empty cells for days before the 1st of the month
            for (let i = 0; i < firstDayOfMonth; i++) {
                calendarHTML += `<div class="other-month"></div>`;
            }

            // Add cells for each day of the month
            const today = new Date();
            const todayDate = today.getDate();
            const todayMonth = today.getMonth();
            const todayYear = today.getFullYear();

            for (let day = 1; day <= daysInMonth; day++) {
                let cellClasses = "";
                let dayEventsHTML = "";
                const currentDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`; // YYYY-MM-DD

                // Check if it's the current day
                if (day === todayDate && month === todayMonth && year === todayYear) {
                    cellClasses += " current-day";
                }

                // Check for exams on this day
                const examsOnDay = exams.filter(exam => exam.date === currentDateStr); //
                examsOnDay.forEach(exam => {
                    dayEventsHTML += `<span class="calendar-event exam-day" title="${exam.subject} - ${exam.time} (${exam.room})">${exam.subject}</span>`;
                });

                calendarHTML += `
                    <div class="${cellClasses.trim()}">
                        <span class="day-number">${day}</span>
                        ${dayEventsHTML}
                    </div>
                `;
            }

            // Add empty cells for the next month to fill the grid
            const totalCells = firstDayOfMonth + daysInMonth;
            const remainingCells = (7 - (totalCells % 7)) % 7;
            for (let i = 0; i < remainingCells; i++) {
                calendarHTML += `<div class="other-month"></div>`;
            }

            // --- Update the DOM ---
            calendarGrid.innerHTML = calendarHTML;
        }
    };

    // ==================================================================
    // 12. OTHER MODULES (Library, Announcements, Chatbot) (Renumbered)
    // ==================================================================
    const Announcements = { /* ... unchanged from previous version ... */
        init() { this.loadAnnouncements('all'); const filters = document.querySelector('.announcement-filters'); const list = document.getElementById('announcement-list'); if (filters) filters.addEventListener('click', (e) => { if (e.target.tagName === 'BUTTON' && !e.target.classList.contains('active')) { filters.querySelectorAll('button').forEach(b => b.classList.remove('active')); e.target.classList.add('active'); this.loadAnnouncements(e.target.dataset.filter); } }); if (list) list.addEventListener('click', (e) => { const header = e.target.closest('.announcement-card-header'); if (header) { header.parentElement.classList.toggle('open'); header.setAttribute('aria-expanded', header.parentElement.classList.contains('open')); } const ttsButton = e.target.closest('.tts-btn'); if (ttsButton) { const contentPara = ttsButton.closest('.announcement-card').querySelector('.announcement-card-body p'); if (contentPara) Accessibility.speak(contentPara.textContent); } }); },
        loadAnnouncements(filter) { const list = document.getElementById('announcement-list'); if (!list) return; const filtered = (filter === 'all') ? (App.data.announcements || []) : (App.data.announcements || []).filter(a => a.tag === filter); UI.renderList(list, filtered, (a) => ` <div class="card announcement-card"> <div class="announcement-card-header" role="button" tabindex="0" aria-expanded="false"> <div> <h5>${a.title ?? 'Untitled Announcement'}</h5> <small>${a.date ?? 'No Date'}</small> </div> <span class="tag">${a.tag ?? 'General'}</span> </div> <div class="announcement-card-body"> <p>${a.content ?? 'No content available.'}</p> <button class="btn btn-small tts-btn"><i class="fa-solid fa-volume-up"></i> Read Aloud</button> </div> </div> `, "No announcements found."); list.querySelectorAll('.announcement-card-header').forEach(header => { header.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); header.parentElement.classList.toggle('open'); header.setAttribute('aria-expanded', header.parentElement.classList.contains('open')); } }); }); }
    };

    const Library = { /* ... unchanged from previous version ... */
        init() { this.loadBooks(); const booksBody = document.getElementById('library-books-body'); if (booksBody) booksBody.addEventListener('click', (e) => { const returnButton = e.target.closest('.return-btn'); if (returnButton && returnButton.dataset.title) this.returnBook(returnButton.dataset.title); }); },
        loadBooks() { let totalFines = 0; const today = new Date(); const books = (App.data.library || []).map(book => { const dueDate = new Date(book.due); let fine = book.fine ?? 0; const isOverdue = !isNaN(dueDate) && today > dueDate; if (fine === 0 && isOverdue) { const daysOver = Math.max(0, Math.floor((today - dueDate) / (1000 * 60 * 60 * 24))); fine = daysOver * 10.00; } totalFines += fine; return { ...book, calculatedFine: fine, isOverdue: isOverdue }; }); UI.renderList( document.getElementById('library-books-body'), books, (b) => `<tr${b.isOverdue ? ' style="color: #dc3545;"' : ''}><td>${b.title ?? 'Unknown Title'}</td><td>${b.borrowed ?? 'N/A'}</td><td>${b.due ?? 'N/A'} ${b.isOverdue ? '(Overdue)' : ''}</td><td>₱${b.calculatedFine?.toFixed(2) ?? '0.00'}</td><td><button class="btn btn-small return-btn" data-title="${b.title}">Return</button></td></tr>`, "No books currently borrowed." ); const totalFinesEl = document.getElementById('library-total-fines'); if(totalFinesEl) totalFinesEl.textContent = `₱${totalFines.toFixed(2)}`; },
        returnBook(title) { UI.showConfirmation("Return Book", `Are you sure you want to return "${title}"? Any fines must be settled separately.`, () => { let currentData = Data.get(); currentData.library = (currentData.library || []).filter(b => b.title !== title); Data.save(currentData); this.loadBooks(); UI.showToast(`"${title}" returned.`, "success"); }); }
    };

    const Chatbot = {
        init() {
            const toggleBtn = document.getElementById('chatbot-toggle-btn');
            const header = document.getElementById('chatbot-header');
            const sendBtn = document.getElementById('chatbot-send-btn');
            const queryInput = document.getElementById('chatbot-query');

            if (toggleBtn) toggleBtn.addEventListener('click', this.toggle.bind(this));
            if (header) header.addEventListener('click', (e) => {
                if (e.target.id === 'chatbot-header' || e.target.tagName === 'SPAN') this.toggle();
            });
            if (sendBtn) sendBtn.addEventListener('click', this.sendMessage.bind(this));
            if (queryInput) queryInput.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') this.sendMessage();
            });
        },
        toggle() {
            document.getElementById('chatbot-container')?.classList.toggle('collapsed');
        },

        sendMessage() {
            const input = document.getElementById('chatbot-query');
            if (!input) return;
            const query = input.value.trim().toLowerCase();
            if (!query) return;

            this.addMessage(query, 'user'); // Add user message
            input.value = '';
            this.addMessage("...", "bot", true); // Add thinking indicator (true)

            // Simulate bot thinking time
            setTimeout(() => {
                this.removeThinkingIndicator(); // Remove the "..." bubble
                const response = this.getResponse(query);
                this.addMessage(response, 'bot'); // Add the actual bot response
            }, 1200); // Increased delay slightly for effect
        },

        addMessage(message, type, isThinking = false) {
            const container = document.getElementById('chatbot-messages');
            if (!container) return;

            const messageDiv = document.createElement('div');
            messageDiv.className = `chat-message ${type}`;

            // Create timestamp
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
            const timestampSpan = `<span class="chat-timestamp">${timeString}</span>`;

            if (isThinking) {
                // Add typing animation dots
                messageDiv.innerHTML = `
                    <div class="typing-indicator">
                        <span></span><span></span><span></span>
                    </div>
                    ${timestampSpan}
                `;
                messageDiv.classList.add('thinking'); // Keep thinking class for removal later
            } else {
                // Add message content and timestamp
                messageDiv.innerHTML = `${message} ${timestampSpan}`;
            }

            container.appendChild(messageDiv);
            container.scrollTop = container.scrollHeight; // Scroll to bottom
        },

        removeThinkingIndicator() {
            const thinkingBubble = document.querySelector('#chatbot-messages .chat-message.bot.thinking');
            if (thinkingBubble) thinkingBubble.remove();
        },

        getResponse(query) {
            query = query.toLowerCase();
            if (query.includes('enroll') || query.includes('registration') || query.includes('register')) return "For new students, enrollment is on the 'Registration' page. Existing students can view their printable Registration Form there.";
            if (query.includes('permit') || query.includes('exam pass')) return "Your <strong>Exam Permit</strong> status is on the 'Academics' > 'Exam Permit' tab. If it's pending due to balance, you might be able to request a <strong>Promissory Note</strong> there.";
            if (query.includes('promissory note') || query.includes('promise')) return "You can request a Promissory Note on the 'Academics' > 'Exam Permit' tab if you have an outstanding balance.";
            if (query.includes('payment') || query.includes('pay') || query.includes('fees') || query.includes('balance') || query.includes('tuition')) return "View your account balance, fee breakdown, and make payments on the 'Finance' page.";
            if (query.includes('grade') || query.includes('gpa') || query.includes('standing')) return "Your grades, GPA calculation, and academic standing are under 'Academics' > 'Subjects & Grades'.";
            if (query.includes('classroom') || query.includes('blackboard') || query.includes('course material') || query.includes('online class')) return "Access your course materials and virtual classrooms under 'Academics' > 'E-Classroom'.";
            if (query.includes('document') || query.includes('tor') || query.includes('transcript') || query.includes('certificate')) return "Request official documents like Transcripts (TOR) or Certificates on the 'Documents' page.";
            if (query.includes('clearance') || query.includes('hold')) return "Check your clearance status from different departments on the 'Clearance' page.";
            if (query.match(/^(hi|hello|hey|good morning|good afternoon|good evening)/)) return "Hi there! How can I assist you today?";
            if (query.includes('help')) return "I can help with questions about: Enrollment, Grades, Exam Permits, Payments, Document Requests, Clearance, and E-Classroom access. How can I assist?";
            return "I'm sorry, I couldn't find information about that. Please try rephrasing, or ask about common topics like enrollment, grades, payments, or permits.";
        }
    };


    // ==================================================================
    // 13. SMART FEATURES (Reminders, Timer, Easter Egg) (Renumbered)
    // ==================================================================
    const SmartFeatures = { /* ... unchanged from previous version ... */
        init() { this.checkBirthday(); this.checkReminders(); setInterval(this.checkReminders.bind(this), 5 * 60 * 1000); this.initPomodoro(); this.initKonamiCode(); this.initPredictiveSearch(); },
        checkBirthday() { const today = new Date().toISOString().slice(5, 10); const bday = App.data.profile?.birthday?.slice(5, 10); if (bday && today === bday) { const container = document.getElementById('smart-reminders'); if (container && !container.querySelector('.birthday-message')) { const bdayDiv = document.createElement('div'); bdayDiv.className = 'message-box info birthday-message'; bdayDiv.innerHTML = `🎉 <strong>Happy Birthday, ${App.data.profile.name.split(' ')[0]}!</strong> We wish you all the best.`; container.prepend(bdayDiv); } } },
        checkReminders() { const container = document.getElementById('smart-reminders'); if (!container) return; container.querySelectorAll('.message-box:not(.birthday-message)').forEach(el => el.remove()); const today = new Date(); const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1); const tomorrowStr = tomorrow.toISOString().slice(0, 10); const schedule = App.data.examSchedule || []; const examTomorrow = schedule.find(e => e.date === tomorrowStr); if (examTomorrow) { const examDiv = document.createElement('div'); examDiv.className = 'message-box error'; examDiv.innerHTML = `<i class="fa-solid fa-warning"></i> <strong>Exam Reminder!</strong> You have an exam for <strong>${examTomorrow.subject}</strong> tomorrow, ${tomorrowStr} at ${examTomorrow.time}.`; container.appendChild(examDiv); } const balance = App.data.finance?.balance; if (balance > 0) { const paymentDiv = document.createElement('div'); paymentDiv.className = 'message-box error'; paymentDiv.innerHTML = `<i class="fa-solid fa-warning"></i> <strong>Payment Due!</strong> You have an outstanding balance of <strong>₱${balance.toFixed(2)}</strong>. Please settle it to generate your exam permit.`; container.appendChild(paymentDiv); } },
        initPomodoro() { const openBtn = document.getElementById('pomodoro-open'); const closeBtn = document.getElementById('pomodoro-close'); const startBtn = document.getElementById('pomodoro-start'); const pauseBtn = document.getElementById('pomodoro-pause'); const resetBtn = document.getElementById('pomodoro-reset'); const timerWidget = document.getElementById('pomodoro-timer'); if (openBtn) openBtn.addEventListener('click', () => { if(timerWidget) timerWidget.style.display = 'block'; }); if (closeBtn) closeBtn.addEventListener('click', () => { if(timerWidget) timerWidget.style.display = 'none'; this.pauseTimer(); }); if (startBtn) startBtn.addEventListener('click', this.startTimer.bind(this)); if (pauseBtn) pauseBtn.addEventListener('click', this.pauseTimer.bind(this)); if (resetBtn) resetBtn.addEventListener('click', this.resetTimer.bind(this)); },
        startTimer() { const p = App.pomodoro; if (p.isRunning) return; p.isRunning = true; document.getElementById('pomodoro-start')?.classList.add('hidden'); document.getElementById('pomodoro-pause')?.classList.remove('hidden'); if (p.timerId) clearInterval(p.timerId); p.timerId = setInterval(() => { if (p.seconds === 0) { if (p.minutes === 0) { clearInterval(p.timerId); p.timerId = null; p.isRunning = false; UI.showToast("Study session complete! Take a break.", "success"); try { new Audio('https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg').play(); } catch (e) { console.warn("Audio playback failed.", e); } this.resetTimer(); document.getElementById('pomodoro-start')?.classList.remove('hidden'); document.getElementById('pomodoro-pause')?.classList.add('hidden'); } else { p.minutes--; p.seconds = 59; } } else p.seconds--; this.updateTimerDisplay(); }, 1000); },
        pauseTimer() { const p = App.pomodoro; if (p.timerId) { clearInterval(p.timerId); p.timerId = null; } p.isRunning = false; document.getElementById('pomodoro-start')?.classList.remove('hidden'); document.getElementById('pomodoro-pause')?.classList.add('hidden'); },
        resetTimer() { const p = App.pomodoro; this.pauseTimer(); p.minutes = 25; p.seconds = 0; this.updateTimerDisplay(); document.getElementById('pomodoro-start')?.classList.remove('hidden'); document.getElementById('pomodoro-pause')?.classList.add('hidden'); },
        updateTimerDisplay() { const p = App.pomodoro; const display = document.getElementById('pomodoro-display'); if (display) display.textContent = `${String(p.minutes).padStart(2, '0')}:${String(p.seconds).padStart(2, '0')}`; },
        initKonamiCode() { window.addEventListener('keydown', (e) => { const p = App; if (e.key === p.konamiCode[p.konamiIndex]) { p.konamiIndex++; if (p.konamiIndex === p.konamiCode.length) { this.triggerEasterEgg(); p.konamiIndex = 0; } } else { if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) || p.konamiIndex > 0) p.konamiIndex = 0; if (e.key === p.konamiCode[0]) p.konamiIndex = 1; } }); },
        triggerEasterEgg() { const egg = document.getElementById('easter-egg'); if (!egg) return; egg.classList.remove('hidden'); egg.classList.add('show'); setTimeout(() => { egg.classList.remove('show'); setTimeout(() => egg.classList.add('hidden'), 500); }, 3000); },
        initPredictiveSearch() { const searchInput = document.getElementById('predictive-search'); const resultsBox = document.getElementById('search-results'); if (!searchInput || !resultsBox) return; searchInput.addEventListener('input', (e) => { const query = e.target.value.toLowerCase().trim(); if (query.length < 2) { resultsBox.classList.add('hidden'); return; } let results = []; const currentData = Data.get(); (currentData.subjects || []).forEach(s => { if (s.name.toLowerCase().includes(query) || s.code.toLowerCase().includes(query)) results.push({ name: `${s.code} - ${s.name}`, page: 'academics' }); }); (currentData.announcements || []).forEach(a => { if (a.title.toLowerCase().includes(query)) results.push({ name: `Announcement: ${a.title}`, page: 'announcements' }); }); document.querySelectorAll('.sidebar-menu .nav-link span').forEach(linkSpan => { const link = linkSpan.closest('.nav-link'); if (link && linkSpan.textContent.toLowerCase().includes(query)) results.push({ name: `Page: ${linkSpan.textContent.trim()}`, page: link.dataset.page }); }); const uniqueResults = results.filter((result, index, self) => index === self.findIndex((r) => (r.page === result.page && r.name === result.name))); resultsBox.innerHTML = ''; if (uniqueResults.length > 0) { uniqueResults.slice(0, 5).forEach(r => resultsBox.innerHTML += `<a href="#" class="search-result nav-link" data-page="${r.page}">${r.name}</a>`); resultsBox.classList.remove('hidden'); } else { resultsBox.innerHTML = `<span style="display: block; padding: 10px; text-align: center; color: var(--text-color-secondary);">No results found</span>`; resultsBox.classList.remove('hidden'); } }); searchInput.addEventListener('blur', () => { setTimeout(() => { if (!resultsBox.contains(document.activeElement)) resultsBox.classList.add('hidden'); }, 200); }); resultsBox.addEventListener('click', () => { setTimeout(() => { resultsBox.classList.add('hidden'); searchInput.value = ''; }, 50); }); }
    };


    // ==================================================================
    // 14. ACCESSIBILITY (Renumbered)
    // ==================================================================
    const Accessibility = { /* ... unchanged from previous version ... */
        init() { document.querySelectorAll('.sidebar-menu .nav-link').forEach(link => { link.setAttribute('tabindex', '0'); link.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); UI.navigateToPage(link.dataset.page); } }); }); document.querySelectorAll('.tabs .tab-link, .btn, .icon-btn').forEach(el => { if(!el.hasAttribute('tabindex') && (el.tagName !== 'BUTTON' && el.tagName !== 'A')) el.setAttribute('tabindex', '0'); }); },
        speak(text) { const synth = window.speechSynthesis; if ('speechSynthesis' in window && synth) { synth.cancel(); if (!text) { console.warn("Speak function called with empty text."); return; } const utterance = new SpeechSynthesisUtterance(text); utterance.lang = 'en-US'; utterance.onerror = (event) => { console.error('SpeechSynthesisUtterance error:', event.error); UI.showToast("Text-to-Speech error.", "error"); }; synth.speak(utterance); } else UI.showToast("Your browser does not support Text-to-Speech.", "error"); }
    };


    // ==================================================================
    // 15. KICKSTART THE APP (Renumbered)
    // ==================================================================
    // App.init(); // OLD way
    App.checkAuthentication(); // NEW: Start authentication flow

});