import pandas as pd
import random

def generate_cic_dataset(filename='cic_attack_sequence.csv', num_attacks=100):
    print(f"[*] Generating {num_attacks} payloads from CIC-IDS-2017 profiles...")
    
    cic_labels = [
        'DDoS', 'DoS Hulk', 'DoS GoldenEye', 'DoS slowloris', 'DoS Slowhttptest', 
        'FTP-Patator', 'SSH-Patator', 'Web Attack – Brute Force', 'Web Attack – XSS', 
        'Web Attack – SQL Injection', 'PortScan', 'Bot', 'Infiltration', 'Heartbleed'
    ]
    
    data = []
    
    for _ in range(num_attacks):
        if random.random() < 0.15:
            data.append([random.randint(3, 8), 'BENIGN', 1.0])
            continue
            
        vector = random.choice(cic_labels)
        delay = random.randint(3, 12)
        
        if 'DoS' in vector or vector == 'DDoS': intensity = round(random.uniform(1.5, 2.5), 1)
        elif vector == 'Heartbleed' or vector == 'Infiltration': intensity = round(random.uniform(1.8, 2.5), 1)
        elif 'Web Attack' in vector or 'Patator' in vector: intensity = round(random.uniform(0.8, 1.5), 1)
        else: intensity = round(random.uniform(0.5, 1.2), 1)
            
        data.append([delay, vector, intensity])

    df = pd.DataFrame(data, columns=['delay_seconds', 'attack_vector', 'intensity'])
    df.to_csv(filename, index=False)
    print(f"[+] Dataset saved to {filename}")

if __name__ == "__main__":
    generate_cic_dataset()