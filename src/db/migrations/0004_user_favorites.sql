CREATE TABLE user_favorite (
  userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  toolSlug TEXT NOT NULL,
  createdAt INTEGER NOT NULL,
  PRIMARY KEY (userId, toolSlug)
);
CREATE INDEX user_favorite_userId_idx ON user_favorite(userId);
