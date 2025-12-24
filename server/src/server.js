const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const db = require('./db');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const app = express();
app.use(cors());
app.use(express.json());

// Multer storage to disk with uuid filenames
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const id = uuidv4();
    // keep original extension
    const ext = path.extname(file.originalname) || '';
    cb(null, id + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    // Accept images and PDFs; add more as needed
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/tiff', 'application/pdf'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Unsupported file type: ' + file.mimetype));
  }
});

// Routes

// Upload one or many files
app.post('/api/invoices/upload', upload.array('files', 10), async (req, res) => {
  try {
    const files = req.files || [];
    const inserted = [];
    const insertStmt = db.prepare(`
      INSERT INTO invoices (id, original_name, filename, mimetype, size, path, created_at, notes)
      VALUES (@id, @original_name, @filename, @mimetype, @size, @path, @created_at, @notes)
    `);

    for (const f of files) {
      const id = path.basename(f.filename, path.extname(f.filename));
      const created_at = new Date().toISOString();
      const relativePath = path.relative(process.cwd(), f.path);
      const rec = {
        id,
        original_name: f.originalname,
        filename: f.filename,
        mimetype: f.mimetype,
        size: f.size,
        path: relativePath,
        created_at,
        notes: ''
      };
      insertStmt.run(rec);

      // If image, generate thumbnail
      if (f.mimetype.startsWith('image/')) {
        const thumbPath = path.join(UPLOAD_DIR, `${id}_thumb.jpg`);
        try {
          await sharp(f.path)
            .resize({ width: 400, height: 400, fit: 'inside' })
            .jpeg({ quality: 70 })
            .toFile(thumbPath);
        } catch (err) {
          console.warn('Thumbnail generation failed', err);
        }
      }

      inserted.push(rec);
    }

    res.json({ ok: true, files: inserted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// List invoices (basic pagination)
app.get('/api/invoices', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || '50', 10), 200);
  const offset = parseInt(req.query.offset || '0', 10);
  const rows = db.prepare('SELECT id, original_name, filename, mimetype, size, path, created_at, notes FROM invoices ORDER BY created_at DESC LIMIT ? OFFSET ?').all(limit, offset);
  res.json({ ok: true, invoices: rows });
});

// Get invoice metadata
app.get('/api/invoices/:id', (req, res) => {
  const id = req.params.id;
  const row = db.prepare('SELECT * FROM invoices WHERE id = ?').get(id);
  if (!row) return res.status(404).json({ ok: false, error: 'Not found' });
  res.json({ ok: true, invoice: row });
});

// Download file
app.get('/api/invoices/:id/file', (req, res) => {
  const id = req.params.id;
  const row = db.prepare('SELECT * FROM invoices WHERE id = ?').get(id);
  if (!row) return res.status(404).json({ ok: false, error: 'Not found' });
  const filePath = path.resolve(process.cwd(), row.path);
  res.download(filePath, row.original_name);
});

// Thumbnail (image only)
app.get('/api/invoices/:id/thumbnail', (req, res) => {
  const id = req.params.id;
  const thumb = path.join(UPLOAD_DIR, `${id}_thumb.jpg`);
  if (fs.existsSync(thumb)) {
    res.sendFile(thumb);
  } else {
    res.status(404).json({ ok: false, error: 'Thumbnail not found' });
  }
});

// Delete invoice (file + db row)
app.delete('/api/invoices/:id', (req, res) => {
  const id = req.params.id;
  const row = db.prepare('SELECT * FROM invoices WHERE id = ?').get(id);
  if (!row) return res.status(404).json({ ok: false, error: 'Not found' });

  try {
    const filePath = path.resolve(process.cwd(), row.path);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    const thumb = path.join(UPLOAD_DIR, `${id}_thumb.jpg`);
    if (fs.existsSync(thumb)) fs.unlinkSync(thumb);

    db.prepare('DELETE FROM invoices WHERE id = ?').run(id);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Invoice API listening on port ${PORT}`);
});
