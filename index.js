const express = require('express');
const cors = require('cors');
const YTMusic = require('ytmusic-api');
const play = require('play-dl');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize YTMusic
const ytmusic = new YTMusic();
ytmusic.initialize().then(() => {
    console.log('✅ YTMusic API initialized');
}).catch(err => {
    console.error('❌ Failed to initialize YTMusic API:', err);
});

// --- API Endpoints ---

/**
 * GET /api/home
 * Retrieves personalized or regional home suggestions.
 */
app.get('/api/home', async (req, res) => {
    try {
        const sections = await ytmusic.getHomeSections();
        res.json({ success: true, data: sections });
    } catch (error) {
        console.error('Error fetching home sections:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch home suggestions.' });
    }
});

/**
 * GET /api/search?q=your_query
 * Searches for songs based on a query. Useful for finding the videoId.
 */
app.get('/api/search', async (req, res) => {
    const { q } = req.query;
    if (!q) {
        return res.status(400).json({ success: false, error: 'Missing search query. Please provide ?q=your_search' });
    }

    try {
        const results = await ytmusic.searchSongs(q);
        res.json({ success: true, data: results });
    } catch (error) {
        console.error('Error searching songs:', error);
        res.status(500).json({ success: false, error: 'Failed to search songs.' });
    }
});

/**
 * GET /api/search/playlists?q=your_query
 * Searches specifically for public playlists (e.g. "Workout", "Top 50", "Lofi").
 */
app.get('/api/search/playlists', async (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(400).json({ success: false, error: 'Missing search query.' });
    try {
        const results = await ytmusic.searchPlaylists(q);
        res.json({ success: true, data: results });
    } catch (error) {
        console.error('Error searching playlists:', error);
        res.status(500).json({ success: false, error: 'Failed to search playlists.' });
    }
});

/**
 * GET /api/search/albums?q=your_query
 * Searches specifically for albums.
 */
app.get('/api/search/albums', async (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(400).json({ success: false, error: 'Missing search query.' });
    try {
        const results = await ytmusic.searchAlbums(q);
        res.json({ success: true, data: results });
    } catch (error) {
        console.error('Error searching albums:', error);
        res.status(500).json({ success: false, error: 'Failed to search albums.' });
    }
});

/**
 * GET /api/search/artists?q=your_query
 * Searches specifically for artists.
 */
app.get('/api/search/artists', async (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(400).json({ success: false, error: 'Missing search query.' });
    try {
        const results = await ytmusic.searchArtists(q);
        res.json({ success: true, data: results });
    } catch (error) {
        console.error('Error searching artists:', error);
        res.status(500).json({ success: false, error: 'Failed to search artists.' });
    }
});

/**
 * GET /api/search/all?q=your_query
 * Generic search that returns a mix of songs, videos, artists, albums, and playlists.
 */
app.get('/api/search/all', async (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(400).json({ success: false, error: 'Missing search query.' });
    try {
        const results = await ytmusic.search(q);
        res.json({ success: true, data: results });
    } catch (error) {
        console.error('Error generic search:', error);
        res.status(500).json({ success: false, error: 'Failed to perform generic search.' });
    }
});

/**
 * GET /api/stream?id=video_id
 * Deciphers the YouTube signature and returns the direct, playable audio stream URL.
 */
app.get('/api/stream', async (req, res) => {
    const { id } = req.query;
    if (!id) {
        return res.status(400).json({ success: false, error: 'Missing videoId. Please provide ?id=video_id' });
    }

    try {
        const url = `https://www.youtube.com/watch?v=${id}`;

        // Use play-dl to get video info
        const info = await play.video_info(url);

        // Find formats that contain a playable URL (play-dl sometimes hides deciphered URLs for audio-only streams)
        const playableFormats = info.format.filter(f => f.url);

        if (!playableFormats || playableFormats.length === 0) {
            return res.status(404).json({ success: false, error: 'Could not extract playable stream URL.' });
        }

        // play-dl usually provides the lowest resolution combined stream (video+audio) with a direct URL
        const bestFormat = playableFormats[0];

        const alternativeFormats = playableFormats.map(f => ({
            itag: f.itag,
            formatNote: f.quality,
            ext: f.container || 'mp4',
            mimeType: f.mimeType,
            url: f.url
        }));

        res.json({
            success: true,
            data: {
                title: info.video_details.title,
                videoId: id,
                bestAudio: {
                    format: bestFormat.mimeType,
                    streamUrl: bestFormat.url
                },
                allAudioFormats: alternativeFormats
            }
        });
    } catch (error) {
        console.error('Error extracting stream URL:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to extract stream URL. The video might be private, region-locked, or the signature changed.',
            details: error.message
        });
    }
});

/**
 * GET /api/playlist?id=playlist_id
 */
app.get('/api/playlist', async (req, res) => {
    const { id } = req.query;
    if (!id) return res.status(400).json({ success: false, error: 'Missing playlist id.' });
    try {
        const playlist = await ytmusic.getPlaylist(id);
        res.json({ success: true, data: playlist });
    } catch (error) {
        console.error('Error fetching playlist:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch playlist.' });
    }
});

/**
 * GET /api/album?id=album_id
 */
app.get('/api/album', async (req, res) => {
    const { id } = req.query;
    if (!id) return res.status(400).json({ success: false, error: 'Missing album id.' });
    try {
        const album = await ytmusic.getAlbum(id);
        res.json({ success: true, data: album });
    } catch (error) {
        console.error('Error fetching album:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch album.' });
    }
});

/**
 * GET /api/artist?id=artist_id
 */
app.get('/api/artist', async (req, res) => {
    const { id } = req.query;
    if (!id) return res.status(400).json({ success: false, error: 'Missing artist id.' });
    try {
        const artist = await ytmusic.getArtist(id);
        res.json({ success: true, data: artist });
    } catch (error) {
        console.error('Error fetching artist:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch artist.' });
    }
});

/**
 * GET /api/lyrics?id=video_id
 */
app.get('/api/lyrics', async (req, res) => {
    const { id } = req.query;
    if (!id) return res.status(400).json({ success: false, error: 'Missing video_id.' });
    try {
        const lyrics = await ytmusic.getLyrics(id);
        res.json({ success: true, data: lyrics });
    } catch (error) {
        console.error('Error fetching lyrics:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch lyrics.' });
    }
});

/**
 * GET /api/upnext?id=video_id
 */
app.get('/api/upnext', async (req, res) => {
    const { id } = req.query;
    if (!id) return res.status(400).json({ success: false, error: 'Missing video_id.' });
    try {
        const upnext = await ytmusic.getUpNexts(id);
        res.json({ success: true, data: upnext });
    } catch (error) {
        console.error('Error fetching up next:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch up next queue.' });
    }
});

/**
 * GET /api/suggestions?q=query
 */
app.get('/api/suggestions', async (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(400).json({ success: false, error: 'Missing query.' });
    try {
        const suggestions = await ytmusic.getSearchSuggestions(q);
        res.json({ success: true, data: suggestions });
    } catch (error) {
        console.error('Error fetching suggestions:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch search suggestions.' });
    }
});

// Export the app for Vercel Serverless Functions
module.exports = app;

// Start Server locally if not running on Vercel
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on http://localhost:${PORT}`);
        console.log(`\nAvailable Endpoints:`);
        console.log(`- Home Suggestions : http://localhost:${PORT}/api/home`);
        console.log(`- Search Songs     : http://localhost:${PORT}/api/search?q=Never+Gonna+Give+You+Up`);
        console.log(`- Search Playlists : http://localhost:${PORT}/api/search/playlists?q=trending`);
        console.log(`- Search Albums    : http://localhost:${PORT}/api/search/albums?q=Top+Hits`);
        console.log(`- Search Artists   : http://localhost:${PORT}/api/search/artists?q=Ed+Sheeran`);
        console.log(`- Generic Search   : http://localhost:${PORT}/api/search/all?q=Pop`);
        console.log(`- Get Audio Stream : http://localhost:${PORT}/api/stream?id=lYBUbBu4W08`);
        console.log(`- Playlist Info    : http://localhost:${PORT}/api/playlist?id=PLAYLIST_ID`);
        console.log(`- Album Info       : http://localhost:${PORT}/api/album?id=ALBUM_ID`);
        console.log(`- Artist Info      : http://localhost:${PORT}/api/artist?id=ARTIST_ID`);
        console.log(`- Lyrics           : http://localhost:${PORT}/api/lyrics?id=lYBUbBu4W08`);
        console.log(`- Up Next / Radio  : http://localhost:${PORT}/api/upnext?id=lYBUbBu4W08`);
        console.log(`- Suggestions      : http://localhost:${PORT}/api/suggestions?q=Never+Gonna\n`);
    });
}
