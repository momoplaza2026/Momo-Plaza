const express = require('express');
const router = express.Router();
const axios = require('axios');

// Helper: Get a fresh OAuth token from Mappls
const getMappplsToken = async () => {
    const response = await axios.post(
        'https://outpost.mappls.com/api/security/oauth/token',
        `grant_type=client_credentials&client_id=${process.env.MAPPLS_CLIENT_ID}&client_secret=${process.env.MAPPLS_CLIENT_SECRET}`,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    return response.data.access_token;
};

// @desc    Get Mappls Access Token
// @route   GET /api/mappls/token
router.get('/token', async (req, res) => {
    try {
        const token = await getMappplsToken();
        res.json({
            access_token: token,
            key: process.env.MAPPLS_API_KEY
        });
    } catch (error) {
        console.error('Mappls Token Error:', error.response?.data || error.message);
        res.status(500).json({ message: 'Failed to fetch Mappls token' });
    }
});

// @desc    Reverse Geocode coordinates → address
// @route   GET /api/mappls/reverse-geocode?lat=28.6139&lng=77.2090
router.get('/reverse-geocode', async (req, res) => {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
        return res.status(400).json({ message: 'lat and lng query params are required' });
    }

    try {
        const token = await getMappplsToken();
        const apiKey = process.env.MAPPLS_API_KEY;

        if (!apiKey) {
            throw new Error('MAPPLS_API_KEY is missing in environment variables');
        }

        // Mappls Reverse Geocoding REST API
        // NOTE: Mappls often expects 'lon' instead of 'lng' for REST parameters
        // Also ensure lat/lng are passed as strings to avoid precision issues in some clients
        const response = await axios.get(
            `https://apis.mappls.com/advancedmaps/v1/${apiKey}/rev_geocode`,
            {
                params: { 
                    lat: String(lat), 
                    lng: String(lng), // Some versions use lng
                    lon: String(lng)  // Others use lon
                },
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        const results = response.data?.results?.[0];
        
        if (!results) {
            console.warn('Mappls Rev-Geocode: No results in response', response.data);
            return res.status(404).json({ 
                message: 'No address found for these coordinates',
                details: response.data 
            });
        }

        // Build a clean readable address from parts
        // Mappls Atlas response might have different fields than v1
        const parts = [
            results.houseNumber || results.house_number,
            results.houseName || results.house_name,
            results.poi || results.poi_name,
            results.street || results.street_name,
            results.subLocality || results.sub_locality || results.locality,
            results.subDistrict || results.sub_district || results.district,
        ].filter(Boolean);

        const cleanAddress = parts.join(', ') || results.formatted_address || results.formattedAddress || '';

        res.json({
            address: cleanAddress,
            formatted_address: results.formatted_address || results.formattedAddress || cleanAddress,
            city: results.city || results.district || results.sub_district || '',
            pincode: results.pincode || results.postalCode || results.postal_code || '',
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            raw: results
        });

    } catch (error) {
        console.error('Reverse Geocode Error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            config: {
                url: error.config?.url,
                params: error.config?.params
            }
        });

        res.status(500).json({ 
            message: 'Reverse geocoding failed', 
            error: error.message,
            details: error.response?.data?.error_description || error.response?.data?.message || null
        });
    }
});

// @desc    Forward Geocode address → coordinates
// @route   GET /api/mappls/geocode?address=delhi
router.get('/geocode', async (req, res) => {
    const { address } = req.query;

    if (!address) {
        return res.status(400).json({ message: 'address query param is required' });
    }

    try {
        const token = await getMappplsToken();

        // Mappls Geocoding / Search API
        const response = await axios.get(
            `https://atlas.mappls.com/api/places/geocode`,
            {
                params: { address },
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        // Mappls results can be in copResults (single) or results (array)
        const result = response.data?.copResults || response.data?.results?.[0];
        
        if (!result || (!result.latitude && !result.lat)) {
            console.warn('Mappls Geocode: No valid results', response.data);
            return res.status(404).json({ message: 'No coordinates found for this address' });
        }

        res.json({
            lat: parseFloat(result.latitude || result.lat),
            lng: parseFloat(result.longitude || result.lng),
            formatted_address: result.formattedAddress || result.formatted_address,
            raw: result
        });

    } catch (error) {
        console.error('Forward Geocode Error:', error.response?.data || error.message);
        res.status(500).json({ message: 'Geocoding failed', error: error.message });
    }
});

module.exports = router;
