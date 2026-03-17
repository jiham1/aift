const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { Pool } = require('pg'); // Neon DB 연결용

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Neon DB 설정 (Render의 Environment Variables에 DATABASE_URL 등록 필수)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.use(express.static(__dirname)); // HTML 파일 서빙

io.on('connection', async (socket) => {
  console.log('유저 접속됨');

  // 1. 처음 접속 시 기존 글들을 DB에서 가져와서 보여주기
  const result = await pool.query('SELECT * FROM posts ORDER BY created_at DESC LIMIT 20');
  socket.emit('load posts', result.rows);

  // 2. 누군가 새 글을 썼을 때
  socket.on('new post', async (data) => {
    const { author, content } = data;
    // DB에 저장
    const insertQuery = 'INSERT INTO posts (author, content) VALUES ($1, $2) RETURNING *';
    const newPost = await pool.query(insertQuery, [author, content]);
    
    // 접속한 모든 사람에게 새 글 전송 (실시간 동기화!)
    io.emit('render post', newPost.rows[0]);
  });
});

server.listen(3000, () => console.log('서버가 3000번 포트에서 실행 중!'));
