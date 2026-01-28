# Epitest Platform Documentation

Complete technical documentation for `myresults.epitest.eu` - the Epitech automated test results platform.

## Table of Contents

1. [Overview](#overview)
2. [Authentication Flow](#authentication-flow)
3. [Session Management](#session-management)
4. [API Reference](#api-reference)
5. [Response Schema](#response-schema)
6. [Data Examples](#data-examples)
7. [Frontend Implementation Guide](#frontend-implementation-guide)

---

## Overview

Epitest is Epitech's automated testing platform that runs test suites against student project submissions and displays results.

### URLs

| Service  | URL                                 | Purpose                          |
| -------- | ----------------------------------- | -------------------------------- |
| Frontend | `https://myresults.epitest.eu`      | Student-facing results dashboard |
| API      | `https://api.epitest.eu`            | REST API for test results        |
| Auth     | `https://login.microsoftonline.com` | Microsoft Azure AD SSO           |

### Architecture

```
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│                     │     │                     │     │                     │
│  myresults.epitest  │────▶│  login.microsoft    │────▶│   api.epitest.eu    │
│        .eu          │     │    online.com       │     │                     │
│                     │◀────│                     │     │                     │
│   (Frontend SPA)    │     │   (Azure AD SSO)    │     │    (REST API)       │
│                     │────────────────────────────────▶│                     │
└─────────────────────┘           JWT Token             └─────────────────────┘
```

---

## Authentication Flow

Epitest uses Microsoft Azure AD Single Sign-On (SSO) for authentication. Students log in with their `@epitech.eu` Microsoft account.

### Step-by-Step Login Process

#### 1. Initial Page Load

- User navigates to `https://myresults.epitest.eu`
- If no valid session exists, a "LOG IN" button is displayed
- User clicks "LOG IN" to initiate authentication

#### 2. Microsoft SSO Redirect

- Browser redirects to `https://login.microsoftonline.com/**`
- Microsoft login page loads

#### 3. Email Entry

- **Selector**: `input[type="email"]`
- User enters their Epitech email (e.g., `prenom.nom@epitech.eu`)
- **Submit button**: `input[type="submit"]`

#### 4. Password Entry

- **Selector**: `input[type="password"]` (wait for `visible` state)
- User enters their password
- **Submit button**: `input[type="submit"]`
- **Error selector**: `#passwordError` (displays if credentials are invalid)

#### 5. Multi-Factor Authentication (if required)

When the session has expired or it's a new device, MFA is required:

- **MFA code display**: `#idRichContext_DisplaySign`
  - Shows a 2-digit number (e.g., "42")
  - User must approve this number in the Microsoft Authenticator app
- **Timeout**: Up to 2 minutes to approve

#### 6. Stay Signed In

- **Selector**: `#idSIButton9` ("Yes" button)
- User clicks to persist the session

#### 7. Redirect Back

- Browser redirects back to `https://myresults.epitest.eu`
- JWT token is stored in localStorage
- Frontend fetches results from API

### DOM Selectors Reference

| Element        | Selector                     | Notes                            |
| -------------- | ---------------------------- | -------------------------------- |
| Email input    | `input[type="email"]`        | Microsoft login page             |
| Password input | `input[type="password"]`     | Wait for `visible` state         |
| Submit button  | `input[type="submit"]`       | Used for both email and password |
| Password error | `#passwordError`             | Indicates invalid credentials    |
| MFA code       | `#idRichContext_DisplaySign` | 2-digit approval code            |
| Stay signed in | `#idSIButton9`               | "Yes" button                     |
| Login button   | `:text("LOG IN")`            | On Epitest main page             |

---

## Session Management

The authenticated session consists of two components: Microsoft SSO cookies and an OIDC JWT token.

### Cookies (Microsoft SSO)

These cookies maintain the SSO session with Microsoft:

| Cookie               | Domain                       | Purpose                   | Expiration |
| -------------------- | ---------------------------- | ------------------------- | ---------- |
| `ESTSAUTHPERSISTENT` | `.login.microsoftonline.com` | Long-lived auth token     | ~90 days   |
| `ESTSAUTH`           | `.login.microsoftonline.com` | Session auth token        | Session    |
| `esctx-*`            | `.login.microsoftonline.com` | Context tokens (multiple) | Varies     |
| `SignInStateCookie`  | `.login.microsoftonline.com` | Sign-in state             | Session    |
| `CCState`            | `.login.microsoftonline.com` | Credential cache          | ~10 days   |
| `buid`               | `login.microsoftonline.com`  | Browser unique ID         | ~30 days   |
| `fpc`                | `login.microsoftonline.com`  | First-party cookie        | ~30 days   |
| `AADSSO`             | `.login.microsoftonline.com` | SSO state indicator       | Session    |

### localStorage (API Authorization)

The JWT token for API authorization is stored in localStorage:

```javascript
// Origin: https://myresults.epitest.eu
localStorage.getItem("argos-api.oidc-token");
// Returns: "eyJ0eXAiOiJKV1QiLCJhbGciOiJS..."
```

### JWT Token Structure

The token is a standard Azure AD JWT with the following claims:

```json
{
  "header": {
    "typ": "JWT",
    "alg": "RS256",
    "kid": "PcX98GX420T1X6sBDkzhQmqgwMU"
  },
  "payload": {
    "aud": "c3728513-e7f6-497b-b319-619aa86f5b50",
    "iss": "https://sts.windows.net/901cb4ca-b862-4029-9306-e5cd0f6d9f86/",
    "iat": 1769169916,
    "nbf": 1769169916,
    "exp": 1769173816,
    "amr": ["pwd", "mfa"],
    "family_name": "Millien",
    "given_name": "Maty",
    "name": "Maty Millien",
    "oid": "61dfa761-1254-4baa-ace7-9d98e51b45ac",
    "upn": "maty.millien@epitech.eu",
    "unique_name": "maty.millien@epitech.eu",
    "tid": "901cb4ca-b862-4029-9306-e5cd0f6d9f86",
    "ver": "1.0"
  }
}
```

#### Key Claims

| Claim  | Description                 | Example                                |
| ------ | --------------------------- | -------------------------------------- |
| `aud`  | Audience (Epitest App ID)   | `c3728513-e7f6-497b-b319-619aa86f5b50` |
| `iss`  | Issuer (Azure AD tenant)    | `https://sts.windows.net/{tenant-id}/` |
| `upn`  | User Principal Name (email) | `maty.millien@epitech.eu`              |
| `name` | Display name                | `Maty Millien`                         |
| `amr`  | Authentication methods      | `["pwd", "mfa"]`                       |
| `exp`  | Expiration timestamp        | Unix timestamp                         |
| `iat`  | Issued at timestamp         | Unix timestamp                         |
| `tid`  | Tenant ID                   | `901cb4ca-b862-4029-9306-e5cd0f6d9f86` |

### Session Expiration

- **JWT Token**: Valid for approximately 1 hour (`exp - iat ≈ 3900 seconds`)
- **SSO Session**: Valid for approximately 90 days (controlled by `ESTSAUTHPERSISTENT`)
- **Token Refresh**: Frontend should handle token refresh before expiration

---

## API Reference

### Get User Results

Retrieves all test results for the authenticated user.

```
GET https://api.epitest.eu/me/2025
```

#### Headers

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

The JWT token is retrieved from localStorage (`argos-api.oidc-token`).

#### Response

```http
HTTP/1.1 200 OK
Content-Type: application/json

[
  {
    "project": { ... },
    "results": { ... },
    "date": "2026-01-23T12:07:44Z"
  },
  ...
]
```

#### URL Structure

The endpoint includes a year parameter:

- `2025` refers to the academic year (2025-2026)
- This may change each academic year

---

## Response Schema

### Field Descriptions

#### EpitestResult

| Field     | Type          | Description                       |
| --------- | ------------- | --------------------------------- |
| `project` | `Project`     | Project/assignment metadata       |
| `results` | `TestResults` | Test execution results            |
| `date`    | `string`      | Test run timestamp (ISO 8601 UTC) |

#### Project

| Field         | Type     | Description                   | Example                      |
| ------------- | -------- | ----------------------------- | ---------------------------- |
| `slug`        | `string` | Unique project identifier     | `"PDGD01"`, `"PDGRUSH2"`     |
| `name`        | `string` | Human-readable name           | `"Day 01"`, `"Rush 2"`       |
| `module.code` | `string` | Module code                   | `"G-PDG-300"`, `"G-PRO-300"` |
| `skills`      | `[]`     | Reserved field (always empty) | `[]`                         |

#### TestResults

| Field             | Type                         | Description                               |
| ----------------- | ---------------------------- | ----------------------------------------- |
| `testRunId`       | `number`                     | Unique identifier for this test execution |
| `logins`          | `string[]`                   | Email(s) of students who submitted        |
| `prerequisites`   | `number`                     | Number of prerequisite checks             |
| `externalItems`   | `ExternalItem[]`             | Linting and coverage metrics              |
| `mandatoryFailed` | `number`                     | Count of failed mandatory tests           |
| `skills`          | `Record<string, SkillStats>` | Test results per category                 |

#### ExternalItem Types

| Type                | Description                      |
| ------------------- | -------------------------------- |
| `lint.note`         | Informational linting notes      |
| `lint.info`         | General linting information      |
| `lint.minor`        | Minor style issues               |
| `lint.major`        | Major code quality issues        |
| `lint.fatal`        | Critical linting violations      |
| `coverage.lines`    | Line coverage percentage/count   |
| `coverage.branches` | Branch coverage percentage/count |

#### SkillStats

| Field             | Type     | Description                       |
| ----------------- | -------- | --------------------------------- |
| `count`           | `number` | Total test cases in this category |
| `passed`          | `number` | Number of passing tests           |
| `crashed`         | `number` | Number of crashed tests           |
| `mandatoryFailed` | `number` | Failed mandatory tests            |

---

## Data Examples

### Single Student Project

```json
{
  "project": {
    "slug": "PDGD01",
    "name": "Day 01",
    "module": {
      "code": "G-PDG-300"
    },
    "skills": []
  },
  "results": {
    "testRunId": 7491121,
    "logins": ["maty.millien@epitech.eu"],
    "prerequisites": 2,
    "externalItems": [
      { "type": "lint.note", "value": 0 },
      { "type": "lint.fatal", "value": 0 },
      { "type": "lint.major", "value": 0 },
      { "type": "lint.minor", "value": 0 },
      { "type": "lint.info", "value": 0 },
      { "type": "coverage.branches", "value": 0 },
      { "type": "coverage.lines", "value": 0 }
    ],
    "mandatoryFailed": 0,
    "skills": {
      "01 - ex00": {
        "count": 1,
        "passed": 1,
        "crashed": 0,
        "mandatoryFailed": 0
      },
      "02 - ex01": {
        "count": 1,
        "passed": 1,
        "crashed": 0,
        "mandatoryFailed": 0
      },
      "03 - ex02": {
        "count": 1,
        "passed": 1,
        "crashed": 0,
        "mandatoryFailed": 0
      },
      "04 - ex03": {
        "count": 1,
        "passed": 1,
        "crashed": 0,
        "mandatoryFailed": 0
      }
    }
  },
  "date": "2026-01-08T22:47:31Z"
}
```

### Team Project (Multiple Logins)

```json
{
  "project": {
    "slug": "PDGRUSH2",
    "name": "Rush 2",
    "module": {
      "code": "G-PDG-300"
    },
    "skills": []
  },
  "results": {
    "testRunId": 7501573,
    "logins": ["gabriel.brument@epitech.eu", "maty.millien@epitech.eu"],
    "prerequisites": 2,
    "externalItems": [
      { "type": "lint.note", "value": 0 },
      { "type": "lint.fatal", "value": 0 },
      { "type": "lint.major", "value": 0 },
      { "type": "lint.minor", "value": 0 },
      { "type": "lint.info", "value": 0 },
      { "type": "coverage.branches", "value": 0 },
      { "type": "coverage.lines", "value": 0 }
    ],
    "mandatoryFailed": 0,
    "skills": {
      "01 Basics": {
        "count": 2,
        "passed": 2,
        "crashed": 0,
        "mandatoryFailed": 0
      },
      "02 Check commands": {
        "count": 7,
        "passed": 7,
        "crashed": 0,
        "mandatoryFailed": 0
      },
      "03 Advanced tests": {
        "count": 2,
        "passed": 2,
        "crashed": 0,
        "mandatoryFailed": 0
      },
      "04 Speed test": {
        "count": 1,
        "passed": 1,
        "crashed": 0,
        "mandatoryFailed": 0
      },
      "99 Error handling": {
        "count": 2,
        "passed": 2,
        "crashed": 0,
        "mandatoryFailed": 0
      }
    }
  },
  "date": "2026-01-10T22:44:55Z"
}
```

### Project with Task-Based Skills

```json
{
  "project": {
    "slug": "PDGD02",
    "name": "Day 02",
    "module": {
      "code": "G-PDG-300"
    },
    "skills": []
  },
  "results": {
    "testRunId": 7498820,
    "logins": ["maty.millien@epitech.eu"],
    "prerequisites": 2,
    "externalItems": [
      { "type": "lint.note", "value": 0 },
      { "type": "lint.fatal", "value": 0 },
      { "type": "lint.major", "value": 0 },
      { "type": "lint.minor", "value": 0 },
      { "type": "lint.info", "value": 0 }
    ],
    "mandatoryFailed": 0,
    "skills": {
      "Checks and Build": {
        "count": 1,
        "passed": 1,
        "crashed": 0,
        "mandatoryFailed": 0
      },
      "Task 01": {
        "count": 3,
        "passed": 3,
        "crashed": 0,
        "mandatoryFailed": 0
      },
      "Task 02": {
        "count": 3,
        "passed": 3,
        "crashed": 0,
        "mandatoryFailed": 0
      },
      "Task 03": { "count": 2, "passed": 2, "crashed": 0, "mandatoryFailed": 0 }
    }
  },
  "date": "2026-01-09T22:47:34Z"
}
```

### Partial Pass (Some Tests Failed)

```json
{
  "project": {
    "slug": "PDGD08",
    "name": "Day 08",
    "module": {
      "code": "G-PDG-300"
    },
    "skills": []
  },
  "results": {
    "testRunId": 7538327,
    "logins": ["maty.millien@epitech.eu"],
    "prerequisites": 2,
    "externalItems": [
      { "type": "lint.note", "value": 0 },
      { "type": "lint.fatal", "value": 0 },
      { "type": "coverage.lines", "value": 0 }
    ],
    "mandatoryFailed": 0,
    "skills": {
      "01 - ex00": {
        "count": 1,
        "passed": 1,
        "crashed": 0,
        "mandatoryFailed": 0
      },
      "02 - ex01": {
        "count": 1,
        "passed": 0,
        "crashed": 0,
        "mandatoryFailed": 0
      },
      "03 - ex02": {
        "count": 1,
        "passed": 0,
        "crashed": 0,
        "mandatoryFailed": 0
      },
      "04 - ex03": {
        "count": 1,
        "passed": 0,
        "crashed": 0,
        "mandatoryFailed": 0
      }
    }
  },
  "date": "2026-01-23T11:14:56Z"
}
```

### Skill Naming Patterns

Different projects use different naming conventions for skills:

| Project Type  | Pattern       | Example                                           |
| ------------- | ------------- | ------------------------------------------------- |
| Day exercises | `XX - exYY`   | `"01 - ex00"`, `"02 - ex01"`                      |
| Task-based    | `Task XX`     | `"Task 01"`, `"Task 02"`                          |
| Rush projects | `XX Category` | `"01 Basics"`, `"02 Check commands"`              |
| Build checks  | Descriptive   | `"Checks and Build"`, `"Checks and Build Step 1"` |
| Internship    | `X - Name`    | `"0 - Preliminaries"`, `"1 - Report"`             |

---

## Frontend Implementation Guide

### Calculating Pass Percentage

To calculate the overall pass percentage for a project:

1. Sum all `count` values from each skill in `results.skills`
2. Sum all `passed` values from each skill in `results.skills`
3. Calculate: `percentage = round((totalPassed / totalCount) * 100)`

**Example**: If a project has 7 total tests and 6 passed, display as `86% (6/7 passed)`

### Detecting New Results

Use `testRunId` to track changes between API calls:

1. Store the set of all `testRunId` values from the previous API response
2. On the next API call, compare current `testRunId` values against the stored set
3. Any result with a `testRunId` not in the previous set is a new result

### Displaying Test Results

For each skill in `results.skills`:

- **Status determination**:
  - If `passed === count`: status is "passed"
  - If `crashed > 0`: status is "crashed"
  - Otherwise: status is "failed"
- **Display format**: `{skill name}: {passed}/{count} ({status})`

### Handling Linting Results

To check for linting issues:

1. Filter `externalItems` for entries where `type` starts with `lint.`
2. Exclude `lint.note` (informational only)
3. If any remaining item has `value > 0`, there are linting issues

**Severity priority** (highest to lowest): `fatal` > `major` > `minor` > `info` > `note`

### Module Code Interpretation

Module codes follow a pattern: `{CAMPUS}-{MODULE}-{YEAR}`

| Code        | Description                |
| ----------- | -------------------------- |
| `G-PDG-300` | G3 Pool - Day exercises    |
| `G-PRO-300` | G3 Internship/Professional |

### OIDC Token Flow

1. **Retrieve token**: Read from `localStorage.getItem("argos-api.oidc-token")`
2. **Parse token**: The value is stored as a JSON string with quotes, so remove surrounding quotes
3. **Check expiration**: Decode the JWT payload (base64), check if `Date.now() >= exp * 1000`
4. **Use in API calls**: Send as `Authorization: Bearer {token}` header
5. **Handle expiration**: If token is expired or missing, redirect to login page

---

## Additional Notes

### API Rate Limiting

No explicit rate limiting has been observed, but consider:

- Polling interval of 5+ minutes for automated tools
- Implementing exponential backoff on errors

### Error Handling

| HTTP Status | Meaning                                 |
| ----------- | --------------------------------------- |
| 200         | Success                                 |
| 401         | Unauthorized (token expired or invalid) |
| 403         | Forbidden (no access to resource)       |
| 500         | Server error                            |

### CORS

The API at `api.epitest.eu` supports CORS for requests from `myresults.epitest.eu`.

### Timezone

All dates in the API response are in UTC (ISO 8601 format with `Z` suffix).
