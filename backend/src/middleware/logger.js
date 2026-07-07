import { TelemetryLog } from '../models/TelemetryLog.js';

export const telemetryMiddleware = (req, res, next) => {
  // We do not await the save() function. 
  // This allows the API to continue instantly while Mongo saves in the background.
  try {
    const logEntry = new TelemetryLog({
      endpoint: req.originalUrl,
      method: req.method,
      ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      headers: {
        user_agent: req.headers['user-agent'],
        content_type: req.headers['content-type'],
        accept: req.headers['accept'],
        authorization_present: !!req.headers['authorization'],
        host: req.headers['host'],
        sec_fetch_site: req.headers['sec-fetch-site'],
        sec_fetch_mode: req.headers['sec-fetch-mode'],
        sec_fetch_dest: req.headers['sec-fetch-dest'],
      },
      query_params: req.query,
      session_id: req.cookies ? req.cookies['sessionId'] : 'none'
    });

    logEntry.save().catch(err => console.error("MongoDB Telemetry Error:", err));
  } catch (error) {
    console.error("Logger skipped due to error:", error);
  }

  // Pass control to the next function (e.g., submitGrievance)
  next();
};