import socket
import json
import time
import random

def send_data(host, port, username, aac_score):
    """Send performance data to the server"""
    try:
        client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        client.connect((host, port))
        
        # Create JSON message
        message = {
            'username': username,
            'AAC': aac_score
        }
        
        # Send data
        client.send(json.dumps(message).encode('utf-8'))
        
        # Receive response
        response = client.recv(1024).decode('utf-8')
        print(f"Server response: {response}")
        
        client.close()
        return True
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    # Configuration
    HOST = 'localhost'  # Change to server IP if needed
    PORT = 5555
    
    # Test users
    test_users = ['Drone_Alpha', 'Drone_Beta', 'Drone_Gamma', 'Drone_Delta', 'Drone_Epsilon']
    
    print("Starting test client...")
    print("Sending random performance data every 3 seconds...")
    print("Press Ctrl+C to stop\n")
    
    try:
        while True:
            # Pick a random user and score
            username = random.choice(test_users)
            aac_score = random.randint(50, 999)
            
            print(f"Sending: {username} - AAC: {aac_score}")
            send_data(HOST, PORT, username, aac_score)
            
            time.sleep(3)
    except KeyboardInterrupt:
        print("\nTest client stopped.")
