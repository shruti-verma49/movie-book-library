import { sampleItems } from "./data/sampleItems";
import "./App.css";

function App() {
  // These numbers are calculated from the data, not typed in by hand
  const total = sampleItems.length;
  const movies = sampleItems.filter((item) => item.type === "movie").length;
  const books = sampleItems.filter((item) => item.type === "book").length;

  return (
    <main className="container test-page">
      <span className="eyebrow">Your personal culture library</span>
      <h1>Stories worth keeping.</h1>
      <p>An independent collection of films to remember and books to return to.</p>
      <p className="counts">
        {total} items · {movies} movies · {books} books
      </p>
    </main>
  );
}

export default App;