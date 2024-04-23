import {readJSON} from "../../utils.js";
import {randomUUID} from "node:crypto";


// en ECM (ecma script modules) no funciona el extraer un json asi)
// se podria extraer la info con fs (file sistem)
// import fs from "node:fs";
// const peliculas = JSON.parse(fs.readFile("./peliculas.json"));
const peliculas = readJSON("./peliculas.json");

export class modeloPelicula {

    static getAll = async () => {
        if (peliculas) return peliculas
        else return "No se encontraron peliculas"
    }

    static getByGenreYear = async ({ genre, year }) => {
        if (genre && year){
            return peliculas.filter(
                pelicula => pelicula.genre.some(g => g.toLowerCase() == genre.toLowerCase())
                && pelicula.year == year
            )
        }
        return peliculas
    }

    static getById = async ({id}) => {
        const peliculaEncontrada = peliculas.find(peliculaEncontrada => peliculaEncontrada.id == id)
        return peliculaEncontrada
    }

    static crearPelicula = async (input) => {
        const newMovie = {
            // se genera el id usando crypto (modulo de node)
            id : randomUUID(),
            // se atrapa toda la info de result porque toda está debidamente validada
            ...input
        }
    
        //esto no es rest porque se esta guardando el estado
        peliculas.push(newMovie)
        return newMovie
    }

    static eliminarPelicula = async ({id}) => {
        const peliIndex = peliculas.findIndex(pelicula => pelicula.id == id)

        if(peliIndex < 0) {
            return false
        }
        peliculas.splice(peliIndex, 1)
        return true
    }

    static modificarPelicula = async ({id, input}) => {
        const peliIndex = peliculas.findIndex(pelicula => pelicula.id == id);

        // no se ha encontrado el indice de la pelicula
        if(peliIndex < 0) {
            return false
        }
        
        const peliculaModificada = {
            ...peliculas[peliIndex],
            ...input
        }
        peliculas[peliIndex] = peliculaModificada;
        return peliculaModificada
    }
}