# 📖 Lisu Dictionary - Frontend

A modern, comprehensive English-Lisu dictionary web application built with React. Preserving and promoting the Lisu language spoken by 1.2 million people across China, Myanmar, Thailand, and India.

![Lisu Dictionary](public/logo.png)

## 🌟 Features

- **📚 Comprehensive Dictionary**: English-Lisu translations with detailed etymology
- **🔍 Advanced Search**: Fast and accurate word lookup
- **🗣️ Pronunciation Guides**: Fraser script (Old Lisu) and New Lisu script support
- **💬 Community Discussions**: Connect with learners and native speakers
- **👥 User Profiles**: Track your learning progress
- **💬 Real-time Chat**: Communicate with community members
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **🔐 OAuth Authentication**: Secure login with Google
- **🌐 SEO Optimized**: Structured data for better search engine visibility

## 🚀 Live Demo

Visit: [https://www.lisudictionar.com](https://www.lisudictionar.com)

## 🛠️ Tech Stack

- **Frontend Framework**: React 18.3.1
- **Routing**: React Router 6.26.2
- **Styling**: Tailwind CSS 3.4.18
- **Icons**: Heroicons 2.1.5
- **HTTP Client**: Axios 1.7.7
- **State Management**: React Query 3.39.3
- **Authentication**: Google OAuth (@react-oauth/google)
- **Real-time Communication**: Socket.io Client 4.8.1
- **Charts**: Chart.js 4.4.6 with React wrapper
- **SEO**: React Helmet Async
- **Notifications**: React Hot Toast
- **Date Handling**: date-fns 4.1.0

## 📋 Prerequisites

- Node.js 16+ and npm
- Backend API running (see [lisu-dict-backend](https://github.com/byarpar/lisu-dict-backend))

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/byarpar/lisu-dict-frontend.git
   cd lisu-dict-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.development` file for local development:
   ```env
   REACT_APP_API_URL=http://localhost:3001/api
   REACT_APP_BACKEND_URL=http://localhost:3001
   REACT_APP_APP_NAME=English-Lisu Dictionary
   REACT_APP_VERSION=1.0.0
   REACT_APP_SITE_URL=http://localhost:3000
   REACT_APP_SITE_NAME=Lisu Dictionary
   REACT_APP_SITE_DESCRIPTION=Free English-Lisu dictionary with detailed etymology and translations
   PORT=3000
   REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here
   ```

   For production, create a `.env.production` file:
   ```env
   REACT_APP_API_URL=https://www.lisudictionar.com/api
   REACT_APP_BACKEND_URL=https://www.lisudictionar.com
   REACT_APP_APP_NAME=English-Lisu Dictionary
   REACT_APP_VERSION=1.0.0
   REACT_APP_SITE_URL=https://www.lisudictionar.com
   REACT_APP_SITE_NAME=Lisu Dictionary
   REACT_APP_SITE_DESCRIPTION=Free English-Lisu dictionary with detailed etymology and translations
   REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here
   ```

4. **Start the development server**
   ```bash
   npm start
   ```
   
   The app will open at [http://localhost:3000](http://localhost:3000)

## 🏗️ Build for Production

```bash
npm run build
```

The optimized production build will be created in the `build/` folder.

## 📁 Project Structure

```
lisu-dict-frontend/
├── public/
│   ├── images/          # Static images
│   ├── index.html       # HTML template with SEO meta tags
│   ├── logo.png         # Application logo (PNG)
│   ├── logo.svg         # Application logo (SVG)
│   ├── manifest.json    # PWA manifest
│   ├── robots.txt       # Search engine directives
│   └── sitemap.xml      # Site structure for SEO
├── src/
│   ├── components/      # Reusable React components
│   │   ├── Auth/        # Authentication components
│   │   ├── Layout/      # Layout components (Navbar, Footer, etc.)
│   │   └── ...          # Other feature components
│   ├── contexts/        # React Context providers
│   │   └── AuthContext.js
│   ├── pages/           # Page components
│   │   ├── Home.js
│   │   ├── Dictionary.js
│   │   ├── About.js
│   │   ├── Discussions.js
│   │   └── ...
│   ├── services/        # API service layers
│   │   ├── api.js
│   │   ├── authAPI.js
│   │   ├── notificationsAPI.js
│   │   └── ...
│   ├── App.js           # Main application component
│   ├── index.js         # Application entry point
│   └── index.css        # Global styles (Tailwind)
├── .env.example         # Environment variables template
├── .gitignore           # Git ignore rules
├── LICENSE              # MIT License
├── package.json         # Dependencies and scripts
├── tailwind.config.js   # Tailwind CSS configuration
└── README.md            # This file
```

## 🎨 Key Pages

- **Home** (`/`) - Landing page with hero section and features
- **Dictionary** (`/dictionary`) - Main dictionary search interface
- **Word Detail** (`/word/:id`) - Detailed word information
- **Discussions** (`/discussions`) - Community forum
- **About** (`/about`) - About the Lisu language and culture
- **User Profile** (`/users/:userId`) - User profiles and contributions
- **Settings** (`/settings`) - User settings and preferences
- **Admin Dashboard** (`/admin/*`) - Admin panel (protected route)

## 🔐 Authentication

The app uses Google OAuth for authentication. To set up:

1. Create a project in [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add authorized JavaScript origins and redirect URIs
5. Copy the Client ID to your `.env` file

## 🌐 API Integration

The frontend communicates with the backend API. All API calls are centralized in the `src/services/` directory:

- `api.js` - Base Axios instance with interceptors
- `authAPI.js` - Authentication endpoints
- `dictionaryAPI.js` - Dictionary operations
- `discussionsAPI.js` - Discussion forum
- `notificationsAPI.js` - User notifications
- And more...

## 📱 Responsive Design

Built with mobile-first approach using Tailwind CSS:
- Desktop: Full-featured interface
- Tablet: Optimized layout
- Mobile: Touch-friendly navigation

## 🔍 SEO Optimization

- ✅ Comprehensive meta tags (Open Graph, Twitter Cards)
- ✅ Structured data (Schema.org: WebSite, EducationalOrganization, Language)
- ✅ Sitemap.xml for search engines
- ✅ Robots.txt configuration
- ✅ Semantic HTML structure
- ✅ Optimized images (PNG logo for social media)

## 🧪 Testing

```bash
npm test
```

Run tests in watch mode for development.

## 📦 Deployment

The app is deployed on [Vercel](https://vercel.com). To deploy:

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables on Vercel

Set these in Vercel Dashboard → Settings → Environment Variables:
- `REACT_APP_API_URL`
- `REACT_APP_GOOGLE_CLIENT_ID`
- All other variables from `.env.production`

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **byarpar** - *Initial work* - [GitHub](https://github.com/byarpar)

## 🙏 Acknowledgments

- Lisu community members for their invaluable input
- Contributors to the Fraser script and New Lisu script documentation
- Open-source community for the amazing tools and libraries

## 📞 Contact & Support

- **Website**: [https://www.lisudictionar.com](https://www.lisudictionar.com)
- **Issues**: [GitHub Issues](https://github.com/byarpar/lisu-dict-frontend/issues)
- **Discussions**: Join our community forum at [lisudictionar.com/discussions](https://www.lisudictionar.com/discussions)

## 🌍 About the Lisu Language

The Lisu language is spoken by approximately 1.2 million people:
- **China**: ~700,000 speakers (primarily in Yunnan Province)
- **Myanmar**: ~350,000 speakers
- **Thailand**: ~50,000 speakers
- **India**: ~20,000 speakers

The language belongs to the Loloish branch of the Tibeto-Burman language family and uses two main writing systems: the Fraser script (Old Lisu) and the New Lisu script.

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Offline mode with service workers
- [ ] Audio pronunciations
- [ ] Flashcard system for learning
- [ ] Translation API
- [ ] Advanced analytics for administrators
- [ ] Multi-language support (add more languages beyond English-Lisu)

---

**⭐ Star this repository if you find it helpful!**

**Made with ❤️ for the Lisu community**
# ft-finalproject
