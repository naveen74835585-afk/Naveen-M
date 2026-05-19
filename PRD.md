# Project Requirement Document (PRD): Namma Pustaka

## 1. Project Overview
**Namma Pustaka** (Our Book) is a digital library management ecosystem designed to modernize school libraries. It bridges the gap between traditional physical libraries and digital accessibility by using QR technology for tracking and AI for localized content consumption (Kannada summaries).

---

## 2. Problem Statement
Many schools lack an efficient way to track book circulation, leading to lost inventory and manual record-keeping errors. Additionally, language barriers often prevent students from fully engaging with diverse literature. There is a need for a lightweight, mobile-first solution that automates tracking and enhances book discovery through AI-powered local language assistance.

---

## 3. Target Audience
- **Students**: Primary users who browse the catalog, scan books to read, and access AI summaries.
- **Teachers/Librarians**: Administrative users who manage the inventory, register students, and track the status of issued books.

---

## 4. Functional Requirements

### 4.1 User Authentication & Roles
- **Role Selection**: Users must choose between 'Student' or 'Teacher' during login/registration.
- **Identity Matching**: Teachers can register students with unique IDs; students log in using these teacher-provided credentials.

### 4.2 The Digital Shelf (Inventory)
- **Search & Filter**: Real-time search by title, author, or serial number.
- **Book Details**: Display book cover, availability status, unique serial number, and community ratings/reviews.

### 4.3 QR Scanning & Transactions
- **Scan to Issue/Return**: Hardware-accelerated camera access to scan book QR codes.
- **Manual Override**: Option to enter book IDs manually if the camera/QR code is damaged.
- **Context-Aware Logic**: The system identifies if a scanned book is being "Borrowed" or "Returned" based on its current state in the register.

### 4.4 AI Smart Features (Kannada Summaries)
- **Instant Translation/Summarization**: Integration with Google Gemini API to generate concise book summaries in Kannada.
- **Learning Support**: Helps students understand English/other language books in their mother tongue.

### 4.5 Teacher Dashboard (Management)
- **Inventory Management**: Add new books to the system with auto-generated serials.
- **Student Enrollment**: Register students into the system to grant them access.
- **Issue Register**: A bird's-eye view of all current transactions, including student names, book titles, and dates.
- **Overdue Alerts**: Visual indicators and notifications for books that have exceeded the return duration.

---

## 5. Technical Specifications

### 5.1 Frontend Architecture
- **Framework**: React 19 (Functional Components, Hooks).
- **Styling**: Tailwind CSS 4 per "Mobile-First" design patterns.
- **Motion**: Framer Motion for high-fidelity UI transitions and feedback.

### 5.2 Mobile Integration
- **Platform**: Cross-platform Android support via **Capacitor**.
- **Permissions**: Explicit camera permissions for Scanner functionality.

### 5.3 Backend & API
- **AI Engine**: `@google/genai` (Gemini Pro) for summary generation.
- **Mock Services/Firebase**: Initial state management via React Context/State (Transitioning to Firebase for real-time multi-user synchronization).

---

## 6. Success Metrics
- **Inventory Accuracy**: Zero delta between physical shelf and digital register.
- **Engagement**: Increase in book "Issue" events per student after providing Kannada summaries.
- **Efficiency**: Reducing book return/issue time to under 5 seconds via QR scanning.

---

## 7. Future Scope
- **Offline Mode**: Support for scanning and tracking in areas with low internet connectivity.
- **Gamification**: Badges and "Leaderboards" for the most active readers.
- **Voice Summaries**: AI-powered text-to-speech for the Kannada summaries to support visually impaired students.
