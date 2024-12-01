const pool = require("../db");

class CategoryModel {
  constructor({ id = null, name, description = null, color }) {
    this.id = id; // 分类 ID
    this.name = name; // 分类名称
    this.description = description; // 分类描述
    this.color = color; // 分类颜色
  }

  // 插入新分类
  static async create({ name, description, color }) {
    console.log("创建分类");
    const [result] = await pool.query(
      `
      INSERT INTO task_categories (name, description, color, created_at, updated_at)
      VALUES (?, ?, ?, NOW(), NOW())
      `,
      [name, description || null, color]
    );
    return result;
  }

  // 检查分类名称是否存在
  static async exists(name) {
    const [result] = await pool.query(
      `
      SELECT id
      FROM task_categories
      WHERE name = ? AND is_deleted = 0
      `,
      [name]
    );
    return result.length > 0;
  }
  // 查询所有未被逻辑删除的分类
  static async getAll() {
    const [rows] = await pool.query(`
      SELECT id, name, description, color, created_at, updated_at
      FROM task_categories
      WHERE is_deleted = 0
      ORDER BY created_at ASC
    `);
    return rows;
  }
  // 检查分类是否存在
  static async existsById(id) {
    const [result] = await pool.query(
      `
      SELECT id
      FROM task_categories
      WHERE id = ? AND is_deleted = 0
      `,
      [id]
    );
    return result.length > 0;
  }

  // 删除分类（逻辑删除）
  static async deleteById(id) {
    const [result] = await pool.query(
      `
      UPDATE task_categories
      SET is_deleted = 1, updated_at = NOW()
      WHERE id = ?
      `,
      [id]
    );
    return result;
  }
}

module.exports = CategoryModel;
