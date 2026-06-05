import * as net from 'net';

const SERVICE_MAP: Record<number, string> = {
  7: 'Echo',
  20: 'FTP-Data',
  21: 'FTP',
  22: 'SSH',
  23: 'Telnet',
  25: 'SMTP',
  43: 'WHOIS',
  53: 'DNS',
  67: 'DHCP',
  68: 'DHCP',
  69: 'TFTP',
  80: 'HTTP',
  88: 'Kerberos',
  110: 'POP3',
  111: 'RPCBind',
  119: 'NNTP',
  123: 'NTP',
  135: 'MSRPC',
  137: 'NetBIOS-NS',
  138: 'NetBIOS-DGM',
  139: 'NetBIOS-SSN',
  143: 'IMAP',
  161: 'SNMP',
  162: 'SNMP-Trap',
  179: 'BGP',
  389: 'LDAP',
  443: 'HTTPS',
  445: 'SMB',
  465: 'SMTPS',
  500: 'ISAKMP',
  514: 'Syslog',
  515: 'LPD',
  520: 'RIP',
  523: 'IBM-DB2',
  587: 'SMTP-Sub',
  631: 'IPP',
  636: 'LDAPS',
  873: 'Rsync',
  902: 'VMware',
  993: 'IMAPS',
  995: 'POP3S',
  1080: 'SOCKS',
  1099: 'RMI',
  1433: 'MSSQL',
  1434: 'MSSQL-UDP',
  1521: 'Oracle',
  1723: 'PPTP',
  1883: 'MQTT',
  2049: 'NFS',
  2181: 'ZooKeeper',
  2375: 'Docker',
  2376: 'Docker-TLS',
  3000: 'Dev-Server',
  3306: 'MySQL',
  3389: 'RDP',
  3690: 'SVN',
  4443: 'HTTPS-Alt',
  4567: 'Sinatra',
  5000: 'Dev-Server',
  5432: 'PostgreSQL',
  5672: 'AMQP',
  5900: 'VNC',
  5984: 'CouchDB',
  6379: 'Redis',
  6443: 'K8s-API',
  6667: 'IRC',
  7001: 'WebLogic',
  8000: 'HTTP-Alt',
  8080: 'HTTP-Proxy',
  8443: 'HTTPS-Alt',
  8888: 'HTTP-Alt',
  9000: 'SonarQube',
  9090: 'Prometheus',
  9092: 'Kafka',
  9200: 'Elasticsearch',
  9300: 'ES-Transport',
  9418: 'Git',
  10000: 'Webmin',
  11211: 'Memcached',
  15672: 'RabbitMQ-Mgmt',
  27017: 'MongoDB',
  27018: 'MongoDB',
  28017: 'MongoDB-Web',
  50000: 'SAP',
};

export function getServiceName(port: number): string | undefined {
  return SERVICE_MAP[port];
}

export async function grabBanner(host: string, port: number, timeout = 2000): Promise<string | undefined> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let data = '';

    socket.setTimeout(timeout);

    socket.once('connect', () => {
      // Some services need a nudge — send a basic HTTP request for common HTTP ports
      if ([80, 443, 8080, 8443, 8000, 8888, 3000, 5000].includes(port)) {
        socket.write('HEAD / HTTP/1.0\r\n\r\n');
      }
    });

    socket.on('data', (chunk) => {
      data += chunk.toString('utf-8', 0, Math.min(chunk.length, 256));
      socket.destroy();
    });

    socket.once('timeout', () => {
      socket.destroy();
      resolve(data.trim() || undefined);
    });

    socket.once('error', () => {
      socket.destroy();
      resolve(undefined);
    });

    socket.once('close', () => {
      resolve(data.trim() || undefined);
    });

    socket.connect(port, host);
  });
}
