const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Helper function
async function fetchAPI(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Energy API (TEM015XP)
export const energyAPI = {
    // Get latest reading
    getLatest: () => fetchAPI('/devices/energy/latest'),

    // Get all readings with pagination
    getAll: (limit = 100, offset = 0) => 
        fetchAPI(`/devices/energy?limit=${limit}&offset=${offset}`),

    // Get readings by date range
    getByDateRange: (startDate, endDate) => 
        fetchAPI(`/devices/energy/range?startDate=${startDate}&endDate=${endDate}`),

    // Save new reading (manual)
    save: (data) => fetchAPI('/devices/energy', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
};

// Temperature API (legacy)
export const temperatureAPI = {
    getLatest: () => fetchAPI('/devices/readings?limit=1'),
    getAll: (limit = 100, offset = 0) => 
        fetchAPI(`/devices/readings?limit=${limit}&offset=${offset}`),
    getByDateRange: (startDate, endDate) => 
        fetchAPI(`/devices/readings/range?startDate=${startDate}&endDate=${endDate}`),
};

export default {
    energy: energyAPI,
    temperature: temperatureAPI,
};