// Quick API test utility to debug endpoints
export const testApiConnection = async () => {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  
  console.log('Testing API connection to:', baseUrl);
  
  // Test 1: Check if server is running
  try {
    const response = await fetch(baseUrl);
    console.log('Server response status:', response.status);
    console.log('Server is running ✓');
  } catch (error) {
    console.error('Server is not running ✗', error);
    return;
  }
  
  // Test 2: Check common endpoint patterns
  const endpointsToTest = [
    '/api/v1/auth/login',
    '/auth/login', 
    '/api/auth/login',
    '/login',
    '/api/v1/docs', // FastAPI docs endpoint
    '/docs', // Alternative docs endpoint
  ];
  
  for (const endpoint of endpointsToTest) {
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'OPTIONS' // Use OPTIONS to avoid CORS issues
      });
      console.log(`${endpoint}: ${response.status}`);
    } catch (error) {
      console.log(`${endpoint}: Error -`, error.message);
    }
  }
};

// Test the login endpoint specifically
export const testLogin = async (email = 'test@test.com', password = 'test123') => {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  
  // Test different login endpoint patterns
  const loginEndpoints = [
    '/api/v1/auth/login',
    '/auth/login',
    '/api/auth/login', 
    '/login',
    '/token', // Common FastAPI token endpoint
  ];
  
  for (const endpoint of loginEndpoints) {
    console.log(`Testing login endpoint: ${baseUrl}${endpoint}`);
    
    try {
      // Try form data (OAuth2 style)
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);
      
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        body: formData,
      });
      
      console.log(`${endpoint} (FormData): ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Success with FormData:', data);
        return { endpoint, method: 'FormData', data };
      }
    } catch (error) {
      console.log(`${endpoint} (FormData): Error -`, error.message);
    }
    
    try {
      // Try JSON data
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      console.log(`${endpoint} (JSON): ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Success with JSON:', data);
        return { endpoint, method: 'JSON', data };
      }
    } catch (error) {
      console.log(`${endpoint} (JSON): Error -`, error.message);
    }
  }
  
  return null;
};

// Call this from browser console to test
window.testApiConnection = testApiConnection;
window.testLogin = testLogin;