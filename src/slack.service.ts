import Axios from "axios";
import assert from "assert";
import { Inject, Injectable } from "@nestjs/common";
import type { SlackBlockDto } from "slack-block-builder";
import type { ChatPostMessageArguments, WebClient } from "@slack/web-api";

import { SLACK_MODULE_OPTIONS, SLACK_WEB_CLIENT } from "./constants";
import { Channels } from ".";
import type { SlackConfig } from "./types";

export type SlackMessageOptions<C = Channels> = ChatPostMessageArguments & { channel: C };

@Injectable()
export class SlackService<C = Channels> {
    constructor(
        @Inject(SLACK_MODULE_OPTIONS) private readonly options: SlackConfig,
        @Inject(SLACK_WEB_CLIENT) public readonly client: WebClient | null
    ) {}

    /**
     * @example
     * ```typescript
     * import { SlackService } from 'n-slack';
     *
     * export class WorldWideController {
     *  constructor(private readonly slack: SlackService){}
     *
     *  sendText(message: string) {
     *    this.slack.sendText(message);
     *  }
     * }
     * ```
     *
     * @param text simple text to send to Slack
     * @param opts SlackMessageOptions
     */
    sendText(text: SlackMessageOptions["text"], opts: SlackMessageOptions<C>): Promise<void> {
        return this.postMessage({ text, ...opts });
    }

    /**
     * Send Blocks (provided by Slack Block Builder)
     *
     * Makes it maintainable to send messages. To use this,
     * please make sure you've installed `slack-block-builder`.
     *
     * ```shell
     * yarn add slack-block-builder@^2
     * ```
     *
     * Read more: https://github.com/raycharius/slack-block-builder
     *
     * @example
     * ```typescript
     * import { SlackService } from 'n-slack';
     * import { BlockCollection, Blocks } from 'slack-block-builder';
     *
     * export class WorldWideController {
     *  constructor(private readonly slack: SlackService){}
     *
     *  sendMessage(message: string) {
     *    this.slack.sendBlocks(
     *      BlockCollection(
     *        Blocks.Section({ text: message }),
     *      ),
     *    );
     *  }
     * }
     * ```
     * @param blocks
     * @param opts
     */
    sendBlocks(blocks: SlackBlockDto[], opts: SlackMessageOptions<C>): Promise<void> {
        return this.postMessage({ blocks, ...opts });
    }

    /**
     * @example
     * ```typescript
     * import { SlackService } from 'n-slack';
     *
     * export class WorldWideController {
     *  constructor(private readonly slack: SlackService){}
     *
     *  sendMessage(message: string) {
     *    this.slack.postMessage({ text: message });
     *  }
     * }
     * ```
     * @param blocks
     * @param opts
     */
    async postMessage(req: SlackMessageOptions<C>): Promise<void> {
        const requestTypes = {
            api: () => this.runApiRequest(req),
            webhook: () => this.runWebhookRequest(req),
            stdout: () => this.runStdoutRequest(req),
        };

        assert(requestTypes[this.options.type], "expected option to exist");

        await requestTypes[this.options.type]();
    }

    private async runApiRequest(req: ChatPostMessageArguments) {
        assert(this.options.type === "api");
        assert(this.client, "expected this.client to be WebClient");

        const channel = req.channel ?? this.options.defaultChannel;
        assert(channel, "neither channel nor defaultChannel was applied");

        await this.client.chat.postMessage({ ...req, channel });
    }

    private async runWebhookRequest(req: SlackMessageOptions) {
        assert(this.options.type === "webhook", "expected type to be webhook");

        if ("channels" in this.options) {
            const { channel: userDefinedChannel = this.options.defaultChannel, ...slackRequest } = req;

            assert(userDefinedChannel, "neither channel nor defaultChannel was applied");

            const channel = this.options.channels.find((c) => c.name === userDefinedChannel);

            if (!channel) {
                throw new Error(
                    `The channel ${userDefinedChannel} does not exist. You must add this in the channels option.`
                );
            }

            await Axios.post(channel.url, slackRequest);
            return;
        }

        assert("url" in this.options, "expected url to be defined");

        await Axios.post(this.options.url, req);
    }

    private runStdoutRequest(req: SlackMessageOptions) {
        assert(this.options.type === "stdout");
        assert(this.options.output, "expected output to be defined");
        this.options.output(req);
    }
}
