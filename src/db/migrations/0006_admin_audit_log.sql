CREATE TABLE admin_audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  actorEmail TEXT NOT NULL,
  action TEXT NOT NULL,
  targetUserId TEXT NOT NULL,
  oldValue TEXT,
  newValue TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_admin_audit_log_actor ON admin_audit_log(actorEmail);
CREATE INDEX idx_admin_audit_log_target ON admin_audit_log(targetUserId);
CREATE INDEX idx_admin_audit_log_created ON admin_audit_log(createdAt);
