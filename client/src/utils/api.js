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
      } else {
          throw new Error("Odpověď není validní JSON");
      }
  })
  .catch((error) => {
      console.error("Chyba při získávání dat:", error);
      throw error;
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
    console.log('Odesílání požadavku na URL:', url); 
      const data = await fetchData(url, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
      });

      console.log('Odpověď serveru:', data);
    return data;  // Přímo vracíme data z fetchData
  } 
  catch (error) {
    console.error("Chyba při odesílání dat:", error);
    throw error;
  }
};
  
export { apiGet, apiPost };