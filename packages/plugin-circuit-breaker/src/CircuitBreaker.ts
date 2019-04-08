const enum CircuitBreakerState {
    Closed,
    Open,
    HalfOpen,
}

export interface CircuitBreakerOptions {
    failureTimeout: number;
    failureThreshold: number;
    minimumFailureCount: number;
    openTimeout: number;
    halfOpenThreshold: number;
}

export class CircuitBreaker {
    // create options
    private readonly failureTimeout: number;
    private readonly failureThreshold: number;
    private readonly minimumFailureCount: number;
    private readonly openTimeout: number;
    private readonly halfOpenThreshold: number;

    // current state
    private state: CircuitBreakerState;

    // for closed state
    private intervalStart?: number;
    private runningCount: number;
    private failureCount: number;

    // for open state
    private lastError?: any;
    private lastErrorTime?: number;

    // for half-open state
    private halfOpenCount?: number;
    private halfOpenRunning?: number;
    private halfOpenSuccessed?: number;

    constructor({
        failureTimeout,
        failureThreshold,
        openTimeout,
        halfOpenThreshold,
        minimumFailureCount,
    }: CircuitBreakerOptions) {
        this.state = CircuitBreakerState.Closed;

        this.failureTimeout = failureTimeout;
        this.failureThreshold = failureThreshold;
        this.openTimeout = openTimeout;
        this.halfOpenThreshold = halfOpenThreshold;
        this.minimumFailureCount = minimumFailureCount;

        this.runningCount = 0;
        this.failureCount = 0;
        this.intervalStart = Date.now();
    }

    isClosed() {
        return this.state === CircuitBreakerState.Closed;
    }

    isOpen() {
        return this.state === CircuitBreakerState.Open;
    }

    isHalfOpen() {
        return this.state === CircuitBreakerState.HalfOpen;
    }

    getError() {
        return this.lastError;
    }

    shouldThrow() {
        if (this.isOpen()) {
            if (Date.now() - this.lastErrorTime > this.openTimeout) {
                this.halfOpen();

                return false;
            }

            return true;
        }

        if (this.isHalfOpen()) {
            if (this.halfOpenRunning < this.halfOpenCount) {
                this.halfOpenRunning++;

                return false;
            }

            return true;
        }

        this.checkInterval();
        this.runningCount++;

        return false;
    }

    success() {
        if (this.isHalfOpen()) {
            this.halfOpenSuccessed++;

            if (this.halfOpenSuccessed >= this.halfOpenCount) {
                this.close();
            }
        }
    }

    failure(error) {
        if (this.isHalfOpen()) {
            this.open(error);

            return;
        }

        if (this.isClosed()) {
            this.checkInterval();
            this.failureCount++;

            if (
                this.failureCount > this.minimumFailureCount &&
                (this.failureCount * 100) / this.runningCount > this.failureThreshold
            ) {
                this.open(error);
            }
        }
    }

    private checkInterval() {
        const now = Date.now();

        if (now - this.intervalStart > this.failureTimeout) {
            this.intervalStart = now;
            this.failureCount = 0;
            this.runningCount = 0;
        }
    }

    private open(lastError) {
        this.lastError = lastError;
        this.lastErrorTime = Date.now();
        this.state = CircuitBreakerState.Open;
    }

    private halfOpen() {
        this.state = CircuitBreakerState.HalfOpen;
        this.halfOpenCount = (this.runningCount * this.halfOpenThreshold) / 100;
        this.halfOpenRunning = 1;
        this.halfOpenSuccessed = 0;
    }

    private close() {
        this.state = CircuitBreakerState.Closed;
        this.lastError = null;
        this.lastErrorTime = null;
        this.runningCount = 0;
        this.failureCount = 0;
    }
}
