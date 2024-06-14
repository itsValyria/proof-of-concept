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

// Functie om data van fabrique_art_objects te fetchen met paginatie en oneindige herhaling
const fetchData = async (page = 1, limit = 20) => {
  // Haal alle items op
  const allItems = await fetchFromApi("items/fabrique_art_objects");
  const totalItems = allItems.length;

  // Bereken de startindex
  let startIndex = (page - 1) * limit;

  // Maak een array aan voor de resultaten die de items in de juiste volgorde bevat
  let paginatedItems = [];

  //  Loop door de items en voeg ze toe aan de resultatenarray
  for (let i = 0; i < limit; i++) {
    paginatedItems.push(allItems[(startIndex + i) % totalItems]);
  }

  return paginatedItems;
};

// Maak een index route die de data van fabrique_art_objects haalt en pagineert
app.get("/", (request, response) => {
  const page = parseInt(request.query.page) || 1;
  const limit = 20;

  fetchData(page, limit)
    .then((data) => {
      response.render("index", { artObjects: data, page });
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