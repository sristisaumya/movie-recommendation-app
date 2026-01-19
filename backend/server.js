
require("dotenv").config();
const Fastify = require("fastify");
const cors = require("@fastify/cors");
const db = require("./db");
const OpenAI = require("openai");

const app = Fastify({ logger: true });

//  CORS enable
app.register(cors, {
  origin: true,
  methods: ["GET", "POST"],
});


//  OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

//  Test route
app.get("/", async () => {
  return { message: "Backend is running " };
});

//  Movie recommend route
app.post("/api/recommend", async (request, reply) => {
  try {
    const { user_input } = request.body;

    if (!user_input) {
      return reply.code(400).send({ message: "user_input is required" });
    }

    const prompt = `
Recommend 3 to 5 movies based on this preference:
"${user_input}"

Return ONLY a JSON array like:
["Movie 1", "Movie 2", "Movie 3"]
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const rawText = response.choices[0].message.content;

    let movies = [];
    try {
      movies = JSON.parse(rawText);
    } catch (err) {
      // fallback if response isn't valid JSON
      movies = rawText
        .split("\n")
        .map((line) => line.replace(/^\d+[\).\s-]+/, "").trim())
        .filter(Boolean)
        .slice(0, 5);
    }

    const moviesString = JSON.stringify(movies);

    //  Save in SQLite DB
    db.run(
      `INSERT INTO recommendations (user_input, recommended_movies) VALUES (?, ?)`,
      [user_input, moviesString],
      (err) => {
        if (err) console.log("DB insert error:", err);
      }
    );

    return reply.send({
      user_input,
      recommendations: movies,
    });
  } catch (error) {
    console.log("OpenAI Error:", error);
    return reply.code(500).send({
      message: "Error generating recommendations",
      error: error.message,
    });
  }
});

//History route (DB data show karega)
app.get("/api/history", (request, reply) => {
  db.all(
    "SELECT * FROM recommendations ORDER BY timestamp DESC",
    [],
    (err, rows) => {
      if (err) {
        console.log("History error:", err);
        return reply.code(500).send({ error: err.message });
      }

      return reply.send(rows);
    }
  );
});


// Start server
const PORT = process.env.PORT || 5000;

app.listen({ port: PORT, host: "0.0.0.0" }, (err) => {
  if (err) {
    console.log(err);
    process.exit(1);
  }
  console.log(`Server running at http://localhost:${PORT} `);
});
