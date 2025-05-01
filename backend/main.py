from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import json
from datetime import datetime
import uuid
from dotenv import load_dotenv
import logging

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="Cash Flow Report API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class ReportRequest(BaseModel):
    reportType: str
    year: int
    month: int

class ChatRequest(BaseModel):
    message: str
    reportType: str
    year: int
    month: int

class CashflowItem(BaseModel):
    id: str
    accountNumber: str
    description: str
    amount: float
    date: str
    category: str

class ReportResponse(BaseModel):
    data: List[CashflowItem]

class ChatResponse(BaseModel):
    message: str

# Mock data for local development
def get_mock_data(report_type: str, year: int, month: int) -> List[Dict[str, Any]]:
    """Generate mock data for local development"""
    import random
    from datetime import datetime, timedelta
    
    data = []
    categories = {
        "AP": ["Vendor Payment", "Utilities", "Rent", "Services", "Equipment"],
        "GL": ["Revenue", "Expenses", "Investments", "Taxes", "Operations"]
    }
    
    # Get days in month
    if month == 2:
        days_in_month = 29 if year % 4 == 0 else 28
    elif month in [4, 6, 9, 11]:
        days_in_month = 30
    else:
        days_in_month = 31
    
    # Generate 20 random transactions
    for i in range(20):
        day = random.randint(1, days_in_month)
        date = datetime(year, month, day).isoformat()
        
        # Generate amount (negative for AP, mixed for GL)
        if report_type == "AP":
            amount = -random.uniform(1000, 10000)
        else:
            amount = random.uniform(-5000, 15000)
        
        item = {
            "id": str(uuid.uuid4()),
            "accountNumber": str(random.randint(100000, 999999)),
            "description": f"{report_type} Transaction {i+1}",
            "amount": round(amount, 2),
            "date": date,
            "category": random.choice(categories.get(report_type, categories["GL"]))
        }
        data.append(item)
    
    # Sort by date
    data.sort(key=lambda x: x["date"])
    return data

# Helper for Azure Key Vault in production
def get_secret(secret_name: str) -> str:
    """Get a secret from Azure Key Vault or environment variables"""
    # In production, this would use Azure Key Vault
    # For local development, it uses environment variables
    if os.getenv("ENVIRONMENT") == "production":
        try:
            from azure.identity import DefaultAzureCredential
            from azure.keyvault.secrets import SecretClient
            
            vault_url = os.getenv("AZURE_KEYVAULT_URL")
            credential = DefaultAzureCredential()
            client = SecretClient(vault_url=vault_url, credential=credential)
            return client.get_secret(secret_name).value
        except Exception as e:
            logger.error(f"Error getting secret from Key Vault: {e}")
            raise HTTPException(status_code=500, detail="Error accessing credentials")
    else:
        # Local development uses environment variables
        return os.getenv(secret_name, "")

# Helper for CosmosDB in production
async def get_cosmos_client():
    """Get a CosmosDB client"""
    # In production, this would connect to real CosmosDB
    # For local development, it returns None
    if os.getenv("ENVIRONMENT") == "production":
        try:
            from azure.cosmos import CosmosClient
            
            cosmos_endpoint = get_secret("COSMOS_ENDPOINT")
            cosmos_key = get_secret("COSMOS_KEY")
            client = CosmosClient(cosmos_endpoint, cosmos_key)
            return client
        except Exception as e:
            logger.error(f"Error connecting to CosmosDB: {e}")
            raise HTTPException(status_code=500, detail="Database connection error")
    else:
        # Local development uses mock data
        return None

# Helper for OpenAI in production
async def get_openai_client():
    """Get an OpenAI client"""
    # In production, this would connect to OpenAI
    # For local development, it returns None
    if os.getenv("ENVIRONMENT") == "production":
        try:
            import openai
            
            openai.api_key = get_secret("OPENAI_API_KEY")
            return openai
        except Exception as e:
            logger.error(f"Error initializing OpenAI client: {e}")
            raise HTTPException(status_code=500, detail="Error initializing AI assistant")
    else:
        # Local development uses mock responses
        return None

# API endpoints
@app.get("/")
async def root():
    return {"message": "Cash Flow Report API is running"}

@app.post("/api/reports", response_model=ReportResponse)
async def generate_report(request: ReportRequest, cosmos_client = Depends(get_cosmos_client)):
    try:
        logger.info(f"Generating {request.reportType} report for {request.year}-{request.month}")
        
        if os.getenv("ENVIRONMENT") == "production" and cosmos_client:
            # In production, query from CosmosDB
            database = cosmos_client.get_database_client("cashflow")
            container = database.get_container_client("transactions")
            
            query = f"""
                SELECT * FROM c 
                WHERE c.reportType = '{request.reportType}' 
                AND c.year = {request.year} 
                AND c.month = {request.month}
            """
            
            items = list(container.query_items(query=query, enable_cross_partition_query=True))
            
            if not items:
                logger.warning(f"No data found for {request.reportType} report {request.year}-{request.month}")
                # Return empty data instead of error
                return ReportResponse(data=[])
            
            return ReportResponse(data=items)
        else:
            # Local development uses mock data
            mock_data = get_mock_data(request.reportType, request.year, request.month)
            return ReportResponse(data=mock_data)
    
    except Exception as e:
        logger.error(f"Error generating report: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, openai_client = Depends(get_openai_client)):
    try:
        logger.info(f"Processing chat request about {request.reportType} for {request.year}-{request.month}")
        
        if os.getenv("ENVIRONMENT") == "production" and openai_client:
            # In production, use OpenAI
            response = openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": f"You are an AI assistant analyzing cash flow data for {request.reportType} report from {request.year}-{request.month}. Provide clear, concise financial insights."},
                    {"role": "user", "content": request.message}
                ],
                max_tokens=500
            )
            return ChatResponse(message=response.choices[0].message.content)
        else:
            # Local development uses mock responses
            if "summary" in request.message.lower():
                response = f"The {request.reportType} cash flow for {request.month}/{request.year} shows a total inflow of $245,678.90 and outflow of $198,456.78, resulting in a net positive flow of $47,222.12."
            elif "largest" in request.message.lower():
                response = f"The largest transaction in the {request.reportType} report for {request.month}/{request.year} was $34,500.00 for equipment purchase on {request.month}/15/{request.year}."
            elif "compare" in request.message.lower():
                response = f"Compared to the previous month, the {request.reportType} cash flow for {request.month}/{request.year} shows a 12% increase in total volume and a 5% increase in net position."
            else:
                response = f"I've analyzed the {request.reportType} cash flow data for {request.month}/{request.year}. The data shows healthy financial activity with balanced inflows and outflows. Is there something specific you'd like to know about this period?"
            
            return ChatResponse(message=response)
    
    except Exception as e:
        logger.error(f"Error in chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 