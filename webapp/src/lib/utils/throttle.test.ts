import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { throttle } from "./throttle";

describe("throttle utility", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should call function immediately on first invocation", () => {
        const mockFn = vi.fn();
        const throttled = throttle(mockFn, 100);

        throttled();

        expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it("should not call function again within delay period", () => {
        const mockFn = vi.fn();
        const throttled = throttle(mockFn, 100);

        throttled();
        throttled();
        throttled();

        expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it("should call function again after delay period", () => {
        const mockFn = vi.fn();
        const throttled = throttle(mockFn, 100);

        throttled();
        expect(mockFn).toHaveBeenCalledTimes(1);

        vi.advanceTimersByTime(100);
        throttled();
        expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it("should pass arguments to the throttled function", () => {
        const mockFn = vi.fn();
        const throttled = throttle(mockFn, 100);

        throttled("arg1", "arg2", 123);

        expect(mockFn).toHaveBeenCalledWith("arg1", "arg2", 123);
    });

    it("should preserve this context", () => {
        const obj = {
            value: 42,
            method: vi.fn(function(this: { value: number }) {
                return this.value;
            }),
        };

        const throttled = throttle(obj.method, 100);
        throttled.call(obj);

        expect(obj.method).toHaveBeenCalled();
    });

    it("should schedule a delayed call when invoked during throttle period", () => {
        const mockFn = vi.fn();
        const throttled = throttle(mockFn, 100);

        throttled(); // Immediate call
        expect(mockFn).toHaveBeenCalledTimes(1);

        throttled(); // During throttle, should schedule
        expect(mockFn).toHaveBeenCalledTimes(1);

        vi.advanceTimersByTime(100); // Complete scheduled call
        expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it("should use latest arguments for scheduled call", () => {
        const mockFn = vi.fn();
        const throttled = throttle(mockFn, 100);

        throttled("first");
        throttled("second");
        throttled("third");

        expect(mockFn).toHaveBeenCalledWith("first");
        expect(mockFn).toHaveBeenCalledTimes(1);

        vi.advanceTimersByTime(100);
        expect(mockFn).toHaveBeenCalledWith("third");
        expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it("should handle multiple throttle periods correctly", () => {
        const mockFn = vi.fn();
        const throttled = throttle(mockFn, 100);

        throttled(); // t=0, immediate
        expect(mockFn).toHaveBeenCalledTimes(1);

        vi.advanceTimersByTime(50);
        throttled(); // t=50, scheduled for t=100
        expect(mockFn).toHaveBeenCalledTimes(1);

        vi.advanceTimersByTime(50); // t=100, execute scheduled
        expect(mockFn).toHaveBeenCalledTimes(2);

        vi.advanceTimersByTime(50);
        throttled(); // t=150, scheduled for t=200
        expect(mockFn).toHaveBeenCalledTimes(2);

        vi.advanceTimersByTime(50); // t=200, execute scheduled
        expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it("should work with different delay values", () => {
        const mockFn = vi.fn();
        const throttled = throttle(mockFn, 500);

        throttled();
        expect(mockFn).toHaveBeenCalledTimes(1);

        vi.advanceTimersByTime(400);
        throttled();
        expect(mockFn).toHaveBeenCalledTimes(1);

        vi.advanceTimersByTime(100); // Total 500ms
        expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it("should handle rapid successive calls correctly", () => {
        const mockFn = vi.fn();
        const throttled = throttle(mockFn, 100);

        // Rapid calls
        for (let i = 0; i < 10; i++) {
            throttled(i);
        }

        // Only first call should execute immediately
        expect(mockFn).toHaveBeenCalledTimes(1);
        expect(mockFn).toHaveBeenCalledWith(0);

        // After delay, last call should execute
        vi.advanceTimersByTime(100);
        expect(mockFn).toHaveBeenCalledTimes(2);
        expect(mockFn).toHaveBeenCalledWith(9);
    });
});
