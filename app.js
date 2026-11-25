require("dotenv").config();

const express = require("express");
const nunjucks = require("nunjucks");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Falta la variable MONGODB_URI. Configúrala antes de iniciar la aplicación.");
  process.exit(1);
}

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

nunjucks.configure("views", {
  autoescape: true,
  express: app,
  noCache: process.env.NODE_ENV !== "production"
});

const client = new MongoClient(MONGODB_URI);
let discos;

function validarId(id) {
  return ObjectId.isValid(id);
}

app.get("/", async (req, res, next) => {
  try {
    const lista = await discos.find().sort({ titulo: 1 }).toArray();
    res.render("index.njk", { discos: lista });
  } catch (error) {
    next(error);
  }
});

app.get("/discos/nuevo", (req, res) => {
  res.render("formulario.njk", { disco: {}, accion: "/discos", titulo: "Añadir disco" });
});

app.post("/discos", async (req, res, next) => {
  try {
    const { titulo, artista, anio, genero } = req.body;
    if (!titulo || !artista) {
      return res.status(400).send("El título y el artista son obligatorios.");
    }
    await discos.insertOne({
      titulo: titulo.trim(),
      artista: artista.trim(),
      anio: anio ? Number(anio) : null,
      genero: (genero || "").trim()
    });
    res.redirect("/");
  } catch (error) {
    next(error);
  }
});

app.get("/discos/:id/editar", async (req, res, next) => {
  try {
    if (!validarId(req.params.id)) return res.sendStatus(400);
    const disco = await discos.findOne({ _id: new ObjectId(req.params.id) });
    if (!disco) return res.sendStatus(404);
    res.render("formulario.njk", {
      disco,
      accion: `/discos/${disco._id}`,
      titulo: "Editar disco"
    });
  } catch (error) {
    next(error);
  }
});

app.post("/discos/:id", async (req, res, next) => {
  try {
    if (!validarId(req.params.id)) return res.sendStatus(400);
    const { titulo, artista, anio, genero } = req.body;
    await discos.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: {
        titulo: (titulo || "").trim(),
        artista: (artista || "").trim(),
        anio: anio ? Number(anio) : null,
        genero: (genero || "").trim()
      }}
    );
    res.redirect("/");
  } catch (error) {
    next(error);
  }
});

app.post("/discos/:id/eliminar", async (req, res, next) => {
  try {
    if (!validarId(req.params.id)) return res.sendStatus(400);
    await discos.deleteOne({ _id: new ObjectId(req.params.id) });
    res.redirect("/");
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).send("Ha ocurrido un error en el servidor.");
});

async function iniciar() {
  try {
    await client.connect();
    const db = client.db("discos");
    discos = db.collection("discos");
    app.listen(PORT, "0.0.0.0", () => {
      console.log("Conectado a MongoDB");
      console.log(`Aplicación disponible en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("No se pudo conectar con MongoDB:", error);
    process.exit(1);
  }
}

iniciar();

async function cerrar() {
  await client.close();
  process.exit(0);
}
process.on("SIGINT", cerrar);
process.on("SIGTERM", cerrar);
