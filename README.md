<p align="center">
    <h3 align="center">N-slack</h3>
</p>

<p align="center">
    A lightweight library for integrating Slack with your NestJS applications.
    <br />
</p>

---

**N-slack** enables you to send Slack messages from your [NestJS] projects.

[nestjs]: https://github.com/nestjs/nest

### ⚡ Features

-   Send messages via Slack Web API
-   Webhook support

### 🚀 Quick Start

```shell
npm install n-slack
```

#### Basic Setup

```typescript
import { Module } from "@nestjs/common";
import { SlackModule } from "n-slack";

@Module({
    imports: [
        SlackModule.forRoot({
            type: "api",
            token: "<insert-token-here>",
        }),
    ],
})
export class AppModule {}
```

#### Webhook Example

```typescript
SlackModule.forRoot({
    type: "webhook",
    url: "<your-webhook-url>",
});
```

#### Multiple Webhooks

```typescript
SlackModule.forRoot({
    type: "webhook",
    channels: [
        { name: "dev", url: "<webhook-url-1>" },
        { name: "customers", url: "<webhook-url-2>" },
    ],
});
```

#### TypeScript Channel Assertions

```typescript
declare module "n-slack" {
    type Channels = "dev" | "customers";
}
```

### 📝 Usage Example

Inject `SlackService` into your services or controllers:

```typescript
import { Injectable } from "@nestjs/common";
import { SlackService } from "n-slack";

@Injectable()
export class AuthService {
    constructor(private service: SlackService) {}

    helloWorldMethod() {
        this.service.sendText("Hello world was sent!");
        return "hello world";
    }
}
```

You can also access the underlying Slack `WebClient`:

```typescript
import { Injectable } from "@nestjs/common";
import { SlackService } from "n-slack";

@Injectable()
export class AuthService {
    constructor(private service: SlackService) {}

    async findUserByEmail(email: string) {
        return await this.service.client.users.lookupByEmail(email);
    }
}
```

### 🟢 Acknowledgements

This project is inspired by and based on [bjerkio/nestjs-slack](https://github.com/bjerkio/nestjs-slack).

### 📄 License

Distributed under the [Apache License 2.0](LICENSE), following the original package's terms.
