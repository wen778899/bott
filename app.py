from flask import Flask, jsonify, render_template
import requests
import yaml  # 新增导入
from config_parser import parse_configs, categorize_nodes

app = Flask(__name__)

CONFIG_URLS = [
    "https://www.gitlabip.xyz/Alvin9999/PAC/master/backup/img/1/2/ipp/clash.meta2/1/config.yaml",
    "https://gitlab.com/free9999/ipupdate/-/raw/master/backup/img/1/2/ipp/hysteria/1/config.json",
    # 其他 URL...
]

@app.route('/')
def home():
    return "Node Subscription Service - Visit /subscribe/clash to get configs."

@app.route('/subscribe/<protocol>', methods=['GET'])
def generate_subscription(protocol):
    nodes = []
    for url in CONFIG_URLS:
        try:
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                # 根据文件类型解析
                if url.endswith('.json'):
                    config_data = response.json()
                elif url.endswith('.yaml') or url.endswith('.yml'):
                    config_data = yaml.safe_load(response.text)
                else:
                    continue
                node = parse_configs(config_data, url)
                if node:
                    nodes.append(node)
        except Exception as e:
            print(f"Error fetching {url}: {e}")
    
    categorized = categorize_nodes(nodes)
    if protocol == "clash":
        return render_template('clash.yaml.j2', nodes=categorized.get('clash.meta2', []))
    else:
        return jsonify(categorized)

if __name__ == '__main__':
    app.run(debug=False, port=8000)
