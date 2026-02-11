# 🚀 Quick Start Guide

## Get Up and Running in 5 Minutes

### 1. Copy Files (30 seconds)
Copy all files from this directory to your `src/` folder:
```bash
# From your project root
cp /mnt/user-data/outputs/*.jsx src/
cp /mnt/user-data/outputs/*.js src/
```

### 2. Install Dependencies (2 minutes)
```bash
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled
```

### 3. Add Fonts to index.html (30 seconds)
Open `index.html` and add this in the `<head>`:
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700;800&display=swap" rel="stylesheet">
```

### 4. Set Environment Variable (30 seconds)
Create/update `.env` file:
```
VITE_API_BASE_URL=http://localhost:8000
```
*(Replace with your actual API URL)*

### 5. Update main.jsx (30 seconds)
```javascript
import App from './App'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

### 6. Run! (30 seconds)
```bash
npm run dev
```

## ✅ Checklist

- [ ] All 11 files copied to `src/`
- [ ] Dependencies installed
- [ ] Fonts added to index.html
- [ ] Environment variable set
- [ ] main.jsx updated
- [ ] App running on localhost

## 🎉 You're Done!

Visit `http://localhost:5173` (or your dev server URL) and enjoy your world-class stock scanner!

## 📱 Test on Mobile

1. Find your local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Visit `http://YOUR_IP:5173` from your phone
3. Experience the beautiful mobile UI!

## 🐛 Troubleshooting

**Error: Cannot find module '@mui/material'**
→ Run: `npm install @mui/material @mui/icons-material @emotion/react @emotion/styled`

**Fonts not loading**
→ Check that the Google Fonts link is in `<head>` of index.html

**API errors**
→ Verify `VITE_API_BASE_URL` in `.env` is correct
→ Ensure backend server is running

**Theme not working**
→ Clear browser cache and localStorage
→ Check browser console for errors

## 💡 Pro Tips

1. **Dark Mode**: Click the sun/moon icon in top-right
2. **Mobile Menu**: On mobile, click hamburger menu (☰)
3. **Strategy Stats**: Hover over strategy cards to see backtest data
4. **Scroll to Top**: Scroll down to see the floating ↑ button
5. **Notifications**: Allow browser notifications for real-time alerts

## 🎨 Customization

Want to customize colors? Edit `src/theme.js`:
```javascript
primary: {
  main: "#00d4aa", // Change this!
}
```

## 📚 Next Steps

- Read `README.md` for detailed documentation
- Check `IMPROVEMENTS.md` to see all enhancements
- Explore the code - it's well-commented!
- Start trading! 📈

---

**Need help?** Check the main README.md file for detailed information.

**Enjoying it?** Give feedback on what else you'd like to see!
