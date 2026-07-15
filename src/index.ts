export type EvaluateResult = {
    flags: Record<string, unknown>;
    experiments: Record<
        string,
        {
            variant: string;
            name: string;
            value: unknown;
            session_replay: boolean;
            session_replay_mask_inputs: boolean;
        }
    >;
};

export type ABSurgeOptions = {
    publishableKey: string;
    baseUrl?: string;
    environment?: string;
};

export class ABSurge {
    private publishableKey: string;
    private baseUrl: string;
    private environment: string;

    constructor(options: ABSurgeOptions) {
        this.publishableKey = options.publishableKey;
        this.baseUrl = options.baseUrl ?? '/api/v1';
        this.environment = options.environment ?? 'production';
    }

    async evaluate(
        distinctId: string,
        attributes: Record<string, unknown> = {},
        flags?: string[],
        experiments?: string[],
    ): Promise<EvaluateResult> {
        const response = await fetch(`${this.baseUrl}/evaluate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-ABSurge-Key': this.publishableKey,
            },
            body: JSON.stringify({
                environment: this.environment,
                distinct_id: distinctId,
                attributes,
                flags,
                experiments,
            }),
        });

        if (!response.ok) {
            throw new Error(`ABSurge evaluate failed: ${response.status}`);
        }

        return response.json();
    }

    async isEnabled(
        flag: string,
        distinctId: string,
        attributes: Record<string, unknown> = {},
    ): Promise<boolean> {
        const result = await this.evaluate(distinctId, attributes, [flag]);

        return Boolean(result.flags[flag]);
    }

    async getExperiment(
        experiment: string,
        distinctId: string,
        attributes: Record<string, unknown> = {},
    ) {
        const result = await this.evaluate(
            distinctId,
            attributes,
            undefined,
            [experiment],
        );

        return result.experiments[experiment] ?? null;
    }

    async trackExposure(
        experiment: string,
        distinctId: string,
        attributes: Record<string, unknown> = {},
    ): Promise<boolean> {
        return this.trackEvent('events/exposure', {
            experiment,
            distinct_id: distinctId,
            attributes,
        });
    }

    async trackConversion(
        experiment: string,
        distinctId: string,
        event: string,
        value?: number,
        properties?: Record<string, unknown>,
    ): Promise<boolean> {
        return this.trackEvent('events/conversion', {
            experiment,
            distinct_id: distinctId,
            event,
            value,
            properties,
        });
    }

    async trackReplay(
        experiment: string,
        distinctId: string,
        events: unknown[],
        durationMs?: number,
        format: 'simple' | 'rrweb' = 'simple',
    ): Promise<boolean> {
        return this.trackEvent('events/replay', {
            experiment,
            distinct_id: distinctId,
            events,
            duration_ms: durationMs,
            format,
        });
    }

    private async trackEvent(
        path: string,
        payload: Record<string, unknown>,
    ): Promise<boolean> {
        const response = await fetch(`${this.baseUrl}/${path}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-ABSurge-Key': this.publishableKey,
            },
            body: JSON.stringify({
                environment: this.environment,
                ...payload,
            }),
        });

        if (!response.ok) {
            throw new Error(`ABSurge track failed: ${response.status}`);
        }

        const data = await response.json();

        return Boolean(data.tracked);
    }
}