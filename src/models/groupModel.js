const pool = require("../db");

class GroupModel {
  constructor({ id = null, name, description = null, priority = 0 }) {
    this.id = id; // 组别 ID
    this.name = name; // 组别名称
    this.description = description; // 组别描述
    this.priority = priority; // 组别优先级
  }

  // 插入新组别
  static async create({ name, description, priority }) {
    const [result] = await pool.query(
      `
      INSERT INTO task_groups (name, description, priority, created_at, updated_at)
      VALUES (?, ?, ?, NOW(), NOW())
      `,
      [name, description || null, priority || 0]
    );
    return result;
  }

  // 检查组别名称是否存在
  static async exists(name) {
    const [result] = await pool.query(
      `
      SELECT id
      FROM task_groups
      WHERE name = ? AND is_deleted = 0
      `,
      [name]
    );
    return result.length > 0;
  }

  // 查询所有未删除的分组
  static async getAll() {
    const [rows] = await pool.query(`
      SELECT id, name, description, priority, created_at, updated_at
      FROM task_groups
      WHERE is_deleted = 0
      ORDER BY priority , created_at ASC
    `);
    return rows;
  }
  // 检查组别是否存在
  static async existsById(id) {
    const [result] = await pool.query(
      `
      SELECT id
      FROM task_groups
      WHERE id = ? AND is_deleted = 0
      `,
      [id]
    );
    return result.length > 0;
  }

  // 检查组别名称是否重复（排除当前组别）
  static async existsByName(name, excludeId) {
    const [result] = await pool.query(
      `
      SELECT id
      FROM task_groups
      WHERE name = ? AND id != ? AND is_deleted = 0
      `,
      [name, excludeId]
    );
    return result.length > 0;
  }

  // 更新组别信息
  static async updateById({ id, name, description, priority }) {
    const [result] = await pool.query(
      `
      UPDATE task_groups
      SET 
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        priority = COALESCE(?, priority),
        updated_at = NOW()
      WHERE id = ?
      `,
      [name || null, description || null, priority || null, id]
    );
    return result;
  }
  static async delGroupById(id) {
    const [result] = await pool.query(
      `
      UPDATE task_groups
      SET is_deleted = 1
      WHERE id = ?
      `,
      [id]
    );
    return result;
  }
}

module.exports = GroupModel;
