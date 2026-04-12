from backend.server import SERVER
import uvicorn

if __name__ == "__main__":
    uvicorn.run(SERVER, host="127.0.0.1", port=8010, log_level="info")
