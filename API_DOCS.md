# YouTube Music API Wrapper

This is a Node.js Express backend that serves as a lightweight wrapper for YouTube Music. It allows you to fetch home page suggestions, search for songs, and reliably extract the deciphered, playable audio stream URLs for any track.

## Getting Started

1. **Install dependencies** (if not already installed):
   ```bash
   npm install
   ```
2. **Run the server in development mode**:
   ```bash
   npm run dev
   ```
   This will start the server using `nodemon` on `http://localhost:3000`. Any changes to the code will automatically restart the server.

---

## API Endpoints

All endpoints return a JSON response in the format:
```json
{
  "success": true,
  "data": { ... } // or [ ... ]
}
```
If an error occurs, the response will be:
```json
{
  "success": false,
  "error": "Error message description"
}
```

### 1. Get Home Suggestions
Returns personalized and regional home suggestions, playlists, and new releases just like the YouTube Music homepage.
- **URL:** `/api/home`
- **Method:** `GET`

### 2. Search Songs
Searches specifically for songs based on a query string. This is particularly useful for finding the `videoId` (Song ID) needed to stream a track.
- **URL:** `/api/search`
- **Method:** `GET`
- **Query Params:** `q`=[string] (Required)
- **Example:** `/api/search?q=Never+Gonna+Give+You+Up`

### 3. Search Playlists
Searches specifically for public playlists (e.g., "Workout", "Top 50", "Lofi").
- **URL:** `/api/search/playlists`
- **Method:** `GET`
- **Query Params:** `q`=[string] (Required)

### 4. Search Albums
Searches specifically for albums.
- **URL:** `/api/search/albums`
- **Method:** `GET`
- **Query Params:** `q`=[string] (Required)

### 5. Search Artists
Searches specifically for artists.
- **URL:** `/api/search/artists`
- **Method:** `GET`
- **Query Params:** `q`=[string] (Required)

### 6. Generic Search
Returns a mixed result of songs, videos, artists, albums, and playlists.
- **URL:** `/api/search/all`
- **Method:** `GET`
- **Query Params:** `q`=[string] (Required)

### 7. Get Audio Stream URL
Deciphers the YouTube signature and returns the direct, playable audio stream URL. It uses the highly robust `yt-dlp` tool in the background to guarantee success even against YouTube's anti-bot updates.
- **URL:** `/api/stream`
- **Method:** `GET`
- **Query Params:** `id`=[string] (Required: The `videoId` of the track)
- **Success Response Data Example:**
    ```json
    {
      "title": "Never Gonna Give You Up",
      "videoId": "lYBUbBu4W08",
      "bestAudio": {
        "format": "251 - audio only (medium)",
        "streamUrl": "https://rr4---sn-gwpa-8one.googlevideo.com/videoplayback?..."
      },
      "allAudioFormats": [
        {
          "itag": "140",
          "formatNote": "m4a",
          "ext": "m4a",
          "acodec": "mp4a.40.2",
          "abr": 129,
          "url": "https://..."
        }
      ]
    }
    ```

### 8. Get Playlist Details
Fetches full metadata and all tracks of a specific playlist.
- **URL:** `/api/playlist`
- **Method:** `GET`
- **Query Params:** `id`=[string] (Required: The playlist ID)

### 9. Get Album Details
Fetches full metadata and all tracks of a specific album.
- **URL:** `/api/album`
- **Method:** `GET`
- **Query Params:** `id`=[string] (Required: The album ID)

### 10. Get Artist Details
Fetches artist details, top songs, and albums for a given artist.
- **URL:** `/api/artist`
- **Method:** `GET`
- **Query Params:** `id`=[string] (Required: The artist ID)

### 11. Get Lyrics
Fetches the lyrics for a given song.
- **URL:** `/api/lyrics`
- **Method:** `GET`
- **Query Params:** `id`=[string] (Required: The `videoId`)

### 12. Get Up Next / Radio Queue
Fetches the "Up Next" queue (the auto-play radio list) for a specific song.
- **URL:** `/api/upnext`
- **Method:** `GET`
- **Query Params:** `id`=[string] (Required: The `videoId`)

### 13. Get Search Suggestions
Fetches autocomplete suggestions based on a query. Useful for building a search bar.
- **URL:** `/api/suggestions`
- **Method:** `GET`
- **Query Params:** `q`=[string] (Required: Search string snippet)

---

## Technical Details
- **Search & Metadata:** Powered by the [ytmusic-api](https://www.npmjs.com/package/ytmusic-api) package, which efficiently scrapes the YouTube Music interface without requiring API keys.
- **Signature Deciphering:** Powered by [youtube-dl-exec](https://www.npmjs.com/package/youtube-dl-exec), which utilizes `yt-dlp` under the hood to completely bypass the deciphering errors commonly found in older JavaScript libraries.
