class AppError extends Error {
  /**
   * @param {string} message
   * @param {{ statusCode?: number, code?: string, details?: any }} [opts]
   */
  constructor(message, opts = {}) {
    super(message)
    this.name = 'AppError'
    this.statusCode = opts.statusCode || 500
    this.code = opts.code
    this.details = opts.details
    Error.captureStackTrace?.(this, this.constructor)
  }
}

module.exports = { AppError }
