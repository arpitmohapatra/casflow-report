import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ReportForm from './components/ReportForm';
import ReportTable from './components/ReportTable';
import ChatWidget from './components/ChatWidget';
import { CashflowItem } from './components/ReportTable';
import { MsalProvider } from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser';
import { Button } from './components/ui/button';

// Mock data for local development
const generateMockData = (reportType: 'AP' | 'GL', year: number, month: number): CashflowItem[] => {
  const daysInMonth = new Date(year, month, 0).getDate();
  const categories = reportType === 'AP' 
    ? ['Vendor Payment', 'Utilities', 'Rent', 'Services', 'Equipment'] 
    : ['Revenue', 'Expenses', 'Investments', 'Taxes', 'Operations'];
  
  return Array.from({ length: 20 }, (_, i) => {
    const day = Math.floor(Math.random() * daysInMonth) + 1;
    const amount = reportType === 'AP'
      ? -(Math.random() * 10000 + 1000)
      : (Math.random() * 15000 - 5000);
    
    return {
      id: `item-${i}`,
      accountNumber: `${Math.floor(Math.random() * 900000) + 100000}`,
      description: `${reportType} Transaction ${i + 1}`,
      amount,
      date: new Date(year, month - 1, day).toISOString(),
      category: categories[Math.floor(Math.random() * categories.length)]
    };
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

// For local development, using empty configuration
// In production, this would come from Azure
const msalConfig = {
  auth: {
    clientId: 'your-client-id', // This would be a real client ID in production
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  }
};

const msalInstance = new PublicClientApplication(msalConfig);

interface User {
  name: string;
  email: string;
  roles: string[];
}

const App: React.FC = () => {
  const [reportType, setReportType] = useState<'AP' | 'GL'>('AP');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [data, setData] = useState<CashflowItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [reportGenerated, setReportGenerated] = useState<boolean>(false);
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for authentication in local storage (development mode)
    const isAuthenticated = localStorage.getItem('authenticated') === 'true';
    setAuthenticated(isAuthenticated);
    
    if (isAuthenticated) {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        } catch (e) {
          console.error('Failed to parse user data:', e);
        }
      }
    }
  }, []);

  const handleLogin = () => {
    // For local development, simulate login with Test User
    if (process.env.NODE_ENV === 'development') {
      const testUser = {
        name: 'Test User',
        email: 'test@example.com',
        roles: ['user']
      };
      
      localStorage.setItem('authenticated', 'true');
      localStorage.setItem('user', JSON.stringify(testUser));
      setAuthenticated(true);
      setUser(testUser);
    } else {
      // In production, this would use Azure AD
      msalInstance.loginRedirect();
    }
  };

  const handleGenerateReport = async (type: 'AP' | 'GL', reportYear: number, reportMonth: number) => {
    setLoading(true);
    setReportType(type);
    setYear(reportYear);
    setMonth(reportMonth);
    
    try {
      // In production, call the actual API
      if (process.env.NODE_ENV === 'production') {
        const response = await fetch('/api/reports', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            reportType: type,
            year: reportYear,
            month: reportMonth
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch report data');
        }
        
        const result = await response.json();
        setData(result.data);
      } else {
        // For local development, generate mock data
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        const mockData = generateMockData(type, reportYear, reportMonth);
        setData(mockData);
      }
      
      setReportGenerated(true);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Login page UI
  if (!authenticated) {
    return (
      <MsalProvider instance={msalInstance}>
        <div className="flex flex-col h-screen overflow-hidden">
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <div className="bg-card rounded-lg shadow-md p-8 max-w-md w-full text-center">
              <h2 className="text-2xl font-bold mb-6">Welcome to Cash Flow Report Generator</h2>
              <p className="mb-8 text-muted-foreground">
                Please log in to access cash flow reports and analytics.
              </p>
              <div className="flex justify-center">
                <Button size="lg" onClick={handleLogin}>
                  Sign in with {process.env.NODE_ENV === 'development' ? 'Test Account' : 'Azure AD'}
                </Button>
              </div>
              {process.env.NODE_ENV === 'development' && (
                <p className="mt-4 text-sm text-muted-foreground">
                  Development mode: Uses a simulated Test User login.
                </p>
              )}
            </div>
          </main>
          
          <footer className="bg-muted py-4 border-t">
            <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Cash Flow Report Generator | Powered by Azure
            </div>
          </footer>
        </div>
      </MsalProvider>
    );
  }

  // Main application UI (only for authenticated users)
  return (
    <MsalProvider instance={msalInstance}>
      <div className="flex flex-col h-screen overflow-hidden">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-6 overflow-hidden">
          {user && (
            <div className="mb-4 text-sm text-muted-foreground">
              Welcome, {user.name}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
            <div className="md:col-span-1 h-full overflow-hidden">
              <div className="h-full overflow-y-auto pr-2">
                <h2 className="text-xl font-bold mb-4">Report Options</h2>
                <ReportForm onSubmit={handleGenerateReport} />
                
                {loading && (
                  <div className="mt-4 p-4 rounded-lg border border-muted bg-card text-center">
                    <div className="animate-pulse">Loading report data...</div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="md:col-span-2 h-full overflow-hidden">
              <div className="h-full">
                {reportGenerated && !loading && (
                  <ReportTable 
                    data={data} 
                    title={`${reportType} Cash Flow Report`}
                    reportType={reportType}
                    year={year}
                    month={month}
                  />
                )}
                
                {!reportGenerated && !loading && (
                  <div className="flex items-center justify-center h-full min-h-[300px] rounded-lg border-2 border-dashed border-muted p-8 text-center">
                    <div>
                      <h3 className="text-lg font-medium mb-2">No Report Generated</h3>
                      <p className="text-muted-foreground">
                        Select report options and click "Generate Report" to view cash flow data or use the chat assistant to generate a report
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
        
        <footer className="bg-muted py-4 border-t">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Cash Flow Report Generator | Powered by Azure
          </div>
        </footer>
        
        {/* Chat Widget - Only show for authenticated users */}
        <ChatWidget onGenerateReport={handleGenerateReport} />
      </div>
    </MsalProvider>
  );
};

export default App;
