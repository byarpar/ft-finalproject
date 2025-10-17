#!/bin/bash

# Lisu Dictionary Admin Dashboard - Quick Setup Script
# This script helps verify the admin dashboard setup

echo "🚀 Lisu Dictionary Admin Dashboard Setup"
echo "========================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found"
    echo "Please run this script from the lisu-dict-frontend directory"
    exit 1
fi

echo "✅ Found package.json"
echo ""

# Check Node and npm versions
echo "📦 Checking Node.js and npm..."
node --version
npm --version
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "⚠️  node_modules not found. Running npm install..."
    npm install
else
    echo "✅ node_modules directory exists"
fi
echo ""

# Verify Chart.js dependencies
echo "📊 Verifying Chart.js dependencies..."
if grep -q '"chart.js"' package.json; then
    echo "✅ chart.js found in package.json"
else
    echo "❌ chart.js not found. Installing..."
    npm install chart.js react-chartjs-2
fi

if grep -q '"react-chartjs-2"' package.json; then
    echo "✅ react-chartjs-2 found in package.json"
else
    echo "❌ react-chartjs-2 not found. Installing..."
    npm install react-chartjs-2
fi
echo ""

# Check required admin components
echo "🔍 Checking admin components..."
COMPONENTS=(
    "src/pages/AdminDashboard.js"
    "src/components/admin/DashboardOverview.js"
    "src/components/admin/UsersManagement.js"
    "src/components/admin/WordsManagement.js"
    "src/components/admin/DiscussionsManagement.js"
    "src/components/admin/CategoriesAndTags.js"
    "src/components/admin/ReportsAnalytics.js"
    "src/components/admin/AdminSettings.js"
    "src/components/admin/AdminProfile.js"
    "src/components/admin/StatCard.js"
)

for component in "${COMPONENTS[@]}"; do
    if [ -f "$component" ]; then
        echo "✅ $component"
    else
        echo "❌ Missing: $component"
    fi
done
echo ""

# Check backend connection
echo "🔌 Checking backend API..."
API_URL="${REACT_APP_API_URL:-http://localhost:3001}"
echo "API URL: $API_URL"

if command -v curl &> /dev/null; then
    if curl -s "${API_URL}/api/health" > /dev/null 2>&1; then
        echo "✅ Backend API is reachable"
    else
        echo "⚠️  Backend API not responding at ${API_URL}"
        echo "   Make sure the backend server is running"
    fi
else
    echo "⚠️  curl not found, skipping API check"
fi
echo ""

# Check for admin user
echo "👤 Admin User Setup"
echo "-------------------"
echo "To access the admin dashboard, you need:"
echo "1. A user account with role = 'admin' in the database"
echo "2. Valid authentication token"
echo ""
echo "To create an admin user, run this SQL in your database:"
echo ""
echo "UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';"
echo ""

# Summary
echo "📋 Setup Summary"
echo "================"
echo ""
echo "Admin Dashboard Routes:"
echo "  - /admin              Dashboard Overview"
echo "  - /admin/users        Users Management"
echo "  - /admin/words        Words Management"
echo "  - /admin/discussions  Discussions Management"
echo "  - /admin/categories   Categories & Tags"
echo "  - /admin/reports      Reports & Analytics"
echo "  - /admin/settings     Settings"
echo "  - /admin/profile      Admin Profile"
echo ""
echo "📚 Documentation:"
echo "  - ADMIN_DASHBOARD_COMPLETE_IMPLEMENTATION.md"
echo ""
echo "🎉 Setup verification complete!"
echo ""
echo "To start the development server:"
echo "  npm start"
echo ""
echo "Then navigate to: http://localhost:3000/admin"
