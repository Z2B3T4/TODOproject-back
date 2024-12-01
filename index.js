const app = require("./src/app");

const PORT = 8010;

// 启动服务
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
