# LiteCPT

A simple, responsive electron app to track your cryptocurrency holdings in real-time. Add, remove, and search for coins, and view your portfolio value in different currencies.

---

## Features

- View your crypto portfolio with live prices fetched by the CoinGecko API.
- Add and remove coins easily.
- Edit your holdings.
- Search for coins by name or symbol.
- Display portfolio value in USD, EUR and GBP.
- Responsive UI with modern design.

---

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Python (FastAPI, Uvicorn)
- **Cryptocurrency API:** CoinGecko
- **Desktop Application:** Electron

---

## Requirements

- [Ollama](https://ollama.com/) & downloaded LLM models *([phi4-mini:3.8b](https://ollama.com/library/phi4-mini) recommended)*
- Python 3
- Node.js and npm (for Electron app)
- Dependencies listed in requirements.txt

---

## Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
```
2. Create a virtual Python environment named .venv in the root directory: (required)

```bash
python3 -m venv .venv
```

3. Install Python dependencies:

```bash
pip install -r requirements.txt
```

4. Set up the Electron App in the root directory:

```bash
npm install
```

---

## Usage

1. To run the application as a standalone Electron desktop app:

```bash
npm start
```

The launcher will:

- Launch the FastAPI backend (uvicorn).
- Open the Electron desktop window.
- Automatically handle backend startup, waiting for readiness, and shutdown when the window is closed.

---

## License

**LiteCPT** © [Thomas Edward Ash](https://github.com/T-Ash-90). This project is licensed under the MIT License

---
