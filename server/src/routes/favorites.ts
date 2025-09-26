import express from 'express';
import {
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  checkFavorite,
  syncFavorites
} from '../controllers/favoritesController';
import { authenticate as protect } from '../middleware/auth';

const router = express.Router();

router.route('/')
  .get(protect, getFavorites)
  .post(protect, addToFavorites);

router.route('/sync')
  .post(protect, syncFavorites);

router.route('/:productId')
  .delete(protect, removeFromFavorites);

router.route('/check/:productId')
  .get(protect, checkFavorite);

export default router;