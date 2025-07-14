from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Any
import json
import os

app = FastAPI(title="Dune Placeable Calculator", version="1.0.0")

# Enable CORS for any origin since nginx will handle routing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow any origin since nginx handles routing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load placeables data
def load_placeables_data():
    file_path = os.path.join(os.path.dirname(__file__), "dune_placeables.json")
    with open(file_path, 'r') as f:
        return json.load(f)

placeables_data = load_placeables_data()

class PlaceableRequest(BaseModel):
    name: str
    quantity: int

class CalculationRequest(BaseModel):
    placeables: List[PlaceableRequest]
    use_deep_desert_cost: bool = False

class CalculationResponse(BaseModel):
    total_resources: Dict[str, int]
    use_deep_desert_cost: bool
    items_calculated: List[Dict[str, Any]]

@app.get("/")
async def root():
    return {"message": "Dune Placeable Calculator API"}

@app.get("/placeables")
async def get_placeables():
    """Get list of all available placeables"""
    return [{"name": item["name"], "resources": item["resources"]} for item in placeables_data]

@app.post("/calculate", response_model=CalculationResponse)
async def calculate_resources(request: CalculationRequest):
    """Calculate total resources needed for selected placeables"""
    
    total_resources = {}
    items_calculated = []
    
    # Create a lookup dictionary for faster access
    placeables_lookup = {item["name"]: item for item in placeables_data}
    
    for placeable_request in request.placeables:
        if placeable_request.name not in placeables_lookup:
            raise HTTPException(status_code=404, detail=f"Placeable '{placeable_request.name}' not found")
        
        placeable = placeables_lookup[placeable_request.name]
        quantity = placeable_request.quantity
        
        if quantity <= 0:
            continue
            
        # Add to items calculated for response
        items_calculated.append({
            "name": placeable_request.name,
            "quantity": quantity,
            "resources_per_unit": placeable["resources"]
        })
        
        # Calculate resources for this placeable
        for resource_name, resource_amount in placeable["resources"].items():
            total_amount = resource_amount * quantity
            
            if resource_name in total_resources:
                total_resources[resource_name] += total_amount
            else:
                total_resources[resource_name] = total_amount
    
    # Apply deep desert cost reduction if requested
    if request.use_deep_desert_cost:
        import math
        total_resources = {
            resource: max(1, math.ceil(amount / 2))  # Half cost rounded up, minimum 1
            for resource, amount in total_resources.items()
        }
    
    return CalculationResponse(
        total_resources=total_resources,
        use_deep_desert_cost=request.use_deep_desert_cost,
        items_calculated=items_calculated
    )

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
