import { describe, beforeEach, it, expect, vi } from "vitest";

import { createApp } from "./utils";
import { SlackService } from "../src/slack.service";

describe("api", () => {
    let service: SlackService;
    let spy;

    beforeEach(async () => {
        const app = await createApp({
            type: "api",
            defaultChannel: "my-channel",
            token: "my-token",
        });
        service = app.get<SlackService>(SlackService);

        spy = vi.spyOn(service, "postMessage");
        spy.mockResolvedValue();
    });

    it("must send requests to API", async () => {
        await service.postMessage({ text: "hello-world", channel: "test" });
        expect(spy).toHaveBeenCalledWith({ text: "hello-world", channel: "test" });
    });
});
