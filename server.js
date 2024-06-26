// Importeer het npm pakket express uit de node_modules map
import express from "express";

// Importeer de zelfgemaakte functie fetchJson uit de ./helpers map
import fetchJson from "./helpers/fetch-json.js";

// Declare de base URL van de Directus API
const baseUrl = "https://fdnd-agency.directus.app";

// Maak een nieuwe express app aan
const app = express();

// Middleware voor JSON en URL-encoded parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Stel ejs in als template engine
app.set("view engine", "ejs");

// Stel de map met ejs templates in
app.set("views", "./views");

// Gebruik de map 'public' voor statische resources, zoals stylesheets, afbeeldingen en client-side JavaScript
app.use(express.static("public"));

// Functie om data van de API op te halen
const fetchFromApi = (endpoint) => {
  return fetchJson(baseUrl + '/' + endpoint)
    .then((response) => response.data)
    .catch((error) => {
      console.error('Fout bij ophalen van API-gegevens:', error);
      throw error;
    });
};

// Functie om alle data van fabrique_art_objects op te halen
const fetchAllData = () => {
  return fetchFromApi('items/fabrique_art_objects')
    .then((data) => data || []) // Geef een lege array terug als er geen data is
    .catch((error) => {
      console.error('Fout bij ophalen van API-gegevens:', error);
      return [];
    });
};

// Functie om paginated data van fabrique_art_objects op te halen en te herhalen
const fetchPaginatedData = (page, limit) => {
  return fetchAllData()
    .then((data) => {
      const start = page * limit;
      const end = start + limit;
      const repeatedData = [];

      // Repeat the data until we have enough items for the requested page and limit
      while (repeatedData.length < end) {
        repeatedData.push(...data);
      }

      return repeatedData.slice(start, end);
    })
    .catch((error) => {
      console.error('Error fetching paginated data:', error);
      return [];
    });
};

// Index route voor de hoofdpagina
app.get("/", (request, response) => {
  const repeatCount = parseInt(request.query.repeat, 10) || 1;

  // Haal alle data op, herhaal deze met het opgegeven aantal
  fetchAllData()
    .then((data) => {
      const repeatedData = [];
      for (let i = 0; i < repeatCount; i++) {
        repeatedData.push(...data);
      }
      response.render("index", { artObjects: repeatedData, repeatCount });
    })
    .catch((error) => {
      console.error("Fout bij ophalen van data:", error);
      response.status(500).send("Fout bij ophalen van data");
    });
});

// API endpoint voor het ophalen van paginated data
app.get("/api/data", (request, response) => {
  const page = parseInt(request.query.page, 10) || 0;
  const limit = parseInt(request.query.limit, 10) || 20;

  fetchPaginatedData(page, limit)
    .then((data) => {
      response.json(data);
    })
    .catch((error) => {
      console.error("Error fetching paginated data:", error);
      response.status(500).json({ error: "Error fetching data" });
    });
});

// Instellen van de poort waarop de server luistert
app.set("port", process.env.PORT || 8000);

// Start de Express server
app.listen(app.get("port"), () => {
  console.log(`Applicatie gestart op http://localhost:${app.get("port")}`);
});