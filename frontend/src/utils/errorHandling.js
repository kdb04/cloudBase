/**
 * Safely parses a JSON response, guarding against non-JSON responses
 * (e.g., HTML error pages on 500). Throws a user-friendly error if
 * the response is not ok.
 *
 * @param {Response} response - The fetch Response object
 * @param {string} [fallbackMessage='Something went wrong'] - Fallback error message
 * @returns {Promise<object>} The parsed JSON data
 * @throws {Error} If the response is not ok or not valid JSON
 */
export async function handleApiResponse(response, fallbackMessage = 'Something went wrong') {
  let data;
  try {
    data = await response.json();
  } catch {
    const error =  new Error(fallbackMessage);
    error.status = response.status;
    throw error;
  }

  if (!response.ok) {
    const error = new Error(data.message || data.error || fallbackMessage);
    error.status = response.status;
    throw error;
  }

  return data;
}
