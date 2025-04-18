from flask import Flask, jsonify, render_template_string
import requests
from config_parser import parse_configs, categorize_nodes

app = Flask(__name__)

# 预定义的配置文件 URL 列表
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
                config_data = response.json()  # 或 yaml.safe_load() 处理 YAML
                node = parse_configs(config_data, url)
                if node:
                    nodes.append(node)
        except Exception as e:
            print(f"Error fetching {url}: {e}")
    
    # 分类去重
    categorized = categorize_nodes(nodes)
    # 生成订阅（以 Clash 为例）
    if protocol == "clash":
        return render_template('clash.yaml.j2', nodes=categorized.get('clash', []))
    else:
        return jsonify(categorized)

if __name__ == '__main__':
    app.run(debug=False, port=8000)
