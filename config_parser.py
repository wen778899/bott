import re
from urllib.parse import urlparse

def parse_configs(config_data, url):
    # 从 URL 路径提取协议类型和节点编号
    path = urlparse(url).path
    match = re.search(r'ipp/(.*?)/(\d+)/config', path)
    if not match:
        return None
    protocol, node_id = match.groups()
    
    # 提取关键参数（根据协议动态解析）
    node = {
        'name': f"{protocol}-{node_id}",
        'type': protocol,
        'server': config_data.get('server', ''),
        'port': config_data.get('port', 443),
        'uuid': config_data.get('uuid', ''),
        'password': config_data.get('password', ''),
        'sni': config_data.get('sni', ''),
        'url': url  # 保留原始链接
    }
    return node

def categorize_nodes(nodes):
    categorized = {}
    for node in nodes:
        if node['type'] not in categorized:
            categorized[node['type']] = []
        categorized[node['type']].append(node)
    return categorized
