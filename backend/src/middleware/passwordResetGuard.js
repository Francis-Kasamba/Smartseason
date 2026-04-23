export const requirePasswordResetCompleted = (req, res, next) => {
  if (req.user?.must_reset_password) {
    return res.status(403).json({
      error: {
        code: 'PASSWORD_RESET_REQUIRED',
        message: 'Password reset required before accessing this resource',
      },
    })
  }

  next()
}
