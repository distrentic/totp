# totp

**zero dependency** time-based one-time password provider based on [`rfc6238`](https://tools.ietf.org/html/rfc6238).

## Installation

```sh
npm install @distrentic/totp
```

```sh
yarn add @distrentic/totp
```

## Usage

```typescript
import totp from "@distrenctic/totp";

const purpose = "EmailConfirmation";
const userId = "cknxpnrvf000001jp176m87ik";
const modifier = `TOTP:${purpose}:${userId}`;

const securityStamp = "soub@WOOL8pow-mol";
const token = Buffer.from(securityStamp, "utf-8");

const code = totp.generateCode(token, modifier);

console.log(code);
// => 112233

const isValid = totp.validateCode(code, token, modifier);

console.log(isValid);
// => true
```

## API

### Methods

- **generateCode**(< _Buffer_ > token[, < _string_ > modifier]) - (_number_) - Generates a new time-based one-time password. Default time-step is **3 minutes**.
  - **token** - _Buffer_ - a secure random token (e.g. user's security stamp)
  - **modifier** - _string_ - (optional) reason to create this one-time password

- **validateCode**(< _number_ > code, < _Buffer_ > token[, < _string_ > modifier]) - (_boolean_) - Validates the time-based one-time password. Allows a variance of no greater than 9 minutes in either direction.
  - **code** - _number_ - code to be validated
  - **token** - __Buffer__ - token that is used to create one-time password
  - **modifier** - _string_ - (optional) reason to create this one-time password

## License

Licensed under MIT license ([LICENSE](LICENSE) or <http://opensource.org/licenses/MIT>)
