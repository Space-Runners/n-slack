import assert from "assert";
import { DynamicModule, Module, Provider } from "@nestjs/common";
import { SLACK_MODULE_OPTIONS, SLACK_MODULE_USER_OPTIONS, SLACK_WEB_CLIENT } from "./constants";
import { SlackService } from "./slack.service";
import { SlackAsyncConfig, SlackConfig, SlackConfigFactory, SlackSyncConfig } from "./types";

@Module({
    providers: [SlackService],
    exports: [SlackService],
})
export class SlackModule {
    static forRoot(opts: Partial<SlackSyncConfig> = {}): DynamicModule {
        const providers = [
            { provide: SLACK_MODULE_USER_OPTIONS, useValue: opts },
            this.createAsyncConfig(),
            this.createAsyncWebClient(),
        ];
        return {
            global: opts.isGlobal,
            module: SlackModule,
            providers,
            exports: providers,
        };
    }

    static forRootAsync(opts: SlackAsyncConfig): DynamicModule {
        const providers = [
            this.createAsyncOptionsProvider(opts),
            this.createAsyncConfig(),
            this.createAsyncWebClient(),
        ];
        return {
            global: opts.isGlobal,
            module: SlackModule,
            imports: opts.imports,
            providers,
            exports: providers,
        };
    }

    private static createAsyncOptionsProvider(opts: SlackAsyncConfig): Provider {
        if (opts.useFactory) {
            return {
                provide: SLACK_MODULE_USER_OPTIONS,
                useFactory: opts.useFactory,
                inject: opts.inject ?? [],
            };
        }
        assert(opts.useClass);
        return {
            provide: SLACK_MODULE_USER_OPTIONS,
            useFactory: async (optionsFactory: SlackConfigFactory): Promise<SlackConfig> =>
                optionsFactory.slackConfigModuleOptions(),
            inject: [opts.useClass],
        };
    }

    private static createAsyncConfig(): Provider {
        return {
            provide: SLACK_MODULE_OPTIONS,
            inject: [SLACK_MODULE_USER_OPTIONS],
            useFactory: (opts: SlackConfig) => ({
                output: (out: unknown) => process.stdout.write(`${JSON.stringify(out)}\n`),
                ...opts,
            }),
        };
    }

    private static createAsyncWebClient(): Provider {
        return {
            provide: SLACK_WEB_CLIENT,
            inject: [SLACK_MODULE_OPTIONS],
            useFactory: async (opts: SlackConfig) => {
                if (opts.type !== "api") {
                    return {
                        provide: SLACK_WEB_CLIENT,
                        useValue: null,
                    };
                }

                const { WebClient } = await import("@slack/web-api");
                return new WebClient(opts.token, opts.clientOptions);
            },
        };
    }
}
