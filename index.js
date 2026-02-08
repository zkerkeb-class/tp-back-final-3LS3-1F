import express from 'express';
import cors from 'cors';
import pokemon from './schema/pokemon.js';
import './connect.js';

const app = express();

app.use(cors());
app.use(express.json());

// Test serveur
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// GET paginé
app.get('/pokemons', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const pokemons = await pokemon.find({}).skip(skip).limit(limit);
    res.json(pokemons);
  } catch {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET par id OU nom
app.get('/pokemons/:param', async (req, res) => {
  try {
    const param = req.params.param;
    const pokeId = parseInt(param, 10);

    const poke = !isNaN(pokeId)
      ? await pokemon.findOne({ id: pokeId })
      : await pokemon.findOne({
          $or: [
            { "name.english": { $regex: `^${param}$`, $options: 'i' } },
            { "name.french": { $regex: `^${param}$`, $options: 'i' } }
          ]
        });

    if (!poke) {
      return res.status(404).json({ error: 'Pokemon not found' });
    }

    res.json(poke);
  } catch {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE
app.delete('/pokemons/:id', async (req, res) => {
  try {
    const pokeId = parseInt(req.params.id, 10);
    const deleted = await pokemon.findOneAndDelete({ id: pokeId });

    if (!deleted) {
      return res.status(404).json({ error: 'Pokemon not found' });
    }

    res.json({ message: 'Pokemon deleted' });
  } catch {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// UPDATE
app.put('/pokemons/:id', async (req, res) => {
  try {
    const pokeId = parseInt(req.params.id, 10);

    const updatedPokemon = await pokemon.findOneAndUpdate(
      { id: pokeId },
      req.body,
      { new: true }
    );

    if (!updatedPokemon) {
      return res.status(404).json({ error: 'Pokemon not found' });
    }

    res.json(updatedPokemon);
  } catch {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
