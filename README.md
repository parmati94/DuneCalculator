# Dune Awakening Placeable Calculator

A web application to calculate total resource requirements for Dune Awakening placeables.

## Features

- **Interactive Item Selection**: Browse and select from all available placeables
- **Quantity Control**: Specify how many of each item you want to build
- **Deep Desert Cost**: Optional 50% cost reduction for deep desert locations
- **Real-time Calculation**: Instantly see total resource requirements
- **Clean UI**: Dark theme with Dune-inspired colors
- **Containerized**: Single container with nginx routing for production deployment

## Deployment Options

### 🐳 Docker (Recommended for Production)

**Quick Start with Docker:**
```bash
# Build and run with one command
docker-compose up -d
```

**Manual Docker Commands:**
```bash
# Build the image
docker build -t dune-calculator .

# Run the container
docker run -d -p 80:80 --name dune-calc dune-calculator

# View logs
docker logs dune-calc

# Stop the container
docker stop dune-calc
```

**Access the application:**
- Web UI: `http://localhost`
- API: `http://localhost/api/`
- Health Check: `http://localhost/health`

### 💻 Development Mode

1. **Install all dependencies**:
   ```bash
   npm run install:all
   ```

2. **Start both servers**:
   ```bash
   npm start
   ```
   
   This will start both the backend (FastAPI) and frontend (React) simultaneously:
   - Backend API: `http://localhost:8000`
   - Frontend UI: `http://localhost:3000`

## Project Structure

```
DuneCalculator/
├── backend/                 # FastAPI backend
│   ├── main.py             # API server
│   ├── requirements.txt    # Python dependencies
│   └── dune_placeables.json # Placeable data
├── frontend/               # React frontend
│   ├── public/
│   ├── src/
│   │   ├── App.js          # Main React component
│   │   ├── index.js        # React entry point
│   │   └── index.css       # Styling
│   └── package.json        # Node.js dependencies
├── docker-compose.yml      # Docker Compose configuration
├── Dockerfile             # Multi-stage Docker build
├── nginx.conf             # Nginx configuration for routing
├── supervisord.conf       # Process management
└── README.md              # This file
```

## Container Architecture

The Docker container includes:
- **Nginx**: Serves the React frontend and routes `/api/*` to FastAPI
- **FastAPI**: Backend API running on port 8000 internally
- **Supervisor**: Manages both nginx and FastAPI processes
- **CORS**: Configured to accept requests from any origin (nginx handles routing)

## Individual Setup (Development)

### Backend Only
```bash
npm run install:backend
npm run start:backend
```

### Frontend Only
```bash
npm run install:frontend
npm run start:frontend
```

## Usage

1. **Start the application** with `npm start`
2. **Open your browser** to `http://localhost:3000`
3. **Select placeables** by entering quantities in the input fields
4. **Check "Use Deep Desert Cost"** if you want 50% cost reduction
5. **Click "Calculate Resources"** to see total requirements
6. **Use "Clear All"** to reset your selection

## Available Scripts

- `npm start` - Start both backend and frontend servers
- `npm run start:backend` - Start only the FastAPI backend
- `npm run start:frontend` - Start only the React frontend
- `npm run install:all` - Install all dependencies (backend + frontend)
- `npm run install:backend` - Install only backend dependencies
- `npm run install:frontend` - Install only frontend dependencies
- `npm run build` - Build the frontend for production

## API Endpoints

### Production (Containerized)
- `GET /api/placeables` - Get list of all available placeables
- `POST /api/calculate` - Calculate total resources for selected items
- `GET /api/health` - Health check endpoint
- `GET /health` - Container health check

### Development
- `GET /placeables` - Get list of all available placeables
- `POST /calculate` - Calculate total resources for selected items
- `GET /health` - Health check endpoint

## Example API Usage

**Production (Container):**
```bash
curl -X POST "http://localhost/api/calculate" \
  -H "Content-Type: application/json" \
  -d '{
    "placeables": [
      {"name": "Advanced Garment Fabricator", "quantity": 2},
      {"name": "Large Windtrap", "quantity": 1}
    ],
    "use_deep_desert_cost": true
  }'
```

**Development:**
```bash
curl -X POST "http://localhost:8000/calculate" \
  -H "Content-Type: application/json" \
  -d '{
    "placeables": [
      {"name": "Advanced Garment Fabricator", "quantity": 2},
      {"name": "Large Windtrap", "quantity": 1}
    ],
    "use_deep_desert_cost": true
  }'
```

## Technologies Used

- **Backend**: FastAPI, Python, Pydantic
- **Frontend**: React, JavaScript, CSS Grid
- **Web Server**: Nginx (reverse proxy and static file serving)
- **Process Management**: Supervisor
- **Containerization**: Docker, Docker Compose
- **Data**: JSON file with placeable costs

## Docker Container Benefits

- **Single Container**: Both UI and API in one container
- **Any Origin Support**: CORS configured for any origin since nginx handles routing
- **Production Ready**: Optimized nginx configuration with compression and caching
- **Health Checks**: Built-in health monitoring
- **Easy Deployment**: Simple `docker-compose up` deployment
- **Resource Efficient**: Multi-stage build minimizes image size

## Contributing

Feel free to modify the code to add new features or improve the UI!

## Troubleshooting

**Container Issues:**
```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Rebuild and restart
docker-compose down && docker-compose up -d --build
```

**Development Issues:**
- Ensure Python 3.8+ and Node.js 16+ are installed
- Check that ports 3000 and 8000 are available
- Verify all dependencies are installed with `npm run install:all`
