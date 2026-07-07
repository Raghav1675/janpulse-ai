import mongoose from 'mongoose';

const telemetrySchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  endpoint: String,
  method: String,
  ip_address: String,
  headers: {
    user_agent: String,
    content_type: String,
    accept: String,
    authorization_present: Boolean, // Security best practice: log existence, not the raw token
    host: String,
    sec_fetch_site: String,
    sec_fetch_mode: String,
    sec_fetch_dest: String,
  },
  query_params: Object,
  session_id: String // For future cookie tracking
});

export const TelemetryLog = mongoose.model('TelemetryLog', telemetrySchema);