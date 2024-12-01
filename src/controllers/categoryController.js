const categoryService = require("../services/categoryService");

exports.createCategory = async (req, res) => {
  try {
    const { name, description, color } = req.body;

    // 参数校验
    if (!name || !color) {
      return res
        .status(400)
        .json({ code: 400, msg: "分类名称和颜色是必填项", data: {} });
    }

    // 调用服务层
    const result = await categoryService.createCategory({
      name,
      description,
      color,
    });

    // 返回结果
    if (result.code === 400) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (err) {
    console.error("Error in createCategory:", err.message);
    res.status(500).json({ code: 500, msg: "服务器错误", data: {} });
  }
};
exports.getAllCategories = async (req, res) => {
  try {
    // 调用服务层获取数据
    const result = await categoryService.getAllCategories();

    // 返回结果
    res.status(200).json(result);
  } catch (err) {
    console.error("Error in getAllCategories:", err.message);
    res.status(500).json({ code: 500, msg: "服务器错误", data: [] });
  }
};
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // 参数校验
    if (!id) {
      return res
        .status(400)
        .json({ code: 400, msg: "分类 ID 是必填项", data: {} });
    }

    // 调用服务层
    const result = await categoryService.deleteCategory(id);

    // 返回结果
    if (result.code === 400) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (err) {
    console.error("Error in deleteCategory:", err.message);
    res.status(500).json({ code: 500, msg: "服务器错误", data: {} });
  }
};
