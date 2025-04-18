import re
from urllib.parse import urlparse

def parse_configs(config_data, url):
    path = urlparse(url).path
    # 匹配协议名称（支持含点的协议，如 clash.meta2）
    match = re.search(r'ipp/(.*?)/(\d+)/config', path)
    if not match:
        return None
    protocol = match.group(1)  # 如 'clash.meta2'
    node_id = match.group(2)
    
    # 动态提取参数
    return {
        'name': f"{protocol}-{node_id}",
        'type': protocol,
        'server': config_data.get('server', ''),
        'port': config_data.get('port', 443),
        'uuid': config_data.get('uuid', ''),
        'password': config_data.get('password', ''),
        'sni': config_data.get('sni', ''),
        'url': url
    }

def categorize_nodes(nodes):
    categorized = {}
    for node in nodes:
        protocol = node['type']
        if protocol not in categorized:
            categorized[protocol] = []
        categorized[protocol].append(node)
    return categorized
