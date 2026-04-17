# Google Ads CLI Contract: Brazilian Haven Beauty

**Tool**: `tools/google-ads-cli/`  
**Runtime**: Node.js 22, invoked from Claude Code via `Bash` tool  
**Auth**: OAuth2 refresh token + Developer token configured in `.env` (never committed)  
**API Version**: Google Ads API v18

---

## Configuration

```env
# tools/google-ads-cli/.env (not committed)
GOOGLE_ADS_CLIENT_ID=...
GOOGLE_ADS_CLIENT_SECRET=...
GOOGLE_ADS_REFRESH_TOKEN=...
GOOGLE_ADS_DEVELOPER_TOKEN=...
GOOGLE_ADS_CUSTOMER_ID=...    # Brazilian Haven Beauty's Google Ads customer ID
```

---

## CLI Commands

All commands are invoked as:
```bash
node tools/google-ads-cli/dist/index.js <command> [options]
```

---

### `list-campaigns`

List all campaigns in the configured account.

**Usage**:
```bash
node tools/google-ads-cli/dist/index.js list-campaigns [--status enabled|paused|all]
```

**Output** (tabular):
```
ID          | Name                          | Status  | Budget/day | Impressions (7d) | Clicks (7d) | Cost (7d) | Conv (7d) | CPA (7d)
------------|-------------------------------|---------|------------|------------------|-------------|-----------|-----------|----------
12345678    | Brazilian Wax - Local Search  | ENABLED | $25.00     | 4,820            | 312         | $87.50    | 18        | $4.86
87654321    | First Time Client Promo       | PAUSED  | $15.00     | 0                | 0           | $0.00     | 0         | —
```

**Exit codes**: 0 = success, 1 = auth error, 2 = API error

---

### `create-campaign`

Create a new campaign with ad group and keywords from a JSON config file or interactive prompts.

**Usage**:
```bash
node tools/google-ads-cli/dist/index.js create-campaign --config path/to/campaign.json
```

**Campaign JSON schema**:
```json
{
  "name": "Brazilian Wax - [City] - Search",
  "status": "PAUSED",
  "dailyBudgetUsd": 20.00,
  "biddingStrategy": "TARGET_CPA",
  "targetCpaUsd": 8.00,
  "targetLocation": {
    "city": "Miami",
    "radiusMiles": 15
  },
  "adGroup": {
    "name": "Brazilian Wax Keywords",
    "keywords": [
      { "text": "brazilian wax near me", "matchType": "PHRASE" },
      { "text": "waxing salon miami", "matchType": "BROAD" },
      { "text": "+brazilian +wax +miami", "matchType": "BROAD_MATCH_MODIFIER" }
    ],
    "ads": [
      {
        "type": "RESPONSIVE_SEARCH_AD",
        "finalUrl": "https://brazilianhaven.com/en/brazilian-wax",
        "headlines": [
          "Brazilian Wax in Miami",
          "Book Online Today",
          "Expert Waxing Specialists"
        ],
        "descriptions": [
          "Smooth, professional Brazilian wax by certified specialists. Book in seconds.",
          "First-time client discount available. See pricing by stylist."
        ]
      }
    ]
  }
}
```

**Output**:
```
Campaign created successfully.
Campaign ID: 12345678
Ad Group ID: 98765432
Status: PAUSED (activate with: resume-campaign 12345678)
```

---

### `pause-campaign`

**Usage**:
```bash
node tools/google-ads-cli/dist/index.js pause-campaign <campaignId>
```

**Output**:
```
Campaign 12345678 paused.
Previous status: ENABLED
New status: PAUSED
```

---

### `resume-campaign`

**Usage**:
```bash
node tools/google-ads-cli/dist/index.js resume-campaign <campaignId>
```

**Output**:
```
Campaign 12345678 enabled.
Status: ENABLED
```

---

### `edit-campaign`

Edit an existing campaign's budget, keywords, or ad copy.

**Usage**:
```bash
node tools/google-ads-cli/dist/index.js edit-campaign <campaignId> --budget 30.00
node tools/google-ads-cli/dist/index.js edit-campaign <campaignId> --patch path/to/patch.json
```

**Patch JSON** (all fields optional):
```json
{
  "dailyBudgetUsd": 30.00,
  "targetCpaUsd": 9.00,
  "adGroupId": "98765432",
  "addKeywords": [
    { "text": "wax near me", "matchType": "PHRASE" }
  ],
  "removeKeywords": ["broad_match_modifier_keyword_id"],
  "updateAd": {
    "adId": "11223344",
    "headlines": ["New Headline 1", "New Headline 2"],
    "descriptions": ["New description text."]
  }
}
```

---

### `report`

Pull campaign performance metrics.

**Usage**:
```bash
node tools/google-ads-cli/dist/index.js report <campaignId> --from 2026-04-01 --to 2026-04-17
node tools/google-ads-cli/dist/index.js report all --days 30
```

**Output**:
```
Report: Campaign 12345678 | 2026-04-01 → 2026-04-17

Metric            | Value
------------------|----------
Impressions       | 21,450
Clicks            | 1,287
CTR               | 6.0%
Cost              | $342.18
Conversions       | 74
Conversion Rate   | 5.75%
Cost per Conv.    | $4.62
Conv. Value       | $5,180.00
ROAS              | 15.1x
```

---

### `list-landing-pages`

List internal landing pages linked to ad campaigns (reads from `AdCampaignReference` table via API).

**Usage**:
```bash
node tools/google-ads-cli/dist/index.js list-landing-pages
```

---

### `sync`

Sync latest campaign metrics from Google Ads API into the platform database.

**Usage**:
```bash
node tools/google-ads-cli/dist/index.js sync
```

**Output**:
```
Synced 3 campaigns. Last synced: 2026-04-17T14:32:00Z
```

---

## Error Handling

| Error | Exit Code | Message |
|---|---|---|
| Auth failed (invalid token) | 1 | `ERROR: OAuth2 authentication failed. Run: node tools/google-ads-cli/dist/index.js auth` |
| Campaign not found | 2 | `ERROR: Campaign {id} not found in account {customerId}` |
| API rate limit | 2 | `ERROR: Google Ads API rate limit exceeded. Retry in {seconds}s` |
| Invalid JSON input | 3 | `ERROR: Invalid campaign config at line {N}: {message}` |
| Network error | 2 | `ERROR: Failed to reach Google Ads API. Check connectivity.` |
| Partial success | 0 | Logged as warnings; exit 0 if main operation succeeded |

---

## Security Notes

- `.env` file MUST be in `.gitignore` — never committed
- OAuth2 refresh token is long-lived; store securely (1Password / environment secrets)
- Developer token is tied to the Google Ads manager account; rotate annually
- CLI does NOT modify campaigns without explicit confirmation prompts in interactive mode (non-interactive mode via `--yes` flag for Claude Code automation)
