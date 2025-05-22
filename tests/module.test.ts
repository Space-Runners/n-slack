import nock from "nock";
import { describe, it } from "vitest";
import { Test } from "@nestjs/testing";
import { Injectable, Module } from "@nestjs/common";

import { SlackConfig } from "../src/types";
import { SlackModule } from "../src/slack.module";
import { SlackService } from "../src/slack.service";

describe("slack.module", () => {
    const baseUrl = "http://example.com";

    it("should construct with useFactory", async () => {
        const app = await Test.createTestingModule({
            imports: [
                SlackModule.forRootAsync({
                    useFactory: () => {
                        return {
                            type: "webhook",
                            url: `${baseUrl}/webhook`,
                        };
                    },
                }),
            ],
        }).compile();
        const service = app.get<SlackService>(SlackService);

        const scope = nock(baseUrl, { encodedQueryParams: true })
            .post("/webhook", {
                text: "hello-world",
            })
            .reply(200, "ok");

        await service.postMessage({ text: "hello-world" });

        scope.done();
    });

    it("should construct with useClass", async () => {
        @Injectable()
        class ConfigClass {
            slackConfigModuleOptions(): SlackConfig {
                return {
                    type: "webhook",
                    url: `${baseUrl}/webhook`,
                };
            }
        }

        @Module({
            exports: [ConfigClass],
            providers: [ConfigClass],
        })
        class TestModule {}

        const app = await Test.createTestingModule({
            imports: [
                SlackModule.forRootAsync({
                    imports: [TestModule],
                    useClass: ConfigClass,
                }),
            ],
        }).compile();
        const service = app.get<SlackService>(SlackService);

        const scope = nock(baseUrl, { encodedQueryParams: true })
            .post("/webhook", {
                text: "hello-world",
            })
            .reply(200, "ok");

        await service.postMessage({ text: "hello-world" });

        scope.done();
    });
});
