# Lisu Dictionary - Frontend

Modern React application for the Lisu Dictionary with responsive design and intuitive user interface.

## Features

- **Search Interface**: Advanced search with filters and pagination
- **User Authentication**: Login/Register functionality
- **Admin Dashboard**: Complete administration interface
- **Word Management**: Add, edit, delete words (admin only)
- **Etymology Management**: Manage word origins and etymology
- **Excel Import/Export**: Bulk word import and export functionality
- **User Management**: Admin interface for managing users
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

## Technologies

- **Framework**: React 18
- **Routing**: React Router DOM
- **State Management**: React Query for server state
- **Styling**: Tailwind CSS with Heroicons
- **Forms**: React Hot Toast for notifications
- **File Upload**: React Dropzone
- **Excel Processing**: XLSX library
- **HTTP Client**: Axios

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/byarpar/english-lisu-dictionary-frontend.git
cd english-lisu-dictionary-frontend
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```
REACT_APP_API_URL=http://localhost:3001/api
```

4. Start the development server
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Create production build
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App (one-way operation)

## Features Overview

### Public Features
- Search words in English and Lisu
- View word definitions and etymology
- Browse dictionary entries

### User Features
- User registration and authentication
- Personal dashboard
- Search history (if implemented)

### Admin Features
- **Dashboard**: System statistics and overview
- **Word Management**: 
  - Add new words
  - Edit existing words
  - Delete words
  - Bulk import from Excel
  - Export to Excel
- **User Management**:
  - View all users
  - Manage user roles
  - Activate/deactivate users
- **Etymology Management**:
  - Add word origins
  - Edit etymology entries
  - Link words to etymologies
- **System Settings**:
  - Database management
  - System configuration
  - Audit logs

## API Integration

The frontend communicates with the backend API at:
- Development: `http://localhost:3001/api`
- Production: Configure via environment variables

### Main API Endpoints Used
- `/auth/*` - Authentication
- `/words/*` - Word management
- `/search/*` - Search functionality
- `/etymology/*` - Etymology management
- `/admin/*` - Admin operations

## Folder Structure

```
src/
├── components/          # Reusable components
│   ├── admin/          # Admin-specific components
│   ├── Auth/           # Authentication components
│   ├── Layout/         # Layout components
│   ├── Search/         # Search components
│   └── UI/             # General UI components
├── contexts/           # React contexts
├── hooks/              # Custom hooks
├── pages/              # Page components
├── services/           # API services
└── utils/              # Utility functions
```

## Deployment

### Build for Production
```bash
npm run build
```

This creates a `build/` directory with optimized files ready for deployment.

### Deploy to Static Hosting
The build folder can be deployed to any static hosting service:
- Netlify
- Vercel
- GitHub Pages
- AWS S3
- etc.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License
