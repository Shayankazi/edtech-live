@echo off
echo Installing frontend dependencies...
cd frontend
npm install @tailwindcss/forms @tailwindcss/typography @tailwindcss/aspect-ratio @testing-library/jest-dom @testing-library/react @testing-library/user-event web-vitals
echo Frontend dependencies installed successfully!
pause
