const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    if (parsed.body) req.body = parsed.body;
    if (parsed.query) req.query = parsed.query;
    if (parsed.params) req.params = parsed.params;
    next();
  } catch (error) {
    const issues = error.issues || error.errors;
    if (issues && Array.isArray(issues)) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: issues.map((err) => ({
          field: err.path.slice(1).join('.') || err.path.join('.'),
          message: err.message,
        })),
      });
    }
    next(error);
  }
};

module.exports = validate;
