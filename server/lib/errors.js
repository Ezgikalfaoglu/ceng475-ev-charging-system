// Standard API error format. OWNER: PM.
//
// Every failed request returns the same JSON shape:
//   { "error": { "code": "VALIDATION_ERROR", "message": "Please fix the highlighted fields.",
//                "details": { "email": "Enter a valid email address." } } }
// `code` is stable and machine readable, `message` is safe to show to the user, and `details`
// (optional) maps form field names to messages.
// Express 5 forwards errors thrown inside (async) handlers to the error middleware below,
// so route code can simply `throw badRequest(...)`.

export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const badRequest = (message = 'Please fix the highlighted fields.', details) =>
  new ApiError(400, 'VALIDATION_ERROR', message, details);
export const unauthorized = (message = 'Please sign in to continue.', code = 'UNAUTHENTICATED') =>
  new ApiError(401, code, message);
export const forbidden = (message = 'You do not have permission to do this.') =>
  new ApiError(403, 'FORBIDDEN', message);
export const notFound = (what = 'Resource') => new ApiError(404, 'NOT_FOUND', `${what} was not found.`);
export const conflict = (message, details, code = 'CONFLICT') => new ApiError(409, code, message, details);

/** 501 for features whose write logic is still assigned to a developer branch. */
export const notImplemented = (owner, feature) =>
  new ApiError(
    501,
    'NOT_IMPLEMENTED',
    `${feature} is not implemented on main yet. Owner: ${owner.name} (branch ${owner.branch}).`
  );

export function apiNotFoundHandler(req, res, next) {
  next(new ApiError(404, 'NOT_FOUND', `No API route for ${req.method} ${req.originalUrl}.`));
}

// eslint-disable-next-line no-unused-vars
export function errorMiddleware(err, req, res, next) {
  if (err instanceof ApiError) {
    const body = { code: err.code, message: err.message };
    if (err.details) body.details = err.details;
    return res.status(err.status).json({ error: body });
  }
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ error: { code: 'INVALID_JSON', message: 'The request body is not valid JSON.' } });
  }
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({ error: { code: 'PAYLOAD_TOO_LARGE', message: 'The request body is too large.' } });
  }
  console.error('[server error]', err);
  return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong on the server.' } });
}
