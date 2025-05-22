import { describe, beforeEach, it, expect, vi } from "vitest";

import { SlackService } from "../src/slack.service";
import { createApp } from "./utils";

describe("stdout", () => {
    let service: SlackService;
    let output: (out: unknown) => void;

    beforeEach(async () => {
        output = vi.fn();
        const app = await createApp({ type: "stdout", output });
        service = app.get<SlackService>(SlackService);
    });

    it("must output requests to stdout", async () => {
        const request = {
            text: "hello-world",
            channel: "hello-world",
        };
        await service.postMessage(request);
        expect(output).toHaveBeenCalledWith(request);
    });
});
