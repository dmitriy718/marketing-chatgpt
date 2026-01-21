# CarolinaGrowth

**The marketing engine that makes local brands feel global.**

CarolinaGrowth is a comprehensive marketing platform combining a high-performance lead generation website (Next.js) with a robust CRM and automation backend (FastAPI).

## 📚 Documentation

The project documentation is organized into volumes. **[Start Here](./docs/README.md)**.

- **[Architecture](./docs/Volume_1_Architecture/)**: System design and decisions.
- **[Operations](./docs/Volume_2_Operations/)**: Deployment, secrets, and maintenance.
- **[Development](./docs/Volume_3_Development/)**: Setup guides and API reference.
- **[Client Manual](./docs/Volume_4_Client_Manual/)**: User guides for CMS and CRM.

## 🚀 Key Features

- **Lead Capture**: High-conversion tools (ROI Calculator, SEO Audit) and forms.
- **CRM**: Built-in lead management, pipeline tracking, and email automation.
- **Automation**: Async email dispatch, error alerts, and scheduled tasks.
- **Security**: Strict CSP, SSRF protection, and Turnstile integration.
- **Performance**: GZip compression, image optimization, and Redis caching.

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (React 19), Tailwind CSS, TypeScript.
- **Backend**: Python 3.13, FastAPI, SQLAlchemy (Async), Pydantic V2.
- **Database**: PostgreSQL 16.
- **Infrastructure**: Docker Compose, Nginx, Redis.

## 🤝 Contributing

Please review **[Volume 3: Development](./docs/Volume_3_Development/)** for setup instructions and contribution guidelines.

---
*Deployed at [https://carolinagrowth.co](https://carolinagrowth.co)*