# Namma Pustaka 📚

**Namma Pustaka** is a modern, AI-powered digital library platform designed to empower students and teachers. It simplifies book management through QR-based tracking, provides instant access to book catalogs, and offers AI-generated summaries in Kannada to bridge language barriers.

## ✨ Features

- **Dual Role System**: Tailored experiences for both Students and Teachers.
- **Digital Shelf**: Browse and search the entire library catalog with ease.
- **QR Scanner**: Seamlessly issue or return books by scanning their unique QR IDs.
- **AI Kannada Summaries**: Powered by Gemini AI, get instant summaries of any book in Kannada.
- **Role-Based Register**: Teachers can manage book issues, track overdue items, and register new students.
- **Mobile First Design**: Fully responsive UI with a native mobile feel, powered by Capacitor for Android.

## 🚀 Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS 4.
- **Animations**: Motion (framer-motion).
- **Icons**: Lucide React.
- **AI Integration**: Google Gemini API (@google/genai).
- **QR Engine**: html5-qrcode & qrcode.react.
- **Mobile Wrapper**: Ionic Capacitor.

## 🛠️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Android Studio](https://developer.android.com/studio) (for Android deployment)
- A Google Gemini API Key

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/namma-pustaka.git
   cd namma-pustaka
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Environment Variables**:
   Create a `.env` file in the root directory and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

### 📱 Android Deployment

1. **Build the web project**:
   ```bash
   npm run build
   ```

2. **Sync with Android**:
   ```bash
   npx cap sync android
   ```

3. **Open in Android Studio**:
   ```bash
   npx cap open android
   ```
   From Android Studio, you can run the app on an emulator or a physical device.

## 📸 Screenshots

*(Add your screenshots here)*

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an issue.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
Built with ❤️ for a better reading culture.
