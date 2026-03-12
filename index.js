const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

// Render의 환경변수 DATABASE_URL을 사용해 Pool 생성
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Neon DB 연결 시 SSL 설정 필수
  }
});

app.get('/', async (req, res) => {
  try {
    // test 테이블에서 name 칼럼 하나만 조회 (LIMIT 1)
    const result = await pool.query('SELECT name FROM test LIMIT 1');
    
    if (result.rows.length > 0) {
      const name = result.rows[0].name;
      res.send(`HELLO ${name}`);
    } else {
      res.send('조회된 데이터가 없습니다.');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('DB 연결 에러가 발생했습니다.');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
