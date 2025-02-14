const fetchData = (url, requestOptions) => {
  const apiUrl = `${process.env.REACT_APP_API_URL}${url}`;

  return fetch(apiUrl, requestOptions)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Chyba při načítání dat: ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get('Content-Type');
      if (contentType && contentType.includes('application/json')) {
        return response.json();
      } else if (contentType && contentType.includes('text/plain')) {
        return response.text();
      } else if (response.status === 200 || response.status === 204 || response.status === 201) {
        return null; 
      } else {
        throw new Error("Odpověď není validní JSON ani text");
      }
    })
    .catch((error) => {
      console.error("Chyba při získávání dat:", error);
      throw error;  // Rethrow to propagate the error
    });
};

const apiGet = async (url, params = {}) => {
  try {
      // Filter params to remove null or undefined values
      const filteredParams = Object.fromEntries(
          Object.entries(params || {}).filter(([_, value]) => value != null)
      );

      const queryParams = new URLSearchParams(filteredParams).toString();
      const fullUrl = queryParams ? `${url}?${queryParams}` : url;

      const data = await fetchData(fullUrl, {
          method: 'GET',
          headers: {
              'Cache-Control': 'no-cache',
          },
      });
      return data;
  } catch (error) {
      console.error("Chyba při volání API:", error);
      throw error;
  }
};


const apiPost = async (url, body) => {
  try {
      const data = await fetchData(url, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
      });

    return data;
  } 
  catch (error) {
    console.error("Chyba při odesílání dat:", error);
    throw error;
  }
};

const apiPut = async (url, body) => {
  try {
      const data = await fetchData(url, {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
      });

    return data;
  } 
  catch (error) {
    console.error("Chyba při odesílání dat:", error);
    throw error;
  }
};

const apiDelete = async (url) => {
  const data = await fetchData(url, {
      method: 'DELETE',
  });
  return data;
};
  
export { apiGet, apiPost, apiPut, apiDelete };