# AgroConnect - added backend features

This ZIP contains the Spring Boot backend source. No React/frontend source files were present in the original ZIP, so the new APIs are included but frontend screens still need to be connected in the existing frontend project.

## Features added

1. **Smart loan affordability estimate** - based on the monthly income, expenses, existing monthly debt and requested amount submitted by the user. It is a basic educational estimate, not bank eligibility or loan approval.
2. **Farm income/expense tracker** - create income and expense transactions and retrieve total income, total expenses and net profit/loss per farmer.
3. **Crop market price dashboard endpoint** - currently returns clearly labelled demo data only. Do not use these values for real trading decisions; connect an authoritative live source such as Agmarknet/eNAM before production.
4. **Government scheme directory endpoint** - starter list with official links. Eligibility and deadlines must be verified at the official portals.
5. **Loan document upload and download** - PDF/JPG/JPEG/PNG up to 5 MB, with session ownership checks. Local disk storage is used; production deployment needs persistent private storage and backups.
6. **Loan status history** - loan creation, approval and rejection are recorded automatically. History can be read per loan.
7. **Security improvements** - BCrypt password hashing for new registrations/admins, legacy plaintext password migration after a successful login, password excluded from JSON output, and ownership/role checks on farmer/loan/finance/document/eligibility/history APIs. Loan approval/rejection and loan record edits are admin-only. Admin creation is restricted after the first admin exists.

## Run locally

1. Install a compatible JDK and Maven (the project POM targets Java 25 and Spring Boot 4.1.0).
2. Check `src/main/resources/application.properties`; set `DB_USERNAME` and `DB_PASSWORD` environment variables for your machine. Do not commit real database credentials.
3. Create the `agroconnectdb` database in MySQL.
4. From the project root, run `mvn spring-boot:run` (or use the Maven wrapper if available and executable).
5. The backend listens on port `8095`; Hibernate `ddl-auto=update` creates the new tables on startup.

## API reference

All endpoints except scheme/market-price public information require the session cookie unless noted. For browser requests use `credentials: 'include'` or Axios `withCredentials: true`.

- `POST /api/eligibility/farmer/{farmerId}` JSON: `{"monthlyIncome":30000,"monthlyExpenses":12000,"existingMonthlyDebt":2000,"requestedAmount":250000}`
- `GET /api/eligibility/documents-checklist`
- `GET /api/finance/farmer/{farmerId}` - transaction list and income/expense/profit totals
- `POST /api/finance/farmer/{farmerId}` JSON example: `{"type":"INCOME","category":"Crop sale","cropType":"Paddy","amount":25000,"transactionDate":"2026-11-16","notes":"Harvest sale"}`
- `DELETE /api/finance/{transactionId}`
- `GET /api/agri-info/market-prices` (demo-only values; optional `?crop=Paddy&state=Tamil%20Nadu`)
- `GET /api/agri-info/schemes`
- `POST /api/loan-documents/loan/{loanId}` multipart form field name `file`
- `GET /api/loan-documents/loan/{loanId}`
- `GET /api/loan-documents/{documentId}/download`
- `GET /api/loan-history/{loanId}`

## Important deployment notes

- Change the database password to environment-based configuration before sharing/deploying.
- Set `agroconnect.upload-dir` to a private persistent volume in production; do not expose the uploads directory as public static content.
- Use HTTPS and configure the real frontend origin in CORS for deployment.
- Review and test all flows with your existing database before production. These changes were added to source, but could not be compiled in this environment because Maven is not installed and the available runtime is Java 21 while this project targets Java 25.

## Live daily mandi prices (official API)

The market-price endpoint now calls the Government of India's `data.gov.in` AGMARKNET resource instead of returning hard-coded demo prices. The dataset contains daily wholesale minimum, maximum and modal prices; it is not a tick-by-tick market feed.

### One-time setup

1. Open the official dataset: https://data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi
2. Sign in/register on data.gov.in and obtain an API key through the portal's API access flow.
3. Set an environment variable named `DATA_GOV_IN_API_KEY` before starting Spring Boot. Do not paste the key into Java source or commit it to GitHub.
   - PowerShell for the current terminal: `$env:DATA_GOV_IN_API_KEY="YOUR_REAL_KEY"`
   - Then start the backend from the project root: `./mvnw.cmd spring-boot:run` (or `mvn spring-boot:run` if Maven is installed).
4. If no key is configured, the endpoint returns `API_KEY_NOT_CONFIGURED` and an empty price list; it does not show fabricated demo prices.

### API examples

- `GET http://localhost:8095/api/agri-info/market-prices`
- `GET http://localhost:8095/api/agri-info/market-prices?state=Tamil%20Nadu&crop=Tomato`
- `GET http://localhost:8095/api/agri-info/market-prices?state=Tamil%20Nadu&district=Coimbatore&limit=50`

Each price record includes state, district, market, crop/commodity, variety, grade, arrival date, minimum price, maximum price and modal price in INR per quintal. The data's actual arrival date is returned so the frontend can show freshness clearly.

### Verify with Postman

1. Start MySQL and the Spring Boot backend as usual.
2. Send a GET request to `http://localhost:8095/api/agri-info/market-prices?state=Tamil%20Nadu&limit=10`.
3. Check `sourceStatus`. `LIVE_GOVERNMENT_API` means the upstream API responded; `API_KEY_NOT_CONFIGURED` means the environment variable is missing; `UPSTREAM_API_ERROR` means the upstream request failed and you should check the API key/network/provider availability.
4. Confirm each record's `arrivalDate` before treating it as current. Government market data is updated daily as markets report; availability and freshness can vary by market.
