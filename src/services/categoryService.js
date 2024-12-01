const CategoryModel = require("../models/categoryModel");
const { format } = require("date-fns");
exports.createCategory = async (categoryData) => {
  try {
    // 将请求数据封装为 CategoryModel 实例
    const category = new CategoryModel(categoryData);

    // 检查分类名称是否已存在
    const exists = await CategoryModel.exists(category.name);
    if (exists) {
      return { code: 400, msg: "分类名称已存在", data: {} };
    }

    // 创建分类
    await CategoryModel.create({
      name: category.name,
      description: category.description,
      color: category.color,
    });

    return { code: 200, msg: "添加成功", data: {} };
  } catch (error) {
    console.error("Error in createCategory:", error.message);
    throw new Error("数据库操作失败");
  }
};
exports.getAllCategories = async () => {
  try {
    // 查询所有未被逻辑删除的分类
    const categories = await CategoryModel.getAll();

    // 格式化日期字段
    const formattedCategories = categories.map((category) => ({
      ...category,
      created_at: category.created_at
        ? format(new Date(category.created_at), "yyyy-MM-dd")
        : null,
      updated_at: category.updated_at
        ? format(new Date(category.updated_at), "yyyy-MM-dd")
        : null,
    }));

    return { code: 200, msg: "查询成功", data: formattedCategories };
  } catch (error) {
    console.error("Error in getAllCategories:", error.message);
    throw new Error("数据库操作失败");
  }
};
exports.deleteCategory = async (id) => {
  try {
    // 检查分类是否存在
    const exists = await CategoryModel.existsById(id);
    if (!exists) {
      return { code: 400, msg: "分类不存在", data: {} };
    }

    // 删除分类（逻辑删除）
    await CategoryModel.deleteById(id);

    return { code: 200, msg: "删除成功", data: {} };
  } catch (error) {
    console.error("Error in deleteCategory:", error.message);
    throw new Error("数据库操作失败");
  }
};
