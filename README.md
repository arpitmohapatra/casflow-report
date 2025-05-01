# Cashflow Report Generator

A modern web application for generating and analyzing cashflow reports, built with React and FastAPI.

## Features

- Select report type (AP or GL), year, and month
- View cash flow data in a tabular format
- Generate Excel reports with formatted data
- Chat with an AI assistant to analyze and summarize reports
- Azure AD authentication for secure access
- Integration with Azure Cosmos DB for data storage
- Azure Key Vault for secure credential management

## Technology Stack

### Frontend
- React with TypeScript
- TailwindCSS for styling
- shadcn/ui components
- Lucide React for icons
- Azure Authentication Library (MSAL)
- Excel export functionality

### Backend
- FastAPI (Python)
- Azure Identity & Key Vault integration
- Azure Cosmos DB for data storage
- OpenAI integration for chat functionality

## Local Development Setup

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- Visual Studio Code or other IDE

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. The frontend will be available at http://localhost:5173

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create and activate a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows, use: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Create a `.env` file based on the template:
   ```
   cp env.example .env
   ```

5. Start the FastAPI server:
   ```
   uvicorn main:app --reload
   ```

6. The backend API will be available at http://localhost:8000
   - API documentation: http://localhost:8000/docs

## Production Deployment

### Azure Resources

1. **Frontend**: Deploy as Azure Static Web App
2. **Backend**: Deploy as Azure Web App
3. **Database**: Azure Cosmos DB
4. **Authentication**: Azure Active Directory
5. **Secrets Management**: Azure Key Vault

### Deployment Instructions

#### Frontend
```bash
# Build the frontend
cd frontend
npm run build

# Deploy to Azure Static Web Apps using GitHub Actions or Azure CLI
```

#### Backend
```bash
# Deploy to Azure Web App using GitHub Actions or Azure CLI
```

## Environment Variables

### Frontend (Production)
- `VITE_API_URL`: URL to the backend API
- `VITE_AAD_CLIENT_ID`: Azure AD client ID
- `VITE_AAD_TENANT_ID`: Azure AD tenant ID

### Backend (Production)
- `ENVIRONMENT`: Set to "production"
- `AZURE_KEYVAULT_URL`: URL to Azure Key Vault
- `ALLOWED_ORIGINS`: Comma-separated list of allowed origins for CORS

## License

This project is licensed under the MIT License. 