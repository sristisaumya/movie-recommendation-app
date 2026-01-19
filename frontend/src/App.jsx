import { useState } from "react";
import axios from "axios";
import "./App.css";

//  Backend Base URL
const API_BASE = "https://movie-recommendation-backend-fdqe.onrender.com";

function App() {
  const [userInput, setUserInput] = useState("");
  const [movies, setMovies] = useState([]);
  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState("");

  //  Recommend movies
  const handleRecommend = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMovies([]);

    try {
      const res = await axios.post(`${API_BASE}/api/recommend`, {
        user_input: userInput,
      });

      setMovies(res.data.recommendations || []);
    } catch (err) {
      setError(" Recommendation failed. Please try again.");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  //  Fetch history from DB
  const fetchHistory = async () => {
    setHistoryLoading(true);
    setError("");

    try {
      const res = await axios.get(`${API_BASE}/api/history`);
      setHistory(res.data.slice(0, 5)); // last 5
    } catch (err) {
      setError(" Failed to load history.");
      console.log(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  //  Clear all
  const clearAll = () => {
    setUserInput("");
    setMovies([]);
    setHistory([]);
    setError("");
  };

  return (
    <div className="container">
      <h1 className="mainTitle">
        <span className="titleIcon">🎬</span>
        <span className="titleText">Movie Recommendation</span>
        <span className="titleSub">Smart picks based on your taste</span>
      </h1>

      <form onSubmit={handleRecommend}>
        <input
          type="text"
          placeholder="Enter your preference..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
        />

        <button type="submit" disabled={loading || !userInput.trim()}>
          {loading ? "Loading..." : "Recommend"}
        </button>
      </form>

      {/*  Buttons */}
      <div className="actionRow">
        <button
          className="secondaryBtn"
          type="button"
          onClick={fetchHistory}
          disabled={historyLoading}
        >
          {historyLoading ? "Loading History..." : "Show History"}
        </button>

        <button className="dangerBtn" type="button" onClick={clearAll}>
          Clear
        </button>
      </div>

      {/*  Error message */}
      {error && <p className="errorText">{error}</p>}

      {/*  Recommended Movies */}
      <div className="results">
        {movies.length > 0 && <h2>Recommended Movies:</h2>}

        <ul>
          {movies.map((movie, index) => (
            <li key={index}>{movie}</li>
          ))}
        </ul>
      </div>

      {/* History */}
      <div className="results">
        {history.length > 0 && <h2>Previous Recommendations (Last 5):</h2>}

        {history.map((item) => {
          let movieList = [];
          try {
            movieList = JSON.parse(item.recommended_movies);
          } catch {
            movieList = [];
          }

          return (
            <div key={item.id} className="historyCard">
              <p>
                <b>Search:</b> {item.user_input}
              </p>

              <p className="timeText">
                <b>Time:</b> {item.timestamp}
              </p>

              <ul>
                {movieList.map((m, idx) => (
                  <li key={idx}>🎥 {m}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
