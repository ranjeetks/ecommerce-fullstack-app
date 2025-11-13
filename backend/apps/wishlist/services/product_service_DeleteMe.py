# cart/services/product_service.py
import requests

PRODUCT_CATALOG_URL = "http://localhost:8000/api/products/"

def get_product(product_id: int):
    try:
        response = requests.get(f"{PRODUCT_CATALOG_URL}{product_id}/")
        if response.status_code == 200:
            return response.json()
        return {"error": "Product not found"}
    except requests.RequestException as e:
        return {"error": str(e)}