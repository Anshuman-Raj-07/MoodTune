from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from pymongo import MongoClient
from datetime import datetime, timezone
import os, requests, random, certifi

load_dotenv()

app = Flask(__name__)
CORS(app)

YOUTUBE_API_KEY = os.getenv('YOUTUBE_API_KEY', '')
MONGODB_URI = os.getenv('MONGODB_URI', '')

# MongoDB setup
db = None
if MONGODB_URI:
    try:
        client = MongoClient(
            MONGODB_URI,
            tlsCAFile=certifi.where(),
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000,
            socketTimeoutMS=5000,
        )
        db = client['moodtune']
        print('✅ MongoDB connected')
    except Exception as e:
        print(f'⚠️ MongoDB connection failed: {e}')

MOOD_QUERIES = {
    'happy':     'happy trending upbeat pop music',
    'sad':       'sad emotional trending music',
    'angry':     'intense rock trending music energy',
    'neutral':   'chill lo-fi trendic music',
    'surprised': 'exciting trending cinematic songs',
}

@app.route('/api/music')
def get_music():
    mood = request.args.get('mood', 'neutral')
    query = MOOD_QUERIES.get(mood, 'chill music')

    # Log mood to MongoDB
    if db is not None:
        try:
            db.mood_logs.insert_one({
                'mood': mood,
                'timestamp': datetime.now(timezone.utc)
            })
        except Exception as e:
            print(f'⚠️ Mood log failed: {e}')

    if not YOUTUBE_API_KEY:
        fallback = {
            'happy':     'ZbZSe6N_BXs',
            'sad':       'kXYiU_JCYtU',
            'angry':     'HgzGwKwLmgM',
            'neutral':   '5qap5aO4i9A',
            'surprised': 'M7lc1UVf-VE',
        }
        return jsonify({'videoId': fallback.get(mood, '5qap5aO4i9A'), 'source': 'fallback'})

    try:
        resp = requests.get(
            'https://www.googleapis.com/youtube/v3/search',
            params={
                'part': 'snippet',
                'q': query,
                'type': 'video',
                'videoCategoryId': '10',
                'maxResults': 5,
                'key': YOUTUBE_API_KEY,
            }
        )
        items = resp.json().get('items', [])
        if items:
            video_id = random.choice(items)['id']['videoId']
            return jsonify({'videoId': video_id, 'source': 'youtube'})
        return jsonify({'error': 'no results'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/logs')
def get_logs():
    if db is None:
        return jsonify({'error': 'MongoDB not connected'}), 503
    try:
        logs = list(db.mood_logs.find({}, {'_id': 0}).sort('timestamp', -1).limit(20))
        for log in logs:
            log['timestamp'] = log['timestamp'].isoformat()
        return jsonify(logs)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health')
def health():
    return jsonify({'status': 'ok', 'mongodb': db is not None})

if __name__ == '__main__':
    app.run(debug=True, port=5000)