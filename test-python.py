import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

req = urllib.request.Request("https://api.comick.app/chapter/F0BvVv8t", headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req, context=ctx) as response:
        html = response.read()
        print("Success:", len(html))
        try:
           data = json.loads(html)
           if "chapter" in data:
              print("Has chapter images:", len(data["chapter"].get("images", [])))
        except:
           print(html[:100])
except Exception as e:
    print("Error:", e)
