# Server Infrastructure: hemant

## Network Ports

### ⚠️ Security Warnings

- **MongoDB (27017)** is listening on a public IP (`72.62.196.46`). This is a high security risk if not firewalled.
- **Port 7000** is listening on `0.0.0.0` (all interfaces).

### Active Ports

| Port      | Protocol | Service       | PID/Process         | Listening Address           |
| --------- | -------- | ------------- | ------------------- | --------------------------- |
| **22**    | TCP      | SSH           | 1/systemd           | `0.0.0.0`, `::`             |
| **53**    | TCP/UDP  | DNS           | systemd-resolved    | `127.0.0.53`, `127.0.0.54`  |
| **80**    | TCP      | HTTP (Nginx)  | 263315/nginx        | `0.0.0.0`, `::`             |
| **443**   | TCP      | HTTPS (Nginx) | 263315/nginx        | `0.0.0.0`                   |
| **3003**  | TCP6     | Node.js       | 276687/next-server  | `::`                        |
| **5005**  | TCP6     | Node.js       | 275393/node         | `::`                        |
| **5173**  | TCP6     | Node.js       | 276679/next-server  | `::`                        |
| **5174**  | TCP6     | Node.js       | 277210/next-server  | `::`                        |
| **6379**  | TCP      | Redis         | 263291/redis-server | `127.0.0.1`, `::1`          |
| **7000**  | TCP      | PM2 App       | 187620/PM2          | `0.0.0.0`                   |
| **27017** | TCP      | MongoDB       | 263327/mongod       | `72.62.196.46`, `127.0.0.1` |

_Generated on: 2026-02-03_
