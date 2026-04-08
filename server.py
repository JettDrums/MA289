import socket
import threading
import json
import time
import subprocess
import sys
import os
from datetime import datetime
from multiprocessing import Process

# Shared data file for inter-process communication
DATA_FILE = os.path.join(os.path.dirname(__file__), 'leaderboard_data.json')
data_lock = threading.Lock()

def save_leaderboard(data):
    """Save leaderboard data to file"""
    with data_lock:
        with open(DATA_FILE, 'w') as f:
            json.dump(data, f)

def load_leaderboard():
    """Load leaderboard data from file"""
    try:
        if os.path.exists(DATA_FILE):
            with open(DATA_FILE, 'r') as f:
                return json.load(f)
    except Exception:
        pass
    return {}

def handle_client(client_socket, address):
    """Handle individual client connections"""
    print(f"[NEW CONNECTION] {address} connected.")
    
    try:
        while True:
            # Receive data from client
            data = client_socket.recv(4096).decode('utf-8')
            
            if not data:
                break
            
            # Parse JSON data
            try:
                message = json.loads(data)
                username = message.get('username')
                aac = message.get('AAC')
                
                if username and aac is not None:
                    # Load current leaderboard
                    leaderboard_data = load_leaderboard()
                    
                    # Update leaderboard
                    leaderboard_data[username] = {
                        'AAC': aac,
                        'timestamp': datetime.now().isoformat(),
                        'address': address[0]
                    }
                    
                    # Save updated leaderboard
                    save_leaderboard(leaderboard_data)
                    
                    print(f"[DATA RECEIVED] {username}: AAC={aac}")
                    
                    # Send acknowledgment
                    response = json.dumps({'status': 'success', 'message': 'Data received'})
                    client_socket.send(response.encode('utf-8'))
                else:
                    error_response = json.dumps({'status': 'error', 'message': 'Invalid data format'})
                    client_socket.send(error_response.encode('utf-8'))
                    
            except json.JSONDecodeError:
                print(f"[ERROR] Invalid JSON from {address}")
                error_response = json.dumps({'status': 'error', 'message': 'Invalid JSON'})
                client_socket.send(error_response.encode('utf-8'))
                
    except Exception as e:
        print(f"[ERROR] {address}: {e}")
    finally:
        client_socket.close()
        print(f"[DISCONNECTED] {address}")

def start_server(host='0.0.0.0', port=5555):
    """Start the server and listen for connections"""
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind((host, port))
    server.listen(5)
    
    print(f"[LISTENING] Server is listening on {host}:{port}")
    
    while True:
        client_socket, address = server.accept()
        thread = threading.Thread(target=handle_client, args=(client_socket, address))
        thread.start()
        print(f"[ACTIVE CONNECTIONS] {threading.active_count() - 1}")

def get_leaderboard():
    """Get current leaderboard data"""
    return load_leaderboard()

def launch_streamlit():
    """Launch the Streamlit app"""
    streamlit_file = os.path.join(os.path.dirname(__file__), 'streamlit_app.py')
    # Run streamlit with headless mode disabled to auto-open browser
    subprocess.run([
        sys.executable, '-m', 'streamlit', 'run', streamlit_file,
        '--server.headless=true',
        '--browser.gatherUsageStats=false'
    ])

if __name__ == "__main__":
    print("=" * 60)
    print("GAME OF DRONES - SERVER STARTING")
    print("=" * 60)
    
    # Initialize empty leaderboard file
    if not os.path.exists(DATA_FILE):
        save_leaderboard({})
    
    # Start Streamlit in a separate process
    print("\n[STREAMLIT] Launching dashboard...")
    streamlit_process = Process(target=launch_streamlit)
    streamlit_process.start()
    
    # Give Streamlit a moment to start
    time.sleep(2)
    
    # Start the server in the main process
    print("\n[SERVER] Starting TCP server...")
    try:
        start_server()
    except KeyboardInterrupt:
        print("\n\n[SHUTDOWN] Stopping server...")
        streamlit_process.terminate()
        streamlit_process.join()
        print("[SHUTDOWN] Complete. Goodbye!")