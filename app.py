from flask import Flask, jsonify, render_template  # 修正导入
import requests
from config_parser import parse_configs, categorize_nodes

app = Flask(__name__)

CONFIG_URLS = [
    "https://www.gitlabip.xyz/Alvin9999/PAC/master/backup/img/1/2/ipp/singbox/1/config.json",
    "https://gitlab.com/free9999/ipupdate/-/raw/master/backup/img/1/2/ipp/hysteria/1/config.json",
    # 其他 URL...
]

@app.route('/')
def home():
    return "Node Subscription Service - Visit /subscribe/clash to get configs."

@app.route('/subscribe/<protocol>')
def generate_subscription(protocol):
    nodes = []
    for url in CONFIG_URLS:
        try:
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                config_data = response.json()
                node = parse_configs(config_data, url)
                if node:
                    nodes.append(node)
        except Exception as e:
            print(f"Error fetching {url}: {e}")
    
    categorized = categorize_nodes(nodes)
    if protocol == "clash":
        return render_template('clash.yaml.j2', nodes=categorized.get('clash', []))  # 确保协议类型匹配
    else:
        return jsonify(categorized)

if __name__ == '__main__':
    app.run(debug=False, port=8000)
