export const errorHandler = (err, req, res, next) => {
  console.error(err.stack)
  const status = err.statusCode || 500
  res.status(status).json({
    error: {
      message: err.message || 'Internal server error',
      code: err.code || 'INTERNAL_ERROR',
    }
  })
}

export const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}
