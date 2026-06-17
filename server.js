// ============================================================
// Avaliacao Final - API REST de Catalogo de Filmes e Series
// ============================================================
//
// Implementa este servidor do zero usando:
//
// - express
// - dotenv
// - mysql2/promise
//
// A base de dados, a tabela e os dados iniciais devem ser criados
// no MySQL Workbench com o ficheiro database.sql.
//
// Rotas obrigatorias:
//
// GET    /api/estado  //verificar se o servidor está a funcionar
// GET    /api/filmes
// GET    /api/filmes/:id
// POST   /api/filmes
// PUT    /api/filmes/:id
// PATCH  /api/filmes/:id/visto
// DELETE /api/filmes/:id
//
// Testa tudo no Postman, Thunder Client ou Bruno.


require("dotenv").config(); 

  const express = require('express');

const app = express(); 
const mysql = require('mysql2/promise'); 

const PORT = 3000;  
const path = require("path") 
app.use(express.static(path.join(__dirname,"frontend")))


const cors = require('cors');
app.use(cors()); 
app.use(express.json());


//ligaçao ao Mysql
const pool = mysql.createPool({ //

    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT || 3306),
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  });

//middleware para tratamento de erros
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ mensagem: 'Erro interno no servidor' });
}); 

//#########################################
//                ROTAS
//#########################################

// GET    /api/estado  //verificar se o servidor está a funcionar
app.get('/api/estado', (req, res) => {
  res.status(200).json({
    status: 'sucesso',
    mensagem: 'O servidor está operacional!',
    timestamp: new Date().toISOString()
  });
});

// GET    /api/filmes
app.get('/api/filmes', async (req, res) => {
       
        const querySQL = 'SELECT * FROM filmes';
        const [rows] = await pool.query(querySQL);
        console.log(rows);
         res.status(200).json(rows);
});


// GET    /api/filmes/:id
//rota para ler filme com id 9
app.get('/api/filmes/:id', async (req, res) => {
    const id = Number(req.params.id);
    const query = "SELECT * FROM filmes WHERE id = ?";
    const [filme] = await pool.execute(query, [id]);
    if (filme.length === 0) {
        res.status(404).json({ mensagem: "Este filme não existe!" });
    }
   
    res.status(200).json(filme[0])
})

// POST   /api/filmes
//rota postman a criar um filme com o titulo "Harry Potter - ordem da fenix",
  app.post("/api/filmes", async (req,res) =>{
    const {titulo, realizador, genero, ano, tipo, avaliacao } = req.body
    if (!titulo || !realizador || !genero || !ano){
        return res.status(400).json({erro: "Preencher campos obrigatórios"})
    }
    const query ="INSERT INTO filmes (titulo, realizador, genero, ano, tipo, avaliacao) VALUES (?,?,?,?,?,?)"
    const [resposta] = await pool.execute(query, [titulo, realizador, genero, ano, tipo, avaliacao])
    res.status(201).json({mensagem: "Filme criado com sucesso!"})
  })


// PUT    /api/filmes/:id
  //rota postman a alterar o filme com id 12 para "Harry Potter - A Pedra Filosofal"
  app.put("/api/filmes/:id", async (req,res) =>{
    const id = Number(req.params.id)
    const query = "SELECT * FROM filmes WHERE id = ?"
    const [filme] = await pool.execute(query, [id])
    if (filme.length === 0){
        res.status(404).json({mensagem: "Este filme não existe!"})
    }
    const {titulo, realizador, genero, ano} = req.body
    if (!titulo || !realizador || !genero || !ano){
        return res.status(400).json({erro: "Preencher campos obrigatórios"})
    }
    const query2 = "UPDATE filmes SET titulo = ?, realizador = ?, genero = ?, ano = ? WHERE id = ?"
    const [resultado] = await pool.execute(query2, [titulo, realizador, genero, ano, id])
 
    res.status(200).json({mensagem: "Filme alterado com sucesso"})
  })

  
// PATCH  /api/filmes/:id/visto
//rota para alterar o estado do filme com id 12 para true ou false, dependendo do estado atual
app.patch ("/api/filmes/:id/visto", async (req,res) =>{
    const id = Number(req.params.id)
    const query = "SELECT * FROM filmes WHERE id = ?"
    const [filme] = await pool.execute(query, [id])
    if (filme.length === 0){
        res.status(404).json({mensagem: "Este filme não existe!"})
    }   
    const novaVista = !filme[0].visto
    const query2 = "UPDATE filmes SET visto = ? WHERE id = ?"
    const [resultado] = await pool.execute(query2, [novaVista, id])
    res.status(200).json({mensagem: "Filme visto alterado com sucesso!"})
})

// DELETE /api/filmes/:id
//rota para apagar o filme com id 13
    app.delete("/api/filmes/:id", async (req,res) =>{
    const id = Number(req.params.id)
    const query = "SELECT * FROM filmes WHERE id = ?"
    const [filme] = await pool.execute(query, [id])
    if (filme.length === 0){
        res.status(404).json({mensagem: "Este filme não existe!"})
    }
    const query2 = "DELETE FROM filmes WHERE id = ?"
    const [resultado] = await pool.execute(query2, [id])
    res.status(204).json()
})












app.listen(PORT, async ()=>{
    console.log(`O servidor está a rolar na porta ${PORT}`)
try {
    await pool.execute("SELECT 1")
    console.log("Ligada à base de dados")
} catch (error) {
    console.log("Erro na ligação ao servidor SQL")
}
  
})
