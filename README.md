# ALKAchatBOT

A real-time AI chat application that simulates a conversational AI phone call experience using WebSockets, streaming responses, interruption handling, and contextual conversation memory.

---

# 🚀 Overview

ALKAchatBOT is a full-stack real-time AI chat system where users can interact with an AI assistant in a natural conversational flow.

Unlike traditional chat applications where the AI waits for the entire message before responding, this application supports:

* Real-time AI response streaming
* User interruption handling
* Context-aware conversations
* Idle user detection
* Multiple chat sessions
* WebSocket-powered communication
* Modern responsive frontend UI

The project is designed to simulate the behavior of a real phone conversation in text form.

---

# ✨ Features

## Core Features

### 🔄 Real-Time Communication

* Uses WebSockets for low-latency bidirectional communication
* Instant message delivery between client and server
* Live streaming AI responses

### 🤖 AI-Initiated Conversations

* AI sends the first message automatically when a chat session starts
* Simulates a real phone-call style interaction

### ⚡ Streaming Responses

* AI responses stream token-by-token or chunk-by-chunk
* Creates a realistic conversational experience
* Supports incremental rendering on the frontend

### ✋ User Interruptions

* Users can interrupt the AI while it is responding
* Ongoing AI response generation stops immediately
* AI generates a new response based on:

  * previous context
  * interrupted sentence
  * latest user message

### 🧠 Conversation Context Management

* Maintains full chat history
* Preserves conversational context across messages
* Tracks interrupted messages and partial AI outputs

### ⏳ Idle User Detection

* Detects inactivity after a configurable timeout
* AI sends follow-up prompts such as:

  * “Hello? Are you still there?”
  * “Would you like to continue?”

---

# 🎨 Frontend Features

* Modern chat UI
* Streaming message rendering
* Scrollable chat history
* Typing indicators
* Multiple chat tabs
* Message timestamps
* Dark mode UI
* Responsive design
* Auto-scroll behavior
* Interrupt-aware UI updates

---

# 🏗️ Architecture

## High-Level Architecture

```text
┌─────────────────────┐
│     Frontend UI     │
│  (React / Vite)     │
└─────────┬───────────┘
          │ WebSocket
          ▼
┌─────────────────────┐
│   FastAPI Backend   │
│   WebSocket Server  │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│     AI Provider     │
│ OpenAI / Gemini API │
└─────────────────────┘
```

---

# 🛠️ Tech Stack

## Frontend

* React
* Vite
* Tailwind CSS
* WebSockets API
* Zustand / Context API (optional)

## Backend

* Python
* FastAPI
* WebSockets
* Uvicorn
* AsyncIO

## AI Providers

* Groq API

---

# 📁 Project Structure

```bash
ALKAchatBOT/
│
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── .env
│   └── ...
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── .gitignore
├── README.md
└── .env
```

---

# ⚙️ Setup Instructions

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/Jeet-Srivastava/ALKAchatBOT.git

cd ALKAchatBOT
```

---

# 🔧 Backend Setup

## 2️⃣ Navigate to Backend

```bash
cd backend
```

## 3️⃣ Create Virtual Environment

### macOS/Linux

```bash
python3 -m venv venv
source venv/bin/activate
```

### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

---

## 4️⃣ Install Dependencies

```bash
pip install -r requirements.txt
```

If `requirements.txt` does not exist yet, install manually:

```bash
pip install fastapi uvicorn websockets python-dotenv openai google-generativeai
```

---

## 5️⃣ Configure Environment Variables

Create a `.env` file inside the `backend/` folder.

Example:

```env
GROQ_API_KEY=your_groq_api_key
```

You may use either OpenAI or Gemini depending on your implementation.

---

## 6️⃣ Run Backend Server

```bash
uvicorn main:app --reload
```

Backend should start at:

```text
http://127.0.0.1:8000
```

WebSocket endpoint example:

```text
ws://127.0.0.1:8000/ws
```

---

# 💻 Frontend Setup

## 7️⃣ Open a New Terminal

Navigate to frontend:

```bash
cd frontend
```

---

## 8️⃣ Install Frontend Dependencies

```bash
npm install
```

---

## 9️⃣ Start Frontend Development Server

```bash
npm run dev
```

Frontend will run at:

```text
http://localhost:5173
```

---

# 🔌 WebSocket Flow

## Typical Chat Lifecycle

### 1. Client Connects

* Frontend establishes WebSocket connection

### 2. AI Sends Greeting

Example:

```text
AI: Hello! How are you doing today?
```

### 3. User Responds

```text
User: I am working on a project.
```

### 4. AI Streams Response

```text
AI: That sounds interesting...
```

### 5. User Interrupts

```text
User: Actually it is an AI chatbot.
```

### 6. AI Stops Current Response

* Current generation is cancelled
* New response starts using updated context

---

# 🧠 Conversation Context Handling

The backend maintains:

* Full message history
* Partial AI responses
* Interrupted message states
* Session-specific context
* Streaming buffer state

Example structure:

```python
conversation_history = [
    {
        "role": "assistant",
        "content": "Hello!"
    },
    {
        "role": "user",
        "content": "Hi"
    }
]
```

---

# ✋ Interruption Handling Logic

## Expected Behavior

When the user types while the AI is streaming:

1. Current AI stream stops
2. Interrupted sentence is stored
3. Latest user message is appended
4. New AI response begins

This mimics natural conversation dynamics.

---

# ⏳ Idle Detection

If the user is inactive for a configured number of seconds:

```text
AI: Hello? Are you still there?
```

Idle detection is handled server-side using async timers/tasks.

---

# 🌙 Dark Mode

The frontend includes a dark mode interface for improved user experience.

Suggested implementation:

* Tailwind dark classes
* Theme toggling
* Local storage persistence

---

# 🗂️ Multiple Chat Tabs

Users can maintain multiple independent chat sessions.

Each tab maintains:

* Independent conversation history
* Unique WebSocket session
* Separate AI context

---

# 📡 API / WebSocket Events

## Client → Server

```json
{
  "type": "message",
  "content": "Hello AI"
}
```

```json
{
  "type": "interrupt",
  "content": "Wait, let me clarify"
}
```

---

## Server → Client

```json
{
  "type": "stream",
  "content": "Hello"
}
```

```json
{
  "type": "done"
}
```

```json
{
  "type": "idle_prompt",
  "content": "Are you still there?"
}
```

---

# 🔐 Environment Variables

| Variable       | Description         |
| -------------- | ------------------- |
| GROQ_API_KEY   | Groq API key (llama-3.1-8b-instant)|
| IDLE_TIMEOUT   | Inactivity timeout  |
| PORT           | Backend server port |

---

# 🚀 Deployment

## Frontend Deployment

* Vercel

## Backend Deployment

Recommended platforms:

* Render


---

# 🧩 Future Improvements

Potential enhancements:

* Voice support
* Speech-to-text
* Text-to-speech
* Persistent database storage
* Authentication system
* Conversation export
* AI memory system
* Rate limiting
* Conversation analytics
* Mobile app version

---

# 📈 Performance Considerations

* Use async WebSocket handlers
* Stream AI responses incrementally
* Avoid blocking operations
* Handle reconnect logic gracefully
* Limit conversation history size if necessary

---

# 🤝 Contributing

Contributions are welcome.

## Steps

1. Fork the repository
2. Create a new branch
3. Commit changes
4. Push branch
5. Open a Pull Request


---

# ⭐ Acknowledgements

* FastAPI
* React
* Tailwind CSS
* WebSockets API

---

# 📬 Contact

If you have suggestions or feedback, feel free to open an issue or connect through GitHub.
