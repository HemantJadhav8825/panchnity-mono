# Incident Response: Chat Service

## Emergency Procedures

### 1. Disable Typing Indicators

Use this when high socket event load is causing CPU spikes or network saturation.

**Command:**

```bash
curl -X PUT http://localhost:3200/api/v1/admin/feature-flags/ENABLE_TYPING_INDICATORS \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"enabled": false}'
```

**Impact:** Users will no longer see "User is typing..." animations. This reduces socket event traffic by approx 40% during active chats.

### 2. Disable Read Receipts

Use this when database write latency is high or `messages` collection is under locking pressure.

**Command:**

```bash
curl -X PUT http://localhost:3200/api/v1/admin/feature-flags/ENABLE_READ_RECEIPTS \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"enabled": false}'
```

**Impact:** Messages will stay in "sent" status. "Delivered" and "Read" statuses will not update. Significant reduction in database writes (approx 50% fewer writes per message lifecycle).

## Degradation Response

### High CPU Usage (>80%)

1. **Check concurrent connections:** If >5k per node, consider scaling horizontally.
2. **Disable Typing Indicators:** Immediate 10-20% CPU reduction.
3. **Review logs for error loops:** Check for repeated connection failures.

### High Memory Usage (>1GB)

1. **Check socket count:** Memory is linear with connection count.
2. **Restart Service:** If memory leak suspected (memory grows without connection growth).
   ```bash
   pm2 restart chat-service
   ```

### Database Slowdown

1. **Disable Read Receipts:** Reduces write pressure.
2. **Check Slow Queries:**
   ```javascript
   db.system.profile.find({ millis: { $gt: 100 } }).sort({ millis: -1 });
   ```
3. **Verify Indexes:** Ensure recent deployments index existence (see `scripts/verify-indexes.js`).

## Escalation Paths

| Severity | Condition                        | Action                                             |
| -------- | -------------------------------- | -------------------------------------------------- |
| **L1**   | Feature latency > 1s, <5% Errors | Disable risky features (Typing, Receipts)          |
| **L2**   | Service Unstable, >5% Errors     | Restart instances, Scale up +2 nodes               |
| **L3**   | Total Outage                     | Enable "Maintenance Mode", rollback recent changes |

## Maintenance

### Routine Checks

- Run `scripts/verify-indexes.js` after every DB migration.
- Monitor `socket_connections_total` metric.
