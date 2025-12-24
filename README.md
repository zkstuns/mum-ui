# Invoice Manager (mum-ui) — Minimal MVP

This project is a minimal invoice manager that lets you upload invoices (PDFs, images), stores them on disk and keeps metadata in a SQLite database. It also offers a simple React UI to upload and list invoices.

Features
- Upload PDFs and common image types (jpg, png, jpeg, tiff)
- Stores file metadata in SQLite
- Download and delete invoices
- Image thumbnail generation
- Extendable: add OCR (Tesseract), S3 storage, invoice parsers

Quick start (local)
1. Backend
   - cd server
   - npm install
   - npm run dev
2. Frontend
   - cd web
   - npm install
   - npm run dev

Docker (optional)
- docker-compose up --build
- Backend: http://localhost:4000
- Frontend: http://localhost:5173

If you’d like, I can push these files into your repo `zkstuns/mum-ui` on a new branch and open a pull request.
