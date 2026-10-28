
export default function asyncHandler(handler) {
  if (typeof handler !== "function") {
    throw new TypeError("asyncHandler requires a function.");
  }

  return function wrappedAsyncHandler(req, res, next) {
    return Promise.resolve(handler(req, res, next)).catch(next);
  };
}
