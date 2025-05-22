import { Test } from "@nestjs/testing";

import { SlackConfig } from "../src/types";
import { SlackModule } from "../src/slack.module";

export const createApp = (options?: Partial<SlackConfig>) => {
    return Test.createTestingModule({
        imports: [SlackModule.forRoot(options)],
    }).compile();
};
