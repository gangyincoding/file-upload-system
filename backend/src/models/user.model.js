import { pool } from '../config/db.config.js';
import bcrypt from 'bcryptjs';

class User {
  // 创建新用户
  static async create({ username, email, password, role = 'user' }) {
    try {
      // 加密密码
      const hashedPassword = await bcrypt.hash(password, 10);

      const [result] = await pool.execute(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        [username, email, hashedPassword, role]
      );

      return {
        id: result.insertId,
        username,
        email,
        role
      };
    } catch (error) {
      throw error;
    }
  }

  // 根据用户名查找用户
  static async findByUsername(username) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // 根据邮箱查找用户
  static async findByEmail(email) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // 根据ID查找用户
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT id, username, email, role, avatar, created_at FROM users WHERE id = ?',
        [id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // 验证密码
  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // 获取所有用户（管理员功能）
  static async findAll(page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;

      // 获取总数
      const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM users');
      const total = countResult[0].total;

      // 获取用户列表
      const [rows] = await pool.execute(
        'SELECT id, username, email, role, avatar, created_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [limit, offset]
      );

      return {
        users: rows,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // 更新用户信息
  static async update(id, data) {
    try {
      const fields = [];
      const values = [];

      if (data.username) {
        fields.push('username = ?');
        values.push(data.username);
      }
      if (data.email) {
        fields.push('email = ?');
        values.push(data.email);
      }
      if (data.avatar) {
        fields.push('avatar = ?');
        values.push(data.avatar);
      }
      if (data.password) {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        fields.push('password = ?');
        values.push(hashedPassword);
      }

      if (fields.length === 0) {
        throw new Error('没有要更新的字段');
      }

      values.push(id);

      await pool.execute(
        `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
        values
      );

      return await this.findById(id);
    } catch (error) {
      throw error;
    }
  }

  // 删除用户
  static async delete(id) {
    try {
      await pool.execute('DELETE FROM users WHERE id = ?', [id]);
      return true;
    } catch (error) {
      throw error;
    }
  }
}

export default User;
