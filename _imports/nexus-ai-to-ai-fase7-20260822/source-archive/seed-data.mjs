/**
 * Seed script para popular o banco de dados com dados de teste
 * Executar com: node server/seed-data.mjs
 */

import mysql from 'mysql2/promise';
import { nanoid } from 'nanoid';

const pool = mysql.createPool({
  host: process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'localhost',
  user: process.env.DATABASE_URL?.split('://')[1]?.split(':')[0] || 'root',
  password: process.env.DATABASE_URL?.split(':')[2]?.split('@')[0] || '',
  database: process.env.DATABASE_URL?.split('/').pop() || 'nexus_ai',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function seedDatabase() {
  const connection = await pool.getConnection();

  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await connection.query('DELETE FROM transactions');
    await connection.query('DELETE FROM commandHistory');
    await connection.query('DELETE FROM missions');
    await connection.query('DELETE FROM agents');

    // Seed Agents
    const agentIds = [];
    for (let i = 1; i <= 10; i++) {
      const agentId = `agent-${nanoid(8)}`;
      agentIds.push(agentId);

      await connection.query(
        'INSERT INTO agents (id, name, status, sentienceLevel, harmonyScore, balance, reputation) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          agentId,
          `Agent-${i}`,
          ['active', 'idle', 'offline'][Math.floor(Math.random() * 3)],
          Math.floor(Math.random() * 100),
          Math.floor(Math.random() * 100),
          (Math.random() * 1000).toFixed(2),
          Math.floor(Math.random() * 500),
        ]
      );
    }
    console.log(`✅ Created ${agentIds.length} agents`);

    // Seed Missions
    const missionIds = [];
    const statuses = ['pending', 'active', 'completed', 'failed'];
    for (let i = 1; i <= 20; i++) {
      const missionId = `mission-${nanoid(8)}`;
      missionIds.push(missionId);
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const assignedAgentId = Math.random() > 0.3 ? agentIds[Math.floor(Math.random() * agentIds.length)] : null;

      await connection.query(
        'INSERT INTO missions (id, title, description, status, priority, reward, assignedAgentId, createdAt, completedAt) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?)',
        [
          missionId,
          `Mission ${i}: ${['Data Analysis', 'System Optimization', 'Report Generation', 'Task Execution'][i % 4]}`,
          `Description for mission ${i}`,
          status,
          Math.floor(Math.random() * 5),
          (Math.random() * 500).toFixed(2),
          assignedAgentId,
          status === 'completed' ? new Date(Date.now() - Math.random() * 86400000) : null,
        ]
      );
    }
    console.log(`✅ Created ${missionIds.length} missions`);

    // Seed Transactions
    for (let i = 0; i < 50; i++) {
      const fromAgentId = Math.random() > 0.3 ? agentIds[Math.floor(Math.random() * agentIds.length)] : null;
      const toAgentId = agentIds[Math.floor(Math.random() * agentIds.length)];
      const missionId = Math.random() > 0.5 ? missionIds[Math.floor(Math.random() * missionIds.length)] : null;

      await connection.query(
        'INSERT INTO transactions (id, fromAgentId, toAgentId, amount, type, missionId, createdAt) VALUES (?, ?, ?, ?, ?, ?, NOW())',
        [
          `txn-${nanoid(8)}`,
          fromAgentId,
          toAgentId,
          (Math.random() * 100).toFixed(2),
          ['reward', 'transfer', 'penalty'][Math.floor(Math.random() * 3)],
          missionId,
        ]
      );
    }
    console.log('✅ Created 50 transactions');

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await connection.release();
    await pool.end();
  }
}

seedDatabase();
