require("dotenv").config({ path: "../.env" });
module.exports = {
  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS, // 替换为你的 MySQL 密码
    database: process.env.DB_NAME,
  },
  server: {
    port: 8010,
  },
};
