from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, AnyUrl as HttpUrl
from bs4 import BeautifulSoup
import requests
import uvicorn
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Link Metadata API")
from fastapi import FastAPI, HTTPException

app = FastAPI()

@app.get("/")
async def read_root():
    return {"Hello": "World"}

@app.get("/items/{item_id}")
async def read_item(item_id: int, q: str = None):
    if item_id == 0:
        raise HTTPException(status_code=400, detail="Item ID cannot be zero")
    return {"item_id": item_id, "q": q}
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class URLRequest(BaseModel):
    url: HttpUrl

class Metadata(BaseModel):
    title: str = None
    description: str = None
    image: str = None
    site_name: str = None
    favicon: str = None
    url: str = None
    status: str = "success"

def fetch_metadata(url: str) -> Metadata:
    """Extract metadata using microlink.io for social media and BeautifulSoup for other sites"""
    try:
        logger.info(f"Fetching metadata for: {url}")
        
         
        if "twitter.com" in url or "x.com" in url:
            logger.info("Using microlink.io API for Twitter/X")
            api_url = f"https://api.microlink.io/?url={url}"
            resp = requests.get(api_url, timeout=5)
            data = resp.json()
            
            if data.get("status") == "success":
                result = data.get("data", {})
                favicon = result.get("logo", {}).get("url") if result.get("logo") else None
                
                return Metadata(
                    url=url,
                    title=result.get("title"),
                    description=result.get("description"),
                    image=result.get("image", {}).get("url") if result.get("image") else None,
                    site_name=result.get("publisher"),
                    favicon=favicon,
                    status="success"
                )
            else:
                logger.warning(f"Microlink API failed for {url}: {data.get('message')}")
        
        
        logger.info("Using BeautifulSoup for metadata extraction")
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        resp = requests.get(url, headers=headers, timeout=5)
        soup = BeautifulSoup(resp.text, "html.parser")
        
       
        metadata = Metadata(url=url)
        
         
        metadata.title = soup.title.string if soup.title else None
        
        
        desc_tag = soup.find("meta", attrs={"name": "description"})
        if desc_tag and desc_tag.get("content"):
            metadata.description = desc_tag["content"]
        
         
        og_title = soup.find("meta", property="og:title")
        if og_title and og_title.get("content"):
            metadata.title = og_title["content"]
            
        og_desc = soup.find("meta", property="og:description")
        if og_desc and og_desc.get("content"):
            metadata.description = og_desc["content"]
            
        og_image = soup.find("meta", property="og:image")
        if og_image and og_image.get("content"):
            metadata.image = og_image["content"]
            
        # Get site name
        og_site = soup.find("meta", property="og:site_name")
        if og_site and og_site.get("content"):
            metadata.site_name = og_site["content"]
            
        # Get favicon
        favicon_link = soup.find("link", rel="icon") or soup.find("link", rel="shortcut icon")
        if favicon_link and favicon_link.get("href"):
            favicon = favicon_link["href"]
            # Make absolute URL if relative
            if not favicon.startswith(("http://", "https://")):
                if favicon.startswith("/"):
                    favicon = f"{resp.url.scheme}://{resp.url.netloc}{favicon}"
                else:
                    favicon = f"{resp.url.scheme}://{resp.url.netloc}/{favicon}"
            metadata.favicon = favicon
        
        return metadata
        
    except Exception as e:
        logger.error(f"Error fetching {url}: {e}")
        return Metadata(
            url=url, 
            title=None, 
            description=None, 
            image=None, 
            status="failed"
        )

@app.post("/extract-metadata", response_model=Metadata)
async def get_url_metadata(request: URLRequest):
    """Extract metadata from the provided URL."""
    try:
        metadata = fetch_metadata(str(request.url))
        return metadata
    except Exception as e:
        logger.error(f"Exception in get_url_metadata: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    # Run the FastAPI app using Uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app:app", host="0.0.0.0", port=port)