This is the JSON structure for the features that this code uses to store map points in LocalStorage.

{ "type": "FeatureCollection", "features": [
  { "type": "Feature",
    "geometry": { "type": "Point", "coordinates": [-69.6631, 44.5797] },
    "properties": { "name": "Thomas College", "details": "..." } } ] }


To ensure that no one else uses your API key, do the following:
https://console.cloud.google.com/apis/library/maps-backend.googleapis.com

Click Enable on the Javascript API 

Go to: https://console.cloud.google.com/apis/credentials
And click on the API Key that should be there. 
Scroll down to App Restrictions and select Websites.
Add http://localhost and http://127.0.0.1 for testing on your computer
You might want to add the https versions of those too.

Run your index.html page using the Live Server.