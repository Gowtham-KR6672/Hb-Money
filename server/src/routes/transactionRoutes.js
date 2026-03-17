import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  createTransaction,
  createTransactionValidators,
  dashboardSummary,
  downloadStatementPdf,
  downloadStatementValidators,
  generateShareCode,
  listTransactionValidators,
  listTransactions,
  lookupShareCode,
  shareCodeValidators,
  statementRangeValidators,
  viewStatementRange
} from '../controllers/transactionController.js';

const router = Router();

router.use(requireAuth);
router.get('/summary', dashboardSummary);
router.get('/statement', statementRangeValidators, viewStatementRange);
router.get('/', listTransactionValidators, listTransactions);
router.post('/', createTransactionValidators, createTransaction);
router.post('/statement/download', downloadStatementValidators, downloadStatementPdf);
router.post('/share-code/generate', generateShareCode);
router.post('/share-code/view', shareCodeValidators, lookupShareCode);

export default router;
