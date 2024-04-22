const cripto = require("node:crypto")
const express = require("express");
const app = express();
const peliculas = require("./peliculas.json");
const { validarPelicula, validarModificacionPelicula } = require("./schemas/schemaMovies");

app.disable("x-powered-by")

app.use(express.json())

const ACCEPTED_ORIGINS = [
    "http://localhost:8080", 
    "http://localhost:4999",
    "http://localhost:4999/peliculas",
    "http://localhost:8080/peliculas",
    "https://rest-api-deploy-s8m8.onrender.com",
    "http://enlaces-de-produccion/"
]

app.get("/", (req, res)=>{
    res.json({message : "Enviaste una peticion tipo GET a la ruta principal de la pagina"})
})

//? para la peticion de buscar peliculas por genero y año se debe modificar el endpoint principal
app.get("/peliculas", (req, res)=>{
    const origin = req.header("origin");
    if(ACCEPTED_ORIGINS.includes(origin) || !origin){
        res.header("Access-Control-Allow-Origin", origin)
    }

    const {genre, year} = req.query;
    if(genre && year) {
        const peliculasFiltradas = peliculas.filter(
            peliculas => 
            peliculas.genre.some(g => g.toLowerCase() == genre.toLowerCase())
            && peliculas.year == year
        )   
        return res.json(peliculasFiltradas)
    }
    res.json(peliculas)
})

//pasamos como parametro el id en el endpoint
app.get(`/peliculas/:id`, (req, res)=>{
    //! captura el id de la peticion
    const {id} = req.params;
    const peliculaEncontrada = peliculas.find(peliculaEncontrada => peliculaEncontrada.id == id)
    if (peliculaEncontrada) res.json(peliculaEncontrada)
    else res.status(404).json({mensaje: "La pelicula no se encontró", codigo: 404})
})

app.post("/peliculas", (req, res)=>{

    const result = validarPelicula(req.body);
    if(result.error) {
        return res.status(400).json({error : JSON.parse(result.error.message)})
    }

    const newMovie = {
        // se genera el id usando crypto
        id : cripto.randomUUID(),
        // se atrapa toda la info de result porque toda está debidamente validada
        ...result.data
    }

    //esto no es rest porque se esta guardando el estado
    peliculas.push(newMovie)
    res.status(201).json(newMovie)
})

app.patch("/peliculas/:id", (req, res)=>{
    const result = validarModificacionPelicula(req.body)

    if (result.error) {
        return res.status(400).json({error: "Error en la estructura"})
    }

    const {id} = req.params;
    const peliIndex = peliculas.findIndex(pelicula => pelicula.id == id);

    // si no se ha encontrado el indice de la pelicula por tanto la pelicula arrojamos un 404
    if(peliIndex < 0) {
        return res.status(401).json({error: "La pelicula no se encontró"})
    }

    const peliculaModificada = {
        ...peliculas[peliIndex],
        ...result.data
    }

    peliculas[peliIndex] = peliculaModificada;
    return res.status(200).json(peliculaModificada)
})

app.delete("/peliculas/:id", (req, res)=>{
    const origin = req.header("origin");
    if(ACCEPTED_ORIGINS.includes(origin) || !origin){
        res.header("Access-Control-Allow-Origin", origin)
    }
    
    const {id} = req.params
    const peliIndex = peliculas.findIndex(pelicula => pelicula.id == id)

    if(peliIndex < 0) {
        return res.status(400).json({error: "Pelicula no encontrada"})
    }

    peliculas.splice(peliIndex, 1)
    return res.status(200).json({message: "Pelicula eliminada correctamente"})
})

app.options("/peliculas/:id", (req, res)=>{
    const origin = req.header("origin");
    if(ACCEPTED_ORIGINS.includes(origin)){
        res.header("Access-Control-Allow-Origin", origin)
        res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE")
    }
    res.sendStatus(200)
    
})

const PORT = process.env.PORT ?? 4999
app.listen(PORT, ()=>{
    console.log(`Server listening port http://localhost:${PORT}`)
})