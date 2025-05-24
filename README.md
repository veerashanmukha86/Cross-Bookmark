# Cross-Bookmark

A web application for extracting metadata from multiple URLs. The application consists of a FastAPI backend and a simple HTML/CSS/JavaScript frontend.

## Backend Setup

1. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

2. Navigate to the project root directory:
   ```bash
   cd Cross-Bookmark
   ```

3. Start the FastAPI server:
   ```bash
   uvicorn backend.app:app --reload
   ```
   
   The backend API will be available at `http://127.0.0.1:8000`.
   
   API Documentation is available at:
   - Swagger UI: `http://127.0.0.1:8000/docs`
   - ReDoc: `http://127.0.0.1:8000/redoc`

## Frontend Setup

1. Simply open the `index.html` file in your web browser:
   - Double-click the file in your file explorer
   - Or use a local development server of your choice

## How to Use

1. Start the backend server as described above.
2. Open the frontend by opening `index.html` in your browser.
3. Enter URLs in the input field or paste a list of URLs.
4. Click the "Fetch Metadata" button to retrieve information about the links.
5. The application will display title, description, and thumbnail (if available) for each URL.

## API Endpoints

- `POST /links`: Accepts a JSON body with a list of URLs and returns metadata for each URL.

Example request:
```json
{
  "links": [
    "https://example.com",
    "https://twitter.com/username/status/123456789"
  ]
}
```