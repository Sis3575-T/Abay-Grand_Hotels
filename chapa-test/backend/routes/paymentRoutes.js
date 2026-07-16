const express = require('express');
const router = express.Router();
const { initialize, verify, history } = require('../controllers/paymentController');
const { validatePaymentInit } = require('../middleware/validators');

router.post('/initialize', validatePaymentInit, initialize);
router.get('/verify/:tx_ref', verify);
router.get('/history', history);

module.exports = router;
