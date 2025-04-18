from flask import Flask, jsonify, render_template
import requests
from config_parser import parse_configs, categorize_nodes

app = Flask(__name__)

# 预定义的配置文件 URL 列表
CONFIG_URLS = [
    "https://www.gitlabip.xyz/Alvin9999/PAC/master/backup/img/1/2/ipp/singbox/1/config.json",
    "https://gitlab.com/free9999/ipupdate/-/raw/master/backup/img/1/2/ipp/hysteria/1/config.json",
    # 添加更多 URL...
]

@app.route('/')
def home():
    """
    首页路由，返回简单的说明文字。
    """
    return "Node Subscription Service - Visit /subscribe/<protocol> to get configs."

@app.route('/subscribe/<protocol>')
def generate_subscription(protocol):
    """
    根据协议类型（如 clash）生成订阅配置。
    """
    nodes = []
    for url in CONFIG_URLS:
        try:
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                config_data = response.json()  # 假设数据是 JSON 格式
                node = parse_configs(config_data, url)
                if node:
                    nodes.append(node)
        except Exception as e:
            print(f"Error fetching {url}: {e}")
    
    # 分类和去重节点
    categorized = categorize_nodes(nodes)
    
    if protocol == "clash":
        # 渲染 Jinja2 模板生成 Clash 配置
        return render_template('clash.yaml.j2', nodes=categorized.get('clash', []))
    else:
        # 返回 JSON 格式的分类结果
        return jsonify(categorized)

if __name__ == '__main__':
    # 启动 Flask 应用
    app.run(debug=False, port=8000)
