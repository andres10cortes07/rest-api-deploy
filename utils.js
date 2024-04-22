//? el peliculas.json se puede usar usando require, es decir, es como si nosotros crearamos la propia funcion require()
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

export const readJSON = (ruta)=>{
    return require(ruta)
}