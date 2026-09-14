import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import pool from '../db.js';
import { validateSignup } from '../validators/authValidator.js';

const router = Router();

router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  const error = validateSignup(username, email, password);

  if(error !== null) {
    return res.status(400).json({
      message: error
    })
  }
  
  try {
    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `
        INSERT INTO users (username, email, password_hash)
        VALUES ($1, $2, $3)
        RETURNING id, username, email, created_at
      `,
      [username, email, passwordHash]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);

    if((error as any).code === '23505') {
      return res.status(409). json({
        message: 'Email already exists'
      });
    }
    return res.status(500). json({
      message: 'Failed to create user'
    });
  }
});

router.post('/login', async(req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      `
        SELECT id, username, email, password_hash
        FROM users
        WHERE email = $1
      `,
      [email]
    );

    const user = result.rows[0];
    if(!user) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!
    );

    res.json({
      token
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Failed to login'
    });
  }
});

export default router;