# Cross Bookmark

A web app to organize and save bookmarks in folders, with a FastAPI backend for link metadata extraction.

---

## Features

- Create, delete, and organize bookmark folders
- Two-step folder deletion for safety
- Category icons and visual feedback
- FastAPI backend for fetching link metadata
- Responsive, modern UI

---

## Folder Structure

```
backend/
    link_metadata.py         # FastAPI backend for metadata extraction
    requirements.txt         # Python dependencies
frontend/
    index.html               # Main HTML file
    style.css                # Main CSS
    app.js                   # App logic
    folder-manager.js        # Folder management logic
    bookmark-grid.css        # Additional styles
```

---

## 1. Deploy the Backend (FastAPI) on Render.com

### **A. Prepare your backend**

1. Make sure you have a `requirements.txt` in your `backend/` folder:
    ```
    fastapi==0.104.0
    uvicorn==0.23.2
    requests==2.31.0
    beautifulsoup4==4.12.2
    pydantic==2.4.2
    python-multipart==0.0.6
    ```

2. Your main backend file should be named `app.py` and contain a FastAPI app called `app`.

3. Create a `Procfile` in your `backend/` folder:
    ```
    web: uvicorn app:app --host=0.0.0.0 --port=$PORT
    ```

### **B. Deploy on Render.com**

1. Go to [https://render.com/](https://render.com/) and sign up/log in.
2. Click **New** → **Web Service**.
3. Connect your GitHub account and select your backend repository.
4. Configure your service:
   - **Name**: `cross-bookmark-backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app:app --host=0.0.0.0 --port=$PORT`
   - **Plan**: Free
5. Click **Create Web Service**.
6. After deployment, Render will give you a public URL (e.g., `https://cross-bookmark-backend.onrender.com`).

---

## 2. Deploy the Frontend (Static Site)

### **A. GitHub Pages (Recommended for static sites)**

1. Create a GitHub account and a new repository (e.g., `cross-bookmark`).
2. Upload all files from your `frontend/` folder to the root of the repo.
3. Go to **Settings > Pages**.
4. Under **Source**, select the branch (usually `main`) and `/ (root)` folder.
5. Click **Save**.  
   After a minute, you’ll get a URL like:  
   `https://yourusername.github.io/cross-bookmark/`

### **B. Railway Static Site (Alternative)**

1. In Railway, create a new project.
2. Click **New Service** → **Static**.
3. Upload all files from your `frontend/` folder.
4. Railway will give you a public URL.

---

## 3. Update Frontend to Use Deployed Backend

- In your `frontend/folder-manager.js`, find the `fetchURLMetadata` function and replace:
  ```javascript
  const apiUrl = 'http://localhost:8000/extract-metadata';
  ```
  With your Render backend URL:
  ```javascript
  const apiUrl = 'https://cross-bookmark-backend.onrender.com/extract-metadata';
  ```

---

## 4. Local Development

### **Backend**
```sh
cd backend
pip install -r requirements.txt
uvicorn app:app --reload
```

### **Frontend**
Just open `index.html` in your browser or use the provided `starter.bat` file.

---

## 5. Example `.env` (if needed)

If your backend uses environment variables, create a `.env` file in `backend/` and set them in Railway’s dashboard as well.

---

## 6. Credits

- Built with [FastAPI](https://fastapi.tiangolo.com/), [Supabase](https://supabase.com/), [FontAwesome](https://fontawesome.com/), [Render](https://render.com/) and [GitHub Pages](https://pages.github.com/).

---

## 7. License

MIT

---

**Need help?**  
Open an issue or ask for step-by-step deployment help!
