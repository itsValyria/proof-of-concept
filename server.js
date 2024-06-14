// Importeer het npm pakket express uit de node_modules map
import express from "express";

// Importeer de zelfgemaakte functie fetchJson uit de ./helpers map
import fetchJson from "./helpers/fetch-json.js";

// Declare de base URL van de directus API
const baseUrl = "https://fdnd-agency.directus.app";

// Maak een nieuwe express app aan
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Stel ejs in als template engine
app.set("view engine", "ejs");

// Stel de map met ejs templates in
app.set("views", "./views");

// Gebruik de map 'public' voor statische resources, zoals stylesheets, afbeeldingen en client-side JavaScript
app.use(express.static("public"));

// Fetch de data van de API
const fetchFromApi = (endpoint) => {
  return fetchJson(baseUrl + '/' + endpoint)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error('Error fetching from API:', error);
      throw error;
    });
};

// Functie om alle data van fabrique_art_objects te fetchen
const fetchData = async () => {
  const allItems = await fetchFromApi("items/fabrique_art_objects");
  return allItems;
};

// Maak een index route die de data van fabrique_art_objects haalt en render naar de view
app.get("/", (request, response) => {
  fetchData()
    .then((data) => {
      response.render("index", { artObjects: data });
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      response.status(500).send("Error fetching data");
    });
});

// Poort instellen waarop Express moet luisteren
app.set("port", process.env.PORT || 8000);

// Start de Express server
app.listen(app.get("port"), function () {
  console.log(`Applicatie gestart op http://localhost:${app.get("port")}`);
});