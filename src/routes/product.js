import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate, authorize } from '../security/authMiddleware.js';
import { listProducts, getProduct, createProduct, updateProduct, removeProduct, getBySlug, updateStock, updateVariantStock } from '../controllers/productController.js';

const uploadDir = path.resolve('uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g,'_')}`)
});
const upload = multer({ storage });

const router = Router();

const uploadFields = upload.fields([
  { name: 'images', maxCount: 6 },
  { name: 'video', maxCount: 1 }
]);

router.get('/', listProducts);
router.get('/slug/:slug', getBySlug);
router.get('/:id', getProduct);
router.post('/', authenticate, authorize(['admin']), uploadFields, createProduct);
router.put('/:id', authenticate, authorize(['admin']), uploadFields, updateProduct);
router.delete('/:id', authenticate, authorize(['admin']), removeProduct);
router.put('/:id/stock', authenticate, authorize(['admin']), updateStock);
router.put('/:id/variant/:idx/stock', authenticate, authorize(['admin']), updateVariantStock);

export default router;


