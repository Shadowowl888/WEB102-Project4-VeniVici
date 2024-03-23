import { useState, useEffect } from "react";
import Gallery from "./Gallery.jsx"
import './App.css'

const App = () => {
  const API_KEY = import.meta.env.VITE_APP_ACCESS_KEY;
  const [dogData, setDogData] = useState(null);
  const [bannedAttributes, setBannedAttributes] = useState([]);
  const [prevImages, setPrevImages] = useState([]);

  const fetchData = async (attempt = 0) => {
    try {
      let query = `https://api.thedogapi.com/v1/images/search?size=med&format=json&has_breeds=true&order=RANDOM&limit=1&api_key=${API_KEY}`;

      const response = await fetch(query);
      const data = await response.json();
      console.log(data[0])
  
      if (data[0].url == null) {
        alert("Oops! Something went wrong with that query, let's try");
        console.log(data[0]);
        return;
      } else {
        setDogData(data[0]);
        setPrevImages((images) => [...images, data[0].url]);
      }
      
      if (data[0].breeds.length > 0) {
        const { temperament } = data[0].breeds[0];
        if (temperament) {
          const attributes = temperament.split(', ')
          const isBanned = attributes.some(attribute => bannedAttributes.includes(attribute.trim()));

          if (isBanned) {
            const maxAttemps = 5;
            if (attempt < maxAttemps) {
              console.log(`Attempt ${attempt + 1}: Found banned attribute. Fetching again.`)
              return fetchData(attempt + 1);
            } else {
              console.log("Max fetch attempts reached.")
            }
          }
        }
      }
      setDogData(data[0])
    } catch (error) {
      console.error("Error fetching dog data:", error);
    }
  };

  const addToBanList = (attribute) => {
    if (!bannedAttributes.includes(attribute)) {
      setBannedAttributes([...bannedAttributes, attribute]);
    }
  };

  const removeFromBanList = (attribute) => {
    setBannedAttributes(bannedAttributes.filter(item => item !== attribute));
  };

  const renderData = () => {
    if (!dogData) {
      return <p>No data available!</p>
    }
    const { url, breeds } = dogData;
    const randomAttributes = (breeds && breeds.length) > 0 ? breeds[0].temperament.split(',') : [];
    const filteredAttributes = randomAttributes.filter(attribute => !bannedAttributes.includes(attribute));
    
    return (
      <div className="photo-display">
        <h2>{dogData.breeds[0].name}</h2>
        <h4>Height: {dogData.breeds[0].height.imperial} inches  |  Life Span: {dogData.breeds[0].life_span}  |  Weight: {dogData.breeds[0].weight.imperial} pounds</h4>
        <img
          className="photo"
          src={url}
          alt="Dog photo returned"
          width="400"
        />
        <ul>
          {filteredAttributes.map((attribute, index) => (
            <li key={index} className="attribute-item">
              <button className="ban-button" onClick={() => addToBanList(attribute)}>{attribute.trim()}</button>
            </li>
          ))}
        </ul>
      </div>
    );
  };
  
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="App">
      <h1>Bark Box 🐶</h1>
      <h4>Discover the dogs of your imagination, like dreams in your pocket!</h4>

      <div className="container">
        <div className="dog-content">
          {renderData()}
          <button className="fetch-button" onClick={fetchData}>New Dog Photo</button>
        </div>

        <div className="banned-list">
          <h2>Banned Attributes</h2>
          <ul>
            {bannedAttributes.map((attribute, index) => (
              <li key={index}>
                <button className="unban-button" onClick={() => removeFromBanList(attribute)}>{attribute}</button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <Gallery images={prevImages} />
        </div>
      </div>
    </div>
  );
};

export default App;