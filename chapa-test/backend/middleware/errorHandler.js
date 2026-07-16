function errorHandler(err, req, res, next) {
  console.error('Error:', err.message);
  if (err.stack) console.error(err.stack);

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: 'Validation error', errors: messages });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid ID format' });
  }

  if (err.code === 11000) {
    return res.status(409).json({ success: false, message: 'Duplicate transaction' });
  }

  if (err.code === 'ECONNABORTED') {
    return res.status(504).json({ success: false, message: 'Request timed out. Please try again.' });
  }

  if (err.response) {
    const { status, data } = err.response;

    if (status === 401 || status === 403) {
      return res.status(502).json({ success: false, message: 'Chapa API authentication failed. Check your secret key.' });
    }

    return res.status(status >= 500 ? 502 : 400).json({
      success: false,
      message: 'Chapa API error',
      error: data,
    });
  }

  if (err.code === 'ECONNREFUSED') {
    return res.status(503).json({ success: false, message: 'Service unavailable. Chapa API could not be reached.' });
  }

  if (err.code === 'ERR_NETWORK') {
    return res.status(503).json({ success: false, message: 'Network error. Could not reach Chapa API.' });
  }

  res.status(500).json({ success: false, message: 'Internal server error' });
}

module.exports = errorHandler;
