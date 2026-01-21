/**
 * Wrap an async Express handler and forward rejections to next().
 * @param {(req:any,res:any,next:any)=>Promise<any>} fn
 */
function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

module.exports = { asyncHandler }
