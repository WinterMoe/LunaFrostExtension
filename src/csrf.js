/**
 * CSRF Utility for LunaFrost Extension
 * Handles fetching and providing CSRF tokens for API requests
 */

// Cache for the CSRF token
let csrfToken = null;
let tokenExpiry = null;
const TOKEN_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch a fresh CSRF token from the server
 * @param {string} serverUrl - Base URL of the server
 * @returns {Promise<string>} - The CSRF token
 */
async function fetchCSRFToken(serverUrl) {
    try {
        // Note: Origin header is set automatically by browser and cannot be overridden
        const response = await fetch(`${serverUrl}/api/csrf-token`, {
            method: 'GET',
            credentials: 'include', // Important: sends session cookies
            mode: 'cors',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch CSRF token: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        if (!data.csrf_token) {
            throw new Error('CSRF token not found in response');
        }
        
        console.log('🔒 Fetched CSRF token:', {
            tokenLength: data.csrf_token.length,
            tokenPrefix: data.csrf_token.substring(0, 10) + '...'
        });
        
        return data.csrf_token;
    } catch (error) {
        console.error('Error fetching CSRF token:', error);
        throw error;
    }
}

/**
 * Get a CSRF token (from cache if valid, otherwise fetch fresh)
 * @param {string} serverUrl - Base URL of the server
 * @param {boolean} forceRefresh - Force fetching a new token
 * @returns {Promise<string>} - The CSRF token
 */
async function getCSRFToken(serverUrl, forceRefresh = false) {
    const now = Date.now();

    // Return cached token if still valid
    if (!forceRefresh && csrfToken && tokenExpiry && now < tokenExpiry) {
        console.log('🔒 Using cached CSRF token');
        return csrfToken;
    }

    // Fetch new token
    console.log('🔒 Fetching fresh CSRF token');
    csrfToken = await fetchCSRFToken(serverUrl);
    tokenExpiry = now + TOKEN_CACHE_DURATION;
    return csrfToken;
}

/**
 * Make a fetch request with CSRF token automatically included
 * @param {string} url - Full URL to fetch
 * @param {Object} options - Fetch options (method, body, headers, etc.)
 * @param {string} serverUrl - Base URL of the server (to fetch token)
 * @returns {Promise<Response>} - Fetch response
 */
async function fetchWithCSRF(url, options = {}, serverUrl) {
    // Get CSRF token
    const token = await getCSRFToken(serverUrl);
    
    if (!token) {
        throw new Error('Failed to obtain CSRF token');
    }
    
    console.log('🔒 Making request with CSRF token:', {
        url,
        tokenLength: token.length,
        tokenPrefix: token.substring(0, 10) + '...'
    });

    // Merge headers with security headers
    // Note: Origin header is set automatically by browser and cannot be overridden
    // Flask-WTF accepts both X-CSRFToken and X-CSRF-Token, but we'll use the standard one
    // Start with user headers, then add our required headers (so ours take precedence)
    const headers = {
        ...options.headers, // User headers first
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-CSRFToken': token,  // Flask-WTF standard header (must be present)
        'X-CSRF-Token': token,  // Alternative header name (some versions expect this)
    };
    
    // Verify token is actually in headers
    if (!headers['X-CSRFToken'] && !headers['X-CSRF-Token']) {
        console.error('🔒 ERROR: CSRF token not in headers after merge!', headers);
        throw new Error('CSRF token not in request headers');
    }

    // Make request
    console.log('🔒 Request details:', {
        url,
        method: options.method || 'GET',
        hasToken: !!token,
        tokenLength: token ? token.length : 0,
        headers: Object.keys(headers)
    });
    
    const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Ensure cookies are sent
        mode: 'cors' // Explicitly set CORS mode
    });
    
    console.log('🔒 Response status:', response.status, response.statusText);
    console.log('🔒 Response headers:', {
        contentType: response.headers.get('content-type'),
        setCookie: response.headers.get('set-cookie')
    });

    // If we get a 400 error, the token might be invalid - retry once with fresh token
    if (response.status === 400) {
        console.warn('🔒 CSRF token may be invalid, retrying with fresh token');
        const freshToken = await getCSRFToken(serverUrl, true);
        headers['X-CSRFToken'] = freshToken;

        const retryResponse = await fetch(url, {
            ...options,
            headers,
            credentials: 'include',
            mode: 'cors'
        });

        // Clone the response before reading it so the caller can also read it
        if (retryResponse.status === 400) {
            const clonedResponse = retryResponse.clone();
            clonedResponse.text().then(errorText => {
                console.error('🔒 CSRF validation failed after retry:', errorText);
            }).catch(() => {
                // Ignore errors in logging
            });
        }

        return retryResponse;
    }

    return response;
}

/**
 * Clear the cached CSRF token (useful after logout or errors)
 */
function clearCSRFToken() {
    csrfToken = null;
    tokenExpiry = null;
    console.log('🔒 CSRF token cache cleared');
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { getCSRFToken, fetchWithCSRF, clearCSRFToken };
} else {
    // For browser extension context
    window.CSRFUtils = { getCSRFToken, fetchWithCSRF, clearCSRFToken };
}
