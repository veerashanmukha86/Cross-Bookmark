from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
from bs4 import BeautifulSoup
from concurrent.futures import ThreadPoolExecutor
from fastapi.middleware.cors import CORSMiddleware
import requests

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LinkRequest(BaseModel):
    links: List[str]

class LinkData(BaseModel):
    url: str
    title: Optional[str]
    description: Optional[str]
    thumbnail: Optional[str]
    status: str  

def fetch_metadata(url: str) -> LinkData:
    try:
        
        if "twitter.com" in url or "x.com" in url:
            api_url = f"https://api.microlink.io/?url={url}"
            resp = requests.get(api_url, timeout=3)
            data = resp.json()
            if data.get("status") == "success":
                result = data.get("data", {})
                return LinkData(
                    url=url,
                    title=result.get("title"),
                    description=result.get("description"),
                    thumbnail=(result.get("image", {}).get("url") if result.get("image") else None),
                    status="success"
                )
            else:
                return LinkData(url=url, title=None, description=None, thumbnail=None, status="failed")
      
        resp = requests.get(url, timeout=1)
        soup = BeautifulSoup(resp.text, "html.parser")
        title = soup.title.string if soup.title else ""
        description = ""
        thumbnail = ""
        desc_tag = soup.find("meta", attrs={"name": "description"})
        if desc_tag and desc_tag.get("content"):
            description = desc_tag["content"]
        og_image = soup.find("meta", property="og:image")
        if og_image and og_image.get("content"):
            thumbnail = og_image["content"]
        return LinkData(url=url, title=title, description=description, thumbnail=thumbnail, status="success")
    except Exception as e:
        print
        print(f"Error fetching {url}: {e}")
        return LinkData(url=url, title=None, description=None, thumbnail=None, status="failed")

@app.post("/links", response_model=List[LinkData])
async def get_links_metadata(request: LinkRequest):
    with ThreadPoolExecutor(max_workers=30) as executor:  
        results = list(executor.map(fetch_metadata, request.links))
    return results