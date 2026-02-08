import express from 'express';
import pokemon from './schema/pokemon.js';

import './connect.js';

const app = express();

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

/*
app.get('/pokemons', async (req, res) => {
  try {
    const pokemons = await pokemon.find({});
    res.json(pokemons);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
})
*/

app.get('/pokemons/:param', async (req, res) => {
  try {
    const param = req.params.param;
    const pokeId = parseInt(param, 10);
    
    let poke;
    if (!isNaN(pokeId)) {
      // Recherche par ID
      poke = await pokemon.findOne({ id: pokeId });
    } else {
      // Recherche par nom (english ou french)
      poke = await pokemon.findOne({
        $or: [
          { "name.english": { $regex: param, $options: 'i' } },
          { "name.french": { $regex: param, $options: 'i' } }
        ]
      });
    }
    
    if (poke) {
      res.json(poke);
    } else {
      res.status(404).json({ error: 'Pokemon not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//GET les pokemons 20 par 20, faire un systeme de pagination,
app.get('/pokemons', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    const pokemons = await pokemon.find({}).skip(skip).limit(limit);
    res.json(pokemons);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
})





console.log('Server is set up. Ready to start listening on a port.');

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});