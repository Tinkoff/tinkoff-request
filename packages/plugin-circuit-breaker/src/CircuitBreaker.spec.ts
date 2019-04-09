import each from '@tinkoff/utils/array/each';
import { CircuitBreaker } from './CircuitBreaker';

describe('Circuit Breaker class', () => {
    let circuitBreaker: CircuitBreaker;
    let currentTime = 1487077708000;
    let mockDate;

    const runActions = (n: number, fail = false) => {
        each((v, i) => {
            circuitBreaker.shouldThrow();
            if (fail) {
                circuitBreaker.failure(new Error(`error ${i}`));
            } else {
                circuitBreaker.success();
            }
        }, Array(n));
    };

    beforeAll(() => {
        mockDate = jest.spyOn(Date, 'now').mockImplementation(() => currentTime);
    });

    afterAll(() => {
        mockDate.mockRestore();
    });

    beforeEach(() => {
        circuitBreaker = new CircuitBreaker({
            failureTimeout: 25,
            failureThreshold: 50,
            openTimeout: 2000,
            halfOpenThreshold: 10,
            minimumFailureCount: 4,
        });
    });

    it('should not throw after first `failureThreshold` percent of errors', () => {
        expect(circuitBreaker.isClosed()).toBe(true);
        expect(circuitBreaker.shouldThrow()).toBe(false);

        runActions(5);
        runActions(5, true);

        expect(circuitBreaker.shouldThrow()).toBe(false);
        expect(circuitBreaker.getError()).toBeUndefined();

        runActions(3, true);
        expect(circuitBreaker.shouldThrow()).toBe(true);
        expect(circuitBreaker.getError()).toEqual(new Error('error 2'));
        expect(circuitBreaker.isOpen()).toBe(true);
    });

    it('should not throw when number of failures is less than `minimumFailureCount` in `failureTimeout` period', () => {
        expect(circuitBreaker.shouldThrow()).toBe(false);

        runActions(4, true);
        expect(circuitBreaker.shouldThrow()).toBe(false);

        currentTime += 30;
        runActions(3, true);
        expect(circuitBreaker.shouldThrow()).toBe(false);

        currentTime += 26;
        runActions(4, true);
        expect(circuitBreaker.shouldThrow()).toBe(false);

        currentTime += 5;
        runActions(1, true);
        expect(circuitBreaker.shouldThrow()).toBe(true);
    });

    it('should change state to half-open after `openTimeout`', () => {
        runActions(10, true);

        expect(circuitBreaker.shouldThrow()).toBe(true);
        currentTime += 2500;

        expect(circuitBreaker.shouldThrow()).toBe(false);
        expect(circuitBreaker.isHalfOpen()).toBe(true);
    });

    it('should allow to execute no more than `halfOpenThreshold` actions if in half-open state', () => {
        runActions(20);
        runActions(21, true);
        expect(circuitBreaker.shouldThrow()).toBe(true);

        currentTime += 2500;

        expect(circuitBreaker.shouldThrow()).toBe(false);
        expect(circuitBreaker.shouldThrow()).toBe(false);
        expect(circuitBreaker.shouldThrow()).toBe(false);
        expect(circuitBreaker.shouldThrow()).toBe(false);
        expect(circuitBreaker.shouldThrow()).toBe(false);
        expect(circuitBreaker.shouldThrow()).toBe(true);
    });

    it('should return to closed state when actions are success', () => {
        runActions(10, true);
        currentTime += 2500;

        expect(circuitBreaker.shouldThrow()).toBe(false);
        expect(circuitBreaker.isHalfOpen()).toBe(true);

        runActions(2);

        expect(circuitBreaker.isClosed()).toBe(true);
        expect(circuitBreaker.shouldThrow()).toBe(false);
    });

    it('should return to open state if any action is failed while in half-open state', () => {
        const error = new Error('test');

        runActions(50);
        runActions(60, true);
        currentTime += 2500;

        circuitBreaker.shouldThrow();
        circuitBreaker.shouldThrow();

        circuitBreaker.success();
        circuitBreaker.failure(error);

        expect(circuitBreaker.isOpen()).toBe(true);
        expect(circuitBreaker.shouldThrow()).toBe(true);
        expect(circuitBreaker.getError()).toBe(error);
    });
});
