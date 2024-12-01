const express = require("express");
const config = require("./config");
const taskRoutes = require("./routes/taskRoutes");
const groupRoutes = require("./routes/groupRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const cors = require("cors");
const app = express();

// 中间件
app.use(express.json()); // 解析 JSON 请求体

app.use(cors());
// 路由
app.use("/todo/tasks", taskRoutes);
app.use("/todo/groups", groupRoutes);
app.use("/todo/categorys", categoryRoutes);
// 启动服务
app.listen(config.server.port, () => {
  console.log(`Server is running on http://localhost:${config.server.port}`);
});
