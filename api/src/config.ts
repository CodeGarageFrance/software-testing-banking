export const config = {
  port: Number(process.env.PORT ?? 3000),
  db: {
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? 'bank',
    password: process.env.DB_PASSWORD ?? 'bank',
    database: process.env.DB_NAME ?? 'bank',
  },
  jwtSecret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
  jwtExpiresIn: '2h',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
};
