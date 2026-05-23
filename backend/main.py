import os
import asyncio
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from groq import AsyncGroq
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()
client = AsyncGroq(api_key=os.environ.get("GROQ_API_KEY"))

chat_sessions = {}
IDLE_TIMEOUT = 30

async def idle_timer(websocket: WebSocket):
    try:
        await asyncio.sleep(IDLE_TIMEOUT)
        msg = "Hello, are you still there?"
        chat_sessions[websocket]["history"].append({"role": "assistant", "content": msg})
        await websocket.send_text(json.dumps({"type": "chunk", "content": "\n\n" + msg}))
        await websocket.send_text(json.dumps({"type": "done"}))
    except asyncio.CancelledError:
        pass

async def stream_groq_response(websocket: WebSocket):
    full_response = ""
    try:
        history = chat_sessions[websocket]["history"]
        
        stream = await client.chat.completions.create(
            messages=history,
            model="llama-3.1-8b-instant",
            temperature=0.7,
            stream=True
        )
        
        async for chunk in stream:
            content = chunk.choices[0].delta.content
            if content:
                full_response += content
                await websocket.send_text(json.dumps({"type": "chunk", "content": content}))
                await asyncio.sleep(0.08)
                
        chat_sessions[websocket]["history"].append({"role": "assistant", "content": full_response})
        await websocket.send_text(json.dumps({"type": "done"}))
        
    except asyncio.CancelledError:
        interrupted_text = full_response + " [Interrupted]"
        chat_sessions[websocket]["history"].append({"role": "assistant", "content": interrupted_text})
        raise
    except Exception as e:
        error_msg = f"\n[API Error: {str(e)}]"
        print(f"CRITICAL BACKEND ERROR: {e}")
        await websocket.send_text(json.dumps({"type": "chunk", "content": error_msg}))
        await websocket.send_text(json.dumps({"type": "done"}))

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    
    chat_sessions[websocket] = {
        "history": [{"role": "system", "content": "You are a helpful AI assistant."}],
        "current_task": None,
        "idle_task": asyncio.create_task(idle_timer(websocket))
    }
    
    greeting = "Hello! I am Alchemyst AI. How can I help you today?"
    chat_sessions[websocket]["history"].append({"role": "assistant", "content": greeting})
    await websocket.send_text(json.dumps({"type": "chunk", "content": greeting}))
    await websocket.send_text(json.dumps({"type": "done"}))

    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            user_message = payload.get("content", "")
            
            session = chat_sessions[websocket]
            
            if session["idle_task"] and not session["idle_task"].done():
                session["idle_task"].cancel()
            session["idle_task"] = asyncio.create_task(idle_timer(websocket))

            if session["current_task"] and not session["current_task"].done():
                session["current_task"].cancel()
                try:
                    await session["current_task"]
                except asyncio.CancelledError:
                    pass
            
            session["history"].append({"role": "user", "content": user_message})
            
            session["current_task"] = asyncio.create_task(stream_groq_response(websocket))
            
    except WebSocketDisconnect:
        if websocket in chat_sessions:
            session = chat_sessions[websocket]
            if session.get("idle_task"):
                session["idle_task"].cancel()
            if session.get("current_task"):
                session["current_task"].cancel()
            del chat_sessions[websocket]