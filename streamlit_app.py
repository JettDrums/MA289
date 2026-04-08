import streamlit as st
import socket
import time
import json
import os

# Shared data file
DATA_FILE = os.path.join(os.path.dirname(__file__), 'leaderboard_data.json')

def get_leaderboard():
    """Load leaderboard data from file"""
    try:
        if os.path.exists(DATA_FILE):
            with open(DATA_FILE, 'r') as f:
                return json.load(f)
    except Exception:
        pass
    return {}

def get_local_ip():
    """Get the local IP address"""
    try:
        # Create a socket to determine the local IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        return local_ip
    except Exception:
        return "Unable to determine IP"

# Page configuration
st.set_page_config(
    page_title="Game of Drones",
    page_icon="target",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Custom CSS for distinctive design - dark cyberpunk theme
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;600&display=swap');
    
    /* Global styles */
    .stApp {
        background: linear-gradient(135deg, #0a0e27 0%, #1a1a2e 50%, #16213e 100%);
        font-family: 'Rajdhani', sans-serif;
    }
    
    /* Hide default Streamlit elements */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
    
    /* Title styling */
    .main-title {
        font-family: 'Orbitron', sans-serif;
        font-size: 4.5rem;
        font-weight: 900;
        text-align: center;
        background: linear-gradient(135deg, #00d4ff 0%, #0099ff 50%, #7700ff 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        text-transform: uppercase;
        letter-spacing: 8px;
        margin: 2rem 0 1rem 0;
        text-shadow: 0 0 40px rgba(0, 212, 255, 0.3);
        animation: glow 2s ease-in-out infinite alternate;
    }
    
    @keyframes glow {
        from {
            filter: drop-shadow(0 0 20px rgba(0, 212, 255, 0.4));
        }
        to {
            filter: drop-shadow(0 0 40px rgba(119, 0, 255, 0.6));
        }
    }
    
    /* IP Address Display */
    .ip-container {
        text-align: center;
        margin: 2rem 0 3rem 0;
        padding: 1.5rem;
        background: rgba(0, 212, 255, 0.05);
        border: 2px solid rgba(0, 212, 255, 0.3);
        border-radius: 15px;
        backdrop-filter: blur(10px);
    }
    
    .ip-label {
        font-family: 'Orbitron', sans-serif;
        font-size: 1rem;
        color: #00d4ff;
        letter-spacing: 3px;
        text-transform: uppercase;
        margin-bottom: 0.5rem;
    }
    
    .ip-address {
        font-family: 'Orbitron', sans-serif;
        font-size: 2.5rem;
        font-weight: 700;
        color: #ffffff;
        letter-spacing: 4px;
        text-shadow: 0 0 20px rgba(0, 212, 255, 0.6);
    }
    
    .port-info {
        font-family: 'Rajdhani', sans-serif;
        font-size: 1.2rem;
        color: #8899aa;
        margin-top: 0.5rem;
        letter-spacing: 2px;
    }
            
    /* Move main content higher */
    .block-container {
        padding-top: 1rem !important;
    }
    
    /* Leaderboard styling */
    .leaderboard-header {
        font-family: 'Orbitron', sans-serif;
        font-size: 2.5rem;
        font-weight: 700;
        color: #00d4ff;
        text-align: center;
        margin: 3rem 0 2rem 0;
        letter-spacing: 5px;
        text-transform: uppercase;
    }
    
  .leaderboard-container {
    max-width: 520px;
    margin: 0 auto;
    }
    
    .leader-card {
        background: linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(119, 0, 255, 0.1) 100%);
        border: 2px solid rgba(0, 212, 255, 0.3);
        border-radius: 12px;
        padding: 0.5rem 1rem;
        margin: 0.4rem auto;
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
        animation: slideIn 0.5s ease-out;
        max-width: 800px;
    }
    
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(-30px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    .leader-card:hover {
        border-color: #00d4ff;
        box-shadow: 0 0 30px rgba(0, 212, 255, 0.4);
        transform: translateX(10px);
    }
            
    .leader-name {
        font-size: 1.3rem;
    }

    .leader-score {
        font-size: 2rem;
    }
        
    .rank-badge {
        font-family: 'Orbitron', sans-serif;
        font-size: 1.3rem;
        font-weight: 900;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 0.7rem;
    }
    
    .rank-1 {
        background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
        color: #1a1a2e;
        box-shadow: 0 0 30px rgba(255, 215, 0, 0.6);
    }
    
    .rank-2 {
        background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%);
        color: #1a1a2e;
        box-shadow: 0 0 20px rgba(192, 192, 192, 0.6);
    }
    
    .rank-3 {
        background: linear-gradient(135deg, #cd7f32 0%, #e6a658 100%);
        color: #1a1a2e;
        box-shadow: 0 0 20px rgba(205, 127, 50, 0.6);
    }
    
    .rank-other {
        background: rgba(0, 212, 255, 0.2);
        color: #00d4ff;
        border: 2px solid rgba(0, 212, 255, 0.5);
    }
    
    .leader-info {
        flex: 1;
    }
    
    .leader-name {
        font-family: 'Orbitron', sans-serif;
        font-size: 1.8rem;
        font-weight: 700;
        color: #ffffff;
        letter-spacing: 2px;
        margin-bottom: 0.3rem;
    }
    
    .leader-details {
        font-family: 'Rajdhani', sans-serif;
        font-size: 1rem;
        color: #8899aa;
        letter-spacing: 1px;
    }
    
    .leader-score {
        font-family: 'Orbitron', sans-serif;
        font-size: 3rem;
        font-weight: 900;
        color: #00d4ff;
        text-shadow: 0 0 20px rgba(0, 212, 255, 0.6);
        letter-spacing: 3px;
    }
            
    .leader-header-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.4rem 1rem;
        margin-bottom: 0.8rem;
        font-family: 'Orbitron', sans-serif;
        font-size: 1rem;
        letter-spacing: 3px;
        color: #00d4ff;
        position: relative;
    }

    /* centered separator line */
    .leader-header-row::after {
        content: "";
        position: absolute;
        bottom: -6px;
        left: 50%;
        transform: translateX(-50%);
        width: 50%;
        height: 2px;
        background: rgba(0,212,255,0.4);
    }

    .leader-header-left {
        margin-left: 550px; /* aligns with name after rank badge */
    }

    .leader-header-right {
        margin-right: 500px;
    }
    
    .no-data {
        text-align: center;
        font-family: 'Rajdhani', sans-serif;
        font-size: 1.5rem;
        color: #8899aa;
        padding: 4rem;
        letter-spacing: 2px;
    }
    
    /* Status indicator */
    .status-badge {
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0, 212, 255, 0.2);
        border: 2px solid #00d4ff;
        border-radius: 25px;
        padding: 0.5rem 1.5rem;
        font-family: 'Orbitron', sans-serif;
        font-size: 0.9rem;
        color: #00d4ff;
        letter-spacing: 2px;
        backdrop-filter: blur(10px);
        animation: pulse 2s ease-in-out infinite;
    }
    
    @keyframes pulse {
        0%, 100% {
            box-shadow: 0 0 10px rgba(0, 212, 255, 0.4);
        }
        50% {
            box-shadow: 0 0 25px rgba(0, 212, 255, 0.8);
        }
    }
    
    /* Decorative elements */
    .corner-decoration {
        position: fixed;
        width: 200px;
        height: 200px;
        pointer-events: none;
        z-index: 0;
    }
    
    .corner-tl {
        top: 0;
        left: 0;
        border-top: 3px solid rgba(0, 212, 255, 0.3);
        border-left: 3px solid rgba(0, 212, 255, 0.3);
    }
    
    .corner-br {
        bottom: 0;
        right: 0;
        border-bottom: 3px solid rgba(119, 0, 255, 0.3);
        border-right: 3px solid rgba(119, 0, 255, 0.3);
    }
</style>
""", unsafe_allow_html=True)

# Decorative elements
st.markdown("""
<div class="corner-decoration corner-tl"></div>
<div class="corner-decoration corner-br"></div>
<div class="status-badge">● LIVE</div>
""", unsafe_allow_html=True)

# Title
st.markdown('<h1 class="main-title">Game of Drones Leaderboard</h1>', unsafe_allow_html=True)

# Create placeholder for leaderboard
leaderboard_placeholder = st.empty()

# Auto-refresh loop
refresh_interval = 1  # seconds

while True:
    # Get leaderboard data
    data = get_leaderboard()
    
    # Sort by AAC score (descending)
    sorted_data = sorted(data.items(), key=lambda x: x[1]['AAC'], reverse=True)
    
    with leaderboard_placeholder.container():
        st.markdown('<div class="leaderboard-container">', unsafe_allow_html=True)

        st.markdown("""
            <div class="leader-header-row">
                <div class="leader-header-left">USERNAME</div>
                <div class="leader-header-right">AVG. AAC</div>
            </div>
            """, unsafe_allow_html=True)
        
        if sorted_data:
            for rank, (username, info) in enumerate(sorted_data, 1):
                # Determine rank badge class
                if rank == 1:
                    rank_class = "rank-1"
                    rank_symbol = "1"
                elif rank == 2:
                    rank_class = "rank-2"
                    rank_symbol = "2"
                elif rank == 3:
                    rank_class = "rank-3"
                    rank_symbol = "3"
                else:
                    rank_class = "rank-other"
                    rank_symbol = f"{rank}"
                
                # Format timestamp
                timestamp = info['timestamp'].split('T')
                time_display = timestamp[1].split('.')[0] if len(timestamp) > 1 else "N/A"
                
                st.markdown(f"""
                    <div class="leader-card">
                        <div class="rank-badge {rank_class}">{rank_symbol}</div>
                        <div class="leader-info">
                            <div class="leader-name">{username}</div>
                            <div class="leader-details">Last Update: {time_display}</div>
                        </div>
                        <div class="leader-score">{info['AAC']}</div>
                    </div>
                    """, unsafe_allow_html=True)
        else:
            st.markdown('<div class="no-data">Waiting for drone data...</div>', unsafe_allow_html=True)
        
        st.markdown('</div>', unsafe_allow_html=True)
    
    # Wait before refreshing
    time.sleep(refresh_interval)