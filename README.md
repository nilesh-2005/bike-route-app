# Bike Routing Web App

A full-stack application for bike routing in India using GraphHopper, Spring Boot, React, and MapLibre.

## Tech Stack
- **Backend**: Java 17, Spring Boot 3, GraphHopper 9.1
- **Frontend**: React (Vite), TypeScript, Tailwind CSS, MapLibre GL JS
- **Database**: PostgreSQL + PostGIS (Dockerized)
- **Infrastructure**: Docker Compose

## Prerequisites
- Docker & Docker Compose
- OpenStreetMap Data (`india-latest.osm.pbf`)

## Setup Instructions

1. **Prepare Data**
   Download the India OSM PBF file and place it in the `data` directory inside the project root (not `backend/data`, but the root's `data` folder mapped in docker-compose).
   
   ```bash
   # Download (example source, make sure to get latest)
   # wget https://download.geofabrik.de/asia/india-latest.osm.pbf -O data/india-latest.osm.pbf
   ```
   **Important**: The file must be named `india-latest.osm.pbf` or you must update `docker-compose.yml`.

2. **Run with Docker**
   From the `bike-route-app` directory (where `docker-compose.yml` is):
   
   ```bash
   docker compose up --build
   ```

   The first run will take some time as GraphHopper processes the OSM file (CH/LM preparation).

3. **Access the App**
   - Frontend: Not Yet Deployed.
   - Backend API: Not Yet Deployed.
     
## Custom Bike Profile
The routing logic is customized in `backend/src/main/resources/custom_bike.json`.
It prioritizes residential and cycleways while penalizing highways and high-speed roads.
**Note**: If you modify `custom_bike.json` or update the OSM file, you need to clear the graph cache for changes to take effect:
```bash
docker compose down -v
docker compose up --build
```


## API Usage
**GET** `/api/route`
- `fromLat`, `fromLng`: Start coordinates
- `toLat`, `toLng`: End coordinates

Response:
```json
{
  "distance": 1234.5, // meters
  "time": 300000,     // milliseconds
  "points": { ... }   // GeoJSON
}
```
