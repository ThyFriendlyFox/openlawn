# 🌱 LawnRoute - Lawn Care CRM/ERP Platform

A modern, mobile-first lawn care management application built with Next.js, React, Firebase, and Google AI. LawnRoute helps lawn care businesses manage customers, optimize routes, and streamline operations with AI-powered insights.

## ✨ **Features**

### 🗺️ **Interactive Route Management**
- **Real-time Google Maps** integration
- **Automatic route optimization** with traffic data
- **Customer location markers** with status indicators
- **Turn-by-turn navigation** for field crews

### 👥 **Customer Management**
- **Horizontal scrolling** customer cards
- **Real-time customer data** synchronization
- **AI-powered customer summaries** using Google Gemini
- **Comprehensive customer profiles** with service history

### 🔐 **Role-Based Access Control**
- **Employee**: View customers and routes
- **Manager**: Customer management and billing access
- **Administrator**: Full system access and user management

### 📱 **Mobile-First Design**
- **Responsive interface** optimized for all devices
- **Touch-friendly** interactions
- **Progressive Web App** capabilities
- **Offline support** for field work

### 🤖 **AI-Powered Insights**
- **Smart customer summaries** and recommendations
- **Predictive analytics** for business growth
- **Natural language processing** for customer data
- **Automated insights** generation

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18.17+
- npm 9.0+
- Google Cloud Console account
- Firebase project

### **Installation**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vie-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 📚 **Documentation**

- **[User Guide](docs/user-guide.md)** - Complete user manual and feature walkthrough
- **[Technical Architecture](docs/technical-architecture.md)** - System design and technical details
- **[Feature Roadmap](docs/feature-roadmap.md)** - Current features and future plans
- **[Setup Guide](docs/setup-guide.md)** - Detailed installation and configuration

## 🛠️ **Technology Stack**

### **Frontend**
- **Next.js 15** - React framework with App Router
- **React 18** - UI library with hooks and context
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Component library

### **Backend & Services**
- **Firebase Authentication** - User management
- **Firestore Database** - Real-time data storage
- **Firebase Storage** - File storage
- **Firebase Analytics** - User behavior tracking

### **External APIs**
- **Google Maps API** - Maps, geocoding, routing
- **Google AI (Gemini)** - AI-powered features
- **Google Directions API** - Route optimization

## 🏗️ **Project Structure**

```
src/
├── app/                    # Next.js App Router pages
├── components/             # Reusable UI components
│   ├── ui/                # Base UI components (shadcn/ui)
│   └── lawn-route/        # Business-specific components
├── contexts/              # React Context providers
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions and services
└── types/                 # TypeScript type definitions
```

## 🔧 **Configuration**

### **Environment Variables**

Create a `.env.local` file with the following variables:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Google AI (Gemini)
GOOGLE_AI_API_KEY=your_google_ai_api_key
```

### **Required API Setup**

1. **Firebase Project** - Authentication, database, and storage
2. **Google Cloud Console** - Maps and AI APIs
3. **Google AI Studio** - Gemini API access

See the [Setup Guide](docs/setup-guide.md) for detailed configuration instructions.

## 🎯 **Current Status**

### ✅ **Implemented Features**
- User authentication and role management
- Interactive Google Maps integration
- Customer management with real-time sync
- AI-powered customer summaries
- Mobile-responsive design
- Firebase backend integration

### 🚧 **In Development**
- Billing and invoicing system
- Enhanced mobile experience
- Real-time notifications
- Advanced route optimization

### 📋 **Planned Features**
- Customer portal and self-service
- Advanced analytics dashboard
- Multi-vehicle routing
- Third-party integrations

## 🧪 **Testing**

### **Run Tests**
```bash
npm run test
```

### **Run Linting**
```bash
npm run lint
```

### **Type Checking**
```bash
npm run type-check
```

## 🚀 **Deployment**

### **Vercel (Recommended)**
```bash
npm i -g vercel
vercel
```

### **Manual Deployment**
```bash
npm run build
npm start
```

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### **Development Guidelines**
- Follow TypeScript best practices
- Use conventional commit messages
- Write tests for new features
- Update documentation as needed

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 **Support**

- **Documentation**: [docs/](docs/) directory
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Email**: support@lawnroute.com
- **Discord**: [Join our community](https://discord.gg/lawnroute)

## 🙏 **Acknowledgments**

- [Next.js](https://nextjs.org/) - React framework
- [Firebase](https://firebase.google.com/) - Backend services
- [Google Maps](https://developers.google.com/maps) - Maps and location services
- [Google AI](https://ai.google/) - AI and machine learning
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components

---

**Built with ❤️ for lawn care professionals**

*LawnRoute - Streamlining lawn care operations with modern technology and AI-powered insights.*
