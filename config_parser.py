import re
from urllib.parse import urlparse

def parse_configs(config_data, url):
    path = urlparse(url).path
    match = re.search(r'ipp/(.*?)/(\d+)/config', path)
    if not match:
        return None
    protocol, node_id = match.groups()
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
        key = node['type']
        if key not in categorized:
            categorized[key] = []
        categorized[key].append(node)
    return categorized
