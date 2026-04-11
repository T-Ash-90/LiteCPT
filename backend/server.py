import uvicorn
import signal
import sys

def shutdown():
    print("Shutting down server...")
    sys.exit(0)

if __name__ == "__main__":
    signal.signal(signal.SIGINT, lambda s, f: shutdown())
    signal.signal(signal.SIGTERM, lambda s, f: shutdown())

    uvicorn.run(
        app,
        host="localhost",
        port=8010,
        reload=False
    )
