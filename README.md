# @absurge/sdk

JavaScript SDK for [ABsurge](https://absurge.com) — feature flags and A/B testing.

## Install

```bash
npm install @absurge/sdk
# or
pnpm add @absurge/sdk
```

## Usage

```ts
import { ABsurge } from '@absurge/sdk';

const absurge = new ABsurge({
  publishableKey: 'pk_...',
  baseUrl: 'https://your-app.example/api/v1', // optional, default: '/api/v1'
  environment: 'production', // optional
});

// Evaluate flags and experiments for a user
const result = await absurge.evaluate('user-123', { plan: 'pro' });

// Check a single flag
const enabled = await absurge.isEnabled('new-checkout', 'user-123');

// Get experiment assignment
const experiment = await absurge.getExperiment('pricing-test', 'user-123');

// Track events
await absurge.trackExposure('pricing-test', 'user-123');
await absurge.trackConversion('pricing-test', 'user-123', 'purchase', 49.0);
```

## API

| Method | Description |
|--------|-------------|
| `evaluate(distinctId, attributes?, flags?, experiments?)` | Batch evaluate flags and experiments |
| `isEnabled(flag, distinctId, attributes?)` | Boolean flag check |
| `getExperiment(experiment, distinctId, attributes?)` | Experiment variant assignment |
| `trackExposure(experiment, distinctId, attributes?)` | Record experiment exposure |
| `trackConversion(experiment, distinctId, event, value?, properties?)` | Record conversion |
| `trackReplay(experiment, distinctId, events, durationMs?, format?)` | Upload session replay events |

Authenticate with your environment publishable key via the `X-ABsurge-Key` header (set automatically).

## License

MIT
