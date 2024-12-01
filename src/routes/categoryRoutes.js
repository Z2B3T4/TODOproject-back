const express = require("express");
const categoryController = require("../controllers/categoryController");
const router = express.Router();

// 创建新分类
router.post("/", categoryController.createCategory);
// 获取所有分类信息
router.get("/", categoryController.getAllCategories);
// 删除分类（逻辑删除）
router.delete("/:id", categoryController.deleteCategory);
module.exports = router;
